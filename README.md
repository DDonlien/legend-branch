# LegendBranch · 传说谱系

> Trace the evolution of legends.

LegendBranch 是一个传说演化知识可视化 Web 项目。它不是传统百科条目列表，而是把传说角色、民俗母题、文学版本和现代作品形象放在同一张可探索的时间图谱中，展示它们如何传播、分支、合流和演化。

## 项目概述

- 横轴表示时间，以可考证来源或作品出现时间为主要定位依据。
- 纵轴由文化、国家或政权区块构成，每个区块包含若干角色行。
- 节点表示某个角色或概念在特定文化和时代中的一个版本。
- 连线表示来源、影响、改编、合流等关系，并附带可信度和外部来源。
- 用户可以 Trace 一个或多个目标，聚焦查看完整的前后传播链。

## 当前阶段

当前已完成 P1 最小化 Demo。

P1 只验证一件事：以“孙悟空”为唯一样例时，“横向时间 × 纵向文化区块 × Trace 角色谱系”的核心阅读体验是否清晰、好看，并值得继续扩展。

## P1 核心体验

- 打开页面后默认进入 `TRACE MODE · 孙悟空`。
- 在可横向、纵向滚动的主图中查看传播和演化关系。
- 点击节点后在当前页面打开克制的浮层，查看简介、关系和外链。
- 清除 Trace 后查看 P1 中围绕孙悟空整理的全部节点。
- 当前界面采用 Material 3 Expressive，保留顶栏、文化分区、画布和详情浮层结构。
- 分支参考 GitTogether 的轨道，以两处 45° 衔接换道；大卡片显示节点，连线避让卡片。
- 为现代作品展开非等距时间轴；历史年份不变，时间刻度与文化索引随画布滚动同步。

## 技术栈

- TypeScript
- React
- Vite
- 原生 SVG 图谱画布
- Google Material Web 2.5.0 标准组件与 Expressive labs，使用 @lit/react 接入
- Google Material Color Utilities / HCT 色彩角色
- 自托管 Roboto Flex 与 Material Symbols Rounded

Expressive 按钮、图标按钮和卡片直接使用官方组件。Material Web 尚无独立 Search bar 元素，搜索入口以官方 Filled Text Field 按 M3 Search bar 规范组合。实验组件版本固定，构建适配使用包内官方等价样式。

## 快速开始

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm run test
npm run build
```

## 目录结构

```text
.
├── AGENTS.md        # Agent 协作规范与项目约束
├── README.md        # 项目整体说明
├── REQUIREMENTS.md  # 需求、验收条件与任务状态
├── DESIGN.md        # 视觉语言和界面规范
├── agent-log/       # 前期讨论记录与后续执行日志
├── archive/design/  # 历史视觉规范
├── output/concepts/ # P1 视觉概念参考
├── output/validation/ # 实际浏览器界面截图与验收记录
├── tests/           # 图谱日期、几何、关系与颜色对比度回归
└── src/             # React 应用、结构化数据与 SVG 图谱组件
```

## 文档入口

- Agent 协作规范：`AGENTS.md`
- 需求与验收追踪：`REQUIREMENTS.md`
- 视觉规范：`DESIGN.md`
- 前期讨论与执行日志：`agent-log/`

## 产品边界

LegendBranch 的长期方向可以覆盖神话、民俗、文学、都市传说和现代媒体中的文化演化关系，但不会把未经核验的 AI 推断当作事实发布。P1 不验证大规模数据、AI 自动补全、社区或后台能力，只验证最小图谱体验。

搜索和筛选目前保留禁用入口。生产构建输出到 `dist/`，可以使用 `npm run preview` 本地查看；仓库尚未定义生产托管或发布命令。
