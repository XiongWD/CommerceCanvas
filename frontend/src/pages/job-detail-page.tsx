/**
 * F3 Job Detail 页面（完整实现：6 区域 + 客户/管理员边界 + 跨页面导航）。
 *
 * 6 区域：Job 总览 / 节点状态列表 / 中文执行时间线 / Artifact 关系 / QC 结果 / 成本重试路由。
 * 所有结果由 projectJobDetail 投影推导，不使用独立 Mock。
 * 客户模式不显示诊断数据；管理员演示模式显示独立诊断抽屉。
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectJobDetail } from '@/features/job-detail/state/job-detail-projection';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { useLiveContext } from '@/app/live-context';
import { STAGE_LABEL_ZH } from '@/features/live-intelligence/state/live-intelligence-state';
import { formatElapsed } from '@/features/live-intelligence/state/live-intelligence-selectors';
import { categoryTone } from '@/features/live-intelligence/mappings/event-presentation-map';
import { ShieldCheck, DollarSign, RefreshCw, ArrowRight, Stethoscope, ArrowLeft, Activity, FileText } from 'lucide-react';
import type { TraceCategoryZh } from '@/types/live-event';

type TimelineFilter = '全部' | '关键事件' | '风险' | 'Artifact' | 'QC' | '成本' | '重试与路由' | '系统';

const TIMELINE_FILTERS: { key: TimelineFilter; matchCats: TraceCategoryZh[] }[] = [
  { key: '全部', matchCats: [] },
  { key: '关键事件', matchCats: ['发现', '判断', '证据', '成果'] },
  { key: '风险', matchCats: ['风险'] },
  { key: 'Artifact', matchCats: ['成果'] },
  { key: 'QC', matchCats: ['质量检查'] },
  { key: '成本', matchCats: ['成本'] },
  { key: '重试与路由', matchCats: ['重试', '系统'] },
  { key: '系统', matchCats: ['系统'] },
];

export function JobDetailPage() {
  const live = useLiveContext();
  const navigate = useNavigate();
  const analysisData = competitorAnalysisMock;
  const [tlFilter, setTlFilter] = useState<TimelineFilter>('全部');
  const [adminMode, setAdminMode] = useState(false);
  const [diagOpen, setDiagOpen] = useState(false);

  const detail = useMemo(
    () => projectJobDetail(live.state, analysisData),
    [live.state, analysisData],
  );

  const o = detail.overview;

  const filteredTimeline = useMemo(() => {
    if (tlFilter === '全部') return detail.timelineItems;
    const filterDef = TIMELINE_FILTERS.find((f) => f.key === tlFilter);
    if (!filterDef || filterDef.matchCats.length === 0) return detail.timelineItems;
    return detail.timelineItems.filter((t) => filterDef.matchCats.includes(t.category as TraceCategoryZh));
  }, [detail.timelineItems, tlFilter]);

  // 跨页面导航：QC 风险 → 返回竞品分析 + Evidence
  const handleQcNavigate = (qcId: string) => {
    const qc = detail.qcResults.find((q) => q.id === qcId);
    if (!qc?.sourceSequence) return;
    const traceItem = detail.timelineItems.find((t) => t.sequence === qc.sourceSequence);
    if (traceItem?.evidenceRefs?.[0]) {
      const ref = traceItem.evidenceRefs[0];
      live.focusEvidence({
        assetId: ref.assetId,
        layer: ref.layer,
        regionId: ref.regionId,
        source: 'trace',
        fromSequence: qc.sourceSequence,
      });
    }
    navigate(`/products/ow-a31-blk/competitor-analysis/${live.state.jobId || 'latest'}`);
  };

  return (
    <div
      data-testid="job-detail-page"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      style={{ background: 'var(--gc-bg-app)' }}
    >
      {/* —— 4.1 Job 总览 —— */}
      <header
        className="flex shrink-0 flex-col gap-2 border-b px-6 py-4"
        style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-elev-1)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <button
              onClick={() => navigate(`/products/ow-a31-blk/competitor-analysis/${live.state.jobId || 'latest'}`)}
              className="flex items-center gap-1 text-2xs"
              style={{ color: 'var(--gc-accent-blue)' }}
            >
              <ArrowLeft size={12} /> 返回分析
            </button>
            <h1 className="text-base font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
              {o.jobNameZh}
            </h1>
            <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{o.jobId}</span>
            <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>SKU · {o.sku}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="gc-data text-2xs" style={{ color: 'var(--gc-accent-purple)' }}>演示运行 · 模拟事件流</span>
            <button
              onClick={() => setAdminMode((v) => !v)}
              data-testid="admin-mode-toggle"
              className="rounded-sm px-2 py-0.5 text-2xs"
              style={{
                color: adminMode ? 'var(--gc-accent-amber)' : 'var(--gc-text-faint)',
                border: '1px solid var(--gc-line)',
              }}
            >
              {adminMode ? '管理员演示模式 · 开' : '管理员模式'}
            </button>
            {adminMode && (
              <button
                onClick={() => setDiagOpen(true)}
                data-testid="admin-diag-open"
                className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-2xs"
                style={{ color: 'var(--gc-accent-amber)', border: '1px solid var(--gc-accent-amber)' }}
              >
                <Stethoscope size={11} /> 诊断
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-2xs">
          <Metric label="阶段"><span className="gc-data">{o.stageProgress.done}/{o.stageProgress.total}</span></Metric>
          <Metric label="图片"><span className="gc-data">{o.imageProgress.processed}/{o.imageProgress.total}</span></Metric>
          <Metric label="发现"><span className="gc-data">{o.findings}</span></Metric>
          <Metric label="风险"><span className="gc-data" style={{ color: o.risks ? 'var(--gc-accent-amber)' : undefined }}>{o.risks}</span></Metric>
          <Metric label="产物"><span className="gc-data">{o.artifacts}</span></Metric>
          <Metric label="已用时"><span className="gc-data">{formatElapsed(o.elapsedSeconds)}</span></Metric>
          <Metric label="连接"><span style={{ color: 'var(--gc-text-mid)' }}>{o.connection}</span></Metric>
          <span style={{ color: o.requiresAction ? 'var(--gc-accent-amber)' : 'var(--gc-accent-green)' }}>
            {o.status}
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px overflow-y-auto" style={{ background: 'var(--gc-line)' }}>
        {/* —— 4.2 节点状态列表 —— */}
        <Section title="节点状态" icon={<ShieldCheck size={13} />}>
          <div className="flex flex-col gap-1">
            {detail.nodes.map((node) => {
              const tone = node.status === 'completed' ? 'var(--gc-accent-green)' :
                node.status === 'active' ? 'var(--gc-accent-blue)' :
                node.status === 'awaiting_review' ? 'var(--gc-accent-amber)' :
                node.status === 'failed' ? 'var(--gc-accent-red)' : 'var(--gc-text-faint)';
              return (
                <div key={node.stageId} data-testid={`job-node-${node.stageId}`}
                  className="flex items-start gap-2 rounded-sm px-2 py-1.5"
                  style={{ background: 'var(--gc-bg-app)', borderLeft: `2px solid ${tone}` }}
                >
                  <span className="mt-0.5 shrink-0 rounded-full" style={{ width: 8, height: 8, background: tone }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>{node.nameZh}</span>
                      <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{node.status}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                      {node.elapsedSeconds !== undefined && <span>用时 {formatElapsed(node.elapsedSeconds)}</span>}
                      <span>尝试 {node.attemptCount}</span>
                      {node.findingsProduced > 0 && <span>发现 {node.findingsProduced}</span>}
                      {node.artifactsProduced.length > 0 && <span>产物 {node.artifactsProduced.length}</span>}
                      {node.riskStatus !== 'none' && (
                        <span style={{ color: node.riskStatus === 'block' ? 'var(--gc-accent-red)' : 'var(--gc-accent-amber)' }}>
                          {node.riskStatus === 'block' ? '阻断' : '风险'}
                        </span>
                      )}
                      {node.awaitingReview && <span style={{ color: 'var(--gc-accent-amber)' }}>待人工确认</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* —— 4.3 中文执行时间线 —— */}
        <Section title="执行时间线" icon={<Activity size={13} />}>
          <div className="mb-2 flex flex-wrap gap-0.5">
            {TIMELINE_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setTlFilter(f.key)}
                className="rounded-sm px-1.5 py-0.5 text-2xs transition-colors"
                style={{
                  color: tlFilter === f.key ? 'var(--gc-accent-blue)' : 'var(--gc-text-faint)',
                  background: tlFilter === f.key ? 'var(--gc-accent-blue-soft)' : 'transparent',
                }}
              >{f.key}</button>
            ))}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredTimeline.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>暂无事件</div>
            ) : (
              <ol className="flex flex-col gap-0.5">
                {filteredTimeline.map((t) => {
                  const tone = categoryTone(t.category as TraceCategoryZh);
                  return (
                    <li key={t.sequence} className="flex gap-2 rounded-sm px-2 py-1"
                      style={{ borderLeft: `2px solid ${tone.color}44` }}
                    >
                      <span className="gc-data shrink-0 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                        #{t.sequence}
                      </span>
                      <span className="shrink-0 text-2xs" style={{ color: tone.color, minWidth: 36 }}>{t.category}</span>
                      <span className="min-w-0 flex-1 truncate text-xs" style={{ color: 'var(--gc-text-mid)' }}>{t.titleZh}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </Section>

        {/* —— 4.4 Artifact 关系 —— */}
        <Section title="Artifact 关系" icon={<FileText size={13} />}>
          <div className="flex flex-col gap-1">
            {detail.artifacts.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>暂无产物</div>
            ) : (
              detail.artifacts.map((a) => (
                <div key={a.artifactId} data-testid={`job-artifact-${a.artifactId}`}
                  className="rounded-sm px-2 py-1.5" style={{ background: 'var(--gc-bg-app)', border: '1px solid var(--gc-line)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>{a.nameZh}</span>
                    <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{a.version}</span>
                    <span className="text-2xs" style={{ color: a.status === 'completed' ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)' }}>{a.status}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                    {a.generatedByStage && <span>来源：{STAGE_LABEL_ZH[a.generatedByStage as keyof typeof STAGE_LABEL_ZH] ?? a.generatedByStage}</span>}
                    <span>事件 #{a.sourceEventId}</span>
                    {a.linkedAssetCount > 0 && <span>关联 {a.linkedAssetCount} 张</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* —— 4.5 QC 结果 —— */}
        <Section title="QC 结果" icon={<ShieldCheck size={13} />}>
          <div className="flex flex-col gap-1">
            {detail.qcResults.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>暂无 QC 检查</div>
            ) : (
              detail.qcResults.map((qc) => {
                const tone = qc.status === 'pass' ? 'var(--gc-accent-green)' : qc.status === 'warning' ? 'var(--gc-accent-amber)' : 'var(--gc-accent-red)';
                const label = qc.status === 'pass' ? '通过' : qc.status === 'warning' ? '待检查' : '阻断';
                return (
                  <div key={qc.id} data-testid={`job-qc-${qc.id}`}
                    onClick={() => qc.status !== 'pass' && handleQcNavigate(qc.id)}
                    className="cursor-pointer rounded-sm px-2 py-1.5 transition-colors hover:bg-[var(--gc-bg-elev-1)]"
                    style={{ background: 'var(--gc-bg-app)', borderLeft: `2px solid ${tone}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>{qc.nameZh}</span>
                      <span className="text-2xs" style={{ color: tone }}>{label}</span>
                    </div>
                    <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                      {qc.targetZh} · 证据 {qc.evidenceCount}
                      {qc.reasonZh && ` · ${qc.reasonZh}`}
                      {qc.requiresReview && <span style={{ color: 'var(--gc-accent-amber)' }}> · 需人工确认</span>}
                    </div>
                    {qc.status !== 'pass' && (
                      <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-accent-blue)' }}>
                        点击定位 Evidence →
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Section>

        {/* —— 4.6 成本、重试和路由升级 —— */}
        <Section title="成本 · 重试 · 路由" icon={<DollarSign size={13} />}>
          {/* 成本 */}
          <div className="mb-2 rounded-sm px-2 py-1.5" style={{ background: 'var(--gc-bg-app)', border: '1px solid var(--gc-line)' }}>
            <div className="gc-section-label mb-1">成本</div>
            {detail.costSummary.hasEvents ? (
              <div className="flex flex-wrap gap-x-4 text-2xs">
                <span style={{ color: 'var(--gc-text-mid)' }}>预估 <span className="gc-data">${(detail.costSummary.estimatedCents / 100).toFixed(2)}</span></span>
                <span style={{ color: 'var(--gc-text-mid)' }}>实际 <span className="gc-data">${(detail.costSummary.actualCents / 100).toFixed(2)}</span></span>
                <span style={{ color: detail.costSummary.deltaCents > 0 ? 'var(--gc-accent-amber)' : 'var(--gc-accent-green)' }}>
                  差异 <span className="gc-data">{detail.costSummary.deltaCents > 0 ? '+' : ''}${(detail.costSummary.deltaCents / 100).toFixed(2)}</span>
                </span>
              </div>
            ) : (
              <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>暂无成本事件</span>
            )}
          </div>
          {/* 路由升级 */}
          {detail.routeUpgrades.length > 0 && (
            <div className="mb-2 rounded-sm px-2 py-1.5" style={{ background: 'var(--gc-accent-amber-soft)', border: '1px solid rgba(224,169,58,0.3)' }}>
              <div className="flex items-center gap-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                <RefreshCw size={11} /> 路由升级
              </div>
              {detail.routeUpgrades.map((r, i) => (
                <div key={i} className="mt-1 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
                  {r.fromStrategy} <ArrowRight size={9} className="inline" /> {r.toStrategy}
                  <span style={{ color: 'var(--gc-text-faint)' }}> · {r.reasonZh}</span>
                  {r.costDeltaCents && <span className="gc-data" style={{ color: 'var(--gc-accent-amber)' }}> +${(r.costDeltaCents / 100).toFixed(2)}</span>}
                </div>
              ))}
            </div>
          )}
          {/* 重试 */}
          {detail.retryRecords.length > 0 && (
            <div className="rounded-sm px-2 py-1.5" style={{ background: 'var(--gc-bg-app)', border: '1px solid var(--gc-line)' }}>
              <div className="flex items-center gap-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                <RefreshCw size={11} /> 重试记录
              </div>
              {detail.retryRecords.map((r, i) => (
                <div key={i} className="mt-1 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
                  第 {r.attempt}/{r.maxAttempts} 次 · {r.reasonZh}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* —— 管理员诊断抽屉 —— */}
      {adminMode && diagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDiagOpen(false)}
        >
          <div data-testid="admin-diag-drawer"
            className="max-h-[80vh] w-[600px] overflow-y-auto rounded-sm p-4"
            style={{ background: 'var(--gc-bg-elev-2)', border: '1px solid var(--gc-accent-amber)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: 'var(--gc-accent-amber)' }}>
                诊断信息 · 仅管理员可见
              </span>
              <button onClick={() => setDiagOpen(false)} className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>关闭</button>
            </div>
            <pre className="gc-data text-2xs overflow-auto" style={{ color: 'var(--gc-text-lo)' }}>
              {JSON.stringify({
                jobId: live.state.jobId,
                runId: live.state.runId,
                lastSequence: live.state.ledger.lastContiguousSequence,
                receivedCount: live.state.receivedCount,
                jobStatus: live.state.jobStatus,
                connection: live.state.connection,
                stages: live.state.stageOrder.map((id) => ({ id, status: live.state.stages[id].status })),
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden p-3" style={{ background: 'var(--gc-bg-elev-1)' }}>
      <div className="mb-2 flex items-center gap-1.5">
        <span style={{ color: 'var(--gc-text-lo)' }}>{icon}</span>
        <span className="gc-section-label">{title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-baseline gap-1">
      <span style={{ color: 'var(--gc-text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--gc-text-mid)' }}>{children}</span>
    </span>
  );
}
