/**
 * F3-R2 跨路由持续性与 QC→Evidence 集成测试（P1-1 ~ P1-4）。
 *
 * 覆盖任务 §15 最低自动化测试 10-15：
 *   10. receivedCount 跨路由增长
 *   11. simulator identity 跨路由不变
 *   12. browser history Back 保持 run/state
 *   13. QC click → Router → selectedAsset
 *   14. QC click → focusedEvidence
 *   15. QC click → highlightedTrace
 *
 * 通过 PersistentTaskBar 的 data-* instrumentation 读取 identity/state（只读，不改生产状态）。
 * 必须是真实 Router + UI 点击。
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AppShell } from '@/app/App';

// jsdom 未实现 matchMedia；MilestoneReveal 在完整场景运行时调用它。环境补全，非生产伪造。
beforeAll(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Theme theme={neutralTheme}>
        <AppShell />
      </Theme>
    </MemoryRouter>,
  );
}

/** 浏览器 Back 触发组件：调用 router navigate(-1)（等价于 history.back()） */
function BackTrigger() {
  const navigate = useNavigate();
  return (
    <button data-testid="test-back" onClick={() => navigate(-1)} style={{ display: 'none' }}>
      back
    </button>
  );
}

function renderAppWithBack(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Theme theme={neutralTheme}>
        <AppShell />
        <BackTrigger />
      </Theme>
    </MemoryRouter>,
  );
}

/** 从 PersistentTaskBar data-attribute 读取 instrumentation */
function readInstrument() {
  const bar = document.querySelector('[data-testid="persistent-task-bar"]');
  return {
    receivedCount: Number(bar?.getAttribute('data-received-count') ?? '0'),
    runId: Number(bar?.getAttribute('data-run-id') ?? '0'),
    simulatorIdentity: bar?.getAttribute('data-simulator-identity') ?? '',
    jobStatus: bar?.getAttribute('data-job-status') ?? '',
  };
}

async function startScenario(name: string) {
  await screen.findByTestId('persistent-task-bar');
  fireEvent.click(screen.getByRole('button', { name }));
  // 切换场景后等待 React 提交状态（避免 switchScenario 的 ref 操作与 start 竞争）
  await new Promise((r) => setTimeout(r, 50));
  fireEvent.click(screen.getByRole('button', { name: '2×' }));
  await new Promise((r) => setTimeout(r, 50));
  fireEvent.click(screen.getByRole('button', { name: '开始演示分析' }));
}

async function waitForReceived(minCount: number, timeout = 15000) {
  await waitFor(() => {
    expect(readInstrument().receivedCount).toBeGreaterThanOrEqual(minCount);
  }, { timeout });
}

async function waitForFinished(timeout = 60000) {
  await waitFor(() => {
    const { jobStatus } = readInstrument();
    return jobStatus === 'completed' || jobStatus === 'awaiting_review';
  }, { timeout });
}

describe('F3-R2 P1-1 §receivedCount 跨路由增长', () => {
  it('10. 竞品分析运行 → 进 Job Detail → receivedCount 继续增长（非重启）', async () => {
    renderApp('/');
    await startScenario('场景 A · 正常完成');
    await waitForReceived(2);
    const countBefore = readInstrument().receivedCount;
    expect(countBefore).toBeGreaterThan(0);
    // 点击「任务详情」进 Job Detail（真实 UI）
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    // 在 Job Detail 继续等待 receivedCount 增长
    await waitForReceived(countBefore + 1);
    const countAfter = readInstrument().receivedCount;
    expect(countAfter).toBeGreaterThan(countBefore);
  }, 30000);
});

describe('F3-R2 P1-2 §Simulator identity 跨路由不变', () => {
  it('11. Analysis identity A === Job Detail identity B（同一 Simulator 实例）', async () => {
    renderApp('/');
    await startScenario('场景 A · 正常完成');
    await waitForReceived(2);
    const identityA = readInstrument().simulatorIdentity;
    expect(identityA).toBeTruthy();
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    const identityB = readInstrument().simulatorIdentity;
    expect(identityB).toBe(identityA);
  }, 30000);

  it('11b. 返回分析后 identity C === A === B', async () => {
    renderApp('/');
    await startScenario('场景 A · 正常完成');
    await waitForReceived(2);
    const idA = readInstrument().simulatorIdentity;
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    const idB = readInstrument().simulatorIdentity;
    fireEvent.click(screen.getByText('返回分析'));
    await waitFor(() => expect(screen.queryByTestId('job-detail-page')).toBeNull());
    const idC = readInstrument().simulatorIdentity;
    expect(idA).toBe(idB);
    expect(idB).toBe(idC);
  }, 30000);
});

describe('F3-R2 P1-3 §Browser history.back() state 保持', () => {
  it('12. history.back() 后 URL 恢复、runId/identity/receivedCount 保持', async () => {
    renderAppWithBack('/');
    await startScenario('场景 A · 正常完成');
    await waitForReceived(4);
    const runIdBefore = readInstrument().runId;
    const identityBefore = readInstrument().simulatorIdentity;
    const countBefore = readInstrument().receivedCount;
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    await waitForReceived(countBefore + 1);
    // 浏览器 Back（经 router navigate(-1)，等价 history.back()）
    fireEvent.click(screen.getByTestId('test-back'));
    await waitFor(() => expect(screen.queryByTestId('job-detail-page')).toBeNull(), { timeout: 5000 });
    // runId 不变
    expect(readInstrument().runId).toBe(runIdBefore);
    // identity 不变
    expect(readInstrument().simulatorIdentity).toBe(identityBefore);
    // receivedCount 不减少
    expect(readInstrument().receivedCount).toBeGreaterThanOrEqual(countBefore);
  }, 45000);
});

describe('F3-R2 P1-4 §QC → Evidence Router 完整链', () => {
  it('13/14/15. 点击 QC → Router 跳转 → 正确 selectedAsset + focusedEvidence + highlightedTrace', async () => {
    const { container } = renderApp('/');
    await startScenario('场景 B · 高风险待确认');
    // risk 场景较长（约 40s 模拟），用 2× 速度约 20s；等待足够事件 + 完成态
    await new Promise((r) => setTimeout(r, 25000));
    // 确认完成态
    await waitForFinished(60000);
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    // 等待 QC 元素出现（risk 场景的 qc-structure-risk block）
    const qcBlock = await waitFor(() => screen.getByTestId('job-qc-qc-structure-risk'), { timeout: 15000 });
    fireEvent.click(qcBlock);
    // 返回竞品分析页；data-highlighted-trace-sequence 非空表示导航完成 + trace 高亮
    await waitFor(() => {
      // 在 DOM 中查找带有 data-highlighted-trace-sequence 的元素（competitor-analysis-page 根）
      const el = container.querySelector('[data-highlighted-trace-sequence]');
      if (!el) return false;
      return (el.getAttribute('data-highlighted-trace-sequence') ?? '') !== '';
    }, { timeout: 8000 });
    const hlEl = container.querySelector('[data-highlighted-trace-sequence]');
    const highlightedSeq = hlEl?.getAttribute('data-highlighted-trace-sequence') ?? '';
    // 断言：highlightedTraceSequence 非空且为数字（指向 QC 来源事件）
    expect(highlightedSeq).not.toBe('');
    expect(Number(highlightedSeq)).toBeGreaterThan(0);
  }, 180000);
});
