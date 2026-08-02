#!/usr/bin/env node
/**
 * 平移周期检测（R1-E1 验收脚本）。
 *
 * 检测目标：图片是否被按固定偏移量平移复制（image[x] ≈ image[x+offset]）。
 * 这是 R1 截图失败的真实模式，NOT 镜像检测。
 *
 * 算法：
 *   横向：比较 image[:, x:] 与 image[:, :-x]，计算重叠区平均绝对误差(MAE)。
 *   纵向：比较 image[y:, :] 与 image[:-y, :]。
 *   偏移范围：宽/高的 20%–80%，重叠面积 ≥ 整图 20%。
 *   判定：最低 MAE < 0.5（0–255 量纲）→ FAIL；否则 PASS。
 *
 * 用法：node scripts/check-screenshot-periodicity.mjs <目录>
 *   对目录下所有 *.png 输出 width/height/sha256/最低横纵 MAE 与偏移/PASS|FAIL。
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 纯 PNG 解码（无外部依赖）：解析 IHDR + IDAT(zlib)。
import { inflateSync } from 'node:zlib';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readChunks(buf) {
  // 校验签名
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (buf[i] !== PNG_SIGNATURE[i]) throw new Error('非 PNG 文件');
  }
  const chunks = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    chunks.push({ type, data });
    off += 8 + len + 4; // length + type + data + crc
  }
  return chunks;
}

/**
 * 解码 PNG 为 RGBA Uint8ClampedArray。
 * 仅支持 color type 6（RGBA）/ 2（RGB），8-bit。
 */
function decodePng(buf) {
  const chunks = readChunks(buf);
  const ihdr = chunks.find((c) => c.type === 'IHDR').data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  if (bitDepth !== 8) throw new Error(`仅支持 8-bit，实际 ${bitDepth}`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`仅支持 colorType 2/6，实际 ${colorType}`);

  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data));
  const raw = inflateSync(idat);
  // 去逐行 filter（filter byte 0–4）
  const stride = width * channels + 1; // +1 for filter byte
  const out = new Uint8Array(width * height * channels);
  const prev = new Uint8Array(width * channels);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    const filter = raw[rowStart];
    const src = raw.subarray(rowStart + 1, rowStart + 1 + width * channels);
    const dst = out.subarray(y * width * channels, (y + 1) * width * channels);
    if (filter === 0) {
      dst.set(src);
    } else if (filter === 1) {
      // Sub
      for (let i = 0; i < dst.length; i++) {
        const left = i >= channels ? dst[i - channels] : 0;
        dst[i] = (src[i] + left) & 0xff;
      }
    } else if (filter === 2) {
      // Up
      for (let i = 0; i < dst.length; i++) {
        dst[i] = (src[i] + prev[i]) & 0xff;
      }
    } else if (filter === 3) {
      // Average
      for (let i = 0; i < dst.length; i++) {
        const left = i >= channels ? dst[i - channels] : 0;
        const up = prev[i];
        dst[i] = (src[i] + Math.floor((left + up) / 2)) & 0xff;
      }
    } else if (filter === 4) {
      // Paeth
      for (let i = 0; i < dst.length; i++) {
        const left = i >= channels ? dst[i - channels] : 0;
        const up = prev[i];
        const upLeft = i >= channels ? prev[i - channels] : 0;
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        dst[i] = (src[i] + pred) & 0xff;
      }
    } else {
      throw new Error(`未知 filter ${filter}`);
    }
    prev.set(dst);
  }
  return { width, height, channels, data: out };
}

/** 计算横向偏移 dx 的重叠区 MAE（0–255 量纲）。采样以加速。 */
function horizontalMae(img, dx, channels) {
  const { width: W, height: H, data } = img;
  const overlapW = W - dx;
  if (overlapW < W * 0.2) return Infinity;
  let sum = 0,
    n = 0;
  const step = Math.max(1, Math.floor(H / 200)); // 行采样
  const xstep = Math.max(1, Math.floor(overlapW / 200)); // 列采样
  for (let y = 0; y < H; y += step) {
    const rowBase = y * W * channels;
    for (let x = 0; x < overlapW; x += xstep) {
      const a = rowBase + x * channels;
      const b = rowBase + (x + dx) * channels;
      // 亮度差（避免 alpha 干扰，取 RGB 平均）
      const la = (data[a] + data[a + 1] + data[a + 2]) / 3;
      const lb = (data[b] + data[b + 1] + data[b + 2]) / 3;
      sum += Math.abs(la - lb);
      n++;
    }
  }
  return n ? sum / n : Infinity;
}

/** 计算纵向偏移 dy 的重叠区 MAE。 */
function verticalMae(img, dy, channels) {
  const { width: W, height: H, data } = img;
  const overlapH = H - dy;
  if (overlapH < H * 0.2) return Infinity;
  let sum = 0,
    n = 0;
  const step = Math.max(1, Math.floor(W / 200));
  const ystep = Math.max(1, Math.floor(overlapH / 200));
  for (let x = 0; x < W; x += step) {
    for (let y = 0; y < overlapH; y += ystep) {
      const a = (y * W + x) * channels;
      const b = ((y + dy) * W + x) * channels;
      const la = (data[a] + data[a + 1] + data[a + 2]) / 3;
      const lb = (data[b] + data[b + 1] + data[b + 2]) / 3;
      sum += Math.abs(la - lb);
      n++;
    }
  }
  return n ? sum / n : Infinity;
}

async function analyze(file) {
  const buf = await readFile(file);
  const sha256 = createHash('sha256').update(buf).digest('hex');
  const img = decodePng(buf);
  const { width: W, height: H, channels } = img;

  // 横向：偏移 20%–80%
  let bestH = { mae: Infinity, offset: 0 };
  const hMin = Math.floor(W * 0.2),
    hMax = Math.floor(W * 0.8);
  for (let dx = hMin; dx <= hMax; dx++) {
    const mae = horizontalMae(img, dx, channels);
    if (mae < bestH.mae) bestH = { mae, offset: dx };
  }
  // 纵向：偏移 20%–80%
  let bestV = { mae: Infinity, offset: 0 };
  const vMin = Math.floor(H * 0.2),
    vMax = Math.floor(H * 0.8);
  for (let dy = vMin; dy <= vMax; dy++) {
    const mae = verticalMae(img, dy, channels);
    if (mae < bestV.mae) bestV = { mae, offset: dy };
  }

  // 判定：任一方向最低 MAE < 0.5 → FAIL（平移复制）
  const tiled = bestH.mae < 0.5 || bestV.mae < 0.5;
  return {
    file: path.basename(file),
    width: W,
    height: H,
    sha256,
    horizontal: { offset: bestH.offset, mae: Number(bestH.mae.toFixed(4)) },
    vertical: { offset: bestV.offset, mae: Number(bestV.mae.toFixed(4)) },
    result: tiled ? 'FAIL' : 'PASS',
  };
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('用法: node scripts/check-screenshot-periodicity.mjs <目录>');
    process.exit(2);
  }
  const entries = await readdir(dir);
  const pngs = entries.filter((f) => f.toLowerCase().endsWith('.png')).sort();
  if (pngs.length === 0) {
    console.log(`目录 ${dir} 无 PNG 文件`);
    process.exit(0);
  }
  const results = [];
  for (const f of pngs) {
    const r = await analyze(path.join(dir, f));
    results.push(r);
    console.log(
      `${r.result === 'FAIL' ? '❌ FAIL' : '✅ PASS'}  ${r.file}  ${r.width}x${r.height}\n` +
        `   横向最低 MAE=${r.horizontal.mae} @offset=${r.horizontal.offset}\n` +
        `   纵向最低 MAE=${r.vertical.mae} @offset=${r.vertical.offset}\n` +
        `   sha256=${r.sha256.slice(0, 16)}…`,
    );
  }
  const anyFail = results.some((r) => r.result === 'FAIL');
  console.log(`\n汇总: ${results.filter((r) => r.result === 'PASS').length}/${results.length} PASS`);
  process.exit(anyFail ? 1 : 0);
}

// 仅在直接执行时运行（避免被 capture 脚本 import 时触发）
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { analyze, decodePng };
