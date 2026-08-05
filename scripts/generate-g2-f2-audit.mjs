/**
 * F2-R1.2 data-audit 生成脚本：调用共享 generateCompetitorDataAudit。
 * 如 missingEntityIds > 0，exit 1。
 */
import { pathToFileURL } from 'node:url';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'artifacts/frontend/g2-f2-r1-2';

// 通过 vitest 运行生成器测试（该测试调用共享函数并写文件）
import { execSync } from 'node:child_process';

async function main() {
  await mkdir(OUT, { recursive: true });
  // 使用 vitest 运行 audit 生成测试
  execSync('npx vitest run src/features/competitor-analysis/state/gen-audit.test.ts', {
    stdio: 'inherit',
    cwd: 'frontend',
    env: { ...process.env, AUDIT_OUT: path.resolve(OUT) },
  });
  console.log('data-audit.json generated at', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
