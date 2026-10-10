# LegendBranch 共享知识库协作规范

继承根目录 [AGENTS.md](../AGENTS.md) 的全部标准内容与项目约束。

## 项目专用内容

- 职责：Cloudflare Workers API、D1 迁移、来源数据接入和增量合并。
- 入口：`index.ts`；API 与数据契约共享根目录 `src/knowledge.ts`。
- 文档：本目录 README、REQUIREMENTS、DESIGN、agent-log；跨界面需求同时记录到根目录。
- 命令从仓库根执行：`npm run dev:api`、`npm run db:migrate:local`、`npm run test`、`npm run build`。
- 远端迁移仅新增结构，不删除既有知识。入库必须保留来源；实体 ID 去重，不依据共用文章 URL 合并条目。
- 公共 API 只接收搜索词，不接受任意条目或关系写入。外部关系属于待复核候选，不因标签相同生成传播边。
- 本目录没有独立 UI；前端继承根 DESIGN。
