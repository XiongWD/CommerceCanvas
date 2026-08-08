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

  // F3-R1 §八：跨页面导航 QC 风险 → 返回竞品分析 + Evidence（稳定导航目标，经 Router state）
  const handleQcNavigate = (qcId: string) => {
    const qc = detail.qcResults.find((q) => q.id === qcId);
    if (!qc) return;
    // 优先用 QC 自身的差异化 evidenceRefs（F3-R1 §五：每项 QC 有对应类型 Evidence）
    const ref = qc.evidenceRefs?.[0];
    const target: {
      jobId: string;
      runId: number;
      qcResultId: string;
      traceSequence?: number;
      evidence?: { assetId?: string; layer?: string; regionId?: string };
    } = {
      jobId: live.state.jobId,
      runId: live.state.runId,
      qcResultId: qc.id,
      traceSequence: qc.sourceSequence,
    };
    if (ref) {
      target.evidence = { assetId: ref.assetId, layer: ref.layer, regionId: ref.regionId };
      // 同步设置 live focus（确保返回分析页时立即聚焦）
      live.focusEvidence({
        assetId: ref.assetId,
        layer: ref.layer,
        regionId: ref.regionId,
        source: 'trace',
        fromSequence: qc.sourceSequence,
      });
    }
    if (qc.sourceSequence) live.highlightTraceSequence(qc.sourceSequence);
    navigate(`/products/ow-a31-blk/competitor-analysis/${live.state.jobId || 'latest'}`, {
      state: target,
    });
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
          <Metric label="产物">
            <span className="gc-data">{detail.artifactMetrics.total}</span>
            <span className="gc-data" style={{ color: 'var(--gc-text-faint)' }}>（中间 {detail.artifactMetrics.intermediate} · 最终 {detail.artifactMetrics.final}）</span>
          </Metric>
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
              // F3-R1 §三：样式用 statusRaw（原始键），展示用 status（中文）
              const tone = node.statusRaw === 'completed' ? 'var(--gc-accent-green)' :
                node.statusRaw === 'active' ? 'var(--gc-accent-blue)' :
                node.statusRaw === 'awaiting_review' ? 'var(--gc-accent-amber)' :
                node.statusRaw === 'failed' ? 'var(--gc-accent-red)' : 'var(--gc-text-faint)';
              return (
                <div key={node.stageId} data-testid={`job-node-${node.stageId}`}
                  data-node-status={node.statusRaw}
                  data-node-attempt={node.attemptCount}
                  data-node-findings={node.findingsProduced}
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
                      {node.startedAt && <span>开始 {fmtTime(node.startedAt)}</span>}
                      {node.completedAt && <span>完成 {fmtTime(node.completedAt)}</span>}
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

        {/* —— 4.4 Artifact 关系（F3-R2 P0-1：真实 producer；P0-2：单一口径 metrics） —— */}
        <Section title="Artifact 关系" icon={<FileText size={13} />}>
          <div className="mb-1 flex items-center gap-3 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
            <span data-testid="artifact-metrics-total">产物 {detail.artifactMetrics.total}</span>
            <span>中间 {detail.artifactMetrics.intermediate}</span>
            <span>最终 {detail.artifactMetrics.final}</span>
          </div>
          <div className="flex flex-col gap-1">
            {detail.artifacts.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>暂无产物</div>
            ) : (
              detail.artifacts.map((a) => (
                <div key={a.artifactId} data-testid={`job-artifact-${a.artifactId}`}
                  data-source-event={a.sourceEventId}
                  data-producer-stage={a.generatedByStage ?? ''}
                  data-parent-count={a.parentArtifactIds.length}
                  data-role={a.role}
                  className="rounded-sm px-2 py-1.5" style={{ background: 'var(--gc-bg-app)', border: '1px solid var(--gc-line)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>{a.nameZh}</span>
                    <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{a.version}</span>
                    <span className="text-2xs" style={{ color: a.status === '待确认' ? 'var(--gc-accent-amber)' : 'var(--gc-accent-green)' }}>{a.status}</span>
                    <span className="text-2xs" style={{ color: a.role === 'final' ? 'var(--gc-accent-blue)' : 'var(--gc-text-faint)' }}>
                      {a.role === 'final' ? '最终产物' : '中间产物'}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                    <span className="gc-data">{a.type}</span>
                    {a.generatedByStage && <span>生产：{STAGE_LABEL_ZH[a.generatedByStage as keyof typeof STAGE_LABEL_ZH] ?? a.generatedByStage}</span>}
                    <span>事件 #{a.sourceSequence}</span>
                    {a.linkedAssetCount > 0 && <span>关联 {a.linkedAssetCount} 张</span>}
                    {a.parentArtifactIds.length > 0 && (
                      <span style={{ color: 'var(--gc-accent-blue)' }}>← 衍生自 {a.parentArtifactIds.length} 个产物</span>
                    )}
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
                    data-qc-status={qc.status}
                    data-qc-review={qc.requiresReview ? 'true' : 'false'}
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
                      {qc.requiresReview && (
                        <span data-testid={`qc-review-flag-${qc.id}`} style={{ color: 'var(--gc-accent-amber)' }}> · 需人工确认</span>
                      )}
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
          {/* 路由升级（F3-R1 §七：完整展示策略+原因+成本+耗时影响，不只成本） */}
          {detail.routeUpgrades.length > 0 && (
            <div className="mb-2 rounded-sm px-2 py-1.5" data-testid="route-upgrade-block"
              style={{ background: 'var(--gc-accent-amber-soft)', border: '1px solid rgba(224,169,58,0.3)' }}>
              <div className="flex items-center gap-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                <RefreshCw size={11} /> 路由升级
              </div>
              {detail.routeUpgrades.map((r, i) => (
                <div key={i} className="mt-1 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
                  <div>
                    <span className="gc-data">{r.fromStrategy}</span>
                    <ArrowRight size={9} className="inline" />
                    <span className="gc-data" style={{ color: 'var(--gc-accent-amber)' }}>{r.toStrategy}</span>
                  </div>
                  <div style={{ color: 'var(--gc-text-faint)' }}>原因：{r.reasonZh}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3">
                    {r.costDeltaCents !== undefined && r.costDeltaCents > 0 && (
                      <span className="gc-data" style={{ color: 'var(--gc-accent-amber)' }}>
                        成本 +${(r.costDeltaCents / 100).toFixed(2)}
                      </span>
                    )}
                    {r.timeDeltaSeconds !== undefined && r.timeDeltaSeconds > 0 && (
                      <span className="gc-data" style={{ color: 'var(--gc-accent-amber)' }}>
                        预计耗时 +{r.timeDeltaSeconds} 秒
                      </span>
                    )}
                    <span style={{ color: 'var(--gc-accent-purple)' }}>
                      质量策略提升：{r.toStrategy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 重试（F3-R1 §六：归并后的单 attempt，含 lifecycle 状态） */}
          {detail.retryRecords.length > 0 && (
            <div className="rounded-sm px-2 py-1.5" data-testid="retry-block">
              <div className="flex items-center gap-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                <RefreshCw size={11} /> 重试记录（{detail.retryRecords.length} 次）
              </div>
              {detail.retryRecords.map((r) => (
                <div key={r.key} data-testid={`retry-attempt-${r.key}`}
                  className="mt-1 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
                  <span className="gc-data">第 {r.attempt}/{r.maxAttempts} 次</span>
                  {' · '}
                  <span style={{ color: 'var(--gc-text-faint)' }}>{r.reasonZh}</span>
                  {' · '}
                  <span style={{ color: 'var(--gc-accent-amber)' }}>
                    {r.status === 'completed' ? '已完成' : r.status === 'started' ? '进行中' : '已排期'}
                  </span>
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
    <div data-testid={`job-section-${title}`} className="flex flex-col overflow-hidden p-3" style={{ background: 'var(--gc-bg-elev-1)' }}>
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

/** ISO 时间 → HH:MM:SS 紧凑展示 */
function fmtTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
