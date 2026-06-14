# 数据结构

技能用三份 JSON。`reader_state.json` 与 `run_plan.json` 在 `<小说目录>/04_editing/reader_map/` 下;每章分析在 `04_editing/reader_map/analysis/`。

**四层颗粒度**:全书 → 章 → 节拍(beat,叙事单位)→ 关键帧(keyframe,情绪单位)。叙事性的东西(`summary` / 认知 / 诊断)挂在 beat;情绪的曲线画在关键帧。

**情绪用双层模型**(详见 `emotion-model.md`):
- 第一层 · 情绪底色(5 维):悲伤 / 想笑 / 恐惧 / 高兴 / 愤怒
- 第二层 · 追读牵引力(2 维):悬念 / 好奇
- 关键帧的 `basis` 里 7 个键就是这两层平铺(JSON 不嵌套;"分两层"由文档与渲染分组实现)。

---

## 1. `run_plan.json` —— `prepare_run.py` 的输出

```jsonc
{
  "novel_dir": "/abs/path/steel-monster-v4",
  "manuscript_dir": ".../03_manuscript",
  "reader_map_dir": ".../04_editing/reader_map",
  "core_reader": {
    "label": "核心目标读者",
    "source_text": "<idea_seed.md 里『目标读者』段落原文>"
  },
  "all_chapters": [1, 2, "...", 20],
  "last_done": 7,
  "pending_chapters": [8, 9, "...", 20],
  "warnings": []
}
```

---

## 2. `reader_state.json` —— 滚动前进的"读者记忆"

```jsonc
{
  "novel": "steel-monster-v4",
  "last_chapter": 7,
  "updated_at": "2026-05-21T10:00:00",

  "shared": {
    "facts_known": [ { "id": "f001", "since": 1, "fact": "……" } ],
    "dramatic_irony": [
      { "id": "di01", "since": 2, "reader_knows": "……",
        "in_dark": ["角色A"], "status": "active" } ],
    "open_questions": [
      { "id": "q01", "since": 3, "q": "……",
        "type": "悬念", "status": "open", "resolved_at": null } ]
  },

  "readers": {
    "core": {
      "engagement": 78,
      "emotion_now": {                       // 读者翻开"下一章"那一刻的情绪基线 —— 连续性的"接力棒"
        "basis": { "悲伤":15,"想笑":40,"恐惧":20,"高兴":25,"愤怒":20,
                   "悬念":50,"好奇":35 },     // 7 维 = 上一章最后一个关键帧
        "drivers": [                          // 仍烧着的维度 + 靠什么吊着(连续性的核心)
          { "dim":"悬念","level":50,"why":"钢怪未脱身,『能不能逃掉』悬着" } ],
        "carry_note": "读者带着 X 走进下一章;什么会引爆 / 兑现 / 缓解它",
        "label": "替主角揪心"
      },
      "recent_arc": "近 3–5 章情绪走势摘要 —— 用于判断轨迹型复合情绪(如解气需接低谷)",
      "dispositions": { "角色名": { "score": 35, "why": "……" } },
      "fatigue": []
    }
  }
}
```

`emotion_now` 是连续性的"接力棒":`basis` 是上一章末尾的 7 维分,`drivers` + `carry_note` 说清"读者带着什么、为什么"。下一章子 Agent 的第一个关键帧必须锚定它。`basis` 7 维:悲伤 / 想笑 / 恐惧 / 高兴 / 愤怒 / 悬念 / 好奇。

---

## 3. `chNNNN.analysis.json` —— 某一章的体验记录

子 Agent 读完一章后写出,文件名如 `ch0007.analysis.json`。

```jsonc
{
  "chapter": 7,
  "title": "封锁边缘",
  "beats": [
    {
      "id": "ch7-b1",
      "summary": "一句话说这一拍(叙事单位)干了啥",
      "cognition": {                              // beat 级:认知层
        "new_info": ["本拍读者获得的新信息"],
        "info_gap": { "opens": ["新开的信息差"], "closes": ["合上的信息差"] },
        "dramatic_irony_touch": "对戏剧反讽的影响;无则写「无变化」"
      },
      "arc": [                                    // 情绪关键帧序列(≥1;转折越多帧越多)
        {
          "at": "承前:带着上章悬念走进来",          // 本章第一帧 = 锚定 emotion_now
          "emotion": { "core": {
            "basis": { "悲伤":12,"想笑":5,"恐惧":20,"高兴":5,"愤怒":5,
                       "悬念":55,"好奇":40 },
            "named": []
          } },
          "why": "第一帧锚定 emotion_now —— 引:『……』"
        },
        {
          "at": "黄灯骤亮、钢怪苏醒",
          "emotion": { "core": {
            "basis": { "悲伤":10,"想笑":0,"恐惧":92,"高兴":0,"愤怒":5,
                       "悬念":70,"好奇":30 },
            "named": [ { "name":"毛骨悚然","why":"死物突然有了生命迹象 —— 引:『……』" } ]
          } },
          "why": "威胁从『可能』变成『眼前』,恐惧瞬间拉满 —— 引:『……』"
        }
      ],
      "flags": [                                  // beat 级:诊断,无则空数组
        { "type":"走平","hit":["core"],"why":"……(引正文)","fix":"修改方向" }
      ]
    }
  ],
  "chapter_rollup": {
    "shape": "本章情绪形状,如『先紧后炸』",
    "end_hook": { "level": "强|中|弱", "what": "章末钩子是什么" },
    "verdict": "一句话总评"
  },
  "state_update": {
    "add_facts": ["新增的剧情事实"],
    "add_questions": [ { "q": "……", "type": "悬念|好奇|伏笔" } ],
    "resolve_questions": ["q03"],
    "disposition_shifts": { "core": { "角色名": { "delta": 5, "note": "原因" } } },
    "recent_arc": "更新后的近况弧线摘要",
    "emotion_carry": {                            // 交给下一章子 Agent 的"情绪接力棒"
      "drivers": [
        { "dim": "恐惧", "level": 85, "why": "这一维靠什么吊着 —— 引:『……』" } ],
      "carry_note": "一句话:读者带着什么走进下一章,什么会引爆/兑现/缓解它"
    }
  },
  "state_health": "ok"
}
```

### 关键帧(keyframe)说明

- 一个 beat 的 `arc` 至少 1 个关键帧;情绪在 beat 内转折越多,关键帧越多(平稳 1–2 个,剧烈起伏 4–5 个)。
- 关键帧标在**情绪真正转折的瞬间**(开始上升、到顶/到谷、陡然反转),**不是均匀切片**。
- 每章 `arc` 的**第一个关键帧 = 锚定 `emotion_now` 的承接帧**(第 1 章除外)——这是连续性的落点。
- 把全书所有 beat 的所有关键帧首尾相接,就是那条可缩放的"读者体验图谱"曲线;它在章与章之间是**连续**的。

## 量纲约定

- `basis` 7 维(5 情绪底色 + 2 追读牵引力)、`engagement`、`emotion_carry.drivers[].level`:0–100。
- `disposition.score`:−100 ~ +100。

## 校验要点(`validate_analysis.py`)

- `chapter` 与文件名章号一致;`beats` 非空。
- 每个 beat 有 `summary` / `cognition` / `arc` / `flags`;`arc` 是非空数组。
- 每个关键帧有 `at` / `emotion.core.basis`(7 维齐全、0–100)/ `why`(非空)。
- 每个 `named` 项、每个 `flags` 项都有非空 `why` / `fix`。
- `chapter_rollup`、`state_update`、`state_health`(ok|warn)存在。
- `state_update.emotion_carry` 存在:`carry_note` 非空字符串;`drivers` 是数组,每项有 `dim` / `level` / `why`。
