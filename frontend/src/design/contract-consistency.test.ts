/**
 * F3.5 R1 §24 — Contract Consistency Test。
 * 确保 component-policy.ts（权威数据源）内部一致，且 B Policy 组件有 wrapper 路径。
 */
import { describe, it, expect } from 'vitest';
import { COMPONENT_POLICY, getPolicy } from './component-policy';

describe('F3.5 R1 Contract Consistency', () => {
  it('所有 B Policy 组件有 ccWrapperPath', () => {
    const bComponents = COMPONENT_POLICY.filter((e) => e.policy === 'B');
    for (const c of bComponents) {
      expect(c.ccWrapperPath, `${c.component} (Policy B) 必须有 ccWrapperPath`).toBeTruthy();
    }
  });

  it('所有 A Policy 组件有 astryxExport', () => {
    const aComponents = COMPONENT_POLICY.filter((e) => e.policy === 'A');
    for (const c of aComponents) {
      expect(c.astryxExport, `${c.component} (Policy A) 必须有 astryxExport`).toBeTruthy();
    }
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
      expect(['A', 'B', 'C']).toContain(p!.policy);
    }
  });
});
