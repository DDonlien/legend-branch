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

当前提供孙悟空时间图谱与通过站内搜索积累的共享知识库。

P1 只验证一件事：以“孙悟空”为唯一样例时，“横向时间 × 纵向文化区块 × Trace 角色谱系”的核心阅读体验是否清晰、好看，并值得继续扩展。

## P1 核心体验

- 打开页面后默认进入 `TRACE MODE · 孙悟空`。
- 在可横向、纵向滚动的主图中查看传播和演化关系。
- 点击节点后在当前页面打开克制的浮层，查看简介、关系和外链。
- 清除 Trace 后查看 P1 中围绕孙悟空整理的全部节点。
- 当前界面采用 Material 3 Expressive，保留顶栏、文化分区、画布和详情浮层结构。
- 分支参考 GitTogether 的轨道，以两处 45° 衔接换道；大卡片显示节点，连线避让卡片。
- 为现代作品展开非等距时间轴；历史年份不变，时间刻度与文化索引随画布滚动同步。
- 搜索条目或标签，先查看已有结果，再从 Wikidata 联网增补；点击结果查看梗概、标签、关系和来源。
- 点击详情标签可继续探索同类条目。

## 技术栈

- TypeScript
- React
- Vite
- 原生 SVG 图谱画布
- Cloudflare Workers + D1 共享知识库
- Google Material Web 2.5.0 标准组件与 Expressive labs，使用 @lit/react 接入
- Google Material Color Utilities / HCT 色彩角色
- 自托管 Roboto Flex 与 Material Symbols Rounded

Expressive 按钮、图标按钮和卡片直接使用官方组件。Material Web 尚无独立 Search bar 元素，搜索入口以官方 Filled Text Field 按 M3 Search bar 规范组合。实验组件版本固定，构建适配使用包内官方等价样式。

## 快速开始

```bash
npm install
npm run dev
```

完整搜索流程还需要本地后端。在另一个终端执行：

```bash
npm run build
npm run db:migrate:local
npm run dev:api
```

Vite 开发和预览将 `/api` 转发到 `127.0.0.1:8787`。本地 D1 状态保存在忽略入库的 `.wrangler/`；线上 D1 是全用户共享数据源。本地启动不需要云端登录。

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
├── tests/           # 图谱、知识库迁移和增量搜索回归
├── server/          # 共享知识库 API、D1 迁移、联网接入及子模块文档
├── scripts/         # 根据现有样例生成初始数据迁移
├── wrangler.jsonc   # Cloudflare API、静态前端及 D1 绑定
└── src/             # React 应用、结构化数据与 SVG 图谱组件
```

## 文档入口

- Agent 协作规范：`AGENTS.md`
- 需求与验收追踪：`REQUIREMENTS.md`
- 视觉规范：`DESIGN.md`
- 前期讨论与执行日志：`agent-log/`
- 共享知识库说明：[server/README.md](server/README.md)

## 增量知识库

条目、来源、梗概版本、标签和关系分别保存。标签是多对多分类，可以同时表达国家和主题；它与传播 / 影响关系不同。实体以稳定外部 ID 去重，共用资料链接的不同文学版本仍然独立。

每次搜索先读取数据库，再联网查询 Wikidata 的结构化实体，保存名称、别名、来源、短梗概及国家 / 类别 / 主题标签。原始数据采用 [Wikidata CC0](https://www.wikidata.org/wiki/Wikidata:Licensing)，Wikipedia 仅提供索引链接。初版来源范围为 Wikidata，不是全网爬虫或 AI 自动撰稿。六小时内相同查询复用已保存结果，随后可再次更新；失败不会删除旧内容。

新来源与梗概版本追加保存，人工整理内容优先显示。联网发现的改编和灵感关系属于待复核候选，不能凭标签相同推断关系。新条目先通过搜索和详情阅读；进入时间图谱还需要可复核的文化位置和年代。

## Cloudflare 部署

线上入口：[LegendBranch](https://legend-branch.taobe-roshambo.workers.dev/)。当前前端和 API 同域托管在 Cloudflare Workers，知识库保存于 D1。

前端和 API 可通过同一个 Worker 发布，D1 保存全用户共享内容。默认使用 `workers.dev` 地址，不需要购买域名。

```bash
npx wrangler login
npm run deploy
```

`deploy` 会构建应用、应用尚未执行的远端 D1 迁移并发布前端和 API。仓库配置绑定本项目已创建的 D1；在其他 Cloudflare 账号部署时应先创建自己的数据库并替换 `database_id`。首次种子迁移由 `npm run seed:generate` 根据样例生成，已经应用的迁移不要直接修改。

## 产品边界

LegendBranch 可以保存神话、民俗、文学、历史事件和现代作品的来源资料，但不会把未经核验的 AI 推断当作事实发布。时间图谱目前仍以孙悟空样例验证阅读体验；搜索知识库与图谱位置分开，尚未整理的位置不自动画进图谱。

筛选仍保留禁用入口。生产构建输出到 `dist/`，可以使用 `npm run preview` 本地查看；共享知识库的存储、数据来源与 API 边界见后端文档。
