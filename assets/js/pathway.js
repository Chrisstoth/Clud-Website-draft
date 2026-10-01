/* ================= SQUAD PATHWAY MAP =================
   The "slanted approach" on the Coaches & Squads page: a map you drag around (pinch or the
   +/- buttons to zoom), with age along the bottom and performance expectation up the side.
   Bronze, Silver and Gold are slanted ribbons -- the higher the branch, the steeper it climbs --
   and tapping a squad opens who it's for, its coaches and its training hours.
   Who-it's-for text lives here in PATHWAY; the sessions, lead coach and coaches come live from
   Squad Timetables and the coaching team, matched by squad name, so hours can never go stale.
   A squad here with no timetable of its own yet can borrow one through `alias`. */

/* World size in map pixels; X() places an age along the bottom axis. */
const PW_W=1520,PW_H=860;
const PW_X=age=>110+(age-5)*92;

/* Each branch is a ribbon from one [age, y] point to another; squads sit on it at their `at` age. */
const PW_BRANCHES={
  academy:{label:"Academy",color:"#4f9bd9",from:[5.1,745],to:[11.4,718]},
  jp:{label:"Junior Pathway",color:"#f5841f"},
  bronze:{label:"Bronze · Club Swim",color:"#b8733a",from:[12.3,650],to:[19.4,592]},
  silver:{label:"Silver pathway",color:"#8f99a6",from:[11.8,478],to:[19.4,372]},
  gold:{label:"Gold pathway",color:"#d9a521",from:[9.4,318],to:[19.4,118]},
  masters:{label:"Masters",color:"#24756b",from:[14.4,768],to:[19.6,768]}
};

const PATHWAY=[
  {name:"Green Hats",branch:"academy",at:5.9,fill:"#23803f",light:true,ages:[5,12],ageLabel:"Up to 12",
    level:"Academy · first hat group",
    blurb:"The first Academy hat group, for swimmers coming out of lessons. Swimmers work up through Green, Yellow, Blue and Red hats."},
  {name:"Yellow Hats",branch:"academy",at:7.4,fill:"#f2c230",ages:[5,12],ageLabel:"Up to 12",
    level:"Academy · second hat group",
    blurb:"The second Academy hat group, building on the skills from Green Hats."},
  {name:"Blue Hats",branch:"academy",at:8.9,fill:"#2f6fd6",light:true,ages:[5,12],ageLabel:"Up to 12",
    level:"Academy · third hat group",
    blurb:"The third Academy hat group, getting swimmers ready for Red Hats."},
  {name:"Red Hats",branch:"academy",at:10.4,fill:"#d23a3a",light:true,ages:[5,12],ageLabel:"Up to 12",
    level:"Academy · final hat group",
    blurb:"The final Academy hat group, before Junior Pathway. There's no age limit in the Academy other than 12: swimmers who haven't moved on by then join the Bronze pathway."},
  {name:"Junior Pathway",branch:"jp",x:10.9,y:560,ages:[8,12],ageLabel:"Aim to move on by 12",competitive:true,
    level:"The \"sorting hat\"",
    blurb:"Junior Pathway works out where each swimmer fits best — Bronze, Silver or Gold — and we aim for swimmers to have moved on by 12. A highly competitive squad with minimum attendance."},
  {name:"Bronze 2",branch:"bronze",at:13.6,alias:"Bronze",ages:[11,15],ageLabel:"Younger swimmers",
    level:"Club Swim",
    blurb:"The Club Swim programme for younger swimmers: fitness, working towards county times, late bloomers and swimmers who are here for the social side as much as the racing."},
  {name:"Bronze 1",branch:"bronze",at:16.6,alias:"Bronze",ages:[14,19],ageLabel:"Older swimmers",
    level:"Club Swim",
    blurb:"The Club Swim programme for older swimmers: fitness, gaining county times, late bloomers and more social swimmers."},
  {name:"Silver 3",branch:"silver",at:13,ages:[12,14],ageLabel:"12–14",competitive:true,
    level:"Working towards county times",
    blurb:"Generally for younger swimmers working towards county times, broadening their swimming skills and improving fitness and speed."},
  {name:"Silver 2",branch:"silver",at:15,ages:[13,16],ageLabel:"13–16",competitive:true,
    level:"County times, or very close",
    blurb:"Generally for swimmers with county times, or very close to them."},
  {name:"Silver 1",branch:"silver",at:17.4,ages:[15,19],ageLabel:"15+",competitive:true,
    level:"County & regional · some national qualifiers",
    blurb:"For county and regional level swimmers, some with national qualifying times."},
  {name:"Gold 3",branch:"gold",at:11.8,ages:[10,14],ageLabel:"10–14",competitive:true,
    level:"County & regional · national potential",
    blurb:"For swimmers with county and regional qualifying times, and national potential."},
  {name:"Gold 2",branch:"gold",at:14.4,ages:[12,16],ageLabel:"12–16",competitive:true,
    level:"Regional & national qualifiers",
    blurb:"For swimmers with regional and national qualifying times."},
  {name:"Gold 1",branch:"gold",at:17.2,ages:[14,19],ageLabel:"14+",competitive:true,
    level:"Regional finals · national qualifying",
    blurb:"For swimmers aiming for regional finals and national qualification."},
  {name:"Junior Masters",branch:"masters",at:15.6,ageLabel:"Younger swimmers",
    level:"Masters offering",
    blurb:"Our Masters offering for younger swimmers. Get in touch to find out more."},
  {name:"Masters",branch:"masters",at:18.4,ageLabel:"Adults",
    level:"Fitness or competitive",
    blurb:"For adult swimmers — whether you're swimming for fitness or to compete."}
];

/* Real routes swimmers have taken -- proof there's no set path, in either direction. */
const PW_JOURNEYS=[
  {label:"The late bloomer",route:["Bronze 1","Silver 2","Silver 1","Gold 1"]},
  {label:"Up, and across",route:["Junior Pathway","Silver 2","Gold 2","Silver 1"]}
];

/* Where a squad's card sits on the map. */
function pwPos(p){
  if(p.x!=null)return {x:PW_X(p.x),y:p.y};
  const b=PW_BRANCHES[p.branch],[a1,y1]=b.from,[a2,y2]=b.to;
  return {x:PW_X(p.at),y:y1+(p.at-a1)/(a2-a1)*(y2-y1)};
}
const pwSlug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,"-");
const pwSquad=p=>DB.squads.find(s=>s.name===p.name)||(p.alias?DB.squads.find(s=>s.name===p.alias):null);
/* Coaches tag squads by name, with an optional "(assistant)" after it. */
function pwCoaches(p){
  const names=[p.name,p.alias].filter(Boolean);
  return DB.coaches.flatMap(c=>(c.squads||[]).map(tag=>{
    const base=tag.replace(/\s*\(.*\)\s*$/,"").trim();
    return names.includes(base)?{name:c.name,assistant:/assistant/i.test(tag)}:null;
  }).filter(Boolean)).sort((a,b)=>a.assistant-b.assistant);
}
const pwMins=t=>{const [h,m]=t.split(":").map(Number);return h*60+m;};
const pwHrs=m=>{const h=Math.round(m/60*4)/4;return `${h} hr${h===1?"":"s"}`;};

/* ---------- drawing ---------- */
function pwSvg(){
  const ticks=[];
  for(let a=6;a<=18;a++)ticks.push(`<line class="pw-grid" x1="${PW_X(a)}" y1="80" x2="${PW_X(a)}" y2="800"/>
    <text class="pw-tick" x="${PW_X(a)}" y="826">${a===18?"18+":a}</text>`);
  const bands=Object.entries(PW_BRANCHES).filter(([,b])=>b.from).map(([k,b])=>{
    const [x1,y1]=[PW_X(b.from[0]),b.from[1]],[x2,y2]=[PW_X(b.to[0]),b.to[1]],h=46;
    const ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
    return `<polygon class="pw-band" style="--c:${b.color}" points="${x1},${y1-h} ${x2},${y2-h} ${x2},${y2+h} ${x1},${y1+h}"/>
      <text class="pw-band-label" style="--c:${b.color}" transform="translate(${x1+10},${y1-h-10}) rotate(${ang})">${esc(b.label)}</text>`;
  }).join("");
  /* The structural flows: through the hats, into Junior Pathway, and out to every branch. */
  const at=n=>pwPos(PATHWAY.find(p=>p.name===n));
  const flow=(a,b,cls="")=>{const p=at(a),q=at(b);return `<line class="pw-flow ${cls}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;};
  const flows=flow("Green Hats","Red Hats","solid")+flow("Red Hats","Junior Pathway")
    +flow("Junior Pathway","Gold 3")+flow("Junior Pathway","Silver 3")+flow("Junior Pathway","Bronze 2")+flow("Red Hats","Bronze 2","faint");
  return `<svg class="pw-svg" viewBox="0 0 ${PW_W} ${PW_H}" width="${PW_W}" height="${PW_H}" aria-hidden="true">
    <defs><marker id="pwArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pw-arrowhead"/></marker></defs>
    ${ticks.join("")}
    <line class="pw-axis" x1="70" y1="800" x2="${PW_W-40}" y2="800" marker-end="url(#pwArrow)"/>
    <line class="pw-axis" x1="70" y1="800" x2="70" y2="70" marker-end="url(#pwArrow)"/>
    <text class="pw-axis-label" x="${PW_W-44}" y="852" text-anchor="end">Age</text>
    <text class="pw-axis-label" transform="translate(48,800) rotate(-90)">Performance expectation</text>
    <rect class="pw-age-range" id="pwAgeRange" x="0" y="794" width="0" height="12" rx="6"/>
    ${bands}${flows}
    <path class="pw-journey" id="pwJourney" d=""/>
    <circle class="pw-journey-dot" id="pwJourneyDot" r="9" cx="-50" cy="-50"/>
  </svg>`;
}
function pwNodeHtml(p){
  const {x,y}=pwPos(p),b=PW_BRANCHES[p.branch];
  return `<button type="button" class="pw-node${p.light?" light":""}${p.branch==="jp"?" hub":p.branch==="academy"?" hat":""}" data-pw="${pwSlug(p.name)}"
    style="left:${x}px;top:${y}px;--c:${p.fill||b.color}">
    <strong>${esc(p.name)}</strong><span>${esc(p.ageLabel)}</span></button>`;
}

/* ---------- details panel ---------- */
function pwDetailHtml(p){
  const b=PW_BRANCHES[p.branch],sq=pwSquad(p),coaches=pwCoaches(p);
  const sessions=sq?sq.sessions||[]:[];
  const pool=sessions.filter(s=>s.type!=="land"),land=sessions.filter(s=>s.type==="land");
  const mins=l=>l.reduce((t,s)=>t+pwMins(s.end)-pwMins(s.start),0);
  const days=new Set(sessions.map(s=>s.day)).size;
  const training=sessions.length
    ?`<div class="pw-hours"><strong>${pwHrs(mins(sessions))}</strong><span>a week</span></div>
      <p class="pw-hours-split">${pool.length} pool session${pool.length===1?"":"s"} (${pwHrs(mins(pool))})${land.length?` · ${land.length} land (${pwHrs(mins(land))})`:""} · over ${days} day${days===1?"":"s"}</p>`
    :`<p class="pw-muted">Session times coming soon — <a href="contact">get in touch</a>.</p>`;
  const lead=sq&&sq.lead&&sq.lead!=="TBC"?sq.lead:"";
  const coachLine=coaches.length?coaches.map(c=>`${esc(c.name)}${c.assistant?' <span class="pw-muted">(assistant)</span>':""}`).join(", ")
    :lead?esc(lead):"";
  const ref=sq?"s:"+sq.id:null,following=ref&&typeof follow!=="undefined"&&follow.tags.includes(ref);
  return `<p class="eyebrow">${esc(b.label)}</p>
    <h3 class="display">${esc(p.name)}</h3>
    <p class="pw-level">${esc(p.level)}</p>
    <p class="pw-blurb">${esc(p.blurb)}</p>
    <dl class="pw-facts">
      <div><dt>Age guide</dt><dd>${esc(p.ageLabel)}</dd></div>
      ${p.competitive?`<div><dt>Commitment</dt><dd>Highly competitive · minimum attendance</dd></div>`:""}
      ${coachLine?`<div><dt>Coach${coaches.length>1?"es":""}</dt><dd>${coachLine}</dd></div>`:""}
    </dl>
    <div class="pw-training"><p class="pw-sub">Training</p>${training}</div>
    <div class="pw-actions">
      ${sq&&sessions.length?`<a class="btn small" href="timetables?squad=${sq.id}">See timetable</a>`:""}
      ${ref?`<button type="button" class="btn small ghost" data-pw-follow="${ref}" aria-pressed="${following}">${following?"✓ Following news":"Follow news"}</button>`:""}
    </div>`;
}

/* ---------- pan & zoom ---------- */
const pw={x:0,y:0,k:1,sel:null,pts:new Map(),drag:null,moved:false,anim:0};
const pwEls=()=>({vp:$("#pwViewport"),world:$("#pwWorld"),panel:$("#pwPanel")});
function pwBounds(){
  const {vp}=pwEls();
  /* On a computer the open panel covers the right-hand side, so centre in what's left. */
  const side=pw.sel&&vp.clientWidth>=760?360:0;
  return {w:vp.clientWidth-side,h:vp.clientHeight-(pw.sel&&!side?vp.clientHeight*.58:0),fullW:vp.clientWidth,fullH:vp.clientHeight};
}
const pwFitK=()=>{const {vp}=pwEls();return Math.min(vp.clientWidth/PW_W,vp.clientHeight/PW_H);};
function pwClamp(){
  /* Measured against the part the panel leaves clear, so any squad can be brought out from under it. */
  const {w:vw,h:vh}=pwBounds(),m=40;
  pw.k=Math.min(2,Math.max(pwFitK()*.85,pw.k));
  const cl=(v,size,view)=>{const lo=Math.min(view-size-m,m),hi=Math.max(view-size-m,m);return Math.min(hi,Math.max(lo,v));};
  pw.x=cl(pw.x,PW_W*pw.k,vw);pw.y=cl(pw.y,PW_H*pw.k,vh);
}
function pwApply(animate){
  const {world}=pwEls();
  pwClamp();
  world.classList.toggle("animating",!!animate);
  world.style.transform=`translate(${pw.x}px,${pw.y}px) scale(${pw.k})`;
}
function pwZoomAt(k,cx,cy,animate){
  const nk=Math.min(2,Math.max(pwFitK()*.85,k));
  pw.x=cx-(cx-pw.x)*nk/pw.k;pw.y=cy-(cy-pw.y)*nk/pw.k;pw.k=nk;
  pwApply(animate);
}
/* Centre a world point in the part of the map the panel isn't covering. */
function pwCentre(x,y,k){
  const b=pwBounds();
  if(k)pw.k=k;
  pw.x=b.w/2-x*pw.k;pw.y=b.h/2-y*pw.k;
  pwApply(true);
}
function pwHome(){
  const {vp}=pwEls();
  /* Phones start zoomed in on the Academy end, ready to be dragged; computers see it all. */
  if(vp.clientWidth<760)pwCentre(PW_X(8.6),600,Math.max(pwFitK(),.55));
  else{pw.k=pwFitK();pw.x=(vp.clientWidth-PW_W*pw.k)/2;pw.y=(vp.clientHeight-PW_H*pw.k)/2;pwApply(true);}
}

/* ---------- selection & journeys ---------- */
function pwSelect(slug,{centre=true}={}){
  const {panel,vp}=pwEls(),p=PATHWAY.find(q=>pwSlug(q.name)===slug);
  pw.sel=p?slug:null;
  document.querySelectorAll(".pw-node").forEach(n=>{
    const on=n.dataset.pw===pw.sel;
    n.classList.toggle("sel",on);n.setAttribute("aria-pressed",String(on));
  });
  vp.classList.toggle("has-sel",!!p);
  const range=$("#pwAgeRange");
  if(!p){panel.hidden=true;range.setAttribute("width",0);return;}
  $("#pwPanelBody").innerHTML=pwDetailHtml(p);
  panel.hidden=false;panel.scrollTop=0;
  if(p.ages){
    const [a1,a2]=p.ages,x1=PW_X(Math.max(a1,5.2)),x2=PW_X(Math.min(a2,19.4));
    range.setAttribute("x",x1);range.setAttribute("width",x2-x1);
  }else range.setAttribute("width",0);
  if(centre){const {x,y}=pwPos(p);pwCentre(x,y,Math.max(pw.k,vp.clientWidth<760?.7:pw.k));}
}
function pwStopJourney(){
  cancelAnimationFrame(pw.anim);
  $("#pwJourney").setAttribute("d","");
  $("#pwJourneyDot").setAttribute("cx",-50);
  document.querySelectorAll(".pw-node.on-route").forEach(n=>n.classList.remove("on-route"));
  document.querySelectorAll("[data-pw-journey]").forEach(b=>b.classList.remove("active"));
  $("#pwViewport").classList.remove("journey");
}
function pwPlayJourney(i){
  const j=PW_JOURNEYS[i],path=$("#pwJourney"),dot=$("#pwJourneyDot");
  pwStopJourney();pwSelect(null);
  $("#pwViewport").classList.add("journey");
  document.querySelector(`[data-pw-journey="${i}"]`).classList.add("active");
  const pts=j.route.map(n=>pwPos(PATHWAY.find(p=>p.name===n)));
  path.setAttribute("d","M"+pts.map(p=>`${p.x},${p.y}`).join("L"));
  /* Frame the whole route. */
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),b=pwBounds();
  const k=Math.min(1.1,(b.fullW-80)/(Math.max(...xs)-Math.min(...xs)+260),(b.fullH-80)/(Math.max(...ys)-Math.min(...ys)+200));
  pwCentre((Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,k);
  const nodes=j.route.map(n=>document.querySelector(`[data-pw="${pwSlug(n)}"]`));
  const len=path.getTotalLength(),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Where along the line each stop falls, so a card lights up as the dot reaches it. */
  let acc=0;const stops=[0];
  for(let s=1;s<pts.length;s++){acc+=Math.hypot(pts[s].x-pts[s-1].x,pts[s].y-pts[s-1].y);stops.push(acc);}
  path.style.strokeDasharray=len;
  const t0=performance.now(),dur=reduce?0:900*(pts.length-1);
  const step=now=>{
    const f=dur?Math.min(1,(now-t0)/dur):1,d=len*f,pt=path.getPointAtLength(d);
    path.style.strokeDashoffset=len-d;
    dot.setAttribute("cx",pt.x);dot.setAttribute("cy",pt.y);
    nodes.forEach((n,s)=>n.classList.toggle("on-route",stops[s]<=d+1));
    if(f<1)pw.anim=requestAnimationFrame(step);
  };
  pw.anim=requestAnimationFrame(step);
}

/* ---------- render & wiring ---------- */
function renderPathway(){
  const host=$("#pathwayMap");
  if(!host)return;
  if(!host.dataset.built){
    host.dataset.built="1";
    host.innerHTML=`<div class="pw-viewport" id="pwViewport" tabindex="0" aria-label="Squad pathway map. Drag to explore; use the squad buttons for details.">
        <div class="pw-world" id="pwWorld" style="width:${PW_W}px;height:${PW_H}px">${pwSvg()}${PATHWAY.map(pwNodeHtml).join("")}</div>
        <div class="pw-hint" id="pwHint"><span class="pw-hint-touch">Drag to explore · pinch to zoom · tap a squad</span><span class="pw-hint-mouse">Drag to explore · Ctrl + scroll to zoom · click a squad</span></div>
        <div class="pw-controls">
          <button type="button" data-pw-zoom="1" aria-label="Zoom in">+</button>
          <button type="button" data-pw-zoom="-1" aria-label="Zoom out">−</button>
          <button type="button" data-pw-zoom="0" aria-label="Show the whole map">⤢</button>
        </div>
        <aside class="pw-panel" id="pwPanel" hidden aria-live="polite">
          <button type="button" class="pw-close" data-pw-close aria-label="Close squad details">×</button>
          <div id="pwPanelBody"></div>
        </aside>
      </div>
      <div class="pw-journeys">
        <span class="pw-sub">Real journeys</span>
        ${PW_JOURNEYS.map((j,i)=>`<button type="button" class="tt-chip" data-pw-journey="${i}">${esc(j.label)}: ${j.route.map(esc).join(" → ")}</button>`).join("")}
      </div>
      <p class="pw-note"><strong>There's no set route — and no guarantees.</strong> Swimmers move up, across and sometimes back as they grow and develop, and the coaches place every swimmer where they'll progress best.</p>`;
    pwWire();
    requestAnimationFrame(()=>pwHome());
  }
  if(pw.sel)pwSelect(pw.sel,{centre:false});
}
function pwWire(){
  const {vp}=pwEls(),host=$("#pathwayMap");
  const local=e=>{const r=vp.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const hideHint=()=>$("#pwHint").classList.add("gone");
  const onUi=e=>e.target.closest(".pw-panel,.pw-controls");

  vp.addEventListener("pointerdown",e=>{
    if(onUi(e)||(e.pointerType==="mouse"&&e.button!==0))return;
    pw.pts.set(e.pointerId,local(e));
    pw.moved=false;
    pw.drag={x:pw.x,y:pw.y,k:pw.k,pts:new Map(pw.pts)};
  });
  vp.addEventListener("pointermove",e=>{
    if(!pw.pts.has(e.pointerId)||!pw.drag)return;
    pw.pts.set(e.pointerId,local(e));
    const start=[...pw.drag.pts.values()],now=[...pw.pts.values()];
    if(now.length===1&&start.length===1){
      const dx=now[0].x-start[0].x,dy=now[0].y-start[0].y;
      /* Only capture once it's clearly a drag, so a tap still reaches the squad underneath. */
      if(!pw.moved&&Math.hypot(dx,dy)<6)return;
      if(!pw.moved){pw.moved=true;vp.setPointerCapture(e.pointerId);vp.classList.add("dragging");hideHint();}
      pw.x=pw.drag.x+dx;pw.y=pw.drag.y+dy;pwApply();
    }else if(now.length>=2&&start.length>=2){
      pw.moved=true;hideHint();
      const mid=p=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}),dist=p=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1;
      const m0=mid(start),m1=mid(now);
      pw.k=pw.drag.k;pw.x=pw.drag.x;pw.y=pw.drag.y;
      pwZoomAt(pw.drag.k*dist(now)/dist(start),m0.x,m0.y);
      pw.x+=m1.x-m0.x;pw.y+=m1.y-m0.y;pwApply();
    }
  });
  const end=e=>{
    if(!pw.pts.has(e.pointerId))return;
    pw.pts.delete(e.pointerId);
    vp.classList.remove("dragging");
    /* Carry on with whichever fingers are still down, from where the map is now. */
    pw.drag=pw.pts.size?{x:pw.x,y:pw.y,k:pw.k,pts:new Map(pw.pts)}:null;
  };
  vp.addEventListener("pointerup",end);
  vp.addEventListener("pointercancel",end);
  /* A plain scroll wheel keeps scrolling the page; Ctrl/⌘ + scroll (and trackpad pinch) zooms. */
  vp.addEventListener("wheel",e=>{
    if(!(e.ctrlKey||e.metaKey))return;
    e.preventDefault();hideHint();
    const p=local(e);pwZoomAt(pw.k*Math.exp(-e.deltaY*.0025),p.x,p.y);
  },{passive:false});
  vp.addEventListener("keydown",e=>{
    if(e.target!==vp)return;
    const step=80,keys={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]};
    if(keys[e.key]){e.preventDefault();pw.x+=keys[e.key][0];pw.y+=keys[e.key][1];pwApply(true);}
    else if(e.key==="+"||e.key==="="){pwZoomAt(pw.k*1.25,vp.clientWidth/2,vp.clientHeight/2,true);}
    else if(e.key==="-"){pwZoomAt(pw.k/1.25,vp.clientWidth/2,vp.clientHeight/2,true);}
  });
  host.addEventListener("keydown",e=>{if(e.key==="Escape"&&pw.sel){pwSelect(null);vp.focus();}});

  host.addEventListener("click",e=>{
    /* The click that ends a drag isn't a tap on a squad. */
    if(pw.moved&&e.target.closest(".pw-viewport")&&!onUi(e)){pw.moved=false;return;}
    const node=e.target.closest("[data-pw]"),zoom=e.target.closest("[data-pw-zoom]"),jr=e.target.closest("[data-pw-journey]");
    const fol=e.target.closest("[data-pw-follow]");
    if(node){hideHint();pwStopJourney();pwSelect(node.dataset.pw===pw.sel?null:node.dataset.pw);}
    else if(zoom){
      const z=+zoom.dataset.pwZoom;
      if(z)pwZoomAt(pw.k*(z>0?1.35:1/1.35),vp.clientWidth/2,vp.clientHeight/2,true);
      else{pwStopJourney();pwSelect(null);pwHome();}
    }
    else if(jr){
      const i=+jr.dataset.pwJourney;
      if(jr.classList.contains("active"))pwStopJourney();else pwPlayJourney(i);
      vp.scrollIntoView({behavior:"smooth",block:"nearest"});
    }
    else if(e.target.closest("[data-pw-close]")){pwSelect(null);}
    else if(fol){
      toggleFollow(fol.dataset.pwFollow);
      if(typeof renderFollowBadge==="function")renderFollowBadge();
      pwSelect(pw.sel,{centre:false});
      toast(follow.tags.includes(fol.dataset.pwFollow)?"Following — this squad's stories will show as \"For you\" in Club News":"No longer following this squad");
    }
  });
  let rz;
  addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>pwApply(),120);});
}
