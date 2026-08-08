/**
 * F3.5 R0 Phase E — Foundation Smoke Test（dev-only route /__dev/design-foundation）。
 *
 * 渲染 Astryx 核心 primitive，使用 CommerceCanvas 真实中文语义内容（非 lorem ipsum）。
 * 验证：Typography 层级、Button/Input/Selector/Tabs/Dialog/Badge/List 等组件、
 * 交互状态（hover/focus/disabled/loading）、键盘可达性、Graphite Canvas 视觉保持。
 *
 * 此页面不在生产导航中暴露（仅 dev route），用于 Foundation 视觉验收。
 */
import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Switch } from '@astryxdesign/core/Switch';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Badge } from '@astryxdesign/core/Badge';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { List, ListItem } from '@astryxdesign/core/List';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Code } from '@astryxdesign/core/Code';
import { Divider } from '@astryxdesign/core/Divider';
import { Stack } from '@astryxdesign/core/Stack';
import { Settings, Play, AlertTriangle, CheckCircle, Search } from 'lucide-react';

export function DesignFoundationPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabVal, setTabVal] = useState('overview');
  const [switchOn, setSwitchOn] = useState(true);
  const [checkbox, setCheckbox] = useState(true);
  const [selectorVal, setSelectorVal] = useState('balanced' as string | null);
  const [inputVal, setInputVal] = useState('');

  return (
    <div data-testid="design-foundation-page" data-astryx-theme="neutral" style={{ padding: 24, maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      {/* —— Typography —— */}
      <section data-testid="foundation-typography" style={{ marginBottom: 32 }}>
        <Heading level={1} type="display-1">CommerceCanvas 设计基础</Heading>
        <Text type="body" color="secondary">Graphite Canvas × Astryx Industrial UI Foundation — 中文工业工作台</Text>
        <Divider style={{ marginTop: 12 }} />
        <Stack direction="vertical" gap={1}>
          <Heading level={2}>竞品套图分析</Heading>
          <Text type="body">已识别全部 12 张图片用途：主图 1、场景 4、卖点 5、细节 1、参数 1</Text>
          <Text type="label" color="secondary">SKU · OW-A31-BLK · OpenWave</Text>
          <Text type="supporting" color="secondary">演示运行 · 模拟事件流 · job-normal-001</Text>
          <Text type="body">发现 <Code>24</Code> · 风险 <Code>3</Code> · 产物 <Code>5</Code></Text>
          <Code>Qwen-Image-Edit-2511 · 2026-08-08 21:42:31 · de-DE</Code>
        </Stack>
      </section>

      {/* —— Buttons —— */}
      <section data-testid="foundation-buttons" style={{ marginBottom: 32 }}>
        <Heading level={3}>按钮</Heading>
        <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
          <Button label="开始分析" variant="primary" icon={<Play size={14} />} />
          <Button label="均衡策略" variant="secondary" />
          <Button label="取消" variant="ghost" />
          <Button label="删除任务" variant="destructive" />
          <Button label="分析中…" variant="primary" isLoading />
          <Button label="已禁用" variant="primary" isDisabled />
          <IconButton icon={<Settings size={16} />} label="设置" />
          <IconButton icon={<Search size={16} />} label="搜索" />
        </Stack>
      </section>

      {/* —— Inputs —— */}
      <section data-testid="foundation-inputs" style={{ marginBottom: 32 }}>
        <Heading level={3}>输入控件</Heading>
        <Stack direction="vertical" gap={3} style={{ maxWidth: 480 }}>
          <TextInput
            label="商品名称"
            placeholder="OpenWave OW-A31-BLK 蓝牙耳机"
            value={inputVal}
            onChange={(v: string) => setInputVal(v)}
          />
          <TextArea
            label="生成指令"
            placeholder="保留构图方向、光线结构、背景气氛…"
            value=""
          />
          <Selector
            label="质量策略"
            hasClear
            options={[
              { label: '快速', value: 'fast' },
              { label: '均衡', value: 'balanced' },
              { label: '高质量', value: 'high' },
              { label: '商品保真优先', value: 'fidelity' },
              { label: '文字准确优先', value: 'text' },
            ]}
            value={selectorVal}
            onChange={(v: string | null) => setSelectorVal(v)}
          />
          <Switch label="启用商品保真策略" value={switchOn} onChange={setSwitchOn} />
          <CheckboxInput label="禁止继承竞品 Logo、型号、包装文字" value={checkbox} onChange={setCheckbox} />
        </Stack>
      </section>

      {/* —— Tabs + Badge —— */}
      <section data-testid="foundation-tabs-badges" style={{ marginBottom: 32 }}>
        <Heading level={3}>标签与状态</Heading>
        <TabList value={tabVal} onChange={setTabVal} size="sm" style={{ marginBottom: 16 }}>
          <Tab value="overview" label="总览" />
          <Tab value="assets" label="图片资产" />
          <Tab value="recipe" label="Creative Recipe" />
          <Tab value="qc" label="QC 结果" />
        </TabList>
        <Stack direction="horizontal" gap={2} wrap="wrap">
          <Badge variant="success" label="通过" />
          <Badge variant="warning" label="待检查" />
          <Badge variant="error" label="阻断" />
          <Badge variant="neutral" label="等待执行" />
          <Badge variant="info" label="执行中" />
          <Badge variant="purple" label="等待人工确认" />
        </Stack>
      </section>

      {/* —— Tooltip + Dialog —— */}
      <section data-testid="foundation-overlays" style={{ marginBottom: 32 }}>
        <Heading level={3}>浮层与对话框</Heading>
        <Stack direction="horizontal" gap={2} align="center">
          <Tooltip content="该 QC 检查商品结构与 Product Master 一致性">
            <Button label="QC 说明 Tooltip" variant="ghost" />
          </Tooltip>
          <Button label="打开确认对话框" variant="primary" onClick={() => setDialogOpen(true)} />
        </Stack>
        <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader title="确认商品结构阻断" />
          <div style={{ padding: '0 24px 24px' }}>
            <Text type="body">
              检测到竞品为入耳式结构，自有商品 OW-A31-BLK 为开放式。
              入耳式结构、竞品独有功能描述已加入禁止继承清单。
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 24px 24px' }}>
            <Button label="取消" variant="ghost" onClick={() => setDialogOpen(false)} />
            <Button label="确认复核" variant="primary" onClick={() => setDialogOpen(false)} />
          </div>
        </Dialog>
      </section>

      {/* —— Dense List (metadata) —— */}
      <section data-testid="foundation-dense-list" style={{ marginBottom: 32 }}>
        <Heading level={3}>密集数据列表</Heading>
        <List hasDividers>
          <ListItem
            startContent={<CheckCircle size={14} style={{ color: 'var(--gc-accent-green)' }} />}
            label="图片用途分类结果"
            description="12 张 · 4 种用途"
            endContent={<Badge variant="neutral" label="seq 8" />}
          />
          <ListItem
            startContent={<AlertTriangle size={14} style={{ color: 'var(--gc-accent-amber)' }} />}
            label="风险排除清单"
            description="7 处品牌资产 · 3 项普通风险"
            endContent={<Badge variant="warning" label="seq 15" />}
          />
          <ListItem
            startContent={<CheckCircle size={14} style={{ color: 'var(--gc-accent-green)' }} />}
            label="套图 Creative Recipe"
            description="7/7 字段 · 草案 v1"
            endContent={<Badge variant="success" label="seq 22" />}
          />
        </List>
      </section>

      {/* —— Progress + Skeleton —— */}
      <section data-testid="foundation-progress" style={{ marginBottom: 32 }}>
        <Heading level={3}>进度与占位</Heading>
        <Stack direction="vertical" gap={3} style={{ maxWidth: 480 }}>
          <div>
            <Text type="label">阶段进度</Text>
            <ProgressBar label="阶段进度" value={5} max={7} />
            <Text type="supporting" color="secondary">5/7 阶段 · 图片用途识别完成</Text>
          </div>
          <div>
            <Text type="label">不确定进度</Text>
            <ProgressBar label="不确定进度" isIndeterminate />
            <Text type="supporting" color="secondary">build_recipe · 阶段进行中</Text>
          </div>
          <div>
            <Text type="label">加载占位</Text>
            <Stack direction="vertical" gap={1}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="80%" height={12} />
            </Stack>
          </div>
        </Stack>
      </section>

      {/* —— EmptyState —— */}
      <section data-testid="foundation-empty" style={{ marginBottom: 32 }}>
        <Heading level={3}>空状态</Heading>
        <EmptyState
          title="暂无竞品分析任务"
          description="从商品工作区选择一个商品，开始竞品套图分析。"
          icon={<Search size={24} />}
          actions={<Button label="新建分析任务" variant="primary" />}
        />
      </section>
    </div>
  );
}
