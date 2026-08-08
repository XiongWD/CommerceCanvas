/**
 * F3：应用外壳 AppShell + App（BrowserRouter 包装）。
 *
 * - useLiveIntelligence 在 AppShell 层调用一次，经 LiveContext 向下传递给所有页面（不重复挂载模拟器）。
 * - AppShell 不含 Router，便于测试用 MemoryRouter 包装（避免 Router 嵌套）。
 * - App = BrowserRouter > AppShell，供生产入口使用。
 * - 路由：
 *     /products/:productId/competitor-analysis/:runId → 竞品分析页
 *     /jobs/:jobId                                    → 任务详情页
 *     *                                              → 默认竞品分析页
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalRail } from '@/components/layout/GlobalRail';
import { PersistentTaskBar } from '@/components/layout/PersistentTaskBar';
import { useLiveIntelligence, DemoControls, AmbientStatus } from '@/features/live-intelligence';
import { LiveContext } from './live-context';
import { CompetitorAnalysisPage } from '@/pages/competitor-analysis-page';
import { JobDetailPage } from '@/pages/job-detail-page';
import { DesignFoundationPage } from '@/pages/DesignFoundationPage';

/**
 * AppShell：真实应用结构（不含 BrowserRouter，便于测试用 MemoryRouter 包装）。
 * useLiveIntelligence 在此层调用一次（NG-024：单一真实来源）。
 */
export function AppShell() {
  const live = useLiveIntelligence('normal');

  return (
    <LiveContext.Provider value={live}>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <DemoControls
          status={live.simulatorStatus}
          speed={live.speed}
          scenarioId={live.scenarioId}
          onStart={live.start}
          onPause={live.pause}
          onResume={live.resume}
          onRestart={live.restart}
          onSpeed={live.setSpeed}
          onSwitch={live.switchScenario}
        />
        <AmbientStatus state={live.state} />

        <div className="flex min-h-0 flex-1">
          <GlobalRail />
          <Routes>
            <Route
              path="/products/:productId/competitor-analysis/:runId"
              element={<CompetitorAnalysisPage />}
            />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/__dev/design-foundation" element={<DesignFoundationPage />} />
            <Route path="*" element={<CompetitorAnalysisPage />} />
          </Routes>
        </div>

        <PersistentTaskBar live={live} />
      </div>
    </LiveContext.Provider>
  );
}

/** App：生产入口，BrowserRouter > AppShell（Graphite Native，无 Astryx runtime）。 */
export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
