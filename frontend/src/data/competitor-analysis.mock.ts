/**
 * 竞品套图分析 — 集中 Mock 数据（演示数据）。
 *
 * 来源：plans/frontend-prototype-plan.md §9 固定演示脚本
 *   开放式耳机 Product Master + 12 张同类竞品套图 + Amazon US Recipe
 *
 * 状态：分析完成态（F0 静态高保真，不实现 Event Simulator）。
 * 所有数值均为真实演示脚本设定，非随机生成（NG-023 / FD-036）。
 * 明确标记"演示数据"，符合 START_HERE §4 与验收清单 A 项。
 */

import type { CompetitorAnalysisState } from '@/types/competitor-analysis';

export const competitorAnalysisMock: CompetitorAnalysisState = {
  projectNameZh: 'OpenWave 耳机视觉升级',
  sku: 'OW-A31-BLK',
  platform: 'amazon',
  taskNameZh: '竞品套图 2026-08-02',
  assetCount: 12,
  goalZh: '提取可复用视觉结构，重建为自有产品 Creative Recipe',

  // —— 12 张竞品图：用途分布与计划 §9 一致 ——
  // 主图 1 / 场景 4 / 卖点 5 / 细节 1 / 参数 1（共 12）
  assets: [
    {
      id: 'img-01',
      filename: 'comp_main_01.jpg',
      role: '主图',
      status: '已完成',
      riskCount: 1,
      thumbPalette: { from: '#1b2330', to: '#0d1117' },
      evidences: [
        {
          id: 'ev-01-subj',
          kind: 'subject',
          x: 0.34,
          y: 0.22,
          w: 0.36,
          h: 0.6,
          labelZh: '商品主体',
          confidence: 0.94,
        },
        {
          id: 'ev-01-logo',
          kind: 'logo',
          x: 0.06,
          y: 0.07,
          w: 0.16,
          h: 0.06,
          labelZh: '竞品 Logo',
          confidence: 0.91,
        },
        {
          id: 'ev-01-safe',
          kind: 'safe',
          x: 0.3,
          y: 0.18,
          w: 0.44,
          h: 0.68,
          labelZh: '主体安全区',
        },
        {
          id: 'ev-01-guide',
          kind: 'guide',
          x: 0.33,
          y: 0,
          w: 0.01,
          h: 1,
          labelZh: '三分线',
        },
      ],
    },
    makeScene('img-02', 'comp_scene_02.jpg', '场景图', 0, 2),
    makeScene('img-03', 'comp_scene_03.jpg', '场景图', 1, 2),
    makeScene('img-04', 'comp_scene_04.jpg', '场景图', 0, 2),
    makeScene('img-05', 'comp_scene_05.jpg', '场景图', 0, 2),
    makeSellingPoint('img-06', 'comp_selling_06.jpg', '卖点图', 0, 3),
    makeSellingPoint('img-07', 'comp_selling_07.jpg', '卖点图', 0, 3),
    makeSellingPoint('img-08', 'comp_selling_08.jpg', '卖点图', 1, 3),
    makeSellingPoint('img-09', 'comp_selling_09.jpg', '卖点图', 0, 3),
    makeSellingPoint('img-10', 'comp_selling_10.jpg', '卖点图', 0, 3),
    makeDetail('img-11', 'comp_detail_11.jpg', '细节图', 1),
    {
      id: 'img-12',
      filename: 'comp_param_12.jpg',
      role: '参数图',
      status: '待人工确认',
      riskCount: 1,
      thumbPalette: { from: '#10151c', to: '#0a0d12' },
      evidences: [
        {
          id: 'ev-12-subj',
          kind: 'subject',
          x: 0.4,
          y: 0.34,
          w: 0.24,
          h: 0.42,
          labelZh: '商品主体',
          confidence: 0.78,
        },
        {
          id: 'ev-12-logo',
          kind: 'logo',
          x: 0.55,
          y: 0.46,
          w: 0.14,
          h: 0.07,
          labelZh: '型号文字',
          confidence: 0.7,
        },
      ],
    },
  ],

  // —— 右侧分析摘要（任务书 §6.4 示例）——
  summary: [
    { labelZh: '图片用途', valueZh: '场景卖点图' },
    { labelZh: '构图模式', valueZh: '右侧主体 / 左侧文案' },
    { labelZh: '商品占比', valueZh: '63%' },
    { labelZh: '镜头角度', valueZh: '前侧 3/4' },
    { labelZh: '背景类型', valueZh: '深灰工作场景' },
  ],

  // —— 视觉语言（任务书 §6.4 示例）——
  visualLanguage: [
    { labelZh: '主光', valueZh: '左上柔光' },
    { labelZh: '轮廓光', valueZh: '冷色边缘光' },
    { labelZh: '色调', valueZh: '深灰、冷蓝、低饱和' },
    { labelZh: '景深', valueZh: '轻度背景虚化' },
  ],

  // —— 可继承内容（mvp-prd §7.2 同类借用）——
  inheritableZh: ['构图方向', '光线结构', '背景气氛', '卖点信息顺序', '页面节奏'],

  // —— 禁止继承内容（mvp-prd §7.2 / 计划 §9：排除竞品商品结构与包装文字）——
  prohibitedZh: [
    '竞品 Logo',
    '竞品型号',
    '包装文字',
    '入耳式耳机结构',
    '竞品独有功能描述',
  ],

  // —— Creative Recipe 草案（任务书 §6.4 示例，完成态）——
  recipe: {
    purposeZh: 'Amazon 场景卖点图',
    canvas: { width: 1600, height: 1600 },
    productPositionZh: '中心偏右',
    productRatio: { min: 58, max: 66 },
    backgroundZh: '深灰工作空间',
    lightingZh: '左上柔光 + 冷色轮廓光',
    textSafetyZonePct: 34,
  },

  // —— 持续任务面板静态完成态（任务书 §6.5 示例）——
  task: {
    nameZh: '竞品套图分析',
    stages: { done: 7, total: 7 },
    findings: 24,
    risks: 3,
    artifacts: 1,
    elapsedZh: '00:38',
    phaseZh: '已完成 7/7 个分析阶段',
    connectionZh: '实时连接正常',
    workerZh: '视觉分析节点 3 个',
  },

  stats: {
    inheritableCount: 5,
    prohibitedCount: 5,
    pendingHumanReview: 1,
  },
};

// —— 工厂函数：构造不同用途的演示图片，保持证据真实可定位 ——

function makeSubjectAndSafe() {
  return [
    {
      id: `ev-subj-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'subject' as const,
      x: 0.38,
      y: 0.26,
      w: 0.3,
      h: 0.56,
      labelZh: '商品主体',
      confidence: 0.9,
    },
    {
      id: `ev-safe-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'safe' as const,
      x: 0.34,
      y: 0.22,
      w: 0.38,
      h: 0.64,
      labelZh: '主体安全区',
    },
  ];
}

function makeScene(
  id: string,
  filename: string,
  role: '场景图',
  riskCount: 0 | 1,
  seed: number,
) {
  return {
    id,
    filename,
    role,
    status: (riskCount > 0 ? '待人工确认' : '已完成') as '已完成' | '待人工确认',
    riskCount,
    thumbPalette: { from: pick('#1a2230', seed), to: '#0c1118' },
    evidences: makeSubjectAndSafe(),
  };
}

function makeSellingPoint(
  id: string,
  filename: string,
  role: '卖点图',
  riskCount: 0 | 1,
  seed: number,
) {
  return {
    id,
    filename,
    role,
    status: (riskCount > 0 ? '待人工确认' : '已完成') as '已完成' | '待人工确认',
    riskCount,
    thumbPalette: { from: pick('#191f2a', seed), to: '#0a0e14' },
    evidences: makeSubjectAndSafe(),
  };
}

function makeDetail(id: string, filename: string, role: '细节图', riskCount: 0 | 1) {
  return {
    id,
    filename,
    role,
    status: (riskCount > 0 ? '待人工确认' : '已完成') as '已完成' | '待人工确认',
    riskCount,
    thumbPalette: { from: '#161c26', to: '#080b10' },
    evidences: [
      {
        id: `ev-subj-d-${id}`,
        kind: 'subject' as const,
        x: 0.44,
        y: 0.36,
        w: 0.22,
        h: 0.34,
        labelZh: '商品主体',
        confidence: 0.86,
      },
    ],
  };
}

function pick<T>(base: T, _seed: number): T {
  // 演示配色保持稳定，不依赖 seed 做随机（NG-023）。
  return base;
}
