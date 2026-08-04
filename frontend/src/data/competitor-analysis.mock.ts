/**
 * 竞品套图分析 — 集中 Mock 数据（演示数据）。
 *
 * 来源：plans/frontend-prototype-plan.md §9 固定演示脚本
 *   开放式耳机 Product Master + 12 张同类竞品套图 + Amazon US Recipe
 *
 * 变更历史：
 *   R1：商品图改用本地无品牌 SVG 演示素材（public/demo-assets/*.svg）；
 *       每张图片携带自身分析摘要（P3 同步：用途/构图/占比/角度/背景/视觉语言/风险）。
 *   F2：12 张资产 1:1 映射到 12 个互异 SVG（不得仅改裁切位置，§6）；
 *       新增 Product Master / 构图聚类 / 卖点顺序 / 风险排除 / 套图洞察；
 *       每张资产携带 clusterId / confidence / sellingPointIds / insightIds；
 *       所有 ConfidenceInfo 携带可定位的中文依据（§八，NG-022 / FD-036）。
 *
 * 状态：分析完成态（F0 静态高保真，不实现 Event Simulator）。
 * 所有数值均为真实演示脚本设定，非随机生成（NG-023 / FD-036）。
 * 明确标记"演示数据 / 模拟分析结果"，符合 START_HERE §4 与验收清单 A 项。
 *
 * 交叉引用一致性：所有 clusters[].assetIds / sellingPoints[].assetIds /
 *   riskExclusion.*[].assetIds / insights[].assetIds 均指向 assets[].id；
 *   每张资产的 clusterId / sellingPointIds / insightIds 反向指向上列集合。
 */

import type {
  CompetitorAnalysisState,
  CompetitorAsset,
  ConfidenceInfo,
  EvidenceRegion,
  AssetVisualLanguage,
} from '@/types/competitor-analysis';

// —— 演示素材路径（本地 SVG，无品牌）——
// F2：12 张资产与 12 个 SVG 一一对应，无复用、无仅改裁切。
const ASSET = {
  main01: '/demo-assets/scene-main-01.svg',
  main07: '/demo-assets/scene-main-07.svg',
  workspace02: '/demo-assets/scene-workspace-02.svg',
  scene08: '/demo-assets/scene-scene-08.svg',
  scene10: '/demo-assets/scene-scene-10.svg',
  lifestyle06: '/demo-assets/scene-lifestyle-06.svg',
  feature03: '/demo-assets/scene-feature-03.svg',
  selling09: '/demo-assets/scene-selling-09.svg',
  detail04: '/demo-assets/scene-detail-04.svg',
  detail11: '/demo-assets/scene-detail-11.svg',
  param05: '/demo-assets/scene-param-05.svg',
  param12: '/demo-assets/scene-param-12.svg',
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

// —— 置信度工厂：集中复用，依据可定位 ——
function conf(
  level: ConfidenceInfo['level'],
  percent: number,
  basisZh: string,
): ConfidenceInfo {
  return { level, percent, basisZh };
}

export const competitorAnalysisMock: CompetitorAnalysisState = {
  projectNameZh: 'OpenWave 耳机视觉升级',
  sku: 'OW-A31-BLK',
  platform: 'amazon',
  taskNameZh: '竞品套图 2026-08-02',
  assetCount: 12,
  goalZh: '提取可复用视觉结构，重建为自有产品 Creative Recipe',

  // —— 12 张竞品图（计划 §9：主图1 / 场景4 / 卖点5 / 细节1 / 参数1）——
  // F2 §6：每张资产使用互异 SVG，1:1 映射，禁止仅改裁切位置。
  assets: [
    {
      id: 'img-01',
      filename: 'comp_main_01.svg',
      role: '主图',
      status: '已完成',
      riskCount: 1,
      src: ASSET.main01,
      thumbPalette: { from: '#1b2330', to: '#0d1117' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '主图',
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
      clusterId: 'cluster-a',
      confidence: conf('high', 94, '主体识别置信度 0.94，三分线辅助对齐，构图与 Recipe 主构图一致'),
      sellingPointIds: [],
      insightIds: ['ins-usage', 'ins-rhythm', 'ins-safe-zone'],
    },
    {
      id: 'img-02',
      filename: 'comp_scene_02.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.workspace02,
      thumbPalette: { from: '#161c25', to: '#0a0e14' },
      thumbFocus: { x: 50, y: 60, scale: 1.05 },
      purposeZh: '场景图（工作空间俯视）',
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
      clusterId: 'cluster-b',
      confidence: conf('high', 90, '主体识别 0.90，俯视构图与工作空间道具一致，环境叙事清晰'),
      sellingPointIds: ['sp-waterproof'],
      insightIds: ['ins-usage', 'ins-light', 'ins-color'],
    },
    {
      id: 'img-03',
      filename: 'comp_scene_03.svg',
      role: '场景图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.scene08,
      thumbPalette: { from: '#10151c', to: '#080b10' },
      thumbFocus: { x: 40, y: 45, scale: 1.15 },
      purposeZh: '场景图（桌面道具）',
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
      clusterId: 'cluster-b',
      confidence: conf('medium', 71, '右上文字框识别置信度 0.71，需人工确认是否为竞品型号'),
      sellingPointIds: [],
      insightIds: ['ins-light', 'ins-color'],
    },
    {
      id: 'img-04',
      filename: 'comp_scene_04.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.lifestyle06,
      thumbPalette: { from: '#1a2028', to: '#0a0e14' },
      thumbFocus: { x: 55, y: 50, scale: 1 },
      purposeZh: '生活方式场景图（人物佩戴）',
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
      clusterId: 'cluster-d',
      confidence: conf('high', 88, '人物佩戴姿势识别 0.88，轮廓光一致，生活方式叙事完整'),
      sellingPointIds: ['sp-comfort', 'sp-stability'],
      insightIds: ['ins-usage', 'ins-color', 'ins-rhythm'],
    },
    {
      id: 'img-05',
      filename: 'comp_scene_05.svg',
      role: '场景图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.scene10,
      thumbPalette: { from: '#141a22', to: '#080b10' },
      thumbFocus: { x: 38, y: 52, scale: 1.1 },
      purposeZh: '场景图（运动场景佩戴）',
      compositionZh: '左偏裁切佩戴',
      productRatioPct: 55,
      cameraAngleZh: '侧面偏左',
      backgroundZh: '深灰渐变 + 运动暗示',
      visualLanguage: stdVisual({ rimLightZh: '冷色轮廓光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.36, 0.3, 0.3, 0.5, '商品主体', 0.86),
        ev('safe', 0.32, 0.26, 0.38, 0.56, '主体安全区'),
      ],
      clusterId: 'cluster-b',
      confidence: conf('high', 86, '佩戴姿势识别 0.86，运动场景道具暗示防水卖点，光线结构一致'),
      sellingPointIds: ['sp-stability', 'sp-waterproof'],
      insightIds: ['ins-color', 'ins-rhythm'],
    },
    {
      id: 'img-06',
      filename: 'comp_selling_06.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.feature03,
      thumbPalette: { from: '#191f2a', to: '#0a0e14' },
      thumbFocus: { x: 55, y: 50, scale: 1 },
      purposeZh: '卖点图（声音体验）',
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
      clusterId: 'cluster-a',
      confidence: conf('high', 91, '主体识别 0.91，左信息右特写的卖点构图与 Recipe 主构图方向一致'),
      sellingPointIds: ['sp-sound'],
      insightIds: ['ins-usage', 'ins-safe-zone'],
    },
    {
      id: 'img-07',
      filename: 'comp_selling_07.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.selling09,
      thumbPalette: { from: '#151b24', to: '#080b10' },
      thumbFocus: { x: 62, y: 48, scale: 1.12 },
      purposeZh: '卖点图（舒适性卖点）',
      compositionZh: '右偏裁切特写 + 佩戴示意',
      productRatioPct: 64,
      cameraAngleZh: '正面偏右',
      backgroundZh: '深灰渐变',
      visualLanguage: stdVisual({ keyLightZh: '右上柔光' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.5, 0.26, 0.32, 0.52, '商品主体', 0.89),
        ev('safe', 0.46, 0.22, 0.4, 0.58, '主体安全区'),
      ],
      clusterId: 'cluster-d',
      confidence: conf('high', 89, '佩戴姿势与耳罩接触识别 0.89，舒适性叙事与材质一致'),
      sellingPointIds: ['sp-comfort'],
      insightIds: ['ins-rhythm'],
    },
    {
      id: 'img-08',
      filename: 'comp_selling_08.svg',
      role: '卖点图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.detail04,
      thumbPalette: { from: '#1c2430', to: '#0c1118' },
      thumbFocus: { x: 70, y: 45, scale: 1.3 },
      purposeZh: '卖点图（结构局部）',
      compositionZh: '耳罩局部放大',
      productRatioPct: 72,
      cameraAngleZh: '前侧 3/4',
      backgroundZh: '深灰工作场景',
      visualLanguage: stdVisual(),
      risksZh: ['局部裁切丢失头梁结构信息，疑似入耳式结构需排除'],
      evidences: [
        ev('subject', 0.4, 0.3, 0.4, 0.5, '商品主体（局部）', 0.79),
        ev('safe', 0.36, 0.26, 0.48, 0.56, '主体安全区'),
      ],
      clusterId: 'cluster-c',
      confidence: conf('medium', 79, '局部主体识别 0.79，结构形态判断置信度偏低，需 Product Master 校验是否含入耳式结构'),
      sellingPointIds: ['sp-sound'],
      insightIds: ['ins-material'],
    },
    {
      id: 'img-09',
      filename: 'comp_selling_09.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.main07,
      thumbPalette: { from: '#171d26', to: '#090c11' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '卖点图（续航卖点）',
      compositionZh: '居中微距 + 信息条',
      productRatioPct: 68,
      cameraAngleZh: '正视微距',
      backgroundZh: '深灰径向渐变',
      visualLanguage: stdVisual({ depthZh: '极浅景深' }),
      risksZh: [],
      evidences: [
        ev('subject', 0.3, 0.28, 0.4, 0.44, '商品主体', 0.87),
        ev('safe', 0.26, 0.24, 0.48, 0.52, '主体安全区'),
      ],
      clusterId: 'cluster-c',
      confidence: conf('high', 87, '主体识别 0.87，续航信息条位置稳定，与材质叙事一致'),
      sellingPointIds: ['sp-battery'],
      insightIds: ['ins-material', 'ins-rhythm'],
    },
    {
      id: 'img-10',
      filename: 'comp_selling_10.svg',
      role: '卖点图',
      status: '已完成',
      riskCount: 0,
      src: ASSET.param12,
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
      clusterId: 'cluster-a',
      confidence: conf('high', 85, '主体识别 0.85，右侧主体/左侧参数块与主图同构图方向'),
      sellingPointIds: ['sp-spec'],
      insightIds: ['ins-usage', 'ins-safe-zone'],
    },
    {
      id: 'img-11',
      filename: 'comp_detail_11.svg',
      role: '细节图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.detail11,
      thumbPalette: { from: '#161c26', to: '#080b10' },
      thumbFocus: { x: 50, y: 48, scale: 1.08 },
      purposeZh: '细节图（网孔材质）',
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
      clusterId: 'cluster-c',
      confidence: conf('low', 76, '主体识别 0.76，网孔纹理与材质判定置信度偏低，需 Product Master 材料参数校验'),
      sellingPointIds: [],
      insightIds: ['ins-material'],
    },
    {
      id: 'img-12',
      filename: 'comp_param_12.svg',
      role: '参数图',
      status: '待人工确认',
      riskCount: 1,
      src: ASSET.param05,
      thumbPalette: { from: '#10151c', to: '#0a0d12' },
      thumbFocus: { x: 50, y: 50, scale: 1 },
      purposeZh: '参数图（规格表）',
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
      clusterId: 'cluster-a',
      confidence: conf('low', 70, '型号文字识别 0.70，参数结构判断置信度偏低，需 Product Master 校验尺寸/兼容性'),
      sellingPointIds: ['sp-spec'],
      insightIds: ['ins-safe-zone'],
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

  // ===== F2 新增：Product Master（§4.1）=====
  productMaster: {
    productNameZh: 'OpenWave OW-A31 开放式耳机',
    sku: 'OW-A31-BLK',
    categoryZh: '耳机 / 音频',
    formFactorZh: '开放式耳机',
    primaryColorZh: '哑光黑',
    materialZh: 'ABS + 硅胶',
    identityFeaturesZh: ['开放式结构', '头梁可折叠', '椭圆耳罩'],
    prohibitedChangesZh: ['结构形态', '耳罩形状', '按键数量'],
  },

  // ===== F2 新增：构图聚类（§5.3）=====
  clusters: [
    {
      id: 'cluster-a',
      nameZh: 'A：右侧主体 / 左侧文案',
      assetIds: ['img-01', 'img-06', 'img-10'],
      compositionFeaturesZh: ['主体偏右', '左侧信息区', '三分线辅助对齐'],
      suitableSlotsZh: ['主图', '参数卖点图', '信息类卖点图'],
      borrowability: conf(
        'high',
        90,
        '该构图在 img-01 / img-06 / img-10 共 3 张图中重复出现，主体位置与文字安全区一致',
      ),
      riskNoteZh: '左侧文案区须去除竞品包装文字与型号',
    },
    {
      id: 'cluster-b',
      nameZh: 'B：中心对称 / 环境场景',
      assetIds: ['img-02', 'img-03', 'img-05'],
      compositionFeaturesZh: ['俯视或侧面居中', '环境道具叙事', '低饱和冷调背景'],
      suitableSlotsZh: ['场景图', '工作空间场景', '运动场景'],
      borrowability: conf(
        'high',
        86,
        'img-02 / img-05 主体识别均 ≥0.86，俯视/侧面构图方向一致，环境叙事可迁移',
      ),
      riskNoteZh: 'img-03 右上道具含疑似型号文字，须人工确认',
    },
    {
      id: 'cluster-c',
      nameZh: 'C：局部特写 / 材质肌理',
      assetIds: ['img-08', 'img-09', 'img-11'],
      compositionFeaturesZh: ['微距局部放大', '极浅景深', '径向渐变背景'],
      suitableSlotsZh: ['细节图', '材质卖点图', '续航卖点图'],
      borrowability: conf(
        'medium',
        80,
        'img-09 构图稳定（0.87），但 img-08 / img-11 主体识别偏低（0.79 / 0.76），结构判断需 Product Master 校验',
      ),
      riskNoteZh: 'img-08 疑似入耳式结构、img-11 网孔材质需人工复核',
    },
    {
      id: 'cluster-d',
      nameZh: 'D：人物佩戴 / 生活方式',
      assetIds: ['img-04', 'img-07'],
      compositionFeaturesZh: ['人物侧面佩戴', '冷色轮廓光', '生活方式叙事'],
      suitableSlotsZh: ['生活方式场景图', '舒适性卖点图'],
      borrowability: conf(
        'high',
        88,
        'img-04 / img-07 佩戴姿势识别均 ≥0.88，轮廓光一致，叙事可迁移',
      ),
      riskNoteZh: '人物面部不得出现竞品 Logo 或包装元素',
    },
  ],

  // ===== F2 新增：卖点顺序（§5.4）=====
  // 顺序：舒适性 → 稳定佩戴 → 声音体验 → 续航 → 防水 → 参数与兼容性
  sellingPoints: [
    {
      id: 'sp-comfort',
      nameZh: '舒适性',
      order: 1,
      assetIds: ['img-07', 'img-04'],
      compositionZh: '佩戴示意 + 右偏特写',
      lightingZh: '右上柔光 + 冷色轮廓光',
      inheritable: true,
      needsFactCheck: false,
    },
    {
      id: 'sp-stability',
      nameZh: '稳定佩戴',
      order: 2,
      assetIds: ['img-04', 'img-05'],
      compositionZh: '人物侧面佩戴 / 运动场景',
      lightingZh: '冷色轮廓光',
      inheritable: true,
      needsFactCheck: false,
    },
    {
      id: 'sp-sound',
      nameZh: '声音体验',
      order: 3,
      assetIds: ['img-06', 'img-08'],
      compositionZh: '左侧信息 / 右侧特写',
      lightingZh: '右上柔光',
      inheritable: true,
      needsFactCheck: true,
    },
    {
      id: 'sp-battery',
      nameZh: '续航',
      order: 4,
      assetIds: ['img-09'],
      compositionZh: '居中微距 + 信息条',
      lightingZh: '左上柔光',
      inheritable: false,
      needsFactCheck: true,
    },
    {
      id: 'sp-waterproof',
      nameZh: '防水',
      order: 5,
      assetIds: ['img-05', 'img-02'],
      compositionZh: '运动场景 / 工作空间俯视',
      lightingZh: '顶部柔光 + 冷色轮廓光',
      inheritable: false,
      needsFactCheck: true,
    },
    {
      id: 'sp-spec',
      nameZh: '参数与兼容性',
      order: 6,
      assetIds: ['img-10', 'img-12'],
      compositionZh: '右侧主体 / 左侧参数块',
      lightingZh: '左上柔光',
      inheritable: false,
      needsFactCheck: true,
    },
  ],

  // ===== F2 新增：风险排除清单（§7.4）=====
  riskExclusion: {
    prohibited: [
      {
        id: 'risk-logo',
        category: 'prohibited',
        nameZh: '竞品 Logo',
        reasonZh: '左上角 Logo 框识别置信度 0.91，属竞品商标资产',
        evidenceCount: 2,
        assetIds: ['img-01'],
        needsReview: false,
      },
      {
        id: 'risk-model',
        category: 'prohibited',
        nameZh: '竞品型号',
        reasonZh: '参数区与道具区存在疑似型号文字，识别置信度 0.70–0.71',
        evidenceCount: 3,
        assetIds: ['img-03', 'img-12'],
        needsReview: true,
      },
      {
        id: 'risk-packaging',
        category: 'prohibited',
        nameZh: '包装文字',
        reasonZh: '左侧文案区含竞品包装信息',
        evidenceCount: 1,
        assetIds: ['img-07'],
        needsReview: false,
      },
      {
        id: 'risk-inear',
        category: 'prohibited',
        nameZh: '入耳式结构',
        reasonZh: '局部裁切疑似入耳式结构，与开放式形态冲突',
        evidenceCount: 1,
        assetIds: ['img-08'],
        needsReview: true,
      },
      {
        id: 'risk-exclusive-feature',
        category: 'prohibited',
        nameZh: '竞品独有功能描述',
        reasonZh: '续航信息条含竞品独有功能话术',
        evidenceCount: 1,
        assetIds: ['img-09'],
        needsReview: false,
      },
    ],
    factCheck: [
      {
        id: 'fact-battery',
        category: 'fact-check',
        nameZh: '续航时长',
        reasonZh: '续航数值须以 OpenWave OW-A31 官方参数为准',
        evidenceCount: 1,
        assetIds: ['img-09'],
        needsReview: true,
      },
      {
        id: 'fact-waterproof',
        category: 'fact-check',
        nameZh: '防水等级',
        reasonZh: 'IP 等级须以 Product Master 实测为准',
        evidenceCount: 2,
        assetIds: ['img-05'],
        needsReview: true,
      },
      {
        id: 'fact-material',
        category: 'fact-check',
        nameZh: '材料参数',
        reasonZh: 'ABS + 硅胶材质与网孔纹理需 Product Master 校验',
        evidenceCount: 2,
        assetIds: ['img-11'],
        needsReview: true,
      },
      {
        id: 'fact-compat',
        category: 'fact-check',
        nameZh: '兼容性',
        reasonZh: '蓝牙/设备兼容性描述须与官方规格一致',
        evidenceCount: 2,
        assetIds: ['img-10', 'img-12'],
        needsReview: true,
      },
      {
        id: 'fact-size',
        category: 'fact-check',
        nameZh: '尺寸数据',
        reasonZh: '参数表尺寸须以 Product Master 实测为准',
        evidenceCount: 2,
        assetIds: ['img-12'],
        needsReview: true,
      },
    ],
    safe: [
      {
        id: 'safe-composition',
        category: 'safe',
        nameZh: '构图方向',
        reasonZh: '右侧主体/左侧文案在 3 张图中重复且安全区一致',
        evidenceCount: 4,
        assetIds: ['img-01', 'img-06', 'img-10'],
        needsReview: false,
      },
      {
        id: 'safe-light',
        category: 'safe',
        nameZh: '光线结构',
        reasonZh: '左上柔光 + 冷色轮廓光在多张场景图中一致',
        evidenceCount: 3,
        assetIds: ['img-02', 'img-03'],
        needsReview: false,
      },
      {
        id: 'safe-background',
        category: 'safe',
        nameZh: '背景气氛',
        reasonZh: '深灰低饱和背景气氛统一，可迁移',
        evidenceCount: 2,
        assetIds: ['img-04'],
        needsReview: false,
      },
      {
        id: 'safe-rhythm',
        category: 'safe',
        nameZh: '页面节奏',
        reasonZh: '主图→场景→卖点→细节→参数节奏稳定，可继承',
        evidenceCount: 1,
        assetIds: ['img-09'],
        needsReview: false,
      },
      {
        id: 'safe-textzone',
        category: 'safe',
        nameZh: '文案安全区',
        reasonZh: '左侧文字安全区占比 34%，在主图/参数图中一致',
        evidenceCount: 3,
        assetIds: ['img-01'],
        needsReview: false,
      },
    ],
  },

  // ===== F2 新增：套图洞察（§7.2）=====
  insights: [
    {
      id: 'ins-usage',
      categoryZh: '用途分布',
      conclusionZh: '套图覆盖 Amazon 主图/场景/卖点/细节/参数全用途，主图1/场景4/卖点5/细节1/参数1',
      assetIds: ['img-01', 'img-02', 'img-06', 'img-10', 'img-11', 'img-12'],
      confidence: conf(
        'high',
        95,
        '12 张资产 role 字段明确分类，用途计数与计划 §9 演示脚本一致',
      ),
    },
    {
      id: 'ins-cluster',
      categoryZh: '构图聚类',
      conclusionZh: '构图收敛为 4 类：右侧主体/中心环境/局部特写/人物佩戴',
      assetIds: ['img-01', 'img-02', 'img-08', 'img-04'],
      confidence: conf(
        'high',
        88,
        '4 个聚类覆盖全部 12 张资产，每张资产 clusterId 反向可定位',
      ),
    },
    {
      id: 'ins-light',
      categoryZh: '光线模式',
      conclusionZh: '主光以左上柔光为主，轮廓光统一为冷色，低饱和冷调',
      assetIds: ['img-02', 'img-03'],
      confidence: conf(
        'high',
        90,
        '视觉语言字段在多张资产中一致，顶部柔光用于俯视场景图',
      ),
    },
    {
      id: 'ins-color',
      categoryZh: '色彩规律',
      conclusionZh: '深灰 + 冷蓝 + 低饱和为统一色彩规律，缩略图配色 from/to 均落在该区间',
      assetIds: ['img-02', 'img-03', 'img-04', 'img-05'],
      confidence: conf(
        'high',
        92,
        '12 张资产 thumbPalette 均落在 #0a–#1f 深灰冷蓝区间，色差稳定',
      ),
    },
    {
      id: 'ins-rhythm',
      categoryZh: '页面节奏',
      conclusionZh: '套图页面节奏稳定：主图定调 → 场景叙事 → 卖点递进 → 细节佐证 → 参数收尾',
      assetIds: ['img-01', 'img-04', 'img-05', 'img-07', 'img-09'],
      confidence: conf(
        'medium',
        82,
        '页面顺序依据 role 与卖点 order 推断，卖点信息顺序部分需事实校验',
      ),
    },
    {
      id: 'ins-material',
      categoryZh: '材质语言',
      conclusionZh: 'ABS + 硅胶材质在细节图中可借鉴，但网孔纹理需 Product Master 校验',
      assetIds: ['img-08', 'img-09', 'img-11'],
      confidence: conf(
        'medium',
        78,
        'img-08 / img-11 主体识别 0.79 / 0.76，材质判断置信度偏低，需人工复核',
      ),
    },
    {
      id: 'ins-safe-zone',
      categoryZh: '安全区与构图方向',
      conclusionZh: '右侧主体/左侧文案在主图/参数图中一致，文字安全区占比 34%',
      assetIds: ['img-01', 'img-06', 'img-10', 'img-12'],
      confidence: conf(
        'high',
        90,
        'safe 证据区在 4 张资产中重复出现，占比与 Recipe textSafetyZonePct 一致',
      ),
    },
  ],

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
