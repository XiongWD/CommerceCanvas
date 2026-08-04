/**
 * F2 数据真实性审计（任务书 §十三 数据真实性）。
 *
 * 审计对象：
 *   1. `competitorAnalysisMock` —— 12 张资产 / 构图聚类 / 卖点顺序 / 风险排除清单 / 套图洞察
 *      的交叉引用一致性，以及 SVG 唯一性与用途分布。
 *   2. `live-intelligence` simulator 的 normal / risk 两个场景最终归并态业务事实。
 *
 * 设计原则（NG-022 / NG-023 / FD-036）：
 *   - 数据不得自相矛盾；所有交叉引用必须指向真实存在的资产 id。
 *   - 每张资产使用互异 SVG（禁止仅改裁切位置，F2 §6）。
 *   - 所有置信度必须携带可定位的中文依据（非装饰性百分比）。
 *   - 业务统计由权威事件更新，不从轨迹条数反推。
 */
import { describe, it, expect } from 'vitest';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildRiskScenario } from '../simulator/scenario-risk';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState } from './live-intelligence-state';

// 事件类型从场景构造器推断，避免额外 import。
type LiveEvent = ReturnType<typeof buildNormalScenario>['events'][number];

/** 与 R1.1 测试一致的 dispatch 辅助：走与 useReducer 完全相同的纯函数路径。 */
function dispatchAll(events: LiveEvent[], scenario: string, jobId: string) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

const { assets, clusters, sellingPoints, riskExclusion, insights } = competitorAnalysisMock;
const assetIds = new Set(assets.map((a) => a.id));

/** 断言一个 ConfidenceInfo 携带非空中文依据。 */
function expectBasisZh(c: { basisZh?: string }, ctx: string) {
  expect(c, `${ctx} 缺失置信度对象`).toBeDefined();
  expect(typeof c?.basisZh, `${ctx} basisZh 应为字符串`).toBe('string');
  expect((c?.basisZh ?? '').trim().length, `${ctx} basisZh 不得为空`).toBeGreaterThan(0);
}

// =========================================================================
// 一、12 张资产本身：数量、SVG 唯一性、用途分布、聚类/置信度完整性
// =========================================================================

describe('F2 §6 资产 SVG 唯一性与数量', () => {
  it('资产总数为 12 且与 assetCount 一致', () => {
    expect(assets.length).toBe(12);
    expect(competitorAnalysisMock.assetCount).toBe(12);
  });

  it('每张资产使用互异 SVG（无两张共享同一 src）', () => {
    const srcs = assets.map((a) => a.src);
    expect(new Set(srcs).size, '存在 SVG 复用').toBe(srcs.length);
    for (const src of srcs) {
      expect(src.startsWith('/demo-assets/'), `src 应为本地路径: ${src}`).toBe(true);
      expect(src.endsWith('.svg'), `src 应为 SVG: ${src}`).toBe(true);
    }
  });
});

describe('F2 用途分布（主图≥1 / 场景图≥3 / 卖点图≥3 / 细节图≥1 / 参数图≥1）', () => {
  function count(role: string): number {
    return assets.filter((a) => a.role === role).length;
  }

  it('主图 ≥1', () => expect(count('主图')).toBeGreaterThanOrEqual(1));
  it('场景图 ≥3', () => expect(count('场景图')).toBeGreaterThanOrEqual(3));
  it('卖点图 ≥3', () => expect(count('卖点图')).toBeGreaterThanOrEqual(3));
  it('细节图 ≥1', () => expect(count('细节图')).toBeGreaterThanOrEqual(1));
  it('参数图 ≥1', () => expect(count('参数图')).toBeGreaterThanOrEqual(1));

  it('用途计数合计为 12', () => {
    const total =
      count('主图') + count('场景图') + count('卖点图') + count('细节图') + count('参数图');
    expect(total).toBe(12);
  });
});

describe('F2 §5.1 每张资产携带非空 clusterId 与已定义 confidence', () => {
  it('无资产存在空 clusterId 或 undefined confidence', () => {
    for (const a of assets) {
      expect(typeof a.clusterId, `${a.id} clusterId 应为字符串`).toBe('string');
      expect(a.clusterId.trim().length, `${a.id} clusterId 不得为空`).toBeGreaterThan(0);
      expect(a.confidence, `${a.id} confidence 不得为 undefined`).toBeDefined();
    }
  });

  it('每张资产的 clusterId 指向真实存在的聚类', () => {
    const clusterIds = new Set(clusters.map((c) => c.id));
    for (const a of assets) {
      expect(clusterIds.has(a.clusterId), `${a.id} clusterId=${a.clusterId} 不存在`).toBe(true);
    }
  });
});

// =========================================================================
// 二、交叉引用一致性：聚类 / 卖点 / 风险排除 / 洞察 → 资产 id
// =========================================================================

describe('F2 4 个构图聚类的 assetIds 全部指向真实资产', () => {
  it('聚类数量为 4', () => {
    expect(clusters.length).toBe(4);
  });

  it('每个聚类的 assetIds 均为真实 id', () => {
    for (const c of clusters) {
      expect(c.assetIds.length, `${c.id} 应至少含 1 张资产`).toBeGreaterThan(0);
      for (const id of c.assetIds) {
        expect(assetIds.has(id), `${c.id} 引用了不存在的资产 ${id}`).toBe(true);
      }
    }
  });
});

describe('F2 §5.4 卖点顺序每个节点的 assetIds 指向真实资产', () => {
  it('每个卖点节点的 assetIds 均为真实 id', () => {
    expect(sellingPoints.length).toBeGreaterThan(0);
    for (const sp of sellingPoints) {
      expect(sp.assetIds.length, `${sp.id} 应至少含 1 张资产`).toBeGreaterThan(0);
      for (const id of sp.assetIds) {
        expect(assetIds.has(id), `${sp.id} 引用了不存在的资产 ${id}`).toBe(true);
      }
    }
  });
});

describe('F2 §7.4 风险排除清单每个条目的 assetIds 指向真实资产', () => {
  const groups: Array<['prohibited' | 'factCheck' | 'safe', string]> = [
    ['prohibited', '禁止继承'],
    ['factCheck', '待事实校验'],
    ['safe', '可安全借鉴'],
  ];

  for (const [key, label] of groups) {
    it(`${label}（riskExclusion.${key}）所有 assetIds 为真实 id`, () => {
      for (const item of riskExclusion[key]) {
        for (const id of item.assetIds) {
          expect(assetIds.has(id), `${label} ${item.id} 引用了不存在的资产 ${id}`).toBe(true);
        }
      }
    });
  }
});

// =========================================================================
// 三、置信度真实性：所有 ConfidenceInfo 携带非空中文依据（§八）
// =========================================================================

describe('F2 §八 所有 ConfidenceInfo 携带可定位的中文依据', () => {
  it('每张资产的 confidence.basisZh 非空', () => {
    for (const a of assets) {
      expectBasisZh(a.confidence, `资产 ${a.id}`);
    }
  });

  it('每个聚类的 borrowability.basisZh 非空', () => {
    for (const c of clusters) {
      expectBasisZh(c.borrowability, `聚类 ${c.id}`);
    }
  });

  it('每个套图洞察的 confidence.basisZh 非空', () => {
    for (const ins of insights) {
      expectBasisZh(ins.confidence, `洞察 ${ins.id}`);
    }
    // 兜底：确保确实存在待审计的洞察项
    expect(insights.length).toBeGreaterThan(0);
  });
});

// =========================================================================
// 四、normal 场景最终归并态业务事实
// =========================================================================

describe('F2 normal 场景最终态：findings=24 / risks=3 / blockingConflicts=0 / recipe=7/7', () => {
  const scenario = buildNormalScenario();
  const s = dispatchAll(scenario.events, scenario.scenarioId, scenario.jobId);

  it('权威业务统计：findings=24, risks=3, blockingConflicts=0', () => {
    expect(s.summaryMetrics.findings).toBe(24);
    expect(s.summaryMetrics.risks).toBe(3);
    expect(s.summaryMetrics.blockingConflicts).toBe(0);
  });

  it('Creative Recipe 7 个字段全部补全（7/7）', () => {
    const keys = Object.keys(s.recipe);
    expect(keys.length).toBe(7);
    const trueCount = Object.values(s.recipe).filter(Boolean).length;
    expect(trueCount).toBe(7);
  });

  it('任务终态为 completed 且 build_recipe 阶段 completed', () => {
    expect(s.jobStatus).toBe('completed');
    expect(s.stages.build_recipe.status).toBe('completed');
  });
});

// =========================================================================
// 五、risk 场景最终归并态业务事实
// =========================================================================

describe('F2 risk 场景最终态：build_recipe=awaiting_review / blockingConflicts=1', () => {
  const scenario = buildRiskScenario();
  const s = dispatchAll(scenario.events, scenario.scenarioId, scenario.jobId);

  it('build_recipe 阶段进入 awaiting_review', () => {
    expect(s.stages.build_recipe.status).toBe('awaiting_review');
  });

  it('存在 1 项结构阻断（blockingConflicts=1）', () => {
    expect(s.summaryMetrics.blockingConflicts).toBe(1);
  });

  it('任务终态为 awaiting_review（非全绿，需人工确认）', () => {
    expect(s.jobStatus).toBe('awaiting_review');
    expect(s.requiresAction).toBe(true);
  });
});
