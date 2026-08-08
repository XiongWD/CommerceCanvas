/**
 * F3.5 R2 — Foundation Smoke Test（dev-only route /__dev/design-foundation）。
 *
 * R2 修正：
 * - 所有 Policy B 组件使用 @/components/ui/ wrapper（不直接 import Astryx）
 * - Policy A 组件直接 import Astryx
 * - Table/Popover/DropdownMenu 使用 wrapper
 * - Dark theme 修正后所有控件 dark surface
 */
import { useState } from 'react';
// Policy B — CommerceCanvas Wrapper（全部从 @/components/ui/ 导入）
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { Heading } from '@/components/ui/Heading';
import { TextInput } from '@/components/ui/TextInput';
import { TextArea } from '@/components/ui/TextArea';
import { Selector } from '@/components/ui/Selector';
import { Badge } from '@/components/ui/Badge';
import { TabList, Tab } from '@/components/ui/TabList';
import { Tooltip } from '@/components/ui/Tooltip';
import { Popover } from '@/components/ui/Popover';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Dialog, DialogHeader } from '@/components/ui/Dialog';
import { Table, TableRow, TableCell, TableHeaderCell, TableHeader, TableBody } from '@/components/ui/Table';
import { List, ListItem } from '@/components/ui/List';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
// Policy A — Astryx Direct
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Switch } from '@astryxdesign/core/Switch';
import { Skeleton } from '@astryxdesign/core/Skeleton';
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

  return (
    <div data-testid="design-foundation-page" data-astryx-theme="neutral" style={{ padding: 24, maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      {/* Typography */}
      <section data-testid="foundation-typography" style={{ marginBottom: 32 }}>
        <Heading level={1} type="display-1">CommerceCanvas 设计基础</Heading>
        <Text type="body" color="secondary">Graphite Canvas × Astryx Industrial UI Foundation</Text>
        <Divider style={{ marginTop: 12 }} />
        <Stack direction="vertical" gap={1}>
          <Heading level={2}>竞品套图分析</Heading>
          <Text type="body">已识别全部 12 张图片用途：主图 1、场景 4、卖点 5、细节 1、参数 1</Text>
          <Text type="label" color="secondary">SKU · OW-A31-BLK · OpenWave</Text>
          <Text type="supporting" color="secondary">演示运行 · job-normal-001</Text>
          <Code>Qwen-Image-Edit-2511 · 2026-08-08 21:42:31 · de-DE</Code>
        </Stack>
      </section>

      {/* Buttons */}
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

      {/* Inputs */}
      <section data-testid="foundation-inputs" style={{ marginBottom: 32 }}>
        <Heading level={3}>输入控件</Heading>
        <Stack direction="vertical" gap={3} style={{ maxWidth: 480 }}>
          <TextInput label="商品名称" placeholder="OpenWave OW-A31-BLK" value="" onChange={() => {}} />
          <TextArea label="生成指令" placeholder="保留构图方向…" value="" />
          <Selector label="质量策略" hasClear options={[
            { label: '快速', value: 'fast' }, { label: '均衡', value: 'balanced' },
            { label: '高质量', value: 'high' }, { label: '商品保真优先', value: 'fidelity' },
          ]} value={selectorVal} onChange={(v: string | null) => setSelectorVal(v)} />
          <Switch label="启用商品保真策略" value={switchOn} onChange={setSwitchOn} />
          <CheckboxInput label="禁止继承竞品 Logo" value={checkbox} onChange={setCheckbox} />
        </Stack>
      </section>

      {/* Tabs + Badges */}
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

      {/* Table */}
      <section data-testid="foundation-table" style={{ marginBottom: 32 }}>
        <Heading level={3}>密集数据表</Heading>
        <Table density="compact" dividers="rows" hasHover>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Job ID</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>路由</TableHeaderCell>
              <TableHeaderCell>成本</TableHeaderCell>
              <TableHeaderCell>QC</TableHeaderCell>
              <TableHeaderCell>更新时间</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Code>job-normal-001</Code></TableCell>
              <TableCell><Badge variant="success" label="已完成" /></TableCell>
              <TableCell>均衡</TableCell>
              <TableCell><Code>$0.19</Code></TableCell>
              <TableCell><Badge variant="success" label="通过" /></TableCell>
              <TableCell><Code>22:31:14</Code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Code>job-risk-002</Code></TableCell>
              <TableCell><Badge variant="purple" label="待人工确认" /></TableCell>
              <TableCell>商品保真优先</TableCell>
              <TableCell><Code>$0.36</Code></TableCell>
              <TableCell><Badge variant="error" label="阻断" /></TableCell>
              <TableCell><Code>22:35:02</Code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Code>job-reconnect-003</Code></TableCell>
              <TableCell><Badge variant="info" label="执行中" /></TableCell>
              <TableCell>均衡</TableCell>
              <TableCell><Code>$0.21</Code></TableCell>
              <TableCell><Badge variant="neutral" label="N/A" /></TableCell>
              <TableCell><Code>22:38:47</Code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* Overlays: Popover + DropdownMenu + Dialog */}
      <section data-testid="foundation-overlays" style={{ marginBottom: 32 }}>
        <Heading level={3}>浮层与对话框</Heading>
        <Stack direction="horizontal" gap={2} align="center">
          <Tooltip content="该 QC 检查商品结构与 Product Master 一致性">
            <Button label="QC 说明" variant="ghost" />
          </Tooltip>
          <Popover content={<div style={{ padding: 12, maxWidth: 280 }}>
            <Text type="label">商品保真优先</Text>
            <Text type="supporting" color="secondary">低成本分析路径结果不充分，系统升级策略。+$0.15 +12秒。</Text>
          </div>} placement="below">
            <Button label="路由策略详情" variant="ghost" />
          </Popover>
          <DropdownMenu
            button={{ label: '批量操作', variant: 'secondary' }}
            hasChevron
            items={[
              { label: '重新运行', onClick: () => {} },
              { label: '导出报告', onClick: () => {} },
              { type: 'divider' },
              { label: '删除任务', onClick: () => {} },
            ]}
          />
          <Button label="打开确认对话框" variant="primary" onClick={() => setDialogOpen(true)} />
        </Stack>
        <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader title="确认商品结构阻断" />
          <div style={{ padding: '0 24px 24px' }}>
            <Text type="body">检测到竞品为入耳式结构，自有商品 OW-A31-BLK 为开放式。</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 24px 24px' }}>
            <Button label="取消" variant="ghost" onClick={() => setDialogOpen(false)} />
            <Button label="确认复核" variant="primary" onClick={() => setDialogOpen(false)} />
          </div>
        </Dialog>
      </section>

      {/* Dense List */}
      <section data-testid="foundation-dense-list" style={{ marginBottom: 32 }}>
        <Heading level={3}>密集数据列表</Heading>
        <List hasDividers>
          <ListItem startContent={<CheckCircle size={14} style={{ color: 'var(--gc-accent-green)' }} />}
            label="图片用途分类结果" description="12 张 · 4 种用途"
            endContent={<Badge variant="neutral" label="seq 8" />} />
          <ListItem startContent={<AlertTriangle size={14} style={{ color: 'var(--gc-accent-amber)' }} />}
            label="风险排除清单" description="7 处品牌资产 · 3 项普通风险"
            endContent={<Badge variant="warning" label="seq 15" />} />
          <ListItem startContent={<CheckCircle size={14} style={{ color: 'var(--gc-accent-green)' }} />}
            label="套图 Creative Recipe" description="7/7 字段 · 草案 v1"
            endContent={<Badge variant="success" label="seq 22" />} />
        </List>
      </section>

      {/* Progress + Skeleton */}
      <section data-testid="foundation-progress" style={{ marginBottom: 32 }}>
        <Heading level={3}>进度与占位</Heading>
        <Stack direction="vertical" gap={3} style={{ maxWidth: 480 }}>
          <div><ProgressBar label="阶段进度" value={5} max={7} /></div>
          <div><ProgressBar label="不确定进度" isIndeterminate /></div>
          <Stack direction="vertical" gap={1}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="100%" height={12} />
            <Skeleton width="80%" height={12} />
          </Stack>
        </Stack>
      </section>

      {/* EmptyState */}
      <section data-testid="foundation-empty" style={{ marginBottom: 32 }}>
        <Heading level={3}>空状态</Heading>
        <EmptyState title="暂无竞品分析任务" description="从商品工作区选择商品开始分析。"
          icon={<Search size={24} />} actions={<Button label="新建分析任务" variant="primary" />} />
      </section>
    </div>
  );
}
