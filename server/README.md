# LegendBranch 共享知识库

本模块提供 Cloudflare Workers API 与 D1 持久存储，让站内搜索产生的来源资料供所有用户共享。前端入口、图谱布局和视觉规范见根目录文档。

## 数据与合并规则

- `entries`：稳定条目标识、名称、类型、可选年代和复核状态。
- `external_ids`、`aliases`：实体身份与名称查询。外部 Wikidata Q ID 唯一，共用文章 URL 不会合并文学版本。
- `sources`、`entry_sources`：资料索引与首次 / 最近取得时间。
- `summaries`：带来源及取得时间的梗概版本，人工整理内容优先显示。
- `tags`、`entry_tags`：多对多国家、分类和主题标签，保留来源。
- `relationships`、`relationship_sources`：有方向的改编 / 影响关系、可信度、争议和复核状态，允许多来源与合流。
- `search_runs`：查询最近一次增补时间、状态与所得实体，用于共享缓存。

入库使用 D1 事务批量合并。已有条目追加别名、资料、标签及梗概版本，外部结果不能替换人工名称、梗概和关系可信度。并发重复查询通过唯一约束合并，新增条目数采用事务实际写入数量。

## API

- `GET /api/search?q=名称或标签`：只读取已有内容，最多 30 个结果。
- `POST /api/search`，JSON `{ "query": "美国大萧条" }`：查询并联网增补。搜索词为 2–120 个字，正文最多 1024 字符；不接受客户端自定义条目写入。
- `GET /api/entries/:id`：读取条目、来源、标签和双向关联详情。
- `GET /api/health`：服务存活检查。

初版从 Wikidata 查询最多五个匹配实体，最多补充五个直接来源作品；标签读取国家 `P17`、来源国 `P495`、类别 `P31`、主题 `P921`。只将明确声明的 `P144` / `P941` 保存为待复核候选关系，分类不会生成影响边。没有年代的条目不编造年代；梗概优先取中文，缺失时使用来源英文短描述。

相同规范化查询六小时内复用增补结果。外部失败保留已有条目并返回 `unavailable`；失败后一分钟内暂不重复请求来源。单次来源请求超时十秒。关系详情始终保留来源链接，待复核内容不会自动加入已有图谱。

## 本地运行与发布

命令在仓库根目录执行：

```bash
npm install
npm run build
npm run db:migrate:local
npm run dev:api
```

Worker 在 `http://127.0.0.1:8787` 同时提供前端构建和 API。开发前端可以另起 `npm run dev`，Vite 自动代理 `/api`。本地状态与远端知识库独立。

```bash
npx wrangler login
npm run deploy
```

数据库迁移放在 `migrations/`。首次种子迁移保留原有 12 个条目和 11 个关系；已经应用的迁移不修改，结构变化追加新文件。`wrangler.jsonc` 中 D1 ID 属于本项目；部署到其他账号先创建自己的数据库并更新绑定。

默认 Worker 同时托管静态前端，API 与页面同域。`ALLOWED_ORIGINS` 只允许指定站点跨域访问，包含本项目 GitHub Pages 域和本地预览地址；其他来源不能通过浏览器发起增补。

## 验证与文档

`npm run test` 在真实 SQLite 中验证迁移、去重、并发、梗概与来源合并、事务回滚、缓存和上游失败；来源接入以独立 API 数据验证标签和候选关系。`npm run build` 同时检查前后端类型。

- 协作规范：[AGENTS.md](AGENTS.md)
- 需求状态：[REQUIREMENTS.md](REQUIREMENTS.md)
- 视觉边界：[DESIGN.md](DESIGN.md)
- 本模块执行记录：`agent-log/`
