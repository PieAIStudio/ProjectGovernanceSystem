#!/usr/bin/env python3
"""读者体验图谱 · ③ 渲染(关键帧 · 双层 · 可缩放交互版)。

用法:  python render_report.py <小说目录>

汇总 04_editing/reader_map/analysis/ 下所有 chNNNN.analysis.json,生成可交互的
report.html:双层情绪曲线(情绪底色 5 维 + 追读牵引力 2 维)画到**关键帧**级,
章与章之间连续;可在「全本」与「单章」之间缩放;点章节钻取每个节拍、每个关键帧。
P1 阶段:仅核心读者。
"""
import sys
import os
import json
import glob
from datetime import datetime


def load_chapters(analysis_dir):
    out = []
    for p in sorted(glob.glob(os.path.join(analysis_dir, "ch*.analysis.json"))):
        try:
            with open(p, encoding="utf-8") as f:
                out.append(json.load(f))
        except Exception as e:
            print(f"  ⚠ 跳过 {os.path.basename(p)}: {e}", file=sys.stderr)
    out.sort(key=lambda c: c.get("chapter", 0))
    return out


HTML = r"""<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">
<title>读者体验图谱 · __NOVEL__</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#14161c;color:#e8e8ec;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;padding:22px;line-height:1.6}
.wrap{max-width:860px;margin:0 auto}
h1{font-size:19px} h1 span{color:#9aa0ad;font-weight:400;font-size:13px}
.note{color:#7f8593;font-size:11.5px;margin:3px 0 14px}
.card{background:#1e212b;border:1px solid #2e323f;border-radius:10px;padding:15px 16px;margin-bottom:13px}
.legend{display:flex;gap:8px 20px;flex-wrap:wrap;font-size:12px;margin-bottom:9px}
.lgroup{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.lglabel{font-style:normal;font-size:11px;color:#7f8593;margin-right:1px}
.legend span.chip{cursor:pointer;user-select:none;padding:2px 7px;border-radius:5px;transition:opacity .12s,background .12s}
.legend span.chip:hover{background:#272b36}
.legend span.chip.off{opacity:.3}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.ctitle{font-size:11.5px;color:#aab0bd;font-weight:600;margin:9px 0 1px}
.ctitle:first-of-type{margin-top:2px}
.ctitle em{font-style:normal;color:#7f8593;font-weight:400}
svg{display:block;width:100%;height:auto}
.hint{color:#7f8593;font-size:11px;text-align:center;margin-top:7px}
.scope{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}
.sc{padding:4px 11px;border-radius:6px;background:#1e212b;border:1px solid #2e323f;font-size:12px;color:#c4c8d2;cursor:pointer}
.sc.on{background:#2d4a6b;border-color:#3a6ea5;color:#fff}
.sc.all{font-weight:600}
#detail h2{font-size:16px;margin-bottom:4px}
.vd{font-size:13px;color:#d4d7df;margin:6px 0}
.meta{font-size:11.5px;color:#8a8f9c;margin-bottom:12px}
.crow{background:#171a22;border:1px solid #2a2e3a;border-radius:7px;padding:9px 12px;margin-bottom:7px;cursor:pointer;font-size:12.5px}
.crow:hover{border-color:#3a6ea5}
.crow .warn{color:#ef7676}
.beat{background:#171a22;border:1px solid #2a2e3a;border-radius:8px;padding:11px 13px;margin-bottom:10px}
.beat h3{font-size:13px;font-weight:600;margin-bottom:9px}
.kf{border-left:2px solid #2e3340;padding:5px 0 7px 12px;margin:11px 0;display:flex;gap:14px;align-items:flex-start}
.fp{display:flex;gap:3px;flex:0 0 auto}
.fp .col{display:flex;flex-direction:column;align-items:center;width:16px}
.fpgap{width:9px;flex:0 0 auto}
.fpv{font-size:8.5px;line-height:10px;height:10px;color:#9aa0ad}
.fpt{width:10px;height:40px;background:#262a35;border-radius:2px;display:flex;flex-direction:column-reverse;overflow:hidden;margin:1px 0}
.fpf{width:100%;border-radius:2px;opacity:.92}
.fpl{font-size:9px;color:#7f8593;margin-top:2px}
.kfbody{flex:1;min-width:0}
.kfat{font-size:12px;color:#cdd2dd;font-weight:600;margin-bottom:3px}
.nm{font-size:11.5px;color:#c9b890;margin:3px 0} .nm b{color:#ecc94b;margin-right:4px}
.kfwhy{font-size:11.5px;color:#9aa6b2;margin-top:3px}
.cog{font-size:11.5px;color:#9aa6b2;margin:7px 0 0} .cog b{color:#6fa8b8}
.cog b.igo{color:#d6a86a} .cog b.igc{color:#7fb89a}
.irony{font-size:11.5px;color:#bfa6cf;margin:6px 0 0;border-left:2px solid #6b4d8a;padding-left:9px}
.irony b{color:#c79ad8;margin-right:4px}
.flag{background:#2a1c1c;border:1px solid #5a2d2d;border-radius:6px;padding:7px 9px;margin-top:7px;font-size:11.5px}
.flag b{color:#ef8a8a} .fix{color:#7fd49b;margin-top:2px}
</style></head><body><div class="wrap">
<h1>读者体验图谱 <span>/ __NOVEL__ · 第 __RANGE__ 章</span></h1>
<p class="note">P1 · 仅核心读者 · 生成于 __TS__ · 双层情绪 × 关键帧级曲线 · 章与章之间连续 —— 点下方按钮在全本/单章间缩放</p>
<div class="card">
<div class="legend" id="legend"></div>
<div class="scope" id="scope"></div>
<div class="ctitle">情绪底色 <em>—— 读者「感觉如何」</em></div>
<svg id="chartFelt" viewBox="0 0 760 232" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="ctitle">追读牵引力 <em>—— 什么让读者「想翻下一页」</em></div>
<svg id="chartPull" viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="hint">点上方图例 → 单独聚焦一条线　·　横轴 = 关键帧(情绪转折点)，章与章连续　·　纵轴 = 强度 0–100　·　虚线 = 章/节拍分界</div>
</div>
<div class="card" id="detail"></div>
</div>
<script>
const DATA = __DATA__;
const FELT = ["悲伤","想笑","恐惧","高兴","愤怒"];          // 第一层 · 情绪底色
const PULL = ["悬念","好奇"];                              // 第二层 · 追读牵引力
const BASIS = FELT.concat(PULL);
const COLOR = {"悲伤":"#4f86c6","想笑":"#ecc94b","恐惧":"#36c2c2","高兴":"#48bb78","愤怒":"#e05a5a","悬念":"#a06cd5","好奇":"#e069a8"};
const DABBR = {"悲伤":"悲","想笑":"笑","恐惧":"恐","高兴":"喜","愤怒":"怒","悬念":"悬","好奇":"奇"};
const esc = s => String(s==null?"":s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
let scope = "all";
let soloDim = null;                                  // 被单独聚焦的维度;null=全部显示

// 单调三次插值(Fritsch-Carlson):把关键帧连成平滑曲线,且绝不过冲——
// 不会凭空造出数据里没有的情绪起伏,符合「可信度」铁律。
function smoothPath(pts){
  const n=pts.length;
  if(n===0) return "";
  if(n===1) return `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  if(n===2) return `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)},${pts[1][1].toFixed(1)}`;
  const dx=[],sl=[],t=[];
  for(let i=0;i<n-1;i++){ dx[i]=pts[i+1][0]-pts[i][0]; sl[i]=(pts[i+1][1]-pts[i][1])/dx[i]; }
  t[0]=sl[0]; t[n-1]=sl[n-2];
  for(let i=1;i<n-1;i++) t[i]=(sl[i-1]*sl[i]<=0)?0:(sl[i-1]+sl[i])/2;
  for(let i=0;i<n-1;i++){
    if(sl[i]===0){ t[i]=0; t[i+1]=0; continue; }
    const a=t[i]/sl[i], b=t[i+1]/sl[i], s2=a*a+b*b;
    if(s2>9){ const tau=3/Math.sqrt(s2); t[i]=tau*a*sl[i]; t[i+1]=tau*b*sl[i]; }
  }
  let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for(let i=0;i<n-1;i++){
    const c1x=pts[i][0]+dx[i]/3, c1y=pts[i][1]+t[i]*dx[i]/3;
    const c2x=pts[i+1][0]-dx[i]/3, c2y=pts[i+1][1]-t[i+1]*dx[i]/3;
    d+=`C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${pts[i+1][0].toFixed(1)},${pts[i+1][1].toFixed(1)}`;
  }
  return d;
}

function collect(sc){
  const pts=[];
  const idx = sc==="all" ? DATA.map((_,i)=>i) : [sc];
  idx.forEach(ci=>{
    const ch=DATA[ci]||{};
    (ch.beats||[]).forEach((b,bi)=>{
      (b.arc||[]).forEach(kf=>{
        pts.push({basis:(((kf.emotion||{}).core||{}).basis)||{}, ci, bi,
                  chapter:ch.chapter, at:kf.at||""});
      });
    });
  });
  return pts;
}

function chip(d){
  return `<span class="chip ${soloDim&&soloDim!==d?'off':''}" onclick="toggleDim('${d}')"`
    +`><i style="background:${COLOR[d]}"></i>${d}</span>`;
}
function drawLegend(){
  document.getElementById("legend").innerHTML =
    `<div class="lgroup"><em class="lglabel">情绪底色</em>`+FELT.map(chip).join("")+`</div>`
    +`<div class="lgroup"><em class="lglabel">追读牵引力</em>`+PULL.map(chip).join("")+`</div>`;
}
function toggleDim(d){ soloDim=(soloDim===d)?null:d; drawLegend(); drawChart(); }
function drawScope(){
  let h=`<span class="sc all ${scope==='all'?'on':''}" onclick="setScope('all')">全本汇总</span>`;
  DATA.forEach((ch,ci)=>{
    h+=`<span class="sc ${scope===ci?'on':''}" onclick="setScope(${ci})">第${ch.chapter}章</span>`;
  });
  document.getElementById("scope").innerHTML=h;
}

// 一层的可见维度:聚焦了本层某维 → 只画它;聚焦了别层 → 本层照常全画。
function chartDims(layer){
  return (soloDim && layer.indexOf(soloDim)>=0) ? [soloDim] : layer;
}

function drawChartInto(svgId, layer, H){
  const svg=document.getElementById(svgId);
  const pts=collect(scope), n=pts.length;
  const X0=56,X1=742,Y0=20,Y1=H-30;
  const px=i=>n<=1?(X0+X1)/2:X0+(X1-X0)*i/(n-1);
  const py=v=>Y1-(Y1-Y0)*Math.max(0,Math.min(100,v))/100;
  let s="";
  for(const v of [0,50,100]){
    s+=`<line x1="${X0}" y1="${py(v).toFixed(0)}" x2="${X1}" y2="${py(v).toFixed(0)}" stroke="#2b2f3b"/>`;
    s+=`<text x="${X0-6}" y="${(py(v)+3).toFixed(0)}" fill="#6b7080" font-size="9" text-anchor="end">${v}</text>`;
  }
  if(!n){ svg.innerHTML=s+
    `<text x="400" y="${(H/2).toFixed(0)}" fill="#7f8593" font-size="12" text-anchor="middle">(无关键帧数据)</text>`;
    return; }
  // 分界虚线:全本=章界,单章=节拍界
  let prev=null;
  pts.forEach((p,i)=>{
    const key = scope==="all" ? p.ci : p.bi;
    if(prev!==null && key!==prev){
      const x=((px(i)+px(i-1))/2).toFixed(1);
      s+=`<line x1="${x}" y1="${Y0}" x2="${x}" y2="${Y1}" stroke="#3a3f4d" stroke-dasharray="3 3"/>`;
    }
    prev=key;
  });
  // 平滑曲线(只画本层当前可见的维度)
  const dims=chartDims(layer);
  for(const d of dims){
    const xy=pts.map((p,i)=>[px(i),py(p.basis[d]||0)]);
    const w=(soloDim===d)?3:2.2;
    s+=`<path fill="none" stroke="${COLOR[d]}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" d="${smoothPath(xy)}"/>`;
  }
  // 关键帧点:单章视图或聚焦单条时才画(全本全画太碎)
  if(scope!=="all" || soloDim){
    pts.forEach((p,i)=>dims.forEach(d=>{
      s+=`<circle cx="${px(i).toFixed(1)}" cy="${py(p.basis[d]||0).toFixed(1)}" r="2" fill="${COLOR[d]}"/>`;
    }));
  }
  // x 轴标签
  const groups={};
  pts.forEach((p,i)=>{
    const key = scope==="all" ? "C"+p.ci : "B"+p.bi;
    (groups[key]=groups[key]||[]).push(i);
  });
  Object.entries(groups).forEach(([key,ids])=>{
    const mid=px((ids[0]+ids[ids.length-1])/2);
    const label = key[0]==="C" ? "第"+DATA[+key.slice(1)].chapter+"章"
                               : "节拍"+(+key.slice(1)+1);
    s+=`<text x="${mid.toFixed(1)}" y="${Y1+16}" fill="#7f8593" font-size="9" text-anchor="middle">${label}</text>`;
  });
  svg.innerHTML=s;
}
function drawChart(){
  drawChartInto("chartFelt", FELT, 232);
  drawChartInto("chartPull", PULL, 170);
}

function fingerprint(basis){
  let h=`<div class="fp">`;
  BASIS.forEach(d=>{
    if(d==="悬念") h+=`<div class="fpgap"></div>`;          // 情绪底色 5 | 追读牵引力 2 之间留缝
    const v=Math.max(0,Math.min(100,Math.round(basis[d]||0)));
    h+=`<div class="col"><div class="fpv">${v||""}</div>`
      +`<div class="fpt"><div class="fpf" style="height:${v}%;background:${COLOR[d]}"></div></div>`
      +`<div class="fpl">${DABBR[d]}</div></div>`;
  });
  return h+`</div>`;
}
function drawDetail(){
  const el=document.getElementById("detail");
  if(scope==="all"){
    let h=`<h2>全本 · 逐章总评</h2><p class="meta">点任意一章,进入单章视图看它内部的情绪曲折</p>`;
    DATA.forEach((ch,ci)=>{
      const r=ch.chapter_rollup||{};
      const fl=(ch.beats||[]).some(b=>(b.flags||[]).length);
      h+=`<div class="crow" onclick="setScope(${ci})"><b>第${ch.chapter}章 · ${esc(ch.title)}</b>`
       +`${fl?' <span class="warn">⚠ 有诊断</span>':''}<br><span class="vd">${esc(r.verdict)}</span></div>`;
    });
    el.innerHTML=h; return;
  }
  const ch=DATA[scope]||{}, r=ch.chapter_rollup||{}, hk=r.end_hook||{};
  let h=`<h2>第 ${ch.chapter} 章 · ${esc(ch.title)}</h2>`;
  h+=`<p class="vd">${esc(r.verdict)}</p>`;
  h+=`<p class="meta">情绪形状:${esc(r.shape)}　|　章末钩子(${esc(hk.level)}):${esc(hk.what)}</p>`;
  (ch.beats||[]).forEach((b,bi)=>{
    h+=`<div class="beat"><h3>节拍 ${bi+1} · ${esc(b.summary)}</h3>`;
    (b.arc||[]).forEach(kf=>{
      const core=((kf.emotion||{}).core)||{}, basis=core.basis||{};
      h+=`<div class="kf">`+fingerprint(basis)+`<div class="kfbody">`;
      h+=`<div class="kfat">▸ ${esc(kf.at)}</div>`;
      (core.named||[]).forEach(nm=>{
        h+=`<div class="nm"><b>${esc(nm.name)}</b>${esc(nm.why)}</div>`;
      });
      h+=`<div class="kfwhy">${esc(kf.why)}</div></div></div>`;
    });
    const cog=b.cognition||{};
    if((cog.new_info||[]).length)
      h+=`<p class="cog"><b>新信息</b> ${esc(cog.new_info.join("；"))}</p>`;
    const ig=cog.info_gap||{};
    const opens=(ig.opens||[]).filter(Boolean), closes=(ig.closes||[]).filter(Boolean);
    if(opens.length)
      h+=`<p class="cog"><b class="igo">▲ 新埋悬念</b> ${esc(opens.join("；"))}</p>`;
    if(closes.length)
      h+=`<p class="cog"><b class="igc">▼ 解开悬念</b> ${esc(closes.join("；"))}</p>`;
    const di=(cog.dramatic_irony_touch||"").trim();
    if(di && di!=="无变化" && di!=="无" && di!=="—" && di!=="-")
      h+=`<p class="irony"><b>⚖ 戏剧反讽</b> ${esc(di)}</p>`;
    (b.flags||[]).forEach(f=>{
      h+=`<div class="flag"><b>⚠ ${esc(f.type)}</b> ${esc(f.why)}<div class="fix">改:${esc(f.fix)}</div></div>`;
    });
    h+=`</div>`;
  });
  el.innerHTML=h;
}
function setScope(s){ scope=s; drawScope(); drawChart(); drawDetail();
  window.scrollTo({top:0,behavior:"smooth"}); }

drawLegend(); drawScope(); drawChart(); drawDetail();
</script></body></html>"""


def main():
    if len(sys.argv) != 2:
        print("用法: python render_report.py <小说目录>", file=sys.stderr)
        sys.exit(2)
    novel_dir = os.path.abspath(sys.argv[1])
    reader_map = os.path.join(novel_dir, "04_editing", "reader_map")
    chapters = load_chapters(os.path.join(reader_map, "analysis"))
    out_path = os.path.join(reader_map, "report.html")

    if not chapters:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("<!DOCTYPE html><meta charset=utf-8>"
                    "<body style='font-family:sans-serif;padding:40px'>"
                    "<h2>还没有任何章节分析结果</h2></body>")
        print(f"(无分析结果)占位报告: {out_path}")
        return

    data_json = json.dumps(chapters, ensure_ascii=False).replace("</", "<\\/")
    rng = f"{chapters[0].get('chapter', '?')}–{chapters[-1].get('chapter', '?')}"
    page = (HTML.replace("__DATA__", data_json)
                .replace("__NOVEL__", os.path.basename(novel_dir))
                .replace("__RANGE__", rng)
                .replace("__TS__", datetime.now().strftime("%Y-%m-%d %H:%M")))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"交互报告已生成: {out_path}  ({len(chapters)} 章)")


if __name__ == "__main__":
    main()
