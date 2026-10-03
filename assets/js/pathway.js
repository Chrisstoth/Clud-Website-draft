/* ================= SQUAD PATHWAY =================
   The Squads tab on the Coaches & Squads page: a simple diagram that fits the page. The Academy
   hats lead up into Junior Pathway, which feeds Bronze, Silver and Gold, three equal pathways
   side by side with each one building from its 3 squad up to its 1. Masters sits alongside.
   Tapping a squad shows who it's for, its coaches and its weekly training underneath.
   Who-it's-for text lives here in PATHWAY; the sessions, lead coach and coaches come live from
   Squad Timetables and the coaching team, matched by squad name, so hours can never go stale.
   A squad here with no timetable of its own yet can borrow one through `alias`. */

const PW_BRANCHES={
  academy:{label:"Academy",color:"#4f9bd9"},
  jp:{label:"Junior Pathway",color:"#f5841f"},
  bronze:{label:"Bronze",sub:"Club Swim",color:"#b8733a"},
  silver:{label:"Silver",sub:"Competitive",color:"#8f99a6"},
  gold:{label:"Gold",sub:"Competitive",color:"#d9a521"},
  masters:{label:"Masters",sub:"Adults & juniors",color:"#24756b",light:true}
};
/* Left to right across the page. */
const PW_LANES=["bronze","silver","gold"];

/* Listed top to bottom within each pathway; the hats run in the order swimmers move through them. */
const PATHWAY=[
  {name:"Green Hats",branch:"academy",fill:"#23803f",light:true,ageLabel:"Up to 12",
    level:"Academy · first hat group",
    blurb:"The first Academy hat group, for swimmers coming out of lessons. Swimmers work up through Green, Yellow, Blue and Red hats."},
  {name:"Yellow Hats",branch:"academy",fill:"#f2c230",ageLabel:"Up to 12",
    level:"Academy · second hat group",
    blurb:"The second Academy hat group, building on the skills from Green Hats."},
  {name:"Blue Hats",branch:"academy",fill:"#2f6fd6",light:true,ageLabel:"Up to 12",
    level:"Academy · third hat group",
    blurb:"The third Academy hat group, getting swimmers ready for Red Hats."},
  {name:"Red Hats",branch:"academy",fill:"#d23a3a",light:true,ageLabel:"Up to 12",
    level:"Academy · final hat group",
    blurb:"The final Academy hat group, before Junior Pathway. There's no age limit in the Academy other than 12: swimmers who haven't moved on by then join the Bronze pathway."},
  {name:"Junior Pathway",branch:"jp",ageLabel:"9–12",competitive:true,
    level:"Finding the right pathway",
    blurb:"Junior Pathway works out where each swimmer fits best — Bronze, Silver or Gold — and we aim for swimmers to have moved on by 12. A highly competitive squad with minimum attendance."},
  {name:"Bronze 1",branch:"bronze",alias:"Bronze",ageLabel:"14+",
    level:"Club Swim",
    blurb:"The Club Swim programme for older swimmers: fitness, gaining county times, late bloomers and more social swimmers."},
  {name:"Bronze 2",branch:"bronze",alias:"Bronze",ageLabel:"11–14",
    level:"Club Swim",
    blurb:"The Club Swim programme for younger swimmers: fitness, working towards county times, late bloomers and swimmers who are here for the social side as much as the racing."},
  {name:"Silver 1",branch:"silver",ageLabel:"15+",competitive:true,
    level:"County & regional · some national qualifiers",
    blurb:"For county and regional level swimmers, some with national qualifying times."},
  {name:"Silver 2",branch:"silver",ageLabel:"13–16",competitive:true,
    level:"County times, or very close",
    blurb:"Generally for swimmers with county times, or very close to them."},
  {name:"Silver 3",branch:"silver",ageLabel:"12–14",competitive:true,
    level:"Working towards county times",
    blurb:"Generally for younger swimmers working towards county times, broadening their swimming skills and improving fitness and speed."},
  {name:"Gold 1",branch:"gold",ageLabel:"14+",competitive:true,
    level:"Regional finals · national qualifying",
    blurb:"For swimmers aiming for regional finals and national qualification."},
  {name:"Gold 2",branch:"gold",ageLabel:"12–16",competitive:true,
    level:"Regional & national qualifiers",
    blurb:"For swimmers with regional and national qualifying times."},
  {name:"Gold 3",branch:"gold",ageLabel:"10–14",competitive:true,
    level:"County & regional · national potential",
    blurb:"For swimmers with county and regional qualifying times, and national potential."},
  {name:"Masters",branch:"masters",ageLabel:"18+",
    level:"Fitness or competitive",
    blurb:"For adult swimmers — whether you're swimming for fitness or to compete."},
  {name:"Junior Masters",branch:"masters",ageLabel:"14–18",
    level:"Masters offering",
    blurb:"Our Masters offering for younger swimmers. Get in touch to find out more."}
];

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

/* ---------- diagram ---------- */
function pwCard(p){
  const b=PW_BRANCHES[p.branch],light=p.fill?p.light:b.light;
  return `<button type="button" class="pw-card${light?" light":""}" data-pw="${pwSlug(p.name)}" aria-pressed="false"
    style="--c:${p.fill||b.color}"><strong>${esc(p.name)}</strong><span>${esc(p.ageLabel)}</span></button>`;
}
const pwIn=branch=>PATHWAY.filter(p=>p.branch===branch);
function pwDiagramHtml(){
  const lane=k=>{const b=PW_BRANCHES[k];
    return `<div class="pw-lane" style="--c:${b.color}"><div class="pw-lane-head"><h4>${esc(b.label)}</h4><span>${esc(b.sub)}</span></div>
      <div class="pw-stack">${pwIn(k).map(pwCard).join("")}</div></div>`;};
  const m=PW_BRANCHES.masters;
  return `<div class="pw-diagram">
      <div class="pw-main">
        <div class="pw-lanes">${PW_LANES.map(lane).join("")}</div>
        <div class="pw-ups" aria-hidden="true">${PW_LANES.map(()=>"<span>↑</span>").join("")}</div>
        <div class="pw-base">${pwIn("jp").map(pwCard).join("")}</div>
        <div class="pw-ups single" aria-hidden="true"><span>↑</span></div>
        <div class="pw-hats"><p class="pw-sub">Academy</p><div class="pw-hat-row">${pwIn("academy").map(pwCard).join('<span class="pw-arrow" aria-hidden="true">→</span>')}</div></div>
      </div>
      <div class="pw-lane pw-side" style="--c:${m.color}"><div class="pw-lane-head"><h4>${esc(m.label)}</h4><span>${esc(m.sub)}</span></div>
        <div class="pw-stack">${pwIn("masters").map(pwCard).join("")}</div></div>
    </div>`;
}

/* ---------- details ---------- */
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
  return `<button type="button" class="pw-close" data-pw-close aria-label="Close squad details">×</button>
    <div class="pw-detail-main">
      <p class="eyebrow">${esc(b.label)}</p>
      <h3 class="display">${esc(p.name)}</h3>
      <p class="pw-level">${esc(p.level)}</p>
      <p class="pw-blurb">${esc(p.blurb)}</p>
      <div class="pw-actions">
        ${sq&&sessions.length?`<a class="btn small" href="timetables?squad=${sq.id}">See timetable</a>`:""}
        ${ref?`<button type="button" class="btn small ghost" data-pw-follow="${ref}" aria-pressed="${following}">${following?"✓ Following news":"Follow news"}</button>`:""}
      </div>
    </div>
    <dl class="pw-facts">
      <div><dt>Age guide</dt><dd>${esc(p.ageLabel)}</dd></div>
      ${p.competitive?`<div><dt>Commitment</dt><dd>Highly competitive · minimum attendance</dd></div>`:""}
      ${coachLine?`<div><dt>Coach${coaches.length>1?"es":""}</dt><dd>${coachLine}</dd></div>`:""}
      <div><dt>Training</dt><dd>${training}</dd></div>
    </dl>`;
}

let pwSel=null;
function pwSelect(slug,scroll){
  const p=PATHWAY.find(q=>pwSlug(q.name)===slug),box=$("#pwDetail");
  pwSel=p?slug:null;
  document.querySelectorAll(".pw-card").forEach(c=>{
    const on=c.dataset.pw===pwSel;
    c.classList.toggle("sel",on);c.setAttribute("aria-pressed",String(on));
  });
  $(".pw-diagram").classList.toggle("has-sel",!!p);
  box.classList.toggle("empty",!p);
  box.innerHTML=p?pwDetailHtml(p):`<p class="pw-muted">Tap a squad above to see who it's for, its coaches and its weekly training.</p>`;
  /* On a phone the details sit below the fold, so bring them into view. */
  if(p&&scroll){
    const r=box.getBoundingClientRect();
    if(r.bottom>innerHeight)box.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
}

/* ---------- render & wiring ---------- */
function renderPathway(){
  const host=$("#pathwayMap");
  if(!host)return;
  if(!host.dataset.built){
    host.dataset.built="1";
    host.innerHTML=`${pwDiagramHtml()}
      <div class="pw-detail empty" id="pwDetail" aria-live="polite"></div>
      <p class="pw-note"><strong>There's no set route — and no guarantees.</strong> Swimmers move up, across and sometimes back between pathways as they grow and develop, and the coaches place every swimmer where they'll progress best.</p>`;
    host.addEventListener("click",e=>{
      const card=e.target.closest("[data-pw]"),fol=e.target.closest("[data-pw-follow]");
      if(card)pwSelect(card.dataset.pw===pwSel?null:card.dataset.pw,true);
      else if(e.target.closest("[data-pw-close]"))pwSelect(null);
      else if(fol){
        toggleFollow(fol.dataset.pwFollow);
        if(typeof renderFollowBadge==="function")renderFollowBadge();
        pwSelect(pwSel);
        toast(follow.tags.includes(fol.dataset.pwFollow)?"Following — this squad's stories will show as \"For you\" in Club News":"No longer following this squad");
      }
    });
  }
  /* Re-draw the open squad's details once the timetables and coaches have loaded. */
  pwSelect(pwSel);
}
