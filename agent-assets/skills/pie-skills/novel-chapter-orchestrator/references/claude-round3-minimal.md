# Claude Round3 Minimal

本文件把《钢怪》V4 里已经验证过效果的 Claude round3 minimal 方案，整理成当前技能的默认 Loop C 路线。

## 来源

- `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/06_ab_tests/claude_style_pilot_round3_minimal/manifest.md`
- `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/06_ab_tests/claude_style_pilot_round3_minimal/evaluation/round3_notes.md`
- `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/06_ab_tests/claude_style_pilot_round3_minimal/prompts/ch01_prompt.md`
- `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/06_ab_tests/claude_style_pilot_round3_minimal/prompts/ch02_prompt.md`
- `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/06_ab_tests/claude_style_pilot_round3_minimal/prompts/ch03_prompt.md`

## 方案要点

- prompt 保持极简，只保留“中文小说家身份 + 外部样本 + 可删平段 + 可扩有戏段落”这条主线
- 不要先叠很多限制，不要先把 Claude 绑死
- 让 Claude 先敢删、敢压、敢改、敢扩
- 主控再根据结果抓副作用，尤其是：
  - 变啰嗦
  - 比喻无聊
  - 评语句太多
  - 乱加标题
  - 多出“机灵劲”或作者腔

## 参考文档

默认把这些文件直接交给 Claude：

1. 当前目标章节正文
2. `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/02_knowledge_base/03_style_reference_pack.md`
3. `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/Docs/References/庆余年-节选.md`
4. `/Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/Docs/References/谁说人类节节败退-节选.md`

如果是 gate pass 后的润色回合，正文输入应当是 gate 通过版，而不是更早的草稿版。

## 默认提示词骨架

```md
你现在是一个中文小说家。

请模仿余华和韩寒那种带幽默感、带人味、通俗、口语、偶尔有点损的叙述风格，来改写《钢怪》V4 的目标章节。

先读取这些文件：
1. 当前目标章节正文
2. /Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/steel-monster-v4/02_knowledge_base/03_style_reference_pack.md
3. /Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/Docs/References/庆余年-节选.md
4. /Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill/Docs/References/谁说人类节节败退-节选.md

要求只保留四条：
1. 把这一章写得更像中文小说，口语化，通俗，有幽默感，有人味。
2. 参考上面的外部样本，但不要照抄。
3. 原文里无聊、平、重复、只是交代信息的地方，可以删掉、压缩、重写。
4. 原文里有意思的对白、有意思的冲突、喜剧段落、尴尬段落，可以扩展、优化、写得更有戏。

补充要求：
- 可以大胆改写
- 可以整段重写
- 可以扩展有意思的冲突和对白
- 但不要靠重复同一层信息来凑字数
- 要让人物像活人在现场说话

输出要求：
- 只输出改写后的完整章节正文
- 不要解释
- 不要分析
- 不要分点
- 不要加代码块
```

## 主控的正确做法

主控不要在第一次就把 Claude 的手脚绑死。正确顺序是：

1. 先把极简 prompt 和参考文档交给 Claude
2. 读 Claude 输出
3. 只把实际副作用写成问题单回传，例如：
   - 第 4-6 段明显更啰嗦了，请压回去
   - “像什么什么一样”这类比喻太无聊，直接删掉，用动作或对白承接
   - 这个段尾是评语句，不是现场感，请改回人物现场反应
   - 删除新增章节标题
4. 继续让 Claude 改，不要由主控自己修句子

## 何时拒收 Claude 结果

如果 Claude 多轮后仍然出现这些问题，就可以拒收，保留 gate 通过版：

- 明显洗平
- 明显变油
- 比喻堆积
- 评语句过多
- 剧情节奏被拖慢
- 增加不必要标题或装饰物
