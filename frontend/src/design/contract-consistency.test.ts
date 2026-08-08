/**
 * F3.5 R5 §24 — Contract Consistency Test。
 * 确保 component-policy.ts（权威数据源）内部一致，且 B Policy 组件有 wrapper 路径。
 *
 * R5：Astryx runtime 完全移除，Policy A 不再存在；原 Policy A 原子退化为
 * Policy C（内联原生）。本测试断言 R5 policy 契约。
 */
import { describe, it, expect } from 'vitest';
import { COMPONENT_POLICY, getPolicy } from './component-policy';

describe('F3.5 R5 Contract Consistency', () => {
  it('所有 B Policy 组件有 ccWrapperPath', () => {
    const bComponents = COMPONENT_POLICY.filter((e) => e.policy === 'B');
    for (const c of bComponents) {
      expect(c.ccWrapperPath, `${c.component} (Policy B) 必须有 ccWrapperPath`).toBeTruthy();
    }
  });

  it('R5 后不再有 Policy A（Astryx runtime 已移除）', () => {
    const policies = new Set(COMPONENT_POLICY.map((e) => e.policy));
    expect(policies.has('A' as never), 'R5 后不应存在 Policy A 组件').toBe(false);
    expect(policies.has('B')).toBe(true);
    expect(policies.has('C')).toBe(true);
  });

  it('组件名唯一（无重复）', () => {
    const names = COMPONENT_POLICY.map((e) => e.component);
    const unique = new Set(names);
    expect(names.length).toBe(unique.size);
  });

  it('关键 F4 组件存在且有 policy', () => {
    // F4 五页面依赖的关键组件
    const required = ['Button', 'Badge', 'Table', 'List', 'Selector', 'TabList', 'Tooltip', 'Dialog', 'ProgressBar'];
    for (const name of required) {
      const p = getPolicy(name);
      expect(p, `${name} 在 policy 中存在`).toBeTruthy();
      expect(['B', 'C']).toContain(p!.policy);
    }
  });
});
