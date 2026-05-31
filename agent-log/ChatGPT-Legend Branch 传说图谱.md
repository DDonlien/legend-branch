# Legend Branch 传说图谱

**User:** Anonymous  
**Created:** 5/31/2026 1:03:54  
**Updated:** 5/31/2026 12:41:43  
**Exported:** 5/31/2026 12:43:24  
**Link:** [https://chatgpt.com/g/g-p-6a16c56341ec8191b23748a278e31d71-aigong-ju-kai-fa/c/6a1b183d-fbcc-83ec-bde6-1ff33377b8f5](https://chatgpt.com/g/g-p-6a16c56341ec8191b23748a278e31d71-aigong-ju-kai-fa/c/6a1b183d-fbcc-83ec-bde6-1ff33377b8f5)  

## Prompt:
2026/5/31 01:03:54

我一直在构思一个新的web项目：亚洲传说角色演变目录，大致形式是：横轴时间，纵轴是国家（政权）然后标识每个角色在哪个时间点从哪里传播到哪里（像一个横向的git树一样）每个节点是对应角色的对应版本，点开有详情和由来

## Response:
2026/5/31 01:03:54

这个项目其实挺有意思，而且我觉得它有一个很大的优势：

它不是「维基百科替代品」，而是一个**知识可视化项目**。

很多人都知道：

- 孙悟空 ← 哈奴曼
- 哪吒 ← 佛教护法神
- 牛头马面 ← 印度地狱体系影响
- 阎罗王 ← Yama
- 天狗 ← 中国天狗 → 日本天狗
- 龙王 ← 印度那伽 → 中国龙王体系融合
- 九尾狐 ← 中国 → 朝鲜 → 日本
- 孟婆 ← 中国原创？
- 八岐大蛇 ← 本土神话还是外来影响？

但没人能一眼看出：

> 一个传说角色在 2000 年里是怎么一路变异的。

而你的设计其实就是：

**Git Log + Crusader Kings 家谱树 + Wikipedia**

---

## 我会把它定义成

### Asian Mythology Evolution Atlas

或者

### Folklore Evolution Tree

中文：

- 亚洲传说演化图谱
- 东亚神话谱系
- 传说角色演变目录
- 妖怪进化树
- 神话基因库

---

## 数据模型

核心实体不是国家

而是：

### Character Version

例如：

```
孙悟空（西游记版）
```

是一条记录

属性：

```yaml
id:
name:
culture:
era:
source:
description:
image:
```

---

然后增加：

```yaml
derived_from:
```

例如

```yaml
孙悟空
derived_from:
  - 哈奴曼
```

---

再比如：

```yaml
日本天狗
derived_from:
  - 中国天狗
```

---

这样实际上就是一个

**有向图（Graph）**

而不是树。

因为很多角色会同时吸收多个来源。

---

## 时间轴

我觉得时间轴应该按作品出现时间

而不是神话内部时间。

例如：

```text
公元前500
公元0
500
1000
1500
1600
1700
1900
2000
```

节点放在：

> 最早可考证文本

例如：

| 角色 | 时间 |
|--------|--------|
| 哈奴曼 | 罗摩衍那 |
| 阎魔 | 吠陀时代 |
| 孙悟空 | 西游记 |
| 鸣人九尾 | 1999 |

这样会很清晰。

---

## 国家维度

这里其实有个大坑。

如果用现代国家：

```text
中国
日本
韩国
印度
```

很多内容会炸。

因为：

```text
唐朝
宋朝
辽
金
元
```

传播路线完全不同。

---

我会考虑：

### Level 1

文化圈

```text
印度文化圈
汉文化圈
藏文化圈
日本文化圈
朝鲜文化圈
东南亚文化圈
```

---

### Level 2

具体政权

展开：

```text
汉文化圈
 ├ 唐
 ├ 宋
 ├ 辽
 ├ 元
 ├ 明
 └ 清
```

类似 GitHub Tree。

默认折叠。

---

## 最有价值的功能

不是查看节点。

而是：

### 查看传播链

例如搜索：

```text
孙悟空
```

自动高亮：

```text
哈奴曼
   ↓
佛教猴王故事
   ↓
无支祁
   ↓
西游记孙悟空
   ↓
龙珠孙悟空
```

---

或者：

```text
九尾狐
```

高亮：

```text
山海经九尾狐
   ↓
朝鲜九尾狐
   ↓
玉藻前
   ↓
Fate玉藻前
```

这种会特别震撼。

---

## 技术上其实很适合 Web

数据结构：

```text
Node
Edge
```

就够了。

前端：

- React
- Next.js
- D3.js
- React Flow

都能做。

尤其是：

[React Flow](https://reactflow.dev?utm_source=chatgpt.com)

几乎天生就是干这个的。

---

## 我觉得最大的难点不是技术

而是学术可信度。

因为神话传播经常有三种情况：

### 已证实

```text
Yama
↓
阎罗王
```

学界共识。

---

### 高度怀疑

```text
哈奴曼
↓
孙悟空
```

很多学者支持。

---

### 民间猜测

```text
克苏鲁
↓
某某妖怪
```

瞎编。

---

所以节点和连线最好有：

```yaml
confidence:
  confirmed
  probable
  speculative
```

并显示引用来源。

否则很快会变成都市传说百科。

---

如果是我来做，我甚至会把范围再缩小一点：

第一版只做：

**中国、日本、韩国三地妖怪与神祇的传播谱系**

控制在：

- 100~300 个角色节点
- 300~500 条传播关系

就已经足够形成一个非常有传播性的知识网站了。

等做完再扩展到印度、东南亚、藏传佛教体系。这样更有机会真正做出来，而不是一开始就掉进“亚洲全部神话”的无底洞。

## Prompt:
2026/5/31 01:04:17

有类似的项目吗

## Response:
2026/5/31 01:04:18

有，但几乎没有一个真正做到你想的那个方向。

目前相关项目基本分成四类：

---

## 1. 妖怪 / 神话百科型

最典型：

### [Yokai.com](https://yokai.com?utm_source=chatgpt.com)

专门做日本妖怪数据库。([yokai.com](https://yokai.com/?srsltid=AfmBOooCuz_yFq3oH9awPstKKfYL4ebB9H2OVl1az1Z7NWN-5qpHvADB&utm_source=chatgpt.com))

特点：

- 每个妖怪一个页面
- 来源文献
- 插图
- 地区传说
- 变体名称

但：

```text
河童
↓
中国河伯
↓
水鬼体系
```

这种传播关系基本没有。

它是：

> Encyclopedia

不是：

> Evolution Graph

---

另一个是：

### [Kaii-Yōkai Database](https://www.nichibun.ac.jp/YoukaiDB/english_kaisetsu.html?utm_source=chatgpt.com)

日本国际日本文化研究中心做的学术数据库。([nichibun.ac.jp](https://www.nichibun.ac.jp/YoukaiDB/english_kaisetsu.html?utm_source=chatgpt.com))

甚至有三万多条妖怪相关资料。([nichibun.ac.jp](https://www.nichibun.ac.jp/en/db/category/yokai/?utm_source=chatgpt.com))

但依然是：

```text
检索
→ 文献
→ 地域
```

不是演化图谱。

---

## 2. Mythology Wiki 型

比如：

### Myth and Folklore Wiki

([mythus.fandom.com](https://mythus.fandom.com/wiki/Myth_and_Folklore_Wiki%3AAsian_Mythology_Project?utm_source=chatgpt.com))

本质：

```text
维基百科
+
神话
```

角色之间最多：

```text
See Also
```

不会做传播链。

---

## 3. 学术 Comparative Mythology

这个方向其实最接近你。

学界有：

### Comparative Mythology

研究：

```text
神话如何传播
神话如何变异
不同文化的共同母题
```

例如：

- 洪水神话
- 英雄降生
- 九尾狐
- 世界树

等等。([维基百科](https://en.wikipedia.org/wiki/Comparative_mythology?utm_source=chatgpt.com))

但问题是：

他们的成果主要是：

```text
论文
书
研究数据库
```

而不是：

```text
交互可视化
```

---

## 4. Folk Motif Database

其实已经有人做到接近图数据库了。

比如：

### Berezkin Folklore Database

学界会把故事拆成：

```text
母题（Motif）
```

例如：

```text
神偷火种
洪水灭世
九头蛇
英雄试炼
```

然后统计：

```text
哪个地区出现
什么时候出现
传播路径
```

([NBER](https://www.nber.org/system/files/working_papers/w25430/revisions/w25430.rev0.pdf?utm_source=chatgpt.com))

但它研究的是：

> 故事结构

不是：

> 具体角色

---

# 反而我觉得你这个项目最像什么？

其实最像：

### GitHub Network Graph

例如：

```text
哈奴曼
   ├────孙悟空
   │         ├──龙珠悟空
   │         └──最游记悟空
   │
   └────其他猴神体系
```

---

或者：

```text
Yama
   ↓
阎罗王
   ↓
十殿阎罗
   ↓
日本閻魔
```

---

这是一个：

```text
Character Genealogy
```

角色谱系学。

---

## 我反而没见过一个成熟项目真正做这个

因为大部分神话数据库停留在：

```text
条目
↓
分类
↓
搜索
```

而不是：

```text
时间
+
传播
+
变体
+
文化影响
```

---

甚至我觉得你这里最有潜力的点不是神话。

而是：

### 神话 → 文学 → 现代作品

例如：

```text
哈奴曼
   ↓
孙悟空
   ↓
龙珠悟空
   ↓
火影猿飞一族
```

或者：

```text
九尾狐
   ↓
玉藻前
   ↓
Fate玉藻前
   ↓
阴阳师玉藻前
```

因为这时候会从：

```text
民俗爱好者
```

直接扩展到：

```text
ACG玩家
游戏玩家
动漫考据党
```

用户量会扩大十倍以上。

---

我甚至觉得这个项目最有趣的不是：

> 亚洲传说角色目录

而是：

> 亚洲角色进化树（Asian Character Evolution Tree）

因为你最后展示的其实不是“资料”。

而是：

```text
角色如何跨越两千年不断转生
```

这个视角非常少见，而且天然适合可视化。现在网上有无数神话数据库，但几乎没有一个把“传播路径”和“角色变异”当成第一视角来设计。

---

**Sources:**

- [Yokai.com | The Illustrated Database of Japanese Folklore](https://yokai.com/?srsltid=AfmBOooCuz_yFq3oH9awPstKKfYL4ebB9H2OVl1az1Z7NWN-5qpHvADB&utm_source=chatgpt.com)
- [The Database of Folktales of Mysterious Phenomena and ...](https://www.nichibun.ac.jp/YoukaiDB/english_kaisetsu.html?utm_source=chatgpt.com)
- [Myth and Folklore Wiki:Asian Mythology Project - Fandom](https://mythus.fandom.com/wiki/Myth_and_Folklore_Wiki%3AAsian_Mythology_Project?utm_source=chatgpt.com)
- [Comparative mythology](https://en.wikipedia.org/wiki/Comparative_mythology?utm_source=chatgpt.com)
- [FOLKLORE Stelios Michalopoulos Melanie Meng Xue ...](https://www.nber.org/system/files/working_papers/w25430/revisions/w25430.rev0.pdf?utm_source=chatgpt.com)

## Prompt:
2026/5/31 01:05:16

是的，我希望不仅包含古典的，还包含现代传播的

## Response:
2026/5/31 01:05:16

那我觉得你的项目方向一下子从「神话数据库」升级成了「文化 Meme（模因）演化图谱」。

因为如果只做古典神话，你会遇到两个问题：

1. 用户群太小（神话爱好者、民俗学学生）
2. 数据量有限，而且很多结论存在学术争议

但如果允许延伸到现代作品，就会变成：

```text
哈奴曼
 ↓
西游记·孙悟空
 ↓
龙珠·孙悟空
 ↓
黑神话·悟空
```

或者

```text
九尾狐
 ↓
朝鲜九尾狐
 ↓
玉藻前
 ↓
Fate
 ↓
阴阳师
 ↓
原神八重神子（部分意象借用）
```

用户突然就变成：

- ACG玩家
- 游戏玩家
- 小说作者
- 编剧
- 世界观设计师
- 民俗研究者
- 历史爱好者

---

## 我甚至会扩大到「角色」之外

因为有些传播最有趣的不是角色，而是概念。

例如：

### 地狱

```text
印度 Naraka
 ↓
中国地狱
 ↓
十殿阎罗
 ↓
日本地狱
 ↓
现代动漫地狱
```

---

### 龙

```text
中国龙
 ↓
日本龙
 ↓
韩龙
 ↓
现代JRPG龙王
```

---

### 天狗

```text
中国天狗
 ↓
日本天狗
 ↓
妖怪文化
 ↓
动漫天狗角色
```

---

### 百鬼夜行

```text
民间传说
 ↓
鸟山石燕
 ↓
京极夏彦
 ↓
阴阳师
 ↓
现代ACG
```

这类传播链往往比单纯角色更清晰。

---

## 你的节点其实应该分层

我会设计三种节点：

### Origin（源头）

```text
哈奴曼
九尾狐
Yama
```

---

### Adaptation（改编）

```text
西游记孙悟空
玉藻前
日本阎魔
```

---

### Modern Media（现代作品）

```text
龙珠悟空
Fate玉藻前
阴阳师大天狗
黑神话悟空
```

---

然后用户能看到：

```text
Origin
  ↓
Adaptation
  ↓
Modern
```

---

## 最有价值的功能

不是搜索角色。

而是：

### 为什么这个角色长这样？

例如用户点开：

**Fate 玉藻前**

界面显示：

```text
Fate 玉藻前

来源：
  ↓
玉藻前（日本）
  ↓
九尾狐（中国）

引用元素：
✓ 九尾
✓ 狐妖
✓ 魅惑
✓ 长寿

未继承：
✗ 食人
✗ 灾祸象征
```

这就很像 Git Diff。

---

## 我甚至觉得不要局限亚洲

虽然项目名可以叫亚洲传说。

但数据模型应该允许：

```text
埃及
希腊
北欧
中东
印度
中国
日本
韩国
东南亚
现代ACG
```

因为你迟早会遇到：

```text
巴哈姆特
 ↓
阿拉伯神话
 ↓
D&D
 ↓
FF
 ↓
最终幻想14
```

或者

```text
芬里尔
 ↓
北欧神话
 ↓
FGO
 ↓
各种JRPG
```

---

从产品角度看，我会把项目定义成：

> 一个展示神话、传说、文学、游戏、动漫角色如何在历史中不断演化和传播的交互式知识图谱。

而不是：

> 亚洲神话数据库。

因为前者是一个几乎没人做过的知识可视化产品。

后者会被拿去和各种 Wiki、百科全书正面竞争。

---

最关键的是，你这个想法天然适合你现在的背景。

你本来就在做游戏、世界观、叙事设计。

做着做着，你会发现这个网站本身就是一个巨大的「角色设计参考库」。

以后你设计一个妖怪、神祇、都市传说角色时，可以直接沿着谱系往回追溯两千年。对于编剧、游戏策划、设定作者来说，这个价值甚至可能比普通玩家还大。

## Prompt:
2026/5/31 01:06:07

而且本质上，我不需要做研究，让ai不断完善就好，你帮我搜索

## Response:
2026/5/31 01:06:08

我觉得你这个项目最关键的一点其实已经被你自己发现了：

> 你不是在做“研究项目”，而是在做“知识结构项目”。

这俩完全不是一个难度。

---

传统神话研究的流程：

```text
收集文献
↓
阅读
↓
考据
↓
建立观点
↓
发表
```

---

而你的流程可以是：

```text
先建立图结构
↓
AI不断填充
↓
人工审核
↓
社区修正
```

这会快几个数量级。

---

而且我搜了一圈，结果反而证明了一件事：

## 已经有人做：

- 神话数据库
- 妖怪数据库
- 民俗母题数据库
- 神话知识图谱
- 角色关系图
- 学术比较神话学

但是几乎没人做：

> 时间维度 + 传播维度 + 现代改编维度

的统一可视化。 ([Folklore Database](https://folkloredatabase.com/?utm_source=chatgpt.com))

---

最接近你的反而是：

### Folklore Database

里面已经有：

- 22万神话故事
- 39000个神话元素（Mytheme）
- 3400多个母题（Motif）

而且正在往结构化方向发展。 ([Folklore Database](https://folkloredatabase.com/?utm_source=chatgpt.com))

但它的问题是：

```text
Narrative
↓
Motif
↓
Search
```

不是：

```text
Character
↓
Evolution
↓
Visualization
```

---

另一个接近的是学术界的：

### Comparative Mythology

他们研究：

- 神话传播
- 母题迁移
- 文化演变

本质和你的想法一致。 ([维基百科](https://en.wikipedia.org/wiki/Comparative_mythology?utm_source=chatgpt.com))

但成果形态是：

```text
论文
数据库
PDF
```

不是交互网站。

---

甚至还有人专门研究：

### Mythology Knowledge Graph

把神话做成 Graph Database。 ([semantic-web-journal.net](https://www.semantic-web-journal.net/system/files/swj2754.pdf?utm_source=chatgpt.com))

但他们的目标是：

```text
知识检索
语义分析
```

而不是：

```text
给人看
```

---

所以我觉得你的优势反而在于：

## 你不需要一开始就正确

你只需要：

### Version 0.1

做出：

```text
哈奴曼
↓
孙悟空
↓
龙珠悟空
↓
黑神话悟空
```

用户已经会开始传播了。

---

## AI时代特别适合做这个

因为这种数据结构太适合LLM。

例如：

你给AI一个节点：

```yaml
name: 孙悟空
```

然后直接生成：

```yaml
possible_origins:
  - 哈奴曼
  - 无支祁

derived_characters:
  - 龙珠悟空
  - 最游记悟空
  - 黑神话悟空

confidence:
  probable

sources:
  ...
```

---

然后人工只需要审核：

```text
✓ 合理
✗ 扯淡
```

---

实际上我觉得后面甚至可以做到：

### AI辅助发现传播链

例如：

用户录入：

```text
鸣人九尾
```

AI发现：

```text
九尾狐
↓
玉藻前
↓
日本妖狐文化
↓
鸣人九尾
```

然后标记：

```yaml
confidence: speculative
```

等社区讨论。

---

我甚至觉得数据库结构都已经很明确了：

```yaml
Node:
  id
  name
  type

  # Myth
  # Character
  # Creature
  # Concept
  # Story
  # Media

  culture
  era

  description

Edge:
  from
  to

  relation

  # derived_from
  # inspired_by
  # adapted_into
  # merged_with

  confidence

  sources
```

---

真正让我觉得有潜力的是：

### 它天然能无限扩张

你最开始可能是：

```text
亚洲神话
```

---

后来变成：

```text
神话
+
民俗
```

---

再后来：

```text
神话
+
ACG
```

---

最后甚至会变成：

```text
文化模因演化图谱
```

例如：

```text
吸血鬼
↓
德古拉
↓
JOJO Dio
↓
吸血鬼题材游戏
```

---

或者：

```text
狐狸精
↓
玉藻前
↓
Fate
↓
原神
↓
鸣潮
```

---

从产品角度来说，我反而会把 MVP 缩得特别狠：

## 第一版只做

- 孙悟空系
- 九尾狐系
- 阎罗王系
- 天狗系
- 龙系

控制：

```text
50个节点
100条边
```

然后直接把时间轴和传播动画做出来。

因为目前网上我能找到很多神话数据库、知识图谱和角色关系网络研究，但几乎没有一个把“角色跨文化传播与现代转生”作为核心体验来展示。([semantic-web-journal.net](https://www.semantic-web-journal.net/system/files/swj2754.pdf?utm_source=chatgpt.com))

而这恰恰是最容易让普通用户一眼看懂、并且愿意分享的部分。

---

**Sources:**

- [Folklore Database — World Mythology, Folktales & Narrative ...](https://folkloredatabase.com/?utm_source=chatgpt.com)
- [Comparative mythology](https://en.wikipedia.org/wiki/Comparative_mythology?utm_source=chatgpt.com)
- [Greek Mythology as a Knowledge Graph: From Chaos to ...](https://www.semantic-web-journal.net/system/files/swj2754.pdf?utm_source=chatgpt.com)

## Prompt:
2026/5/31 01:07:05

ts+react+vite ok？

## Response:
2026/5/31 01:07:07

可以，而且很合适。

我建议技术栈：

```txt
TypeScript + React + Vite
React Flow / XYFlow
Zustand
TanStack Query
Tailwind CSS
Supabase / PostgreSQL
```

核心原因：

**Vite + React** 做这种交互式知识图谱很轻，启动快，部署简单。

**React Flow / XYFlow** 很适合你的「横向 Git 树」式节点关系图，可以自定义节点、边、缩放、拖拽、点击详情。

**TypeScript** 很重要，因为你的核心其实是数据结构：

```ts
type MythNode = {
  id: string
  name: string
  type: 'origin' | 'adaptation' | 'modern'
  culture: string
  polity?: string
  yearStart?: number
  yearEnd?: number
  description?: string
}

type MythEdge = {
  id: string
  from: string
  to: string
  relation: 'derived_from' | 'inspired_by' | 'adapted_into' | 'merged_with'
  confidence: 'confirmed' | 'probable' | 'speculative'
  sources?: string[]
}
```

前端布局大概：

```txt
左侧：搜索 / 筛选 / 角色族谱列表
中间：时间轴图谱
右侧：节点详情
底部：来源、争议、版本记录
```

MVP 可以先不做后端，直接：

```txt
/src/data/sunwukong.json
/src/data/kitsune.json
/src/data/yama.json
```

等交互验证后再上 Supabase。

所以结论是：**TS + React + Vite OK，甚至是我会首选的 MVP 技术栈。**

## Prompt:
2026/5/31 01:07:25

设计风格呢

## Response:
2026/5/31 01:07:27

我建议走：

**古籍档案馆 × GitHub 网络图 × 现代博物馆导览**

不要做成传统“神话网站”的羊皮纸、毛笔、卷轴风。那个很容易土，而且不适合现代传播链。

整体气质可以是：

```text
深色底 / 低饱和
细线网格
时间轴刻度
档案卡片
少量朱红、金色、青绿色作为文化标记
```

视觉关键词：

**research board / archive / transit map / genealogy tree / cyber-museum**

---

我会定成三层 UI：

### 1. 主图谱：像 Git 分支 + 地铁线路图

横向时间推进，节点像 commit。

```text
公元前500    500    1000    1500    2000
印度文化圈  ●───────╮
             │       ╰──● 孙悟空
汉文化圈     ───────────●──────● 黑神话悟空
日本文化圈             ╰──────● 龙珠悟空
```

线条不要太花，重点是“传播路径”。

---

### 2. 节点详情：像博物馆展签

点开节点后右侧浮层：

```text
孙悟空 / Sun Wukong
明代 · 中国 · 文学角色

首次明确文本：西游记
来源关系：可能受哈奴曼、无支祁等影响
继承元素：猴、神通、反叛、取经
现代影响：龙珠、黑神话悟空……
```

风格要像精品展览说明牌，而不是百科词条。

---

### 3. 可信度：像学术标注，但做得轻

边上可以有小标签：

```text
Confirmed
Probable
Speculative
```

颜色可以：

```text
Confirmed：青绿色
Probable：琥珀色
Speculative：灰紫色
```

这样用户一眼知道哪些是学界较稳，哪些是猜测/流行说法。

---

配色我会建议：

```text
背景：#0E1116 / #111318
卡片：#181C22
主文字：#E6E1D8
次文字：#9B9488
线条：#3A3F48
强调朱红：#C94F3D
强调金：#C6A15B
强调青绿：#3FA796
```

字体：

中文：思源宋体 / 思源黑体  
英文：Inter / IBM Plex Sans  
标题可以用偏宋体，正文用黑体。

---

一个很好的方向是：

**不要古风，而是“研究古典文化的现代工具”。**

这样它可以同时容纳：

- 《山海经》
- 《西游记》
- 鸟山石燕
- 《龙珠》
- 《Fate》
- 《黑神话：悟空》

不会视觉上割裂。

## Prompt:
2026/5/31 01:08:06

叫什么名字呢

## Response:
2026/5/31 01:08:07

我会先明确一件事：

如果你真的想包含：

```text
神话
↓
民俗
↓
文学
↓
影视
↓
游戏
↓
ACG
```

那项目名最好不要叫：

```text
Asian Mythology
Myth Database
妖怪图鉴
神话百科
```

因为范围太窄了。

实际上你做的是：

> 角色、概念、故事在文化中的演化与传播。

---

## 我最推荐的几个方向

### 1. MythBranch

```text
MythBranch
神话分支
```

像 Git Branch。

非常符合：

```text
哈奴曼
 ├─ 孙悟空
 │   ├─ 龙珠悟空
 │   └─ 黑神话悟空
 └─ 其他猴神
```

优点：

- 好记
- 国际化
- 直接体现树状传播

---

### 2. MythTree

```text
MythTree
神话树
```

简单直白。

缺点：

太常见。

---

### 3. MythGraph

```text
MythGraph
神话图谱
```

偏技术感。

适合你这种：

```text
Node
Edge
Timeline
```

的数据结构。

---

### 4. LegendFlow

```text
LegendFlow
传说流变
```

我很喜欢。

因为你展示的是：

```text
角色如何流动
文化如何传播
```

而不是静态档案。

---

### 5. LoreAtlas

```text
LoreAtlas
传说图志
```

Atlas（地图集）非常适合：

```text
时间
+
空间
+
传播
```

这个概念。

而且未来可以扩展：

- 神话
- 游戏世界观
- 小说设定

---

## 如果想突出东亚

### Sinosphere

```text
Sinosphere
汉字文化圈
```

但有点学术。

---

### EastLore

```text
EastLore
东方传说
```

简单。

---

### Hundred Spirits

```text
百灵谱
Hundred Spirits
```

有《百鬼夜行》味道。

但不够国际化。

---

## 如果想做得像 GitHub

我会考虑：

### LoreHub

```text
LoreHub
```

### LoreGit

```text
LoreGit
```

### MythHub

```text
MythHub
```

其中 MythHub 最顺口。

---

## 中文名

我觉得下面几个比较强：

### 传说谱系

```text
Legend Genealogy
```

最准确。

---

### 传说演化图谱

最直观。

---

### 角色演化树

最符合产品。

---

### 万象谱

比较有味道。

有：

```text
万物皆可追溯
```

的感觉。

---

### 流变

就两个字。

非常中国学术界。

例如：

```text
《九尾狐流变史》
《龙王信仰流变》
```

---

如果是我自己做，我大概率会选：

```text
英文：
LoreAtlas

中文：
传说谱系
```

组合起来：

```text
LoreAtlas
传说谱系
```

用户第一次看到就能理解：

> 这是一个查看角色、神话、传说如何传播和演化的地图。 

而且未来你把《Fate》《黑神话》《原神》《龙珠》这些现代内容放进去，也完全不会违和。

## Prompt:
2026/5/31 01:09:23

中文还行，英文音节太多了

## Response:
2026/5/31 01:09:24

我同意。

**LoreAtlas、LegendFlow、Mythology Evolution Atlas** 这种都属于“解释性名字”，不像产品名。

你这个项目其实更适合：

```text
短
好记
有文化感
最好 1~2 个单词
```

就像：

- GitHub
- Fandom
- Pixiv
- Danbooru
- Obsidian
- SteamDB

这种。

---

## 我觉得最有潜力的是

### Lore

直接就叫：

```text
Lore
```

但域名和商标基本没戏。

---

### Mythos

来自希腊语：

```text
Mythos
```

意思：

```text
神话
传说
叙事
```

音节很短：

```text
迈索斯
```

而且比 Myth 更高级。

---

### Saga

```text
Saga
```

传奇、史诗。

特别短。

但北欧味有点重。

---

### Canon

```text
Canon
```

设定集、正史。

可惜已经被佳能占了。

---

### Lorea

这是我比较喜欢的。

```text
Lore + a
```

念起来：

```text
洛瑞亚
```

像个地方名。

像：

```text
Pixiv
Notion
Figma
```

这种现代互联网产品。

---

## 如果结合你的传播树概念

### Root

```text
Root
```

追根溯源。

---

### Roots

```text
Roots
```

角色的根系。

---

### Origin

```text
Origin
```

起源。

非常符合项目。

---

### Lineage

```text
Lineage
```

谱系。

学术味最重。

其实非常贴切。

---

### MythRoot

```text
MythRoot
```

我觉得挺不错。

用户一眼就懂：

```text
寻找角色的根源
```

---

## 中文我反而觉得可以大胆一点

不要：

```text
亚洲传说角色演变目录
```

这种项目说明书式名称。

而是：

### 谱系

就两个字。

---

### 流变

两个字。

很学术。

---

### 溯源

两个字。

很符合功能。

---

### 源流

我特别喜欢。

因为：

```text
源
↓
流
```

本来就是你的产品。

---

### 百相

来自：

```text
千变万化
```

同一个角色的不同化身。

---

### 化身

其实也不错。

例如：

```text
九尾狐
↓
玉藻前
↓
Fate玉藻前

都是化身
```

---

如果让我选，我会优先考虑：

| 中文 | 英文 |
|--------|--------|
| 源流 | Origin |
| 谱系 | Lineage |
| 流变 | Mythos |
| 溯源 | Root |
| 化身 | Avatar |

其中我最喜欢的是：

```text
源流
Origin
```

或者甚至直接：

```text
源流
YuanLiu
```

因为这个项目本质上就是在回答：

> 这个角色是从哪里来的，又流向了哪里。 

这比“神话”“传说”“妖怪”等具体类别更接近你的核心价值。

## Prompt:
2026/5/31 01:10:11

mythroot不错，中文呢

## Response:
2026/5/31 01:10:12

如果英文确定偏向 **MythRoot**，那中文最好也围绕：

```text
神话
+
根源
+
谱系
+
溯源
+
分支
```

而不是单纯翻译成“神话根源”（太直白）。

我会按喜欢程度排序：

## 第一梯队

### 神话谱系

```text
MythRoot
神话谱系
```

优点：

- 一眼知道干什么
- 学术感强
- 和你的图结构完全一致

例如：

```text
九尾狐谱系
孙悟空谱系
阎罗王谱系
```

都成立。

---

### 神话源流

```text
MythRoot
神话源流
```

我个人最喜欢。

因为：

```text
Root = 源
Tree = 流
```

天然对应你的产品。

而且：

```text
龙的源流
九尾狐的源流
```

中文里本来就是自然表达。

---

### 传说谱系

```text
MythRoot
传说谱系
```

覆盖范围最大。

因为你后面一定会收录：

- 龙珠
- Fate
- 黑神话
- 原神

这些已经不算神话了。

---

## 第二梯队

### 溯源

```text
MythRoot
溯源
```

非常短。

产品感强。

但有个问题：

听不出是神话项目。

像代码工具。

---

### 源流

```text
MythRoot
源流
```

也很好。

但和上面同样的问题：

太抽象。

---

### 谱系

```text
MythRoot
谱系
```

最简洁。

但搜索性差。

---

## 第三梯队（偏品牌）

### 万相谱

有点《山海经》味道。

```text
一个角色的万千化身
```

很符合你后期扩展到 ACG。

---

### 众神谱

不太行。

因为会限制到神。

---

### 化身录

很有味道。

但会让人以为是小说。

---

## 我最推荐的组合

### 方案A（最稳）

```text
MythRoot
传说谱系
```

用户第一次打开：

> 哦，这是看角色演化树的。

---

### 方案B（最有文化味）

```text
MythRoot
神话源流
```

我自己最喜欢。

看起来像一本书：

```text
《神话源流》
```

而你的项目本质上就是把这本书做成交互版。

---

### 方案C（如果未来想做成大项目）

```text
MythRoot
谱系
```

就像：

```text
GitHub
SteamDB
Pixiv
```

一样。

产品叫：

```text
MythRoot
```

中文社区叫：

```text
谱系
```

例如：

> 我刚给谱系补了一个玉藻前节点。

> 去 MythRoot 查一下孙悟空的谱系。

这种社区语言其实挺顺的。

我个人会投 **「MythRoot · 神话源流」** 一票，因为它既保留了神话起源的感觉，又不把自己限制死在“百科全书”这个框架里。未来你加入《龙珠》《Fate》《黑神话：悟空》这些现代节点，也完全说得通。

## Prompt:
2026/5/31 01:10:27

myth和lore差这么多？

## Response:
2026/5/31 01:10:29

差挺多。

**Myth** 更偏：

> 神话、神祇、创世、宗教性叙事、古典神话体系

比如：

- Greek myth
- Hindu myth
- creation myth
- mythological creatures

听起来更“古典 / 学术 / 神话学”。

**Lore** 更宽：

> 传说、背景设定、民间知识、世界观资料、口耳相传的故事

比如：

- game lore
- Elden Ring lore
- folklore
- vampire lore
- Star Wars lore

它可以自然覆盖：

- 神话
- 民俗
- 都市传说
- 文学设定
- 游戏世界观
- ACG 角色来源

所以你的项目如果只做“亚洲神话角色源流”，**MythRoot** 很合适。

但你明确要包含现代传播，比如《龙珠》《Fate》《黑神话》《原神》这类，严格说 **LoreRoot** 可能更准确。

不过问题是：

**LoreRoot 没有 MythRoot 好听。**

我的判断：

- **MythRoot**：更有辨识度，更像品牌名，但范围听起来稍窄。
- **LoreRoot**：概念更准确，但听起来有点工具站/数据库味。
- **MythLore**：覆盖广，但普通。
- **Loreline**：好听，表示谱系/脉络，但不如 MythRoot 直观。
- **RootLore**：还行，有“根源资料库”的感觉。

我会选：**MythRoot** 做品牌名，副标题用 **Lore Genealogy** 或中文“传说谱系 / 神话源流”来补足范围。

## Prompt:
2026/5/31 01:10:59

还有别的词吗，我同意myth有点古典

## Response:
2026/5/31 01:10:59

有，而且我觉得你这个项目其实已经快脱离 **Myth（神话）** 了。

因为你最终想追踪的是：

```text
文化元素
↓
传说角色
↓
文学角色
↓
游戏角色
↓
网络文化
```

本质更接近：

> Cultural Evolution Database

而不是 Mythology Database。

---

## 最值得考虑的几个词

### Lore

最接近你的项目。

```text
Elden Ring Lore
Dark Souls Lore
Star Wars Lore
```

包含：

- 神话
- 传说
- 世界观
- 背景故事

全部。

---

### Legend

```text
Legend
```

传说。

比 Myth 更民间。

例如：

```text
Urban Legend
Local Legend
```

但现代作品味道不够。

---

### Folklore

```text
Folklore
```

民俗学。

学术上特别准确。

因为：

```text
九尾狐
河童
孟婆
龙王
```

其实很多属于 Folklore。

但普通人不认识这个词。

---

### Lore + Folklore

其实很多学者都这么区分：

```text
Myth
神话

Legend
传说

Folklore
民俗

Lore
统称
```

---

## 但我觉得你应该跳出这个维度

你项目最特别的地方不是内容。

而是：

```text
传播
演化
分支
谱系
```

---

例如：

### Lineage

我特别喜欢。

```text
Lineage
```

意思：

```text
血统
谱系
传承链
```

例如：

```text
Fox Lineage
Dragon Lineage
```

非常符合。

---

### Roots

```text
Roots
```

根系。

传播树。

---

### Origin

```text
Origin
```

起源。

简洁。

---

### Branch

```text
Branch
```

分支。

Git味极强。

---

### Nexus

```text
Nexus
```

连接点。

知识图谱感。

---

### Echo

这个比较有意思。

```text
Echo
```

回响。

一个角色不断在历史中回响。

例如：

```text
Hanuman
↓
Sun Wukong
↓
Goku

是一种Echo
```

---

## 我最喜欢的几个名字

### LoreLine

```text
LoreLine
```

传说脉络。

非常符合产品。

---

### Lineage

直接叫：

```text
Lineage
```

超级高级。

缺点：

有点抽象。

---

### LoreRoot

```text
LoreRoot
```

比 MythRoot 范围更广。

---

### LoreTree

```text
LoreTree
```

有点像技能树。

---

### StoryRoot

```text
StoryRoot
```

简单。

但太宽泛。

---

### MythRoot（你现在的）

其实仍然很强。

因为：

用户第一眼就知道：

```text
这玩意跟神话、传说有关
```

---

## 如果是我

我会认真考虑下面三个：

```text
MythRoot
LoreLine
Lineage
```

它们对应三种定位。

### MythRoot

```text
神话起源站
```

最容易理解。

---

### LoreLine

```text
传说传播链
```

最符合功能。

---

### Lineage

```text
文化谱系图谱
```

最有格调。

---

说实话，如果这个项目以后真的会收录：

- 孙悟空
- Fate玉藻前
- 龙珠悟空
- 原神八重神子
- 黑神话悟空

我反而觉得：

**LoreLine** 比 MythRoot 更准确。

因为用户打开后会发现：

> 这不是神话网站，这是角色和文化元素的演化网络。

而 Lore 本来就是游戏、ACG、世界观圈子最常用的那个词。

## Prompt:
2026/5/31 01:11:45

legend branch？

## Response:
2026/5/31 01:11:45

**LegendBranch 其实比 MythRoot 更接近你的产品。**

因为它天然表达了：

```text
Legend（传说）
+
Branch（分支）
```

用户第一次看到就能联想到：

```text
一个传说不断分化
```

而不是：

```text
研究神话起源
```

---

不过它有几个特点：

### 优点

#### 1. 直接体现你的核心机制

你的产品本质不是百科。

而是：

```text
哈奴曼
 ├─ 孙悟空
 │   ├─ 龙珠悟空
 │   └─ 黑神话悟空
 │
 └─ 其他猴神
```

这就是 Branch。

所以：

```text
LegendBranch
```

和 Git 分支的隐喻非常一致。

---

#### 2. 比 Myth 更宽

Legend 可以覆盖：

- 神话
- 民间传说
- 妖怪
- 都市传说

比 Myth 自然。

---

#### 3. 现代作品也不违和

例如：

```text
九尾狐
↓
玉藻前
↓
Fate玉藻前
```

仍然可以解释成：

```text
一个传说的分支
```

---

### 缺点

#### 1. 有点长

```text
LegendBranch
```

三个音节：

```text
Le-gend-Branch
```

比：

```text
MythRoot
```

更长。

---

#### 2. Branch 偏技术

程序员会秒懂。

普通人可能会觉得：

```text
什么分支？
银行支行？
树枝？
```

不像 Root 那么直观。

---

## 我会试几个变体

### LegendRoot

```text
LegendRoot
```

我觉得比 LegendBranch 更顺口。

而且：

```text
追溯传说源头
```

符合用户直觉。

---

### LoreBranch

```text
LoreBranch
```

其实挺强。

因为：

```text
Lore
+
Git Branch
```

正好对应你的项目。

---

### Branches

直接：

```text
Branches
```

有点艺术馆味。

但太抽象。

---

### LegendTree

```text
LegendTree
```

用户秒懂。

但有点普通。

---

### LegendLine

```text
LegendLine
```

传说脉络。

我觉得甚至比 Branch 更符合你的时间轴设计。

---

## 中文对应

如果英文是：

```text
LegendBranch
```

我不会翻译成：

```text
传说分支
```

太程序员了。

而会翻译成：

```text
传说谱系
```

或者：

```text
传说源流
```

---

说实话，在目前讨论过的名字里，我个人排名大概是：

```text
1. MythRoot
2. LegendBranch
3. LoreLine
4. Lineage
```

**MythRoot 像一个品牌名。**

**LegendBranch 像一个产品名。**

如果我在 Product Hunt 或 GitHub 上看到：

```text
LegendBranch
Trace the evolution of myths, legends and characters across cultures.
```

我会立刻明白这是干什么的。反而 MythRoot 还需要点进去看看。

## Prompt:
2026/5/31 01:12:47

legend branch 传说谱系挺好

## Response:
2026/5/31 01:12:48

我觉得 **LegendBranch · 传说谱系** 已经相当不错了，而且最重要的是：

**英文和中文在表达同一个核心概念。**

很多项目的问题是：

```text
英文：MythRoot（起源）
中文：神话图鉴（百科）
```

两边表达的其实不是一个东西。

但你这个：

```text
LegendBranch
传说谱系
```

非常统一。

---

它隐含的是：

```text
一个传说
↓
不断分化
↓
产生不同版本
↓
形成谱系
```

例如：

```text
九尾狐
├─ 中国九尾狐
├─ 朝鲜九尾狐
│  └─ 阿狸郎传说
└─ 日本玉藻前
   ├─ Fate
   └─ 阴阳师
```

这就是一个 Legend Branch。

---

而且它还有一个优势：

## 不限制内容范围

未来你放进去：

### 神话

```text
阎罗王
天狗
龙王
```

没问题。

---

### 民俗

```text
河童
座敷童子
狐仙
```

没问题。

---

### 都市传说

```text
裂口女
如月车站
八尺大人
```

没问题。

---

### 游戏动漫

```text
孙悟空
↓
龙珠悟空
↓
黑神话悟空
```

也没问题。

---

而如果叫 MythRoot：

```text
Fate玉藻前
原神八重神子
```

用户会开始怀疑：

> 这还算 Myth 吗？

---

## Logo 我甚至已经有画面了

不是树。

而是：

```text
●────●────●
      ╰──●
          ╰──●
```

像：

- Git Branch
- 地铁线路图
- 家谱

三者结合。

因为你的产品本质上就是：

> Git Graph for Legends

---

## Slogan 甚至都能直接写

英文：

```text
Trace the evolution of legends.
```

或者

```text
Explore how stories branch across cultures.
```

---

中文：

```text
追溯传说的流变。
```

```text
查看角色如何跨越千年不断演化。
```

```text
探索文化如何分支、生长与传播。
```

---

如果是我现在注册仓库，我大概率会直接用：

```text
LegendBranch
```

副标题：

```text
传说谱系
```

因为它不像数据库项目，更像一个真正的产品名字。

而且几年后你把范围扩展到：

- 亚洲神话
- 欧洲神话
- SCP
- 克苏鲁
- Fate
- 原神

甚至各种现代互联网 Meme

**LegendBranch 这个名字仍然成立。**

这是它最大的优势。

## Prompt:
2026/5/31 01:13:19

Trace the evolution of legends.很好

## Response:
2026/5/31 01:13:20

我也觉得这句很强。

因为它有几个优点：

### 简短

```text
Trace the evolution of legends.
```

只有 5 个词。

不像：

```text
Explore the genealogy of mythological characters across cultures.
```

这种一股基金申请书味。

---

### 符合产品功能

用户打开网站后实际做的事情就是：

```text
点击节点
↓
查看来源
↓
查看分支
↓
查看后代
```

本质上就是：

```text
Trace
```

追溯。

---

### 范围刚好

它说的是：

```text
legends
```

不是：

```text
myths
```

所以：

- 孙悟空
- 玉藻前
- 八尺大人
- Fate
- 龙珠
- 黑神话

都能装进去。

---

### 有成长感

最妙的是：

```text
evolution
```

这个词。

它暗示：

```text
不是抄袭
不是借鉴
不是百科
```

而是：

```text
演化
变异
分支
传播
```

这正是你的核心卖点。

---

如果做 Landing Page，我甚至会这么写：

```text
LegendBranch

Trace the evolution of legends.

From ancient myths to modern media,
explore how characters, stories, and ideas
branch across cultures and centuries.
```

中文：

```text
传说谱系

追溯传说的演化。

从古代神话到现代游戏，
探索角色、故事与文化概念
如何跨越千年不断分支与传播。
```

---

其实到了这一步，我反而觉得：

```text
LegendBranch
```

已经比前面讨论的 MythRoot 更适合。

因为用户看到名字和 Slogan 的瞬间，就能理解：

```text
LegendBranch
Trace the evolution of legends.
```

= 

```text
这是一个看传说如何不断分支演化的网站。
```

基本不用额外解释了。

而且作为 GitHub 仓库名也很好看：

```text
LegendBranch/
├─ frontend/
├─ backend/
├─ crawler/
└─ data/
```

看起来就像一个认真产品，而不是一个研究课题。

## Prompt:
2026/5/31 12:28:09

有类似的产品（交互）可以给我参考吗

## Response:
2026/5/31 12:28:10

有，而且我觉得你应该参考的不是“神话网站”。

而是不同领域里已经验证过的：

> 时间 + 分支 + 知识图谱 + 探索体验

下面几个我觉得价值特别高。

---

# 1. Git Graph（最重要）

你整个项目本质上就是：

> Mythology Git Graph

参考：

[Mermaid Git Graph 示例](https://mermaideditor.com/diagrams/git-graph?utm_source=chatgpt.com)

![Image](https://images.openai.com/static-rsc-4/EDfu-NbOYTe_26qVpGtoIgvsEbkR2V792ASUz1sW5ArMsy28fcwO_mvNREphJfq_kFfPl1kL8g9i-OHW3215tpznfx471Wjlf9MjTti11OkDtxe8Jqrir-m44ReaALnESD8MGxiYwbIrnmkpDmL4pBdsTOrVQaOQDG9gU68EioztzTIT6bFvxE5fiioWMIIz?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/f8C1cChphnG1cnKYnR1j_VGro4LV10OmLxOpSmQKuj942M3kkadGq723QTyAOwzM7DT7KobdIRGScgY20PX6PPg0pZTAfaUmx6uQRf8B7CnGxtuR0dHXxRWOVSh9XShLUKCar_WNNQQM_InAPEqS1eyhrdxIuKWebstp884YlCpDqxJxc10ftxAQnOkEcSig?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/DZmLwYsUJEEWcg2t0YJdZYlEyXEEpnFD396LoJYJgadPH32NzJKogfT16GtqZPgB27azdh05G-X7DJ-X8cgG5uXQdgDflR-5fegezXtQd32oTOOcSTnPWA5RjuLuh5zoUjacr_YE2kBUndKbnrEZ7ODR0zSyOzBj0oerx1O2KhrTNGr7KZ9q-Xrpkd-7hac-?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/18yWFh88fYbjYL_k9Ljoo15_NhkLwI7HHG7R7bRvf_NzgXi70cIs6pK8zChDw_nE_VQfJQdqrG7ugqVT9mRl0OnY653HIrSv92ddv1LnKi81tJS2RmUV2rJdQKcN-AAfdy-57i5nOwQF4_jrCUf8g4PHAGCen1w0Zu22vEEvEdom8BgTnOBUP8syXXv85GWN?purpose=fullsize)

你真正应该学的不是代码。

而是：

### 用户如何阅读分支

例如：

```text
●──●──●
    ╰─●──●
```

人类为什么能瞬间理解：

```text
主线
↓
分支
↓
合流
```

这和：

```text
九尾狐
↓
玉藻前
↓
Fate
```

是同一个问题。

---

# 2. ChronoZoom（时间缩放）

这是微软当年做的时间可视化项目：

ChronoZoom

[ChronoZoom 项目介绍](https://en.wikipedia.org/wiki/ChronoZoom?utm_source=chatgpt.com)

核心体验：

```text
时间轴
↓
无限缩放
↓
展开细节
```

例如：

```text
亚洲神话
↓
中国
↓
明代
↓
西游记
↓
孙悟空
```

逐级钻进去。

---

# 3. BioTapestry（超级值得看）

这个特别重要。

BioTapestry

[BioTapestry 介绍](https://en.wikipedia.org/wiki/BioTapestry?utm_source=chatgpt.com)

它本来是：

```text
基因
↓
影响
↓
分支
↓
调控网络
```

但视觉形式和你非常像。

![Image](https://images.openai.com/static-rsc-4/D6fCjubtA3QWWH0MBU2-1DLw_C7A3Ea0pUBDsaYDMRML0eCPmE8s223c4RXBAcMd4VRmxska7uZlANXQNBQ2e10hY8uZa4vklVlW5_uhOtUJoz10xM2Vzm9_0nx5q_Rr1C09kYM_e7XjGL0m-mDd9peFNu6POt8wnvIjw4XKfepk5VbKyjiUbie9pmujyu9T?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/h7vtbXFS-CGNDYfCHDDgXgHzNljWyU3BIFk7ZRc-dOynhyJpOWnkSnBqj-rFY_nOlsdN_MENjS-p8I4n8rC2iBKrwCxtIX89OE2FDINffBhWApVUSTvOU0obvKxHSq3hOyjxXkc6N1INMrPjHiqWaTSvqPskyErTcAaLfm_YjPBGZr9SMspSci6gXnMWY8_5?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/dMX1TtmZTbwjV_WE4bQWITHF0lRs0mpo0YgYrhexQidLHyTmHGawDDkUj5kPo7caTA3UBUPS9aqmVUfCnqW3O7WRnXpBNYXF6mUmQPV_IZmaMBG00O_in7mQU5wbEYKYKnaIzWU6kOAvqKQDecGw3KowYGdqz2ZAjVCzM2BGfrCKF2h5_xF-hrZUD5IIxLcR?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/UGZxM_6K5qYHt8ZETEJBdrc55JbvCfPVEZNd1-Ds1aGfIuLoUTYqzIn7lgeBi-qFp3y6OZmhuIGA01KPnpMEr70gpJfY7WrGoXdvCy-kRkI2nSZVGVmqthh-fcuykpAY9L1S5vIojsWPc1z7OEclT3Nmpu9Yhq4TuYvJb60JxQYMOEUMcqf5b8uwFBjnEuhv?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/Fkq3yMKW6x-IDPhpiBHCq_z95DA_sYUrJ2vu0miYWsZJIwTSksWwB3-X23DcqqrjtgWr19t_s8vZER9iT86-KBiR8rkZSX8po45mCeg-BX72eb_XxorcbqnEaNx2xMWIszDZnLLVbMH4NizIZDOpSD53XqLWlxB3rxRudWMVJt0MbtbIFfqbjgFCiAJvKd9i?purpose=fullsize)

看起来像：

```text
节点
+
横向传播
+
层级
+
关系线
```

你甚至可以直接借鉴布局逻辑。

---

# 4. Kumu（最接近商业产品）

这是做关系图谱的。

[Kumu 官方网站](https://kumu.io?utm_source=chatgpt.com)

![Image](https://images.openai.com/static-rsc-4/wS3GN57O78-iOKsz09nPnapsU3Zj82RnWUxQaBPinMD_TMVLiMtMX8Zy3UASLfWPRn-dyQoZ6nXYbDxaPUgQy_6SVLMY00EN_K5AO_Zu2vHa52GWAuTWJGSXMpwF4hLjV2TuEdtcT6mxOXxzFYdFMCz5aDQnasU8-IyRWgjjmR6Z1gcrnjsXi_zQFcJLdTHL?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/GXmX-UD-y06W8CeQ26pqDPX9Wgl2i6Cmxk9JNLS6U8b-zB8dMrd6H8CYOExTfloZWeVAZ_UxNhe6yLEPXNEN_HUm7e-IgkuW7xF_CXmR74g3P0jC8NI0cl2wjMCcdy4aD6Acl7JbzHjZefwJQIk5BOzNOhHSb0Sz5-K_YxfXGt64VID1MwPOflsRnhE4ro93?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/CSfJwRcd83nwNGK-Wx3Qutob3JMqqB7bTzpMltRqR5nY5n65Wqe3UpSc4aXKTdp0o_-YjN6rGJQ92DMp0S058tUZDY-Ntl9G_qc1uKapAGoa4Ffxy8xQ5I-c-4kPzeAyQcIJV4UV-fMDlayIE6RK4Pg0W9i0yFu34deqpxZO4gZvvt0-NzYUDBkXBU2uab06?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/MBf-giFeD6Hc0EAlGrNdiWNrL_aIfwtVNZgBZVbd5g01_MY3l789M-QcQclq1QLFMNAlfBK6PEmlu9ZOEzXhe0xUO97gLhG3YUpkFTm5D0XrXROgqguJRRo3Y60tmtI-1nuuIKbJx1cXUi112RdnqX9ktjhC453aH39p9SsVonEc0DJ5Jsj0ibJkxB5ZRWJt?purpose=fullsize)

它最大的价值：

### 节点详情面板

点击后右侧展开。

你未来：

```text
孙悟空
```

点开后：

```text
来源
影响
传播路径
引用文献
现代改编
```

完全可以照抄交互。

---

# 5. Obsidian Graph View

Obsidian

[Obsidian 官方网站](https://obsidian.md?utm_source=chatgpt.com)

![Image](https://images.openai.com/static-rsc-4/i4usYcAMFPJ4M9f31BHGf0jTUvybonIGzZXBg2wJajdjKonJJaOGjfhn2lGcPoT-rTTDP2F45Uhl1ICQEAi0REx7E_vxBaon7W1YQ4bCEPLgtrb018aZ1jhV7AkRqRiaGQ7UTKkRHwLPPdlw6o5B5O5Lef7PF1tu--VY_XxOkq51fqLR37p6AGOhErJ9Tw5j?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/bHqQ4STvih4ZoXu5rtdIGCd1nUvY6XQoPaGYi0GSRJLpDSmCiwd0DMFj5aZD-57sdtjNdTVa9drx9ajE_f5dpeJjDnEt91QacCSGUiJ5R1sJ5Q_T3Twfw-pJ41M1HSd2hnExHqSA7YfLW1YOJsT2V-Qsteb86hJxMjOJjJ5x-om7fl1IJH03SE-8SZIyLQW5?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/fk7go3-SN1tNkhWwSbLuzymSGjzNHHALJ4VccASRXcGIv07l7lYKZp0gZH75nhKIeEJkEN0JkKYli3VKyzpbMLwJcbaoyAIctojyk-7039k3pKZ-0-u3QHG9w6BgCeTT8gf7wHrzYE4aEoylx7gZZLc8FlmQKP-eisdQJQpUd5l1lUMLGt0OlaWKeNTZHWNq?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/V2pyRkqVr90QPteD2gKH9kfILbnTAzUZlZBy0P3NTCSVbYtwe2-S6twuqNQpXiVclv5-ZPQZ7NSvxuSpXeLp0k7zhoxo-0tcklEI72Y75SugMoIdyQt30FxW8O7X066QTfbfeZVWUM6CxT4Lpaz3-XnvmX63KrgPhgeULJhNXVHFB0EagCuqNZ3PhD5nHsu0?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/jWd9iePj4zCKdKiOs2ck2-ZvHzwAxng2QaXuFDCWR0Lj-oWK9Uqzx_jwkVn8mMSetK4P3fcms4VhC9n5s4ECP2h8_5C0bGgzUqy_GzxUrD0feQd16ukzz-oZIjmWyF_gEJ3WsJdAU64yyi74mOZ1H-6Xv0W58Z6dn5jugH42dLJnaaY5I19RaFiORp05CNLi?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/3lIWpzGXbXkbz1P-TPfw6zrXKmCGSJ24sc_wCnqypTJKP9N9X9c3Sty_mU8QMZKpD_hOmAsXMpu9HryGtbH502RbQnU2VQBR95EYBUh4BcbhmYoRX-09dx7WHpWfxLIi4yPALcOp4YT8AsdNOny4kBiUoEMbsWZgewe4T4Wd8tQcH9mg8AO6jPAKBx6z9PHG?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/JeKZR5MQ0Q01TSz5yCl0soIXlzgPQ_HHALxqmC3XPL3e0YeqkX726HPmVjAVc7ET3bcs6O33i9qO8L6YY2sV_Zq9K6-FInCysaCsHSHczZI45xQ1u-P6f_oM-gunuyOZofkkXurXNZ5_OGavH7zHIYafbjccpQN5H6lmNA9PywH9xe8TXYklXyY9YUCh90Vf?purpose=fullsize)

为什么重要？

因为它证明了一件事：

### 用户喜欢探索关系

而不是搜索。

你的项目未来最爽的体验可能不是：

```text
搜索孙悟空
```

而是：

```text
点开孙悟空
↓
发现哈奴曼
↓
发现阎魔
↓
发现佛教传播
```

不断跳转。

---

# 6. 地铁线路图

这个听起来离谱。

但我觉得：

## 真正最该参考的是东京地铁图

Tokyo Metro

![Image](https://images.openai.com/static-rsc-4/9NGj5xa1KY_g_8gG3pnxPByqq0gDj6SwV3vesJioM_B5qg8OJdGqeXamlfU2MEoHjBhz0XPZYLZ-qswcrX4MdKlOkdvSQQcMyf1aJdnDHTAioBqBzRK5kscQzhUzyQCBWoZLFbHruOCmYvL5eH_m4-GojqqWdAwtXgqty5FDxsgr2zerXJplHA022K9xN2iT?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/m0aUyt879wmoB8Tu6yxWdGWTxpIWaUcYaP_brQVjnf5_LokL6oa5UoaDVw5pE2lL_FcQ3UbKpM-590y7ia42ylj-bDhGjv7i8vhw31WqeqDBx2H5zj4rluZK82zu8U2nwdhu0e8kZZ2wAm18WT5iU60Hptf6FcPOcFknHL6b724mdMomhRSCpLXEsqhubKRA?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/MyhNGLpvLSDrqIy_oZ2z2z-olPWq-oMTTDaZBDzwzVrUoPUxEmRAMkrK1E-BsAYHKAfTb5V58Ic0D9j_y96AHY-LWSND4-x2O7-tv0VrD3M_1tbRJwTXWQg73mI1vWdi-cClRgX6rSrKzFcecwoxCSPfaZfqeuIbL2KORVxEApxGjoeTEfmS-BmGaHJx7sSp?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/nA8xKYduek_qPi5ZQi-qhdOiBYaHe4_c314a-7dY1ngvIs19dU9skwqyNcI32Zy6go9baPmIeo8R1Yopj-AeeMMBYMbOmExXdHdr2sWmLlrKguW_rc-T1W2VQR1BSnA7vFnSSnytG6uezXE6VLeRZXxv5v-B8r5zGJ3k0-kq4fcfIqpbsSka2TiskAt-4e-w?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/WD34K-sbLMKd6t1SZBHnmj1YvzFqyII09dDFw05XFcPZnH6vM-ZIJlk7eAxN0iXhsNexBjqfhxc0xuXW5i5dFH5x--kpBmAqLsKhDyDruRw9M9LOZKVeHKOSwitTAmchGc-w9qk7m20d53lrY9poxSa_Cv_PsGwJCKoSP6jzMx41_VAb9MRoIQhsonzYZHci?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/jblQQ37WNZ9AWRd57tWDNjbepTpHxpzZKvq7hHxfrwKbdPsGVp83QH4ugElvZhJzTlX5leYN-FJc1nE21wrTUWD2dyiAWT6o96bH0DChl0AT3aZ1Snh49BTMyjCDDLlMAf_ZoeJSckJ-RlfEJn_0Z5g2Pfsm719t_FDgmYoBxL8UUAlnp0wc_PBp0MPqUI79?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ukZl84wSKTeIBOwGEZuM68H2RbwU8Jg6229RGbqJoMVFP3XtK0QNlhQhKBvTGIQJUmJSxUNt3RDTWaByqsnP3IdLp36oh9W5IZWPxgqpoOMLuPcGhDXzIFXPmfsP2B7AwdWWOxeHqtqYmZw0yW9BuLozv8cyiN5YeqZ5UlGsNISKm48VZwMEoWbhjacEt3hE?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/tOuuZOnK8Yh8uR7QsnlqY_VcBYAHEtJp0I4w8e5Iiphg4bzROdAyFEforUkEfVFl7wNUyy1MLeHOi_Pz9Y-WeB1vDGjm5061w3h_W0rFyEdSY0DIQ_QxoB3KI5SntfJyFHTA1zyc4FzQb01r2oC9lrwJFX7wax1NxJOIAS5LGXONl2Za3k5NtVNaafKFzL8v?purpose=fullsize)

因为你的问题其实是：

```text
如何让复杂传播关系
看起来一眼能懂
```

而这正是地铁图解决的问题。

不是地图。

是：

```text
信息拓扑
```

---

# 我觉得最终应该长什么样

其实不是：

```text
Wikipedia
+
Neo4j
```

---

而是：

```text
Git Graph
+
地铁图
+
博物馆导览
+
Obsidian Graph
```

混合体。

例如：

```text
印度文化圈

● 哈奴曼
      ╲
       ╲
中国    ● 孙悟空
             ╲
              ● 龙珠悟空
             ╱
日本    ● 最游记悟空
```

点击：

右侧弹出：

```text
孙悟空

来源：
哈奴曼（Probable）
无支祁（Speculative）

首次文本：
西游记

现代分支：
龙珠
黑神话
最游记
```

这时候它就不是数据库了。

而是一个：

> 可探索的文化演化网络（Explorable Cultural Evolution Network）

说实话，我觉得如果你真的开始做 UI，我第一批参考对象会是：

1. GitKraken / Git Graph
2. Kumu
3. Obsidian Graph
4. 东京地铁图
5. ChronoZoom

而不会是任何神话网站，因为那些网站几乎全都是“条目列表 + 搜索框”的思路。你的核心创新恰恰在于把“传说如何分支”作为第一视觉语言。 ([en.wikipedia.org](https://en.wikipedia.org/wiki/ChronoZoom?utm_source=chatgpt.com))

---

**Sources:**

- [ChronoZoom](https://en.wikipedia.org/wiki/ChronoZoom?utm_source=chatgpt.com)

## Prompt:
2026/5/31 12:35:38

no

## Response:
2026/5/31 12:35:40

我懂你的意思。

你问的其实不是：

> 有哪些图谱工具？

而是：

> 有没有哪个产品，让我一

## Prompt:
2026/5/31 12:39:17

no，页面形式我脑子里非常清楚：
- 屏幕中间大部分空间是这个tree图
- 页面可以横滚纵滚，横向是时间，纵向每一行的最小单位是一个角色，多行构成的一个block是一个文化/国家，政权，有自己的背景色，并且会合并演进（行高不限定，取决于有多少角色以及怎么合并）或分叉（比如罗马帝国变成东西罗马，虽然我们先关注东亚
- 顶部有一个很低调的搜索/筛选功能，占一整行，可以隐藏
- 每个角色点击是一个pop up，不切换页面，保持沉静感，核心内容是简介+索引外链（毕竟我们都是外部收集的信息）
- 支持单一角色trace功能（把前后所有与他相关的单独显示其他都隐藏），这个功能可以以多个角色为对象

我在思考的是美术风格，是极简、apple liquid glass、nothing design，还是马拉松游戏的acid design

## Response:
2026/5/31 12:39:20

> **考虑设计风格偏好**
>
> 用户问到设计风格时，我可以直接用设计知识提供回答，而无需浏览网页，这里不涉及实时数据。可能可以提到一些较新的设计风格，如"Nothing Design"或"Marathon 酸性设计"，但这不必要。可以给出一些思路，讨论极简风格和液态玻璃的区分，避免将液态玻璃作为主设计，并介绍页面沉静感等设计元素。
>
> 已思考 9s

我会选一个主方向：

# **极简信息制图 + 轻微 Liquid Glass + 少量 Acid 标识色**

不要选纯 Apple Liquid Glass，也不要选纯 Nothing，也不要选纯 Marathon acid。

你的页面核心是一个**高密度、可长期阅读的历史谱系图**，所以第一优先级一定是：

> 清晰、沉静、可读、能看很久。

所以默认美术风格应该更像：

**博物馆数字档案 / 地铁线路图 / Git graph / 历史地图册**

而不是强视觉风格网站。

---

## 我对几个方向的判断

### 1. 极简风：最适合作为骨架

优点是不会抢信息层级。

你的主画面里已经有：

- 时间轴
- 文化 / 国家 / 政权区块
- 角色行
- 节点
- 传播线
- 合并 / 分叉
- trace 高亮
- popup 详情

如果再上很强的视觉语言，图会很快乱。

所以极简是底层答案。

但纯极简的问题是：**没记忆点**。会像数据工具，不像产品。

---

### 2. Apple Liquid Glass：适合做“浮层”，不适合做“主图”

Liquid Glass 很适合你的：

- 顶部搜索 / 筛选栏
- 点击角色后的 popup
- hover tooltip
- trace mode 控制条
- 右下角 legend / 图例

但不适合整个背景都 glass。

因为你的主图需要非常稳定的空间感。大量模糊、透明、折射会干扰线条和节点阅读。

所以我的建议是：

> 主图保持平面、冷静、清晰；浮层用轻微玻璃感。

例如 popup 像一块半透明博物馆展签：

```text
孙悟空 / Sun Wukong
明代 · 中国 · 文学角色

可能来源：
哈奴曼 / 无支祁

现代分支：
龙珠 / 黑神话 / 最游记
```

这会很高级。

---

### 3. Nothing Design：适合作为 UI 字体和控件语言

Nothing 的优点是：

- 科技感
- 点阵感
- 黑白红很强
- 适合“系统界面”

这和 **LegendBranch** 有一定契合。

尤其适合：

- logo
- loading
- 时间刻度
- 节点编号
- confidence 标签
- 筛选按钮
- trace mode 状态提示

但如果整站都 Nothing，会有个问题：

> 它会把项目带向“科幻设备界面”，而不是“文化谱系档案”。

你这个项目虽然是现代工具，但内容是传说、文学、民俗、ACG。太 Nothing 会显得有点冷。

所以 Nothing 可以借一点，但不要全盘采用。

---

### 4. Marathon / Acid Design：适合品牌，不适合默认阅读界面

Marathon 那种高饱和、酸性、反差强的风格很有记忆点。

但你的 tree 图本身已经需要颜色来表达：

- 文化 / 国家
- 政权区块
- 角色类型
- 关系类型
- 可信度
- trace 高亮

如果默认界面就很 acid，信息颜色会被品牌颜色污染。

所以我会把 Acid Design 用在：

- landing page
- 海报
- 分享图
- “trace 完成后的可视化截图”
- 特殊主题模式

而不是主编辑 / 主浏览页面。

---

# 我推荐的最终风格

## **Quiet Atlas / 沉静图谱风**

中文可以叫：

> **冷静档案风**  
> **数字图志风**  
> **静态博物馆风**  
> **传说地图册风**

核心感觉：

```text
不是古风。
不是科幻。
不是维基。
不是游戏 UI。

而是一个现代人用来观察古老传说如何演化的工具。
```

视觉上可以是：

```text
深色背景
低饱和文化色块
细线节点
柔和发光
轻微玻璃浮层
少量朱红 / 荧光绿 / 酸性黄作为 trace 高亮
```

---

## 默认配色可以这样

```css
--bg-main: #0D0F12;
--bg-panel: rgba(22, 25, 30, 0.72);
--bg-block-china: rgba(120, 63, 48, 0.18);
--bg-block-japan: rgba(70, 82, 110, 0.18);
--bg-block-india: rgba(125, 93, 47, 0.18);
--bg-block-korea: rgba(62, 98, 86, 0.18);

--text-main: #E8E2D6;
--text-muted: #9B948A;
--line-default: #4B505A;
--node-default: #D8D1C5;

--accent-trace: #DFFF3F;
--accent-warning: #FF7A45;
--accent-confirmed: #56D6B1;
--accent-speculative: #A58BFF;
```

这套里面：

- 平时很沉静；
- trace 的时候突然亮起来；
- 分享截图有视觉记忆点；
- 不会影响阅读。

---

## 节点设计

节点不要做成复杂卡片。

默认应该像 commit 点：

```text
● 孙悟空
```

或者：

```text
◎ 孙悟空
```

节点类型可以靠形状区分：

```text
● 古典神话 / 民俗
◆ 文学作品
■ 现代游戏 / 动漫
◇ 概念 / 母题
```

可信度不要用大色块，用边线样式：

```text
实线：confirmed
虚线：probable
点线：speculative
```

这会比颜色更清晰。

---

## 政权 / 文化 block

你这个“多行构成一个文化/国家/政权 block，会合并演进或分叉”的设定很关键。

我建议它们不要像表格背景，而要像历史地图的色块：

- 大面积低透明度背景色
- 左侧有竖排 / 横排文化名
- block 边缘可以有柔和边界
- 分裂时背景色分叉
- 合并时背景色融合

例如：

```text
中国文化圈     ┌───────────────────────
              │  ● 山海经九尾狐
              │        ╲
              │         ● 狐狸精
              └───────────────────────

日本文化圈              ┌──────────────
                        │   ● 玉藻前
                        │        ╲
                        │         ■ Fate 玉藻前
                        └──────────────
```

block 背景色一定要低调，否则会抢线条。

---

## Popup 风格

popup 是最适合做 Liquid Glass 的地方。

它应该像：

> 半透明档案卡 / 博物馆展签 / 研究笔记

不要全屏 modal，不切页面，这点你想得对。

结构可以固定：

```text
孙悟空
Sun Wukong

明代 · 中国 · 文学角色
首次明确文本：《西游记》

简介
……

来源
- 哈奴曼：probable
- 无支祁：speculative

外链
Wikipedia / 百度百科 / Wikidata / 相关论文 / 原典
```

popup 里面不要太花。它是“读资料”的，不是“看特效”的。

---

## Trace mode 是视觉高潮

默认界面要沉静，trace 时才变戏剧化。

比如用户 trace “九尾狐 + 孙悟空”：

- 其他节点降到 8% opacity
- 相关 block 保留 25% opacity
- 相关路径亮起
- trace 路径使用酸性黄 / 荧光绿
- 顶部出现低调状态条：

```text
TRACE MODE · 九尾狐 / 孙悟空
```

这时可以引入一点 Marathon acid 味。

也就是说：

> Acid 不做默认风格，做“分析模式的高亮语言”。

这会很酷。

---

# 最终结论

我不会选单一风格，而是这样定：

```text
主界面：极简信息制图
浮层：轻微 Apple Liquid Glass
控件：少量 Nothing 式系统感
Trace 高亮：少量 Acid Design
```

一句话：

> **LegendBranch 应该像一个安静的文化谱系仪器，只有在追踪传说分支时才发光。**

这个方向最适合你的页面结构，也最能同时容纳《山海经》《西游记》《Fate》《龙珠》《黑神话：悟空》这些完全不同时代的内容。

## Prompt:
2026/5/31 12:41:10

先来一个最简单，几乎没有美术，主要关注风格的最小化demo，trace“孙悟空”这个角色，怎么样（不急着 coding，给我确定一下p1的scope就好

## Response:
2026/5/31 12:41:17

> **定义P1范围和功能规划**
>
> 用户请求的是P1范围，应该围绕一个简洁但实用的理念。P1不涉及编程，可以考虑最简单的实现，比如展示孙悟空的追踪链。核心体验包括：用户打开应用、查看画布、点击节点可弹出简介和链接。数据涉及块，例如印度文化等。
>
> 已思考 13s

可以，这个 P1 我建议做成**“孙悟空 Trace 的垂直切片”**，不是完整产品。

目标只有一个：

> 打开 LegendBranch，用户能一眼看懂：孙悟空这个角色是如何从早期神话/民俗来源，演化到古典文学角色，再进入现代作品分支的。

---

# P1 Scope：最小化 Demo

## 1. 页面结构

只做一个页面。

```text
顶部：低调搜索 / 筛选 / Trace 状态栏
中间：大面积可滚动 Tree 图
右侧或居中：点击节点后的 popup
```

不做首页，不做登录，不做编辑器，不做数据库后台。

---

## 2. 核心交互

P1 只需要支持这几个动作：

### 进入页面后默认 Trace「孙悟空」

也就是说一打开就是：

```text
TRACE MODE · 孙悟空
```

用户不用搜索、不用配置。

---

### 可横向 / 纵向滚动

横向是时间。

纵向是文化 / 地区 / 政权 block。

---

### 点击节点弹出详情

popup 不切页面，只显示：

```text
节点名
英文名 / 原名
时代
文化区域
一句话简介
来源 / 影响关系
外链索引
```

---

### 支持取消 Trace

一个简单按钮：

```text
Clear Trace
```

取消后显示所有 P1 节点，但这些节点其实还是围绕孙悟空展开。

---

## 3. P1 数据范围

P1 不追求学术完整，追求结构成立。

可以先放 10～15 个节点。

### 印度文化圈

```text
哈奴曼 Hanuman
```

关系：

```text
哈奴曼 → 孙悟空
confidence: probable / debated
```

---

### 中国文化圈

```text
无支祁
猴行者 / 取经猴形象
孙悟空《西游记》
```

关系：

```text
无支祁 → 孙悟空
confidence: speculative / debated

猴行者 → 孙悟空
confidence: probable

孙悟空《西游记》 → 后世孙悟空形象
confidence: confirmed
```

---

### 日本现代传播

```text
龙珠 · 孙悟空
最游记 · 孙悟空
```

关系：

```text
西游记孙悟空 → 龙珠孙悟空
西游记孙悟空 → 最游记孙悟空
```

---

### 中国现代传播

```text
大话西游 · 至尊宝 / 孙悟空
黑神话：悟空
```

关系：

```text
西游记孙悟空 → 大话西游
西游记孙悟空 → 黑神话：悟空
```

---

### 现代泛文化分支

可以先只放 1～2 个占位：

```text
ACG 孙悟空母题
游戏化孙悟空
```

但我建议 P1 先别抽象太多，直接用具体作品更容易看懂。

---

## 4. 视觉 Scope

P1 几乎没有美术，只确定风格方向。

### 主界面

```text
深色背景
细线
小节点
低饱和文化 block 背景
轻微发光的 trace 路径
```

不要图标，不要插画，不要古风纹理。

---

### 节点

先用最简单的三种形状：

```text
● 神话 / 民俗来源
◆ 古典文学版本
■ 现代作品版本
```

---

### 线条

关系可信度用线型表达：

```text
实线：confirmed
虚线：probable
点线：speculative
```

这样比颜色更适合最小化 demo。

---

### Trace 状态

孙悟空 trace 路径高亮，其他节点淡出。

```text
相关节点：100% opacity
相关路径：亮色
无关节点：10% opacity
无关路径：5% opacity
```

P1 的视觉记忆点就靠这个。

---

## 5. P1 不做什么

这个很重要。

P1 不做：

```text
用户投稿
账号系统
复杂搜索
AI 自动补全
多角色 trace 编辑
数据库管理后台
图片素材
地图视图
完整亚洲神话分类
移动端适配
学术引用管理
```

外链可以先手填，引用只做 URL 列表，不做正式 citation 系统。

---

# P1 的验收标准

我觉得 P1 成功与否只看 5 件事：

1. 横轴时间、纵轴文化 block 的布局是否成立。
2. 用户是否能一眼看懂“孙悟空的传播/演化路径”。
3. Trace mode 是否有爽感。
4. popup 是否足够克制，不打断沉静感。
5. 这个页面截图是否能让人明白 LegendBranch 是什么。

---

# 我建议 P1 的一句话定义

> **一个以「孙悟空」为唯一样例的交互式传说谱系图，用来验证 LegendBranch 的核心阅读体验和视觉语言。**

也就是说，P1 不验证数据规模，不验证 AI，不验证社区，只验证一件事：

> 这个“横向时间 × 纵向文化 block × trace 角色谱系”的形式，好不好看、好不好懂、有没有继续做的欲望。



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)