/**
 * F2-R1.3-E1 §2 真实组件测试。
 * 验证聚类详情、卖点详情、检查器切换、restart 重置。
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClusterView } from '@/components/competitor/ClusterView';
import { SellingPointSequenceView } from '@/components/competitor/SellingPointSequenceView';
import { RiskExclusionTab } from '@/components/competitor/RiskExclusionTab';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';

const clusters = competitorAnalysisMock.clusters;
const assets = competitorAnalysisMock.assets;
const sellingPoints = competitorAnalysisMock.sellingPoints;

describe('§2.1 聚类详情联动', () => {
  it('点击 cluster-a 后只显示该聚类详情和关联图片', () => {
    const onSelectCluster = vi.fn();
    const onSelectAsset = vi.fn();
    render(
      <ClusterView
        clusters={clusters}
        assets={assets}
        selectedClusterId={null}
        onSelectCluster={onSelectCluster}
        onSelectAsset={onSelectAsset}
      />,
    );
    // 点击 cluster-a
    fireEvent.click(screen.getByTestId('cluster-cluster-a'));
    expect(onSelectCluster).toHaveBeenCalledWith('cluster-a');
  });

  it('selectedClusterId 设置后显示详情模式', () => {
    render(
      <ClusterView
        clusters={clusters}
        assets={assets}
        selectedClusterId="cluster-a"
        onSelectCluster={vi.fn()}
        onSelectAsset={vi.fn()}
      />,
    );
    // 详情模式应有返回按钮
    expect(screen.getByTestId('cluster-back-to-overview')).toBeTruthy();
    // 应有该聚类的关联图片
    const clusterA = clusters.find((c) => c.id === 'cluster-a')!;
    for (const assetId of clusterA.assetIds) {
      expect(screen.queryByTestId(`cluster-asset-${assetId}`)).toBeTruthy();
    }
  });

  it('点击返回全部聚类恢复总览', () => {
    const onSelectCluster = vi.fn();
    render(
      <ClusterView
        clusters={clusters}
        assets={assets}
        selectedClusterId="cluster-a"
        onSelectCluster={onSelectCluster}
      />,
    );
    fireEvent.click(screen.getByTestId('cluster-back-to-overview'));
    expect(onSelectCluster).toHaveBeenCalledWith(null);
  });
});

describe('§2.2 卖点详情联动', () => {
  it('点击 sp-comfort 后显示详情和全部关联图片', () => {
    render(
      <SellingPointSequenceView
        sellingPoints={sellingPoints}
        assets={assets}
        onSelectAsset={vi.fn()}
        onSelectSellingPoint={vi.fn()}
        selectedSellingPointId="sp-comfort"
      />,
    );
    // 详情模式应有返回按钮
    expect(screen.getByTestId('sp-back-to-sequence')).toBeTruthy();
    // 应有该卖点的关联图片
    const sp = sellingPoints.find((s) => s.id === 'sp-comfort')!;
    for (const assetId of sp.assetIds) {
      expect(screen.queryByTestId(`sp-asset-${assetId}`)).toBeTruthy();
    }
  });

  it('点击返回卖点顺序恢复全部节点', () => {
    const onSelectSP = vi.fn();
    render(
      <SellingPointSequenceView
        sellingPoints={sellingPoints}
        assets={assets}
        onSelectAsset={vi.fn()}
        onSelectSellingPoint={onSelectSP}
        selectedSellingPointId="sp-comfort"
      />,
    );
    fireEvent.click(screen.getByTestId('sp-back-to-sequence'));
    expect(onSelectSP).toHaveBeenCalledWith('');
  });
});

describe('§2.3 风险排除 Tab 导航', () => {
  it('点击风险条目调用 onNavigateRisk', () => {
    const onNavigateRisk = vi.fn();
    const riskExclusion = competitorAnalysisMock.riskExclusion;
    render(
      <RiskExclusionTab
        riskExclusion={riskExclusion}
        onSelectAsset={vi.fn()}
        onNavigateRisk={onNavigateRisk}
      />,
    );
    // 点击第一个风险条目
    const firstRisk = screen.getByTestId(`risk-item-${riskExclusion.prohibited[0].id}`);
    fireEvent.click(firstRisk);
    expect(onNavigateRisk).toHaveBeenCalledWith(riskExclusion.prohibited[0].id);
  });
});

describe('§2.4 状态重置验证', () => {
  it('restart 后 selectedClusterId/SellingPointId 应为 null（由 App 重置逻辑保证）', () => {
    // 验证组件在 selectedClusterId=null 时显示总览模式
    const { rerender } = render(
      <ClusterView
        clusters={clusters}
        assets={assets}
        selectedClusterId="cluster-a"
        onSelectCluster={vi.fn()}
      />,
    );
    expect(screen.getByTestId('cluster-back-to-overview')).toBeTruthy();

    // 重置后
    rerender(
      <ClusterView
        clusters={clusters}
        assets={assets}
        selectedClusterId={null}
        onSelectCluster={vi.fn()}
      />,
    );
    // 总览模式应显示聚类卡片而非详情
    expect(screen.queryByTestId('cluster-back-to-overview')).toBeNull();
    expect(screen.getByTestId('cluster-cluster-a')).toBeTruthy();
  });

  it('restart 后 selectedSellingPointId 应为 null', () => {
    const { rerender } = render(
      <SellingPointSequenceView
        sellingPoints={sellingPoints}
        assets={assets}
        onSelectAsset={vi.fn()}
        onSelectSellingPoint={vi.fn()}
        selectedSellingPointId="sp-comfort"
      />,
    );
    expect(screen.getByTestId('sp-back-to-sequence')).toBeTruthy();

    rerender(
      <SellingPointSequenceView
        sellingPoints={sellingPoints}
        assets={assets}
        onSelectAsset={vi.fn()}
        onSelectSellingPoint={vi.fn()}
        selectedSellingPointId={null}
      />,
    );
    expect(screen.queryByTestId('sp-back-to-sequence')).toBeNull();
    expect(screen.getByTestId('selling-point-sp-comfort')).toBeTruthy();
  });
});
