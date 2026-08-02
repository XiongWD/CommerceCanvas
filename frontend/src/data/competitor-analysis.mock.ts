/**
 * 竞品套图分析 — 集中 Mock 数据（演示数据）。
 *
 * 来源：plans/frontend-prototype-plan.md §9 固定演示脚本
 *   开放式耳机 Product Master + 12 张同类竞品套图 + Amazon US Recipe
 *
 * R1 变更：
 *   - 商品图改用本地无品牌 SVG 演示素材（public/demo-assets/*.svg）
 *   - 每张图片携带自身分析摘要（P3 同步：用途/构图/占比/角度/背景/视觉语言/风险）
 *   - 12 张缩略图复用 6 张素材的不同裁切，肉眼可见差异
 *
 * 状态：分析完成态（F0 静态高保真，不实现 Event Simulator）。
 * 所有数值均为真实演示脚本设定，非随机生成（NG-023 / FD-036）。
 * 明确标记"演示数据 / 模拟分析结果"，符合 START_HERE §4 与验收清单 A 项。
 */

import type {
  CompetitorAnalysisState,
  CompetitorAsset,
  EvidenceRegion,
  AssetVisualLanguage,
} from '@/types/competitor-analysis';

// —— 演示素材路径（本地 SVG，无品牌）——
const ASSET = {
  main: '/demo-assets/scene-main-01.svg',
  workspace: '/demo-assets/scene-workspace-02.svg',
  feature: '/demo-assets/scene-feature-03.svg',
  detail: '/demo-assets/scene-detail-04.svg',
  param: '/demo-assets/scene-param-05.svg',
  lifestyle: '/demo-assets/scene-lifestyle-06.svg',
} as const;

// —— 通用证据工厂：归一化坐标，真实可定位（NG-022 / FD-036）——
let evCounter = 0;
function ev(
  kind: EvidenceRegion['kind'],
  x: number,
  y: number,
  w: number,
  h: number,
  labelZh: string,
  confidence?: number,
): EvidenceRegion {
  evCounter += 1;
  return { id: `ev-${evCounter}`, kind, x, y, w, h, labelZh, confidence };
}

function stdVisual(opts: Partial<AssetVisualLanguage> = {}): AssetVisualLanguage {
  return {
    keyLightZh: opts.keyLightZh ?? '左上柔光',
    rimLightZh: opts.rimLightZh ?? '冷色边缘光',
    toneZh: opts.toneZh ?? '深灰、冷蓝、低饱和',
    depthZh: opts.depthZh ?? '轻度背景虚化',
  };
}

export const competitorAnalysisMock: CompetitorAnalysisState = {
  projectNameZh: 'OpenWave 耳机视觉升级',
  sku: 'OW-A31-BLK',
  platform: 'amazon',
  taskNameZh: '竞品套图 2026-08-02',
  assetCount: 12,
  goalZh: '提取可复用视觉结构，重建为自有产品 Creative Recipe',

  // —— 12 张竞品图（计划 §9：主图1 / 场景4 / 卖点5 / 细节1 / 参数1）——
  assets: [
    {
      id: 'img-01',
      filename: 'comp_main_01.svg',
      role: '主图',
      status: '已完成',
      riskCount: 1,
      src: ASSET.main,
      thumbPalette: { from: '#1b2330', to: '#0d1117' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '场景卖点图',
      compositionZh: '右侧主体 / 左侧文案',
      productRatioPct: 63,
      cameraAngleZh: '前侧 3/4',
      backgroundZh: '深灰工作场景',
      visualLanguage: stdVisual(),
      risksZh: ['左上角疑似竞品 Logo 框'],
      evidences: [
        ev('subject', 0.5, 0.22, 0.34, 0.6, '商品主体', 0.94),
        ev('logo', 0.05, 0.05, 0.14, 0.05, '竞品 Logo', 0.91),
        ev('safe', 0.48, 0.18, 0.4, 0.68, '主体安全区'),
        ev('guide', 0.5, 0, 0.008, 1, '三分线'),
      ],
    },
    {
      id: 'img-02',
      filename: 'comp_scene_02.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.workspace,
      thumbPalette: { from: '#161c25', to: '#0a0e14' },
      thumbFocus: { x: 50, y: 60, scale: 1.05 },
      purposeZh: '场景图',
      compositionZh: '居中俯视',
      productRatioPct: 48,
      cameraAngleZh: '俯视',
      backgroundZh: '深灰桌面工作空间',
      visualLanguage: stdVisual({ keyLightZh: '顶部柔光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.45, 0.36, 0.4, 0.34, '商品主体', 0.9),
        ev('safe', 0.4, 0.32, 0.5, 0.42, '主体安全区'),
      ],
    },
    {
      id: 'img-03',
      filename: 'comp_scene_03.svg',
      role: '场景图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.workspace,
      thumbPalette: { from: '#10151c', to: '#080b10' },
      thumbFocus: { x: 40, y: 45, scale: 1.15 },
      purposeZh: '场景图',
      compositionZh: '左侧主体 / 右侧道具',
      productRatioPct: 52,
      cameraAngleZh: '俯视偏左',
      backgroundZh: '深灰桌面 + 键盘道具',
      visualLanguage: stdVisual({ keyLightZh: '左上柔光' }),
      risksZh: ['右上道具含疑似型号文字'],
      evidences: [
        ev('subject', 0.32, 0.34, 0.34, 0.38, '商品主体', 0.83),
        ev('logo', 0.66, 0.62, 0.18, 0.06, '疑似型号文字', 0.71),
        ev('safe', 0.28, 0.3, 0.42, 0.44, '主体安全区'),
      ],
    },
    {
      id: 'img-04',
      filename: 'comp_scene_04.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.lifestyle,
      thumbPalette: { from: '#1a2028', to: '#0a0e14' },
      thumbFocus: { x: 55, y: 50, scale: 1 },
      purposeZh: '生活方式场景图',
      compositionZh: '人物侧面佩戴',
      productRatioPct: 58,
      cameraAngleZh: '侧面',
      backgroundZh: '深灰渐变',
      visualLanguage: stdVisual({ rimLightZh: '冷色轮廓光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.42, 0.3, 0.3, 0.5, '商品主体', 0.88),
        ev('safe', 0.38, 0.26, 0.38, 0.56, '主体安全区'),
      ],
    },
    {
      id: 'img-05',
      filename: 'comp_scene_05.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.lifestyle,
      thumbPalette: { from: '#141a22', to: '#080b10' },
      thumbFocus: { x: 38, y: 52, scale: 1.1 },
      purposeZh: '生活方式场景图',
      compositionZh: '左偏裁切佩戴',
      productRatioPct: 55,
      cameraAngleZh: '侧面偏左',
      backgroundZh: '深灰渐变',
      visualLanguage: stdVisual({ rimLightZh: '冷色轮廓光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.36, 0.3, 0.3, 0.5, '商品主体', 0.86),
        ev('safe', 0.32, 0.26, 0.38, 0.56, '主体安全区'),
      ],
    },
    {
      id: 'img-06',
      filename: 'comp_selling_06.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.feature,
      thumbPalette: { from: '#191f2a', to: '#0a0e14' },
      thumbFocus: { x: 55, y: 50, scale: 1 },
      purposeZh: '卖点图',
      compositionZh: '左侧信息 / 右侧特写',
      productRatioPct: 60,
      cameraAngleZh: '正面',
      backgroundZh: '深灰渐变',
      visualLanguage: stdVisual({ keyLightZh: '右上柔光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.45, 0.28, 0.32, 0.5, '商品主体', 0.91),
        ev('safe', 0.42, 0.24, 0.38, 0.56, '主体安全区'),
      ],
    },
    {
      id: 'img-07',
      filename: 'comp_selling_07.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.feature,
      thumbPalette: { from: '#151b24', to: '#080b10' },
      thumbFocus: { x: 62, y: 48, scale: 1.12 },
      purposeZh: '卖点图',
      compositionZh: '右偏裁切特写',
      productRatioPct: 64,
      cameraAngleZh: '正面偏右',
      backgroundZh: '深灰渐变',
      visualLanguage: stdVisual({ keyLightZh: '右上柔光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.5, 0.26, 0.32, 0.52, '商品主体', 0.89),
        ev('safe', 0.46, 0.22, 0.4, 0.58, '主体安全区'),
      ],
    },
    {
      id: 'img-08',
      filename: 'comp_selling_08.svg',
      role: '卖点图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.main,
      thumbPalette: { from: '#1c2430', to: '#0c1118' },
      thumbFocus: { x: 70, y: 45, scale: 1.3 },
      purposeZh: '卖点图（局部裁切）',
      compositionZh: '耳罩局部放大',
      productRatioPct: 72,
      cameraAngleZh: '前侧 3/4',
      backgroundZh: '深灰工作场景',
      visualLanguage: stdVisual(),
      risksZh: ['局部裁切丢失头梁结构信息'],
      evidences: [
        ev('subject', 0.4, 0.3, 0.4, 0.5, '商品主体（局部）', 0.79),
        ev('safe', 0.36, 0.26, 0.48, 0.56, '主体安全区'),
      ],
    },
    {
      id: 'img-09',
      filename: 'comp_selling_09.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.detail,
      thumbPalette: { from: '#171d26', to: '#090c11' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '卖点图（材质卖点）',
      compositionZh: '居中微距',
      productRatioPct: 68,
      cameraAngleZh: '正视微距',
      backgroundZh: '深灰径向渐变',
      visualLanguage: stdVisual({ depthZh: '极浅景深' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.3, 0.28, 0.4, 0.44, '商品主体', 0.87),
        ev('safe', 0.26, 0.24, 0.48, 0.52, '主体安全区'),
      ],
    },
    {
      id: 'img-10',
      filename: 'comp_selling_10.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.param,
      thumbPalette: { from: '#14181f', to: '#080b10' },
      thumbFocus: { x: 60, y: 50, scale: 1 },
      purposeZh: '卖点图（参数卖点）',
      compositionZh: '右侧主体 / 左侧参数块',
      productRatioPct: 56,
      cameraAngleZh: '等比正视',
      backgroundZh: '深灰网格',
      visualLanguage: stdVisual(),
      risksZh: [],
      evidences: [
        ev('subject', 0.5, 0.3, 0.34, 0.46, '商品主体', 0.85),
        ev('safe', 0.46, 0.26, 0.42, 0.52, '主体安全区'),
      ],
    },
    {
      id: 'img-11',
      filename: 'comp_detail_11.svg',
      role: '细节图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.detail,
      thumbPalette: { from: '#161c26', to: '#080b10' },
      thumbFocus: { x: 50, y: 48, scale: 1.08 },
      purposeZh: '细节图',
      compositionZh: '居中超近微距',
      productRatioPct: 80,
      cameraAngleZh: '正视微距',
      backgroundZh: '深灰径向渐变',
      visualLanguage: stdVisual({ depthZh: '极浅景深' }),
      risksZh: ['网孔材质置信度较低，需人工复核'],
      evidences: [
        ev('subject', 0.28, 0.26, 0.44, 0.48, '商品主体', 0.76),
        ev('safe', 0.24, 0.22, 0.52, 0.56, '主体安全区'),
      ],
    },
    {
      id: 'img-12',
      filename: 'comp_param_12.svg',
      role: '参数图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.param,
      thumbPalette: { from: '#10151c', to: '#0a0d12' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '参数图',
      compositionZh: '右侧主体 / 左侧参数',
      productRatioPct: 54,
      cameraAngleZh: '等比正视',
      backgroundZh: '深灰网格',
      visualLanguage: stdVisual(),
      risksZh: ['参数区存在疑似型号文字，结构判断置信度低'],
      evidences: [
        ev('subject', 0.5, 0.32, 0.32, 0.42, '商品主体', 0.78),
        ev('logo', 0.12, 0.34, 0.18, 0.06, '型号文字', 0.7),
        ev('safe', 0.46, 0.28, 0.4, 0.48, '主体安全区'),
      ],
    },
  ],

  // —— 套图级分析摘要（右侧「套图整体策略」消费）——
  summary: [
    { labelZh: '套图用途', valueZh: 'Amazon 主图 + 场景 + 卖点 + 细节 + 参数' },
    { labelZh: '主构图模式', valueZh: '右侧主体 / 左侧文案' },
    { labelZh: '平均商品占比', valueZh: '58%–66%' },
    { labelZh: '主镜头角度', valueZh: '前侧 3/4' },
    { labelZh: '主背景类型', valueZh: '深灰工作场景' },
  ],

  // —— 套图级视觉语言（「套图整体策略」消费）——
  visualLanguage: [
    { labelZh: '主光', valueZh: '左上柔光' },
    { labelZh: '轮廓光', valueZh: '冷色边缘光' },
    { labelZh: '色调', valueZh: '深灰、冷蓝、低饱和' },
    { labelZh: '景深', valueZh: '轻度背景虚化' },
  ],

  inheritableZh: ['构图方向', '光线结构', '背景气氛', '卖点信息顺序', '页面节奏'],
  prohibitedZh: [
    '竞品 Logo',
    '竞品型号',
    '包装文字',
    '入耳式耳机结构',
    '竞品独有功能描述',
  ],

  recipe: {
    purposeZh: 'Amazon 场景卖点图',
    canvas: { width: 1600, height: 1600 },
    productPositionZh: '中心偏右',
    productRatio: { min: 58, max: 66 },
    backgroundZh: '深灰工作空间',
    lightingZh: '左上柔光 + 冷色轮廓光',
    textSafetyZonePct: 34,
  },

  task: {
    nameZh: '竞品套图分析',
    stages: { done: 7, total: 7 },
    findings: 24,
    risks: 3,
    artifacts: 1,
    elapsedZh: '00:38',
    phaseZh: '已完成 7/7 个分析阶段',
    // P5：演示语义，中性灰，不伪装真实在线
    connectionZh: '实时事件 · 演示',
    workerZh: '分析节点 · 模拟 3 个',
  },

  stats: {
    inheritableCount: 5,
    prohibitedCount: 5,
    pendingHumanReview: 3,
  },
};

// 派生导出：便于按 id 取资产（同步验证用）
export function findAsset(assets: CompetitorAsset[], id: string): CompetitorAsset {
  const a = assets.find((x) => x.id === id);
  if (!a) throw new Error(`资产未找到: ${id}`);
  return a;
}
