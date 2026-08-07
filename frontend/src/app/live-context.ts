/**
 * F3：Live Intelligence 共享 Context。
 *
 * useLiveIntelligence 必须在 AppShell 层（Routes 之上）调用一次，
 * 通过本 Context 向下传递给所有页面，避免重复挂载模拟器。
 */
import { createContext, useContext } from 'react';
import type { LiveIntelligenceApi } from '@/features/live-intelligence/useLiveIntelligence';

export const LiveContext = createContext<LiveIntelligenceApi | null>(null);

/** 在任意子组件中读取共享的 Live Intelligence API（未挂载时抛错） */
export function useLiveContext(): LiveIntelligenceApi {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLiveContext must be used within LiveContext.Provider');
  return ctx;
}
