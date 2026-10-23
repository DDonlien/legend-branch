# LegendBranch 共享知识库协作规范


## 通用规范继承

继承当前工作副本根 [AGENTS.md](../AGENTS.md#通用规则) 的新版通用规则。

<!-- local-agent-template-rollout:v2.0.1-261023-173015 -->
> 通用规则来源于本地 `DDonlien/agent-template` `v2.0.1-261023-173015`。项目自己的范围、命令和技术契约继续有效；旧模板中要求 REQUIREMENTS / agent-log 双写、例行远端同步与提交的通用制度已停用。
>
> 项目任务以当前工作副本根 `../issue/` 为唯一工作入口，正文维护当前事实，Comments 追加历史。旧工作文档在有可追溯迁移映射和 Git 历史 / 版本化来源副本后移除；未把历史日志机械创建为新任务。`versioncontrolid` 仍为未定义占位。
<!-- /local-agent-template-rollout -->


继承根目录 [AGENTS.md](../AGENTS.md) 的全部标准内容与项目约束。

## 项目专用内容

- 职责：Cloudflare Workers API、D1 迁移、来源数据接入和增量合并。
- 入口：`index.ts`；API 与数据契约共享根目录 `src/knowledge.ts`。
- 文档：本目录 README、REQUIREMENTS、DESIGN、agent-log；跨界面需求同时记录到根目录。
- 命令从仓库根执行：`npm run dev:api`、`npm run db:migrate:local`、`npm run test`、`npm run build`。
- 远端迁移仅新增结构，不删除既有知识。入库必须保留来源；实体 ID 去重，不依据共用文章 URL 合并条目。
- 公共 API 只接收搜索词，不接受任意条目或关系写入。外部关系属于待复核候选，不因标签相同生成传播边。
- 本目录没有独立 UI；前端继承根 DESIGN。
