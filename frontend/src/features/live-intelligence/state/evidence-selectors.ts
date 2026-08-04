/**
 * Evidence 定位 Selector（F2 §3.2 提取）。
 * 组件与测试共同导入此函数，禁止复制同名算法。
 *
 * 三级回退：regionId 精确 → assetId+layer → assetId → undefined。
 */

import type { LiveIntelligenceState } from './live-intelligence-state';
import type { EvidenceRef } from '@/types/live-event';

export interface EvidenceLookup {
  regionId?: string;
  assetId?: string;
  layer?: EvidenceRef['layer'];
}

/** 在分析轨迹中反查 sequence（点击画布 Evidence → 定位轨迹） */
export function findSequenceForEvidence(
  state: LiveIntelligenceState,
  params: EvidenceLookup,
): number | undefined {
  const { regionId, assetId, layer } = params;
  // 1. regionId 精确匹配
  if (regionId) {
    const exact = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.regionId === regionId),
    );
    if (exact) return exact.sequence;
  }
  // 2. assetId + layer 匹配
  if (assetId && layer) {
    const byAssetLayer = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.assetId === assetId && r.layer === layer),
    );
    if (byAssetLayer) return byAssetLayer.sequence;
  }
  // 3. assetId 匹配（最宽回退）
  if (assetId) {
    const byAsset = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.assetId === assetId),
    );
    if (byAsset) return byAsset.sequence;
  }
  return undefined;
}

/** 反查：给定 sequence 找到对应轨迹条目（用于点击画布 Evidence 后高亮轨迹） */
export function findTraceBySequence(
  state: LiveIntelligenceState,
  sequence: number | undefined,
) {
  if (sequence === undefined) return undefined;
  return state.trace.find((t) => t.sequence === sequence);
}
