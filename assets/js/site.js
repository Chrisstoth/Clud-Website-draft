/* Orange edge only when entries can actually be made: an open meet, upcoming, status open, and an entry pack link set. */
/* A card with one destination is a link as a whole: this anchor's ::after is stretched over the
   nearest positioned ancestor (the card), so a tap anywhere on it follows the link. On phones the
   label gives way to an arrow badge (see .tap-card in site.css). */
/* iOS Safari only applies :active (the tap-card press state) once the page listens for touches */
document.addEventListener("touchstart",()=>{},{passive:true});
const cardLink=(attrs,label)=>`<a class="card-link" ${attrs}><span class="cl-label">${label}</span></a>`;
const meetHasEntry=m=>m.type!=="teamMeet"&&!meetDone(m)&&m.status==="open"&&!!m.entryUrl;
/* The results archive runs back to 2024 and only grows, so showing every completed gala as a
   card leaves a wall of them between the reader and the one they came for. The most recent
   season's galas stay as ordinary cards; each earlier year folds into one expandable bar.
   "Most recent season" is whichever year has the newest results, not the calendar year, so
   there is always something on show -- in January, last year's galas are still the latest. */
function completedByYear(completed,card){
  if(!completed.length)return `<p style="color:var(--muted)">No completed galas yet.</p>`;
  const years=new Map();
  completed.forEach(m=>{const y=m.start.slice(0,4);(years.get(y)||years.set(y,[]).get(y)).push(m);});
  /* completed is already newest-first, so the first key is the season to leave open. */
  return [...years].map(([year,meets],i)=>{
    const cards=meets.map(card).join("");
    if(i===0)return cards;
    return `<details class="year-group"><summary>${year}<span class="year-count">${meets.length} gala${meets.length===1?"":"s"}</span></summary>
      <div class="year-body">${cards}</div></details>`;
  }).join("");
}
function renderMeets(){
  const all=DB.feed.filter(isMeet).sort((a,b)=>a.start<b.start?-1:1);
  const upcoming=all.filter(m=>!meetDone(m)),completed=all.filter(meetDone).reverse();
  /* BPSC-hosted galas get their own section, first, on Open Meets -- meets we're just entering
     stay in date order below rather than interleaved, so an urgent external closing date is
     still easy to spot without our own galas getting lost among them. */
  const upcomingOpen=upcoming.filter(m=>m.type!=="teamMeet"&&!meetTooFarAhead(m)),upcomingTeam=upcoming.filter(m=>m.type==="teamMeet");
  const upcomingOurs=upcomingOpen.filter(m=>m.type==="meet"),upcomingOthers=upcomingOpen.filter(m=>m.type==="externalMeet");
  const extLink=(url,label,cls="big ghost")=>`<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  /* Live results are published by the poolside laptop to a separate host, so this is always an external link. */
  const liveLink=url=>`<a class="btn big live" href="${esc(url)}" target="_blank" rel="noopener"><span class="live-dot"></span>Live results</a>`;
  /* The live video stream (YouTube, Facebook etc.) is external too, and sits beside live results. */
  const streamLink=url=>`<a class="btn big ghost stream" href="${esc(url)}" target="_blank" rel="noopener"><span class="stream-play" aria-hidden="true">▶</span>Watch live stream</a>`;
  const meetCard=m=>{
    const done=meetDone(m),team=m.type==="teamMeet",ours=m.type==="meet";
    const dp=dateParts(m.start);
    const pills=[
      meetLive(m)||meetStreaming(m)?'<span class="pill live"><span class="live-dot"></span>Live now</span>':"",
      done?'<span class="pill closed">Completed</span>':team?"":m.status==="open"?'<span class="pill open">Entries open</span>':'<span class="pill closed">Entries closed</span>',
      team?`<span class="pill results">${esc(m.league||"Team meet")}</span>`:ours?'<span class="pill hosted">BPSC hosted</span>':"",
      m.level&&!team?`<span class="pill level">${esc(m.level)}</span>`:""
    ].join("");
    let actions;
    if(done)actions=m.resultsUrl?extLink(m.resultsUrl,"Results","big"):`<span class="btn big disabled" aria-disabled="true">Results coming soon</span>`;
    else if(team)actions=m.leagueUrl?extLink(m.leagueUrl,"League info"):"";
    else actions=(meetHasEntry(m)?extLink(m.entryUrl,"Entry pack","big")
        :m.entryUrl&&m.status!=="open"?`<span class="btn big entries-closed" aria-disabled="true">Entries CLOSED</span>`:"")
      +(m.officialsUrl?extLink(m.officialsUrl,"Officials sign-up"):"")
      +(m.volunteerUrl?extLink(m.volunteerUrl,"Volunteer here"):"");
    /* A gala in progress leads with its live-results button, whatever else the card offers. */
    if(meetStreaming(m))actions=streamLink(m.streamUrl)+actions;
    if(meetLive(m))actions=liveLink(m.liveUrl)+actions;
    const dates=m.end?`${fmtDate(m.start)} – ${fmtDate(m.end)}`:fmtDate(m.start);
    /* Each line reads "Name: link text", or just the link when it has no name. */
    const extraLinks=(m.docLinks||[]).filter(l=>l&&l.url).map(l=>{
      const a=`<a href="${esc(l.url)}">${esc(l.text||(l.label?"Open":l.url))}</a>`;
      const hl=LINK_HIGHLIGHTS.some(([k])=>k&&k===l.hl)?` hl-${l.hl}`:"";
      return `<div class="link-line${hl}">${l.label?`${esc(l.label)}: `:""}${a}</div>`;
    }).join("");
    const r=resolveNewsImage(m.img);
    const thumb=r?`<div class="news-thumb ${r.cls}" style="${r.style}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
    return `<article class="card meet${meetLive(m)||meetStreaming(m)?" live":""}${done?" done":""}${meetHasEntry(m)?" entries-open":""}${ours?" ours":""}">
      ${thumb}
      <div class="datebox"><div class="d">${dp.d}</div><div class="m">${dp.m}</div></div>
      <div class="meet-main">
        ${pills?`<div class="row">${pills}</div>`:""}
        <h3>${esc(m.title)}</h3>
        ${m.type==="externalMeet"&&m.host?`<div class="host">Hosted by ${esc(m.host)}</div>`:""}
        <div class="venue">${esc(m.venue||"Venue TBC")}${m.poolType?` · ${esc(m.poolType)}`:""} · ${dates}</div>
        ${m.license?`<div style="font-size:.82rem;color:var(--muted);margin-top:2px">Licence ${esc(m.license)}</div>`:""}
        ${m.notes&&!done?`<p style="margin-top:10px;font-size:.94rem;color:var(--body2)">${esc(m.notes)}</p>`:""}
        ${m.closing&&m.status==="open"&&!done?`<div class="closing">Entries close <strong>${fmtDate(m.closing)}</strong></div>`:""}
        ${extraLinks?`<details class="info" style="margin-top:12px"><summary>Meet documents &amp; links</summary><div class="body">${extraLinks}</div></details>`:""}
      </div>
      ${actions?`<div class="meet-actions">${actions}</div>`:""}</article>`;
  };
  if($("#meetsList")){
    $("#meetsList").innerHTML=upcomingOurs.length?upcomingOurs.map(meetCard).join(""):`<p style="color:var(--muted)">No Basildon-hosted galas confirmed yet — check back soon.</p>`;
    $("#otherMeetsList").innerHTML=upcomingOthers.length?upcomingOthers.map(meetCard).join(""):`<p style="color:var(--muted)">No other open meets listed yet.</p>`;
    $("#teamMeetsList").innerHTML=upcomingTeam.length?upcomingTeam.map(meetCard).join(""):`<p style="color:var(--muted)">No team meets scheduled yet.</p>`;
    $("#completedMeetsList").innerHTML=completedByYear(completed,meetCard);
  }
  /* The hero's red LIVE pill only shows while a gala with a live-results link is actually running.
     A button that pulses permanently and goes nowhere just trains people to ignore it. */
  const livePill=$("#liveResultsPill"),liveNow=all.find(meetLive);
  if(livePill){
    if(liveNow){livePill.href=liveNow.liveUrl;livePill.hidden=false;livePill.title="Live results — "+liveNow.title;}
    else livePill.hidden=true;
  }

  if(!$("#nextMeetCard"))return;
  const isHome=isHomeVenue;
  const clubUpcoming=upcoming.filter(m=>m.type==="meet");
  const next=clubUpcoming.find(isHome)||clubUpcoming[0]||upcomingOpen[0];
  $("#nextMeetCard").classList.toggle("tap-card",!!next);
  $("#nextMeetCard").innerHTML=next?`
    <p class="eyebrow">Next ${isHome(next)?"Basildon ":""}meet</p>
    <h3>${esc(next.title)}</h3>
    <div class="meta"><div class="nm-venue">${esc(next.venue)}</div><div>${fmtDate(next.start)}${next.closing?`<span class="nm-closing"> · entries close ${fmtDate(next.closing)}</span>`:""}</div></div>
    <div class="nm-cta">${cardLink('href="open-meets"','<span class="btn small">Details<span class="nm-long"> &amp; entry pack</span></span>')}</div>`
    :`<p class="eyebrow">Next Basildon meet</p><h3>Dates coming soon</h3>
    <div class="meta"><div>The next season's meets will be published here once confirmed.</div></div>`;
}
/* The Academy coaches get their own block under the squad coaches; coaches.html holds the
   heading, which stays hidden while nobody carries the "Academy Coach" role. */
function coachCard(c){
  const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");
  const squads=(c.squads||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join("");
  const photoStyle=c.photo?`background-image:url('${esc(c.photo)}')`:"";
  const bio=(c.bio||"").trim();
  return `<article class="card coach${bio?" has-bio":""}">
    <div class="coach-main">
      <div class="coach-photo" style="${photoStyle}">${c.photo?"":`<span class="avatar">${esc(ini)}</span>`}</div>
      <h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div>
      ${c.quals?`<div class="quals">${esc(c.quals)}</div>`:""}
      <div class="squads">${squads}</div>
    </div>
    ${bio?`<div class="coach-bio"><p>${esc(bio)}</p></div>`:""}</article>`;
}
function renderCoaches(){
  if(!$("#coachesList"))return;
  const academy=DB.coaches.filter(c=>c.role==="Academy Coach");
  const squad=DB.coaches.filter(c=>c.role!=="Academy Coach");
  $("#coachesList").innerHTML=squad.map(coachCard).join("");
  if($("#academyCoachesList")){
    $("#academyCoachesList").innerHTML=academy.map(coachCard).join("");
    $("#academyCoachesHead").hidden=!academy.length;
  }
}
/* Coaches & Squads has two tabs; "coaches#squads" opens straight on the squads. */
const coachTabs=$("#coachTabs");
function showCoachTab(tab){
  coachTabs.querySelectorAll("[data-ctab]").forEach(b=>{
    const on=b.dataset.ctab===tab;
    b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));
  });
  document.querySelectorAll("[data-ctab-panel]").forEach(p=>{p.hidden=p.dataset.ctabPanel!==tab;});
}
if(coachTabs){
  const fromHash=()=>location.hash==="#squads"?"squads":"coaches";
  coachTabs.addEventListener("click",e=>{
    const b=e.target.closest("[data-ctab]");
    if(!b)return;
    history.replaceState(null,"",b.dataset.ctab==="squads"?"#squads":location.pathname+location.search);
    showCoachTab(b.dataset.ctab);
  });
  addEventListener("hashchange",()=>showCoachTab(fromHash()));
  showCoachTab(fromHash());
}
function roleCard(r){
  return `<article class="card role-card" data-cat="${esc(r.category)}"><h3>${esc(r.title)}</h3>
      <div class="meta">
        <span><strong>Commitment</strong>${esc(r.commitment)}</span>
        <span><strong>Training</strong>${esc(r.training)}</span>
      </div>
      <p>${esc(r.blurb)}</p></article>`;
}
/* The tab cards above filter which of these stay visible -- see the #roleCatTabs wiring
   further down, which also fills in each tab's role count once this has run. */
function renderRoles(){
  if(!$("#rolesList"))return;
  $("#rolesList").innerHTML=DB.roles.map(roleCard).join("");
  applyRoleCatFilter();
}
function applyRoleCatFilter(){
  const tabs=$("#roleCatTabs");
  if(!tabs)return;
  const active=tabs.querySelector(".path-card.sel");
  const cat=active?active.dataset.cat:null;
  document.querySelectorAll("#rolesList [data-cat]").forEach(el=>{el.hidden=cat!==null&&el.dataset.cat!==cat;});
  tabs.querySelectorAll("[data-count]").forEach(el=>{
    const n=DB.roles.filter(r=>r.category===el.dataset.count).length;
    el.textContent=`${n} role${n===1?"":"s"}`;
  });
  /* Mobile collapses the tab cards to a title-only row (see .role-cat-tabs in site.css) and
     shows the rest of the active card's copy here instead -- kept in sync on every filter
     change so it never lags behind which tab is actually selected. */
  const descPanel=$("#roleCatDesc");
  if(descPanel&&active){
    descPanel.innerHTML=`${active.querySelector(".eyebrow")?.outerHTML||""}${active.querySelector(".path-desc")?.outerHTML||""}${active.querySelector(".role-cat-count")?.outerHTML||""}`;
  }
}
function renderWelfare(){
  if(!$("#welfareBody"))return;
  $("#welfareBody").innerHTML=sanitizeArticleHtml(DB.welfare[0]?.body||WELFARE_DEFAULT_BODY);
}

/* ================= CLUB COMMITTEE =================
   A scrollable role list on the left drives a detail panel on the right, rather than one
   long page of cards -- there are ~19 posts, most with several bullets each, so showing them
   all at once buried the page. The selection is kept across a re-render (e.g. after the
   admin's own edits) by id, falling back to the first role if that id has since been deleted. */
let committeeSelectedId=null;
/* Initials fallback for a role with no photo -- "Vacant"/blank gets a plain dash rather than
   a "V" that would misleadingly read as someone's actual initial. */
function committeeInitials(person){
  if(!person||person.trim().toLowerCase()==="vacant")return "–";
  return person.split(" ").map(w=>w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
}
function committeeAvatar(r,cls){
  return r.photo
    ?`<div class="${cls}" style="background-image:url('${esc(r.photo)}')"></div>`
    :`<div class="${cls} initials"><span>${esc(committeeInitials(r.person))}</span></div>`;
}
function committeeListItem(r){
  return `<button type="button" class="committee-item${r.id===committeeSelectedId?" active":""}" data-id="${r.id}">
    ${committeeAvatar(r,"committee-item-photo")}
    <span class="tp">
      <span class="t">${esc(r.title)}</span>
      <span class="p">${esc(r.person||"Vacant")}</span>
    </span>
  </button>`;
}
function committeeBullets(label,items){
  return items&&items.length?`<h4>${label}</h4><ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"";
}
function committeeDetail(r){
  if(!r)return `<p style="color:var(--muted)">No committee roles yet.</p>`;
  return `<article class="card committee-card">
    <div class="committee-card-head">
      ${committeeAvatar(r,"committee-detail-photo")}
      <div>
        <h3 class="display">${esc(r.title)}</h3>
        <p class="committee-person">${r.person?esc(r.person):"Vacant"}${r.email?` · <a href="mailto:${esc(r.email)}">${esc(r.email)}</a>`:""}</p>
      </div>
    </div>
    ${r.commitment?`<p class="committee-commitment"><strong>Time commitment:</strong> ${esc(r.commitment)}</p>`:""}
    ${r.summary?`<p>${esc(r.summary)}</p>`:""}
    ${committeeBullets("Skills & experience",r.skills)}
    ${committeeBullets("Main duties",r.duties)}
  </article>`;
}
function renderCommittee(){
  if(!$("#committeeList"))return;
  const list=DB.committee;
  const exec=list.filter(r=>r.tier==="executive"),rest=list.filter(r=>r.tier!=="executive");
  const group=(label,items)=>items.length?`<div class="committee-group-label">${label}</div>${items.map(committeeListItem).join("")}`:"";
  $("#committeeList").innerHTML=list.length?group("Executive Committee",exec)+group("Committee",rest):`<p style="color:var(--muted)">No committee roles yet.</p>`;
  if(!list.some(r=>r.id===committeeSelectedId))committeeSelectedId=list[0]?.id??null;
  $("#committeeDetail").innerHTML=committeeDetail(list.find(r=>r.id===committeeSelectedId));
}
if($("#committeeList")){
  $("#committeeList").addEventListener("click",e=>{
    const b=e.target.closest("[data-id]");
    if(!b)return;
    committeeSelectedId=+b.dataset.id;
    renderCommittee();
  });
}

/* ================= SQUAD TIMETABLES =================
   Two views: one squad's week (AM/PM grid on desktop, day list on phones), or every squad on one day.
   AM/PM is derived from each session's start time so it can never disagree with the time. */
const ttMinutes=t=>{const [h,m]=t.split(":").map(Number);return h*60+m;};
const ttTodayKey=()=>TT_DAYS[(new Date().getDay()+6)%7];
const ttLandTag=s=>s.type==="land"?'<span class="tt-tag">Land</span>':"";
let ttView="squad",ttDay=ttTodayKey(),ttSquadId=null;
try{ttSquadId=+localStorage.getItem("bpsc_tt_squad")||null;}catch(e){}
/* "timetables?squad=<id>" (from the squad pathway map) opens straight on that squad. */
{const q=+new URLSearchParams(location.search).get("squad");if(q)ttSquadId=q;}

function renderTimetable(){
  const body=$("#ttBody"),chips=$("#ttChips"),today=ttTodayKey();
  if(!body)return;
  document.querySelectorAll("#ttViews button").forEach(b=>b.classList.toggle("active",b.dataset.view===ttView));
  if(!DB.squads.length){chips.innerHTML="";body.innerHTML=`<p style="color:var(--muted)">Squad timetables coming soon.</p>`;return;}

  if(ttView==="day"){
    chips.innerHTML=TT_DAYS.map(d=>`<button type="button" class="tt-chip${d===ttDay?" active":""}" data-day="${d}" aria-pressed="${d===ttDay}">${TT_DAY_NAMES[d]}</button>`).join("");
    const rows=DB.squads.flatMap(sq=>(sq.sessions||[]).filter(s=>s.day===ttDay).map(s=>({...s,squad:sq.name})))
      .sort((a,b)=>a.start.localeCompare(b.start)||a.squad.localeCompare(b.squad));
    const groups=["AM","PM"].map(p=>{
      const list=rows.filter(s=>ttPeriod(s)===p);
      return list.length?`<div class="tt-group">${p}</div>`+list.map(s=>`<div class="tt-row club">
        <strong>${esc(s.start)}–${esc(s.end)}</strong><span><strong>${esc(s.squad)}</strong>${ttLandTag(s)}</span><span class="muted">${esc(s.loc)}</span></div>`).join(""):"";
    }).join("");
    body.innerHTML=`<div class="card"><div class="tt-head"><div><h3 class="display">${TT_DAY_NAMES[ttDay]}</h3>
      <div class="tt-lead">All squads${ttDay===today?" · today":""}</div></div></div>
      ${rows.length?groups:`<p style="color:var(--muted)">No training on ${TT_DAY_NAMES[ttDay]}.</p>`}</div>`;
    return;
  }

  const sq=DB.squads.find(x=>x.id===ttSquadId)||DB.squads[0];
  ttSquadId=sq.id;
  chips.innerHTML=`<label class="tt-select">Choose a squad
    <select id="ttSquadSelect">${DB.squads.map(x=>`<option value="${x.id}" ${x.id===sq.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>`;
  const sessions=[...(sq.sessions||[])].sort(ttSort);
  const pool=sessions.filter(s=>s.type!=="land"),landCount=sessions.length-pool.length;
  const hrs=pool.reduce((t,s)=>t+ttMinutes(s.end)-ttMinutes(s.start),0)/60;
  const stats=sessions.length?[`${pool.length} pool session${pool.length===1?"":"s"}`,`${+hrs.toFixed(2)} hrs in the water`,landCount?`${landCount} land`:""].filter(Boolean).join(" · "):"";
  const sessHtml=s=>`<div class="tt-sess${s.type==="land"?" land":""}"><div class="time">${esc(s.start)}–${esc(s.end)}${ttLandTag(s)}</div><div class="loc">${esc(s.loc)}</div></div>`;
  const grid=`<div class="tt-grid"><div></div>${TT_DAYS.map(d=>`<div class="tt-dow${d===today?" today":""}">${d}</div>`).join("")}
    ${["AM","PM"].map(p=>`<div class="tt-period">${p}</div>`+TT_DAYS.map(d=>`<div class="tt-cell${d===today?" today":""}">${sessions.filter(s=>s.day===d&&ttPeriod(s)===p).map(sessHtml).join("")}</div>`).join("")).join("")}</div>`;
  const list=`<div class="tt-list">${TT_DAYS.filter(d=>sessions.some(s=>s.day===d)).map(d=>`<div class="tt-day">
    <h4>${TT_DAY_NAMES[d]}${d===today?'<span class="tt-tag">Today</span>':""}</h4>
    ${sessions.filter(s=>s.day===d).map(s=>`<div class="tt-row"><span class="tt-ampm">${ttPeriod(s)}</span><strong>${esc(s.start)}–${esc(s.end)}</strong><span>${esc(s.loc)}${ttLandTag(s)}</span></div>`).join("")}
  </div>`).join("")}</div>`;
  body.innerHTML=`<div class="card"><div class="tt-head"><div><h3 class="display">${esc(sq.name)}</h3>
    <div class="tt-lead">Lead squad coach: <strong>${esc(sq.lead||"TBC")}</strong></div></div>
    <div class="tt-stats">${stats}</div></div>
    ${sessions.length?grid+list:`<p style="color:var(--muted)">No sessions listed for this squad yet.</p>`}</div>`;
}
if($("#page-info-timetable")){
  $("#page-info-timetable").addEventListener("click",e=>{
    const v=e.target.closest("[data-view]"),d=e.target.closest("[data-day]");
    if(v)ttView=v.dataset.view;
    else if(d)ttDay=d.dataset.day;
    else return;
    renderTimetable();
  });
  $("#page-info-timetable").addEventListener("change",e=>{
    if(e.target.id!=="ttSquadSelect")return;
    ttSquadId=+e.target.value;
    try{localStorage.setItem("bpsc_tt_squad",ttSquadId);}catch(err){}
    renderTimetable();
    $("#ttSquadSelect").focus();
  });
}

/* Club Calendar: team meets (and legacy "Team event" level meets) are "League Galas"; all other meets are "Competitions". */
function isLeagueGala(m){return m.type==="teamMeet"||m.level==="Team event";}
function calCatInfo(it){
  if(it.type==="training")return{cls:"training",label:"Training change"};
  if(it.type==="social")return{cls:"social",label:"Social"};
  return isLeagueGala(it)?{cls:"league",label:"League gala"}:{cls:"comp",label:"Competition"};
}
let calViewDate=(()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),1);})();
function renderCalendarGrid(){
  const y=calViewDate.getFullYear(),m=calViewDate.getMonth();
  $("#calMonthLabel").textContent=calViewDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const startOffset=(new Date(y,m,1).getDay()+6)%7; // Monday-first
  const daysInMonth=new Date(y,m+1,0).getDate();
  const totalCells=Math.ceil((startOffset+daysInMonth)/7)*7;
  const items=DB.feed.filter(it=>(isMeet(it)||it.type==="social"||it.type==="training")&&it.start);
  const now=new Date(),todayIso=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  let html="";
  for(let i=0;i<totalCells;i++){
    const dayNum=i-startOffset+1;
    const inMonth=dayNum>=1&&dayNum<=daysInMonth;
    let iso="",dayItems=[];
    if(inMonth){
      iso=`${y}-${String(m+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
      dayItems=items.filter(it=>it.start===iso||(it.end&&it.start<=iso&&iso<=it.end));
    }
    const chips=dayItems.map(it=>{const c=calCatInfo(it);return `<div class="cal-chip ${c.cls}" title="${esc(c.label)}: ${esc(it.title)}"><span class="cal-chip-label">${esc(it.title)}</span></div>`;}).join("");
    html+=`<div class="cal-day${inMonth?"":" out"}${iso&&iso===todayIso?" today":""}"><div class="cal-daynum">${inMonth?dayNum:""}</div>${chips}</div>`;
  }
  $("#calGrid").innerHTML=html;
}
/* Compact calendar card: date + title share the top line; open entries get a pulsing orange edge instead of a pill. */
function meetRowCard(m){
  const dp=dateParts(m.start),open=m.status==="open",ours=m.type==="meet";
  return `<article class="card comp-card tap-card${meetHasEntry(m)?" entries-open":""}${ours?" ours":""}">
    <div class="comp-top">
      <div class="comp-date"><span class="d">${dp.d}</span><span class="m">${dp.m}</span></div>
      <h3>${esc(m.title)}</h3>
    </div>
    ${ours?'<div><span class="pill hosted">BPSC hosted</span></div>':""}
    <div class="comp-meta">${esc(m.venue||"Venue TBC")}${m.poolType?` · ${esc(m.poolType)}`:""}</div>
    <div class="comp-foot">
      <span class="comp-status">${m.type==="teamMeet"?esc(m.league||"Team meet"):meetHasEntry(m)?"":open?"Entry pack soon":"Entries closed"}</span>
      ${cardLink('href="open-meets"',"Full details →")}
    </div></article>`;
}
function renderSocials(){
  if(!$("#calGrid"))return;
  renderCalendarGrid();
  const socials=DB.feed.filter(it=>it.type==="social").sort((a,b)=>a.start<b.start?-1:1);
  $("#socialsList").innerHTML=socials.length?socials.map(it=>{
    const r=resolveNewsImage(it.img);
    /* the darkening keeps the title legible: over a photo it rides on the .photo layer (--shade),
       over a default gradient or the chosen card colour it's just another background layer */
    const shade="linear-gradient(160deg,rgba(16,16,20,.15),rgba(16,16,20,.65))";
    const artStyle=!r?`background:${it.color}`:r.bg?`background:${shade},${r.bg}`:`${r.style};--shade:${shade}`;
    return `
    <article class="card social-card tap-card">
      <div class="art ${r?r.cls:""}" style="${artStyle}">${esc(it.title)}</div>
      <div class="body"><div class="when">${esc(fmtDate(it.start))}</div><p>${esc(it.blurb)}</p>
      ${it.link?`<div class="card-extra"><a class="btn small" href="${esc(it.link)}">Details / tickets</a></div>`:""}
      <div>${cardLink(`href="article?id=${it.id}"`,'<span class="btn small ghost">Read more →</span>')}</div></div>
    </article>`;
  }).join(""):`<p style="color:var(--muted)">No socials scheduled yet.</p>`;

  const meets=DB.feed.filter(it=>isMeet(it)&&!meetDone(it)).sort((a,b)=>a.start<b.start?-1:1);
  const comps=meets.filter(m=>!isLeagueGala(m));
  const leagues=meets.filter(isLeagueGala);
  $("#compList").innerHTML=comps.length?comps.map(meetRowCard).join(""):`<p style="color:var(--muted)">No competitions scheduled yet.</p>`;
  $("#leagueList").innerHTML=leagues.length?leagues.map(meetRowCard).join(""):`<p style="color:var(--muted)">No league galas scheduled yet.</p>`;
  ["socialsList","compList","leagueList"].forEach(updateCatArrows);
}
if($("#calGrid")){
  $("#calPrev").addEventListener("click",()=>{calViewDate.setMonth(calViewDate.getMonth()-1);renderCalendarGrid();});
  $("#calNext").addEventListener("click",()=>{calViewDate.setMonth(calViewDate.getMonth()+1);renderCalendarGrid();});
}

/* Swipeable category rows: translucent prev/next arrows scroll the row by ~one card-width's worth,
   disabling themselves at either end instead of showing a visible scrollbar. */
function updateCatArrows(rowId){
  const row=document.getElementById(rowId);
  if(!row)return;
  const wrap=row.parentElement;
  const prev=wrap.querySelector(".cat-arrow.prev"),next=wrap.querySelector(".cat-arrow.next");
  prev.disabled=row.scrollLeft<=2;
  next.disabled=row.scrollLeft>=row.scrollWidth-row.clientWidth-2;
}
document.querySelectorAll(".cat-arrow").forEach(btn=>{
  const rowId=btn.dataset.row, row=document.getElementById(rowId);
  btn.addEventListener("click",()=>{
    row.scrollBy({left:btn.classList.contains("prev")?-row.clientWidth*0.85:row.clientWidth*0.85,behavior:"smooth"});
  });
  row.addEventListener("scroll",()=>updateCatArrows(rowId));
});
window.addEventListener("resize",()=>["socialsList","compList","leagueList","igList"].forEach(updateCatArrows));

/* ================= INSTAGRAM ROW (News page) =================
   The club's latest Instagram posts, drawn as our own cards rather than a foreign widget.
   The feed ID and any hidden posts are set in the members' area (see core.js). Until a feed
   is set -- or if Behold can't be reached -- the whole row stays hidden, so the page never
   shows a broken or empty section. */
function igCard(p){
  const img=igPostImage(p),caption=igPostCaption(p),badge=igPostBadge(p);
  const day=(p.timestamp||"").slice(0,10);
  return `<article class="card social-card ig-card">
    <a class="ig-photo" href="${esc(p.permalink)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
      ${img?`<img src="${esc(img)}" alt="" loading="lazy">`:""}${badge?`<span class="ig-badge">${badge}</span>`:""}</a>
    <div class="body">${day?`<div class="when"><time datetime="${esc(day)}">${esc(fmtDate(day))}</time></div>`:""}
      <p class="ig-caption">${esc(caption)}</p>
      <div><a class="btn small ghost" href="${esc(p.permalink)}" target="_blank" rel="noopener">View on Instagram →</a></div></div>
  </article>`;
}
async function renderInstagram(){
  const wrap=$("#igWrap");
  if(!wrap)return;
  try{
    const {feedId,hidden}=await loadInstagramSettings();
    if(!feedId)return;
    const posts=(await fetchBeholdPosts(feedId)).filter(p=>!hidden.includes(p.id)).slice(0,IG_MAX_POSTS);
    if(!posts.length)return;
    $("#igList").innerHTML=posts.map(igCard).join("");
    wrap.hidden=false;
    updateCatArrows("igList");
  }catch(e){console.warn("Instagram feed unavailable",e);}
}
renderInstagram();
const HERO_SLIDE_BG=[
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#3a5570,#1c2c3d)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#4a5a3a,#1c2c22)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#5a4a3a,#2c1c1c)"
];
let heroIndex=0;
const HERO_AUTO_MS=10000;
let heroAutoTimer=null,heroHeld=false;
/* The News page's filter: null (everything), NEWS_MINE, or one tag's reference ("t:3" / "s:5"). */
let newsTagFilter=null;
const NEWS_MINE="mine";

/* ================= FOLLOWING TAGS =================
   No accounts: a visitor ticks the tags they care about on the News page -- squads, and the club's
   own tags like Trips (see NEWS TAGS in core.js) -- and it's remembered in this browser only
   (localStorage), never sent anywhere. Stories with one of those tags get a "For you" label, and
   the ones they haven't opened yet put a count on the Club News link on every page. It lasts
   until the browser's site data is cleared (Safari on an iPhone also clears it after about a week
   without a visit, unless the site is installed to the home screen); a different device or
   browser starts afresh.
   "Unread" only counts stories posted since they started following -- less a week, so following
   a tag shows its latest news straight away rather than an empty count. */
const FOLLOW_KEY="bpsc_follow_v2",FOLLOW_LOOKBACK_MS=7*86400000;
const FOLLOW_EMPTY=()=>({tags:[],since:null,seen:[]});
function loadFollow(){
  try{
    const f=JSON.parse(localStorage.getItem(FOLLOW_KEY)||"null");
    if(f&&Array.isArray(f.tags))return {tags:f.tags,since:f.since||null,seen:Array.isArray(f.seen)?f.seen:[]};
  }catch(e){}
  return FOLLOW_EMPTY();
}
let follow=loadFollow();
function saveFollow(){try{localStorage.setItem(FOLLOW_KEY,JSON.stringify(follow));}catch(e){}}
const followedStory=n=>n.type==="news"&&(n.topics||[]).some(r=>follow.tags.includes(r));
const unreadStory=n=>followedStory(n)&&!follow.seen.includes(n.id)
  &&!!follow.since&&Date.parse(n.createdAt||0)>Date.parse(follow.since);
const followUnread=()=>DB.feed.filter(unreadStory);
function toggleFollow(ref){
  const on=!follow.tags.includes(ref);
  follow.tags=on?follow.tags.concat(ref):follow.tags.filter(r=>r!==ref);
  if(on&&!follow.since)follow.since=new Date(Date.now()-FOLLOW_LOOKBACK_MS).toISOString();
  if(!follow.tags.length)follow=FOLLOW_EMPTY();
  saveFollow();
}
function markStoriesSeen(list){
  const ids=list.map(n=>n.id).filter(id=>!follow.seen.includes(id));
  if(!ids.length)return;
  follow.seen=follow.seen.concat(ids);
  saveFollow();
}
/* Once content is loaded: drop follows of tags the club has since deleted, and "seen" ids of
   stories since deleted (so neither list grows for ever), then put the unread count on every
   Club News link and a dot on the phone menu button, since on a phone the link itself is hidden
   in the menu. */
function renderFollowBadge(){
  const refs=newsTagList().map(t=>t.ref);
  const tags=follow.tags.filter(r=>refs.includes(r));
  const seen=follow.seen.filter(id=>DB.feed.some(n=>n.id===id));
  if(tags.length!==follow.tags.length||seen.length!==follow.seen.length){
    follow=tags.length?{...follow,tags,seen}:FOLLOW_EMPTY();
    saveFollow();
  }
  const n=followUnread().length;
  const label=`${n} new ${n===1?"story":"stories"} for you`;
  document.querySelectorAll('nav.main a[href="news"]').forEach(a=>{
    let b=a.querySelector(".nav-badge");
    if(!n){if(b)b.remove();return;}
    if(!b){b=document.createElement("span");b.className="nav-badge";a.appendChild(b);}
    b.textContent=n>9?"9+":n;
    b.setAttribute("aria-label",label);
  });
  const burger=$("#burger");
  if(burger){
    burger.classList.toggle("has-unread",n>0);
    burger.setAttribute("aria-label",n?`Open menu (${label})`:"Open menu");
  }
}
/* The News page's follow panel: folded away to one line so it doesn't push the news down on a
   phone. Squads and the club's own tags are listed as two groups. */
let followPanelOpen=false;
/* The iPhone warning only matters in Safari itself -- the Home Screen app keeps its data. */
const FOLLOW_IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const FOLLOW_INSTALLED=matchMedia("(display-mode: standalone)").matches||!!navigator.standalone;
function renderFollowPanel(){
  const el=$("#followPanel");
  if(!el)return;
  const all=newsTagList();
  el.hidden=!all.length;
  if(!all.length)return;
  const unread=followUnread().length;
  const followed=all.filter(t=>follow.tags.includes(t.ref));
  const summary=followed.length
    ?`<span class="follow-sum-label">Following</span> <span class="follow-sum-names">${esc(followed.map(t=>t.name).join(", "))}</span>`
    :`<span class="follow-sum-label">Follow what matters to you</span> <span class="follow-sum-names">Your squads, trips and more</span>`;
  const group=(label,list)=>list.length?`<p class="follow-group">${label}</p><div class="follow-chips">${list.map(t=>{const on=follow.tags.includes(t.ref);
    return `<button type="button" class="news-tag-chip follow-chip${on?" active":""}" data-follow="${esc(t.ref)}" aria-pressed="${on}">${on?"✓ ":""}${esc(t.name)}</button>`;}).join("")}</div>`:"";
  el.innerHTML=`<details class="follow-panel"${followPanelOpen?" open":""}>
    <summary><span class="follow-bell" aria-hidden="true">🔔</span><span class="follow-sum">${summary}</span>${unread?`<span class="follow-new">${unread} new</span>`:""}</summary>
    <div class="follow-body">
      <p class="follow-note">Tap anything you want to follow. Those stories get a <b>For you</b> label, and new ones show a count on Club News. No sign-up, and nothing is sent to us.</p>
      ${group("Squads",all.filter(t=>t.squad))}
      ${group("Topics",all.filter(t=>!t.squad))}
      ${unread?`<button type="button" class="btn small ghost follow-read" id="followMarkRead">Mark ${unread} as read</button>`:""}
      <div class="follow-warn">
        <p class="follow-warn-head">⚠️ Saved on this device only</p>
        <ul>
          <li><b>Other phones, tablets or computers</b> won't know what you follow &mdash; set it up on each one.</li>
          <li><b>Clearing your browsing data</b> (history, cookies or site data) wipes it, and so does a <b>private / incognito</b> window.</li>
          <li><b>A different browser</b> on this device (say Chrome instead of Safari) starts from scratch too.</li>
          ${FOLLOW_IOS&&!FOLLOW_INSTALLED?`<li><b>On iPhone and iPad</b>, Safari forgets it if you don't visit for about a week. Add this site to your Home Screen (Share → <i>Add to Home Screen</i>) and open it from there to keep it.</li>`:""}
        </ul>
        <p class="follow-warn-foot">If your tags ever disappear, just tick them again here.</p>
      </div>
    </div>
  </details>`;
  el.querySelector("details").addEventListener("toggle",e=>{followPanelOpen=e.target.open;});
}
document.addEventListener("click",e=>{
  const chip=e.target.closest("[data-follow]");
  if(chip){
    toggleFollow(chip.dataset.follow);
    renderFollowPanel();renderNews();renderFollowBadge();
    return;
  }
  if(e.target.closest("#followMarkRead")){
    markStoriesSeen(followUnread());
    renderFollowPanel();renderNews();renderFollowBadge();
    toast("All caught up");
  }
});

/* ================= NEWS TIMELINE =================
   Club News reads as one scroller running backwards through time: whatever landed in the last
   week sits at the top, the rest of the current month under it, then a deliberate full-width
   break ("Previous history") before the month-by-month archive. The break matters -- without it
   a reader scrolling past this week's two stories has no way to tell that what follows is old
   news rather than more of the same. The sticky bar above the timeline is the way back and
   forth through it: Newer/Older step between periods, and the chips jump straight to one.

   Stories and training changes are placed by publish date (publishedOn, core.js), so something
   announced today about a date weeks away still lands under "This week". Eras are assigned by
   decreasing recency and rendered in that order, so the page is always strictly newest-first
   even when a month boundary falls mid-week. */
const NEWS_MS_DAY=86400000;
function newsEraFor(iso,today){
  const d=new Date(iso+"T12:00:00");
  const days=Math.round((today-d)/NEWS_MS_DAY);
  if(days<0)return {key:"ahead",label:"Coming up",chip:"Coming up",recent:true};
  if(days<7)return {key:"week",label:"This week",chip:"This week",recent:true};
  if(d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth())
    return {key:"month",label:"Earlier this month",chip:"This month",recent:true};
  const sameYear=d.getFullYear()===today.getFullYear();
  return {key:iso.slice(0,7),label:d.toLocaleDateString("en-GB",{month:"long",year:"numeric"}),
    chip:d.toLocaleDateString("en-GB",sameYear?{month:"short"}:{month:"short",year:"2-digit"}),recent:false};
}
function newsCard(n,featured){
  const r=resolveNewsImage(n.img);
  const thumb=r?`<div class="news-thumb ${r.cls}" style="${r.style}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
  const posted=publishedOn(n);
  /* A training change has no article of its own: the card says when it applies and points at the calendar. */
  if(n.type==="training"){
    const when=fmtDate(n.start)+(n.end&&n.end!==n.start?" – "+fmtDate(n.end):"");
    return `<article class="card news-card tap-card${featured?" is-latest":""}">${thumb}<p class="eyebrow">Training change</p>
    <h3 style="font-size:1.05rem;margin-top:6px">${esc(n.title)}</h3>
    <p class="news-date"><time datetime="${esc(posted)}">${fmtDate(posted)}</time> · Applies ${esc(when)}</p>
    ${n.note?`<p style="color:var(--muted);font-size:.9rem;margin-top:8px">${esc(n.note)}</p>`:""}
    <div style="margin-top:14px">${cardLink('href="club-calendar"','<span class="btn small ghost">Club calendar →</span>')}</div></article>`;
  }
  const forWho=storySquadLabel(n);
  const about=n.start>posted?` · About ${fmtDate(n.start)}`:"";
  const pin=heroPinned(n)?`<span class="news-mark pin">📌 Pinned</span>`:"";
  const mine=followedStory(n)?`<span class="news-mark mine">For you</span>${unreadStory(n)?`<span class="news-mark new">New</span>`:""}`:"";
  const marks=pin||mine?`<p class="news-marks">${pin}${mine}</p>`:"";
  return `<article class="card news-card tap-card${featured?" is-latest":""}${followedStory(n)?" is-mine":""}">${thumb}${marks}<p class="eyebrow">${esc(storyTopicLabel(n))}</p>
    <h3 style="font-size:1.05rem;margin-top:6px">${esc(n.title)}</h3>
    <p class="news-date"><time datetime="${esc(posted)}">${fmtDate(posted)}</time>${about}${forWho?` · For ${esc(forWho)}`:""}</p>
    <p style="color:var(--muted);font-size:.9rem;margin-top:8px">${esc(n.blurb)}</p>
    <div style="margin-top:14px">${cardLink(`href="article?id=${n.id}"`,'<span class="btn small ghost">Read more →</span>')}</div></article>`;
}
function renderNews(){
  if(!$("#newsList"))return;
  /* Training changes are club news too, so they run in the same timeline. */
  const all=DB.feed.filter(it=>(it.type==="news"||it.type==="training")&&it.start).sort(newestFirst);
  /* A chip for every tag at least one story has -- the club's topics first, then squads. */
  const tags=newsTagList().filter(t=>all.some(n=>(n.topics||[]).includes(t.ref)));
  const mine=follow.tags.length>0;
  if(newsTagFilter===NEWS_MINE?!mine:newsTagFilter&&!tags.some(t=>t.ref===newsTagFilter))newsTagFilter=null;
  if($("#newsTagChips")){
    $("#newsTagChips").innerHTML=[`<button type="button" class="news-tag-chip${newsTagFilter?"":" active"}" data-tag="">All</button>`]
      .concat(mine?[`<button type="button" class="news-tag-chip chip-mine${newsTagFilter===NEWS_MINE?" active":""}" data-tag="${NEWS_MINE}">Following</button>`]:[])
      .concat(tags.map(t=>`<button type="button" class="news-tag-chip${t.ref===newsTagFilter?" active":""}" data-tag="${esc(t.ref)}">${esc(t.name)}</button>`)).join("");
  }
  const list=newsTagFilter===NEWS_MINE?all.filter(followedStory):newsTagFilter?all.filter(n=>(n.topics||[]).includes(newsTagFilter)):all;
  if(!list.length){
    const tagName=newsTagFilter&&(tags.find(t=>t.ref===newsTagFilter)||{}).name;
    $("#newsList").innerHTML=`<p style="color:var(--muted)">${newsTagFilter===NEWS_MINE?"No stories for what you follow yet — they'll show here when there are."
      :newsTagFilter?`No news articles tagged "${esc(tagName)}" yet.`:"No news articles yet."}</p>`;
    renderNewsJump([]);
    return;
  }
  const today=new Date(isoToday()+"T12:00:00");
  /* A pinned story sits above everything while its pin is in date, then drops back to its date. */
  const pinned=list.filter(heroPinned);
  const eras=pinned.length?[{key:"pinned",label:"Pinned",chip:"📌 Pinned",recent:true,items:pinned}]:[];
  list.filter(n=>!pinned.includes(n)).forEach(n=>{
    const era=newsEraFor(publishedOn(n),today);
    const last=eras[eras.length-1];
    if(last&&last.key===era.key)last.items.push(n);
    else eras.push(Object.assign({items:[n]},era));
  });
  const recent=eras.filter(e=>e.recent),archive=eras.filter(e=>!e.recent);
  const block=(e,featured)=>`<section class="news-era" id="news-era-${esc(e.key)}" aria-labelledby="news-era-${esc(e.key)}-h">
      <div class="news-era-head"><h3 id="news-era-${esc(e.key)}-h">${esc(e.label)}</h3>
        <span class="news-era-count">${e.items.length} ${e.items.length===1?"story":"stories"}</span></div>
      <div class="grid cols-3">${e.items.map(n=>newsCard(n,featured)).join("")}</div>
    </section>`;
  /* The break divides two halves of one list, so it only earns its space when there is
     something on both sides of it. With no recent news at all the archive simply opens the
     page, under a line saying why. */
  let html=recent.map((e,i)=>block(e,i===0)).join("");
  if(archive.length){
    html+=recent.length
      ? `<div class="news-break"><span class="news-break-label">Previous history</span>
           <p class="news-break-note">Everything below is older news, most recent first.</p></div>`
      : `<p class="news-break-note news-break-note-solo">Nothing new in the past month — here is what came before.</p>`;
    html+=archive.map(e=>block(e,false)).join("");
  }
  $("#newsList").innerHTML=html;
  renderNewsJump(eras);
}

/* ---- the sticky period bar ---- */
let newsEraKeys=[];
function renderNewsJump(eras){
  const bar=$("#newsJump"),chips=$("#newsJumpChips");
  if(!bar||!chips)return;
  newsEraKeys=eras.map(e=>e.key);
  /* One period is the whole page -- nothing to jump between. */
  bar.hidden=eras.length<2;
  setHeaderVar();
  chips.innerHTML=eras.map((e,i)=>`<button type="button" class="news-jump-chip${i===0?" active":""}" data-era="${esc(e.key)}">${esc(e.chip)}</button>`).join("");
  newsJumpSpy();
}
/* The header is sticky and its height changes with the logo at each breakpoint, so the CSS
   cannot hard-code where the period bar should stick. Publish the measured height instead. */
function setHeaderVar(){
  const h=document.querySelector("header.site");
  if(h)document.documentElement.style.setProperty("--hdr-h",h.offsetHeight+"px");
}
window.addEventListener("resize",setHeaderVar);
window.addEventListener("load",setHeaderVar);
const newsEraEl=key=>document.getElementById("news-era-"+key);
function newsScrollToEra(key){
  const el=newsEraEl(key);
  if(el)el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
}
/* The "current" period is the last heading to have passed under the sticky bar -- the one the
   reader is actually inside. An IntersectionObserver would instead fire on whichever heading
   happened to cross the viewport first, which on a fast flick lights up the wrong chip. */
let newsSpyQueued=false;
function newsJumpSpy(){
  const bar=$("#newsJump");
  if(!bar||bar.hidden||!newsEraKeys.length)return;
  const line=(document.querySelector("header.site")?.offsetHeight||0)+bar.offsetHeight+14;
  let current=newsEraKeys[0];
  newsEraKeys.forEach(k=>{const el=newsEraEl(k);if(el&&el.getBoundingClientRect().top<=line)current=k;});
  document.querySelectorAll("#newsJumpChips .news-jump-chip").forEach(c=>c.classList.toggle("active",c.dataset.era===current));
  const i=newsEraKeys.indexOf(current);
  const newer=bar.querySelector('.news-jump-arrow[data-dir="newer"]'),older=bar.querySelector('.news-jump-arrow[data-dir="older"]');
  if(newer)newer.disabled=i<=0;
  if(older)older.disabled=i>=newsEraKeys.length-1;
  const active=$("#newsJumpChips .news-jump-chip.active");
  if(active)active.scrollIntoView({block:"nearest",inline:"nearest"});
}
window.addEventListener("scroll",()=>{
  if(newsSpyQueued)return;
  newsSpyQueued=true;
  requestAnimationFrame(()=>{newsSpyQueued=false;newsJumpSpy();});
},{passive:true});
window.addEventListener("resize",newsJumpSpy);
document.addEventListener("click",e=>{
  const chip=e.target.closest("#newsTagChips .news-tag-chip");
  if(chip){
    newsTagFilter=chip.dataset.tag||null;
    renderNews();
    /* Filtering can shorten the page under a reader who is deep in the archive, leaving them
       below everything that is left. Put them back at the top of the list they just asked for. */
    setHeaderVar();
    const anchor=$("#newsTagChips");
    if(anchor)window.scrollTo({top:Math.max(0,anchor.getBoundingClientRect().top+window.scrollY-((document.querySelector("header.site")?.offsetHeight||0)+14)),behavior:"auto"});
    return;
  }
  const jump=e.target.closest("#newsJumpChips .news-jump-chip");
  if(jump){newsScrollToEra(jump.dataset.era);return;}
  const arrow=e.target.closest(".news-jump-arrow");
  if(!arrow||!newsEraKeys.length)return;
  const active=$("#newsJumpChips .news-jump-chip.active");
  const i=newsEraKeys.indexOf(active?active.dataset.era:newsEraKeys[0]);
  const next=i+(arrow.dataset.dir==="older"?1:-1);
  if(next>=0&&next<newsEraKeys.length)newsScrollToEra(newsEraKeys[next]);
});

/* Which view of the slideshow this visitor picked (HERO_VIEWS in core.js), kept in this browser. */
const HERO_VIEW_KEY="bpsc_hero_view";
let heroView="all";
try{const v=localStorage.getItem(HERO_VIEW_KEY);if(HERO_VIEWS.some(x=>x.key===v))heroView=v;}catch(e){}
function renderHeroViews(){
  if(!$("#heroViews"))return;
  $("#heroViews").innerHTML=HERO_VIEWS.map(v=>
    `<button type="button" class="hero-view${v.key===heroView?" active":""}" data-view="${v.key}" aria-pressed="${v.key===heroView}">${esc(v.label)}</button>`).join("");
}
document.addEventListener("click",e=>{
  const b=e.target.closest("#heroViews .hero-view");
  if(!b||b.dataset.view===heroView)return;
  heroView=b.dataset.view;
  try{localStorage.setItem(HERO_VIEW_KEY,heroView);}catch(err){}
  renderHeroFeed();
});
/* A narrowed view can come up empty (a quiet week) -- say so in a slide rather than show nothing. */
const HERO_EMPTY={
  week:{tag:"This Week",title:"A quiet week",blurb:"Nothing on the calendar and no new stories in the past 7 days.",linkAttrs:'href="club-calendar"',more:"See the calendar →"},
  all:{tag:"Club News",title:"No news yet",blurb:"Stories will show here as soon as they're posted.",linkAttrs:'href="news"',more:"Club News →"}
};
function renderHeroFeed(){
  if(!$("#heroSlides"))return;
  renderHeroViews();
  const items=heroFeedItems(DB.feed,heroView);
  const empty=!items.length&&HERO_EMPTY[heroView];
  if(empty){
    $("#heroSlides").innerHTML=`<div class="hero-slide" style="background:${HERO_SLIDE_BG[0]}">
      <div class="hero-news-card tap-card"><p class="eyebrow">${esc(empty.tag)}</p><h3>${esc(empty.title)}</h3>
        <p>${esc(empty.blurb)}</p>${cardLink(empty.linkAttrs,empty.more)}</div></div>`;
    $("#heroDots").innerHTML="";
    heroIndex=0;updateHeroSlide();restartHeroAuto();
    return;
  }
  $("#heroSlides").innerHTML=items.map((it,i)=>{
    const c=heroFeedContent(it);
    /* An article with a gallery shows all of it here, cross-fading (see cycleHeroPhotos);
       anything else shows its single picture, or a club gradient if it has none. Either screen
       can have its own pictures instead (feed.hero_photos) -- then both sets are drawn and CSS
       shows the one for the screen size. */
    const base=(it.photos||[]).length?it.photos:[c.img];
    const layersOf=list=>list.map(src=>resolveNewsImage(src,"hero")).filter(Boolean);
    const mediaOf=(layers,cls)=>layers.length?`<div class="hero-slide-media${cls}">${layers.map((r,j)=>
      `<div class="hero-slide-photo${j===0?" show":""} ${r.cls}" style="${r.style}"></div>`).join("")}</div>`:"";
    const own=it.heroPhotos||{};
    const wide=layersOf(own.hd?.length?own.hd:base),narrow=layersOf(own.hp?.length?own.hp:base);
    const media=own.hd?.length||own.hp?.length?mediaOf(wide," only-wide")+mediaOf(narrow," only-narrow"):mediaOf(wide,"");
    return `
    <div class="hero-slide" style="background:${wide.length||narrow.length?"#101014":HERO_SLIDE_BG[i%HERO_SLIDE_BG.length]}">
      ${media}
      <div class="hero-news-card tap-card${heroCardClasses(it.heroCard)}">
        <p class="eyebrow">${esc(c.tag)}</p>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.blurb)}</p>
        ${cardLink(c.linkAttrs,"Read more →")}
      </div>
    </div>`;
  }).join("");
  $("#heroDots").innerHTML=items.map((_,i)=>`<button class="hero-dot" data-i="${i}" aria-label="Story ${i+1} of ${items.length}"></button>`).join("");
  heroIndex=0;
  updateHeroSlide();
  restartHeroAuto();
}
function updateHeroSlide(){
  const n=$("#heroSlides").children.length;
  if(!n)return;
  heroIndex=Math.max(0,Math.min(heroIndex,n-1));
  const strip=$("#heroPhotoStrip");
  const track=$("#heroSlides");
  const slideEl=track.children[heroIndex];
  if(slideEl){
    const stripW=strip.getBoundingClientRect().width;
    const slideW=slideEl.getBoundingClientRect().width;
    const inset=(stripW-slideW)/2;
    const maxOffset=Math.max(track.scrollWidth-stripW,0);
    const offset=Math.min(slideEl.offsetLeft-inset,maxOffset);
    track.style.transform=`translateX(${-offset}px)`;
    $("#heroPrev").style.left=`${Math.max(inset+10,10)}px`;
    $("#heroNext").style.right=`${Math.max(inset+10,10)}px`;
  }
  document.querySelectorAll(".hero-slide").forEach((s,i)=>s.classList.toggle("active",i===heroIndex));
  document.querySelectorAll(".hero-dot").forEach((d,i)=>d.classList.toggle("active",i===heroIndex));
  $("#heroPrev").disabled=heroIndex===0;
  $("#heroNext").disabled=heroIndex===n-1;
}
/* Only the slide in front cycles -- the ones either side are blurred out anyway. Each set of
   pictures in it (computer and phone, when they differ) steps on independently. */
const HERO_PHOTO_MS=7000;
function cycleHeroPhotos(){
  if(document.hidden)return;
  document.querySelectorAll(".hero-slide.active .hero-slide-media").forEach(media=>{
    const photos=[...media.querySelectorAll(".hero-slide-photo")];
    if(photos.length<2)return;
    const cur=photos.findIndex(el=>el.classList.contains("show"));
    const old=photos[cur],next=photos[(cur+1)%photos.length];
    /* keep the old one fully shown beneath until the new one has finished fading in over it */
    if(old){old.classList.add("was");old.classList.remove("show");setTimeout(()=>old.classList.remove("was"),1700);}
    next.classList.add("show");
  });
}
/* The stories themselves step on every HERO_AUTO_MS, wrapping from the last back to the first.
   It holds while the pointer or keyboard focus is on the strip (someone's reading or about to
   click), and any manual move restarts the count so the next story doesn't jump in straight after. */
function restartHeroAuto(){
  clearInterval(heroAutoTimer);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  heroAutoTimer=setInterval(()=>{
    const n=$("#heroSlides").children.length;
    if(document.hidden||heroHeld||n<2)return;
    heroIndex=(heroIndex+1)%n;
    updateHeroSlide();
  },HERO_AUTO_MS);
}
if($("#heroPhotoStrip")){
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches)setInterval(cycleHeroPhotos,HERO_PHOTO_MS);
  $("#heroPrev").addEventListener("click",()=>{heroIndex--;updateHeroSlide();restartHeroAuto();});
  $("#heroNext").addEventListener("click",()=>{heroIndex++;updateHeroSlide();restartHeroAuto();});
  $("#heroDots").addEventListener("click",e=>{const b=e.target.closest(".hero-dot");if(b){heroIndex=+b.dataset.i;updateHeroSlide();restartHeroAuto();}});
  const strip=$("#heroPhotoStrip");
  /* mouse only: a tap on a phone fires an enter with no leave, which would stall it for good */
  strip.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")heroHeld=true;});
  strip.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"){heroHeld=false;restartHeroAuto();}});
  /* keyboard focus only (:focus-visible) -- a tapped arrow keeps focus too, and shouldn't stop it */
  strip.addEventListener("focusin",e=>{if(e.target.matches(":focus-visible"))heroHeld=true;});
  strip.addEventListener("focusout",e=>{if(!strip.contains(e.relatedTarget)){heroHeld=false;restartHeroAuto();}});
  let heroResizeTimer;
  window.addEventListener("resize",()=>{clearTimeout(heroResizeTimer);heroResizeTimer=setTimeout(updateHeroSlide,100);});
}
(function(){
  const strip=$("#heroPhotoStrip");
  if(!strip)return;
  let startX=0,deltaX=0,dragging=false;
  strip.addEventListener("touchstart",e=>{startX=e.touches[0].clientX;dragging=true;},{passive:true});
  strip.addEventListener("touchmove",e=>{if(!dragging)return;deltaX=e.touches[0].clientX-startX;},{passive:true});
  strip.addEventListener("touchend",()=>{if(!dragging)return;dragging=false;
    if(deltaX<-40)heroIndex++;else if(deltaX>40)heroIndex--;
    deltaX=0;updateHeroSlide();restartHeroAuto();});
})();
(function(){
  const title=$("#heroTitle");
  if(!title)return;
  let showingAlt=false,autoTimer=null;
  function swap(){
    showingAlt=!showingAlt;
    title.innerHTML=showingAlt?title.dataset.textB:title.dataset.textA;
    title.classList.toggle("alt-text",showingAlt);
  }
  function resetAutoSwap(){
    clearInterval(autoTimer);
    autoTimer=setInterval(swap,30000);
  }
  title.addEventListener("click",()=>{swap();resetAutoSwap();});
  title.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();swap();resetAutoSwap();}
  });
  resetAutoSwap();
})();
/* Single article page (article.html?id=…): news & socials only — meets have their own detail
   page (Open Meets) and don't go through here. */
function renderArticle(){
  const view=$("#articleView");
  if(!view)return;
  const id=+(new URLSearchParams(location.search).get("id"));
  const it=DB.feed.find(x=>x.id===id&&(x.type==="news"||x.type==="social"));
  if(!it){
    view.innerHTML=`<div class="page-head">
      <p class="eyebrow">Not found</p>
      <h2 class="display">Article not found</h2>
      <p style="color:var(--muted);margin-top:10px">It may have been removed, or the link is out of date.</p>
      <div style="margin-top:18px"><a class="btn small" href="news">Back to Club News</a></div>
    </div>`;
    return;
  }
  document.title=`${it.title} — Basildon & Phoenix Swimming Club`;
  if(followedStory(it))markStoriesSeen([it]);
  const back=it.type==="social"?{href:"club-calendar",label:"← Back to Club Calendar"}:{href:"news",label:"← Back to Club News"};
  view.innerHTML=articleContentHtml(it)
    +(it.link?`<div style="margin-top:18px"><a class="btn small" href="${esc(it.link)}" target="_blank" rel="noopener">Details / tickets →</a></div>`:"")
    +`<div style="margin-top:28px"><a class="btn small ghost" href="${back.href}">${back.label}</a></div>`;
  wireArticleGallery((it.photos||[]).length);
}
/* ================= PROUD PARTNERS =================
   The strip under the header. Every page's HTML carries a copy of the list, so the strip is
   never empty while the database loads (or if the partners table hasn't been set up); once the
   real list arrives it replaces that copy. The last list seen is kept in this browser and drawn
   straight away on the next page, so a changed partner doesn't flash up as the old one first.
   Two copies of the list are drawn: phones scroll them end to end as a ticker (see site.css). */
const PARTNERS_KEY="bpsc_partners_v1";
function renderPartners(list){
  const strip=document.querySelector(".partners"),track=strip&&strip.querySelector(".logos-track");
  if(!track||!list)return;
  strip.hidden=!list.length;
  const copy=hidden=>`<div class="logos"${hidden?' aria-hidden="true"':""}>${list.map(p=>{
    const href=partnerUrl(p.url);
    return href?`<a href="${esc(href)}"${hidden?' tabindex="-1"':""} target="_blank" rel="noopener">${esc(p.name)}</a>`:`<a>${esc(p.name)}</a>`;
  }).join("")}</div>`;
  track.innerHTML=copy(false)+copy(true);
}
try{renderPartners(JSON.parse(localStorage.getItem(PARTNERS_KEY)));}catch(e){}
function renderPartnersFromDb(){
  if(!DB.partners)return;
  renderPartners(DB.partners);
  try{localStorage.setItem(PARTNERS_KEY,JSON.stringify(DB.partners.map(({name,url})=>({name,url}))));}catch(e){}
}

/* ================= MEMBER GUIDES =================
   Each guide is a tab over one panel area. The page's HTML carries a copy of the guides, so the
   page is never empty while the database loads (or before migration 020 is run); once the real
   list arrives it's redrawn from that, and the last list seen is kept in this browser like the
   partners strip. The hash picks the tab (member-guides#gala-entry), so a link or bookmark can
   land on any guide; switching rewrites it with replaceState rather than a jump. Links between
   guides are plain #hash links, picked up by hashchange, which brings the tab bar into view. */
const GUIDES_KEY="bpsc_guides_v1";
const guideBar=$("#guideTabs");
const guideTabs=()=>[...guideBar.querySelectorAll("[data-tab]")];
function showGuide(name,{focus=false,setHash=true}={}){
  const tabs=guideTabs();
  if(!tabs.some(t=>t.dataset.tab===name))name=tabs.length?tabs[0].dataset.tab:"";
  tabs.forEach(t=>{
    const on=t.dataset.tab===name,panel=document.getElementById("panel-"+t.dataset.tab);
    t.classList.toggle("active",on);
    t.setAttribute("aria-selected",on?"true":"false");
    t.tabIndex=on?0:-1;
    if(panel)panel.hidden=!on;
    if(on&&focus)t.focus();
  });
  if(setHash&&name)history.replaceState(null,"","#"+name);
}
const guideFromHash=()=>decodeURIComponent(location.hash.slice(1));
const hashIsGuide=()=>guideTabs().some(t=>t.dataset.tab===guideFromHash());
function renderGuides(list){
  const wrap=$("#guidePanels");
  /* no sanitizer, no guides: keep the page's own copy rather than blanking it */
  if(!guideBar||!wrap||!list||!window.DOMPurify)return;
  /* the address can name a guide the old tabs didn't have (one just added), so check the new list */
  const open=guideBar.querySelector('[aria-selected="true"]'),want=guideFromHash();
  const hashed=list.some(g=>g.slug===want),keep=hashed?want:open&&open.dataset.tab;
  guideBar.innerHTML=list.map(g=>`<button type="button" role="tab" data-tab="${esc(g.slug)}" id="tab-${esc(g.slug)}" aria-controls="panel-${esc(g.slug)}">${esc(g.title)}</button>`).join("");
  guideBar.hidden=!list.length;
  wrap.innerHTML=list.length?list.map(g=>`<div class="card guide-panel" id="panel-${esc(g.slug)}" role="tabpanel" aria-labelledby="tab-${esc(g.slug)}" tabindex="0" hidden>
      <h3 class="display">${esc(guideHeading(g.title))}</h3>
      <div class="guide-doc">${sanitizeGuideHtml(g.body)}</div>
    </div>`).join(""):`<p style="color:var(--muted)">No guides have been published yet.</p>`;
  showGuide(keep,{setHash:hashed});
}
if(guideBar){
  try{renderGuides(JSON.parse(localStorage.getItem(GUIDES_KEY)));}catch(e){}
  guideBar.addEventListener("click",e=>{const t=e.target.closest("[data-tab]");if(t)showGuide(t.dataset.tab);});
  guideBar.addEventListener("keydown",e=>{
    if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
    e.preventDefault();
    const tabs=guideTabs(),i=tabs.indexOf(document.activeElement);
    showGuide(tabs[(i+(e.key==="ArrowRight"?1:tabs.length-1))%tabs.length].dataset.tab,{focus:true});
  });
  window.addEventListener("hashchange",()=>{
    if(!hashIsGuide())return;
    showGuide(guideFromHash());
    guideBar.scrollIntoView({behavior:"smooth",block:"start"});
  });
  if(hashIsGuide())showGuide(guideFromHash());
}
function renderGuidesFromDb(){
  if(!DB.guides)return;
  renderGuides(DB.guides);
  try{localStorage.setItem(GUIDES_KEY,JSON.stringify(DB.guides.map(({slug,title,body})=>({slug,title,body}))));}catch(e){}
}

function renderAllPublic(){renderPartnersFromDb();renderGuidesFromDb();renderMeets();renderCoaches();renderTimetable();renderRoles();renderSocials();renderNews();renderHeroFeed();renderArticle();renderWelfare();renderCommittee();renderFollowPanel();renderFollowBadge();if(typeof renderPathway==="function")renderPathway();}

/* ================= NAV ================= */
const infoDropdown=$("#infoDropdown"), infoToggle=$("#infoToggle");
function closeInfoMenu(){infoDropdown.classList.remove("open");infoToggle.setAttribute("aria-expanded","false");}
infoToggle.addEventListener("click",e=>{
  e.stopPropagation();
  const open=infoDropdown.classList.toggle("open");
  infoToggle.setAttribute("aria-expanded",String(open));
});
document.addEventListener("click",e=>{
  if(infoDropdown.classList.contains("open") && !infoDropdown.contains(e.target)) closeInfoMenu();
});
const quickLinks=$("#quickLinks"), quickLinksToggle=$("#quickLinksToggle");
if(quickLinks&&quickLinksToggle){
  const closeQuickLinks=()=>{quickLinks.classList.remove("open");quickLinksToggle.setAttribute("aria-expanded","false");};
  quickLinksToggle.addEventListener("click",e=>{
    e.stopPropagation();
    const open=quickLinks.classList.toggle("open");
    quickLinksToggle.setAttribute("aria-expanded",String(open));
  });
  quickLinks.querySelectorAll("#quickLinksMenu a, #quickLinksMenu button").forEach(el=>el.addEventListener("click",closeQuickLinks));
  document.addEventListener("click",e=>{
    if(quickLinks.classList.contains("open") && !quickLinks.contains(e.target)) closeQuickLinks();
  });
}
/* The drawer hangs off a sticky header that may sit below the prototype banner, so how much
   room it actually has is only knowable at open time -- a pure-CSS cap has to assume the header
   is already pinned to the top, which on a short phone pushes "Join Us" off the bottom. */
const mainNav=$("#mainNav");
function sizeDrawer(){
  if(!mainNav.classList.contains("open"))return;
  const top=mainNav.getBoundingClientRect().top;
  mainNav.style.setProperty("--drawer-max",Math.max(200,window.innerHeight-top-10)+"px");
}
$("#burger").addEventListener("click",()=>{
  mainNav.classList.toggle("open");
  $("#burger").setAttribute("aria-expanded",mainNav.classList.contains("open"));
  sizeDrawer();
});
window.addEventListener("resize",sizeDrawer);
window.addEventListener("scroll",sizeDrawer,{passive:true});

/* ================= JOIN FORM → INBOX ================= */
function submitEnquiry(e,type,detailFn){
  e.preventDefault();
  const f=new FormData(e.target);
  DB.enquiries.unshift({id:Date.now(),parent:f.get("parent"),email:f.get("email"),swimmer:f.get("swimmer"),dob:f.get("dob"),type,detail:detailFn(f),notes:f.get("notes"),received:"Just now"});
  saveEnquiries();
  e.target.reset();
  toast("Enquiry sent — the membership team will be in touch");
}
if($("#joinLessons")){
  document.querySelectorAll(".path-card").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".path-card").forEach(x=>x.classList.toggle("sel",x===b));
    const p=b.dataset.path;
    $("#joinLessons").hidden = p!=="lessons";
    $("#joinCompetitive").hidden = p!=="competitive";
    $("#joinMasters").hidden = p!=="masters";
  }));
  /* default pathway so a form is always visible and swaps in place */
  document.querySelector('.path-card[data-path="lessons"]').classList.add("sel");
  $("#joinLessons").hidden=false;
  $("#joinLessons").addEventListener("submit",e=>submitEnquiry(e,"Academy / lessons",f=>f.get("stage")));
  $("#joinCompetitive").addEventListener("submit",e=>submitEnquiry(e,"Competitive trial",f=>`SE ${f.get("seNo")} · ${f.get("level")}`));
  $("#joinMasters").addEventListener("submit",e=>submitEnquiry(e,"Masters",()=>"Masters enquiry"));
}

if($("#roleCatTabs")){
  document.querySelectorAll("#roleCatTabs .path-card").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("#roleCatTabs .path-card").forEach(x=>{
      x.classList.toggle("sel",x===b);
      x.setAttribute("aria-pressed",x===b?"true":"false");
    });
    applyRoleCatFilter();
  }));
  /* Volunteering is the widest-appeal tab -- default open so a first-time visitor always
     sees roles straight away rather than an empty grid. */
  const defaultTab=document.querySelector('#roleCatTabs .path-card[data-cat="volunteering"]');
  defaultTab.classList.add("sel");
  defaultTab.setAttribute("aria-pressed","true");
}

/* ================= HOMEPAGE V1 / V2 (CLUB PULSE) =================
   V2 is the homepage that knows what's on at the club today, and is what every visitor gets
   unless they pick Classic (V1, the homepage as it was) with the switch under the slideshow. It is
   one page: the V2 parts sit in index.html all along and site.css only shows them while the body
   has .home-v2, which a line at the top of index.html sets before anything is drawn (so the wrong
   version never flashes up first). The visitor's pick is kept in this browser; with no pick,
   data-home-default on index.html's <body> decides ("v2"). Remove #homeVersion to retire the
   switch. The navigation and every other page are untouched either way. */
const HOME_VERSION_KEY="bpsc_home_version",HOME_CONTEXT_KEY="bpsc_home_context";
const homePref=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const setHomePref=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const homeVersion=()=>{const v=homePref(HOME_VERSION_KEY);return v==="v1"||v==="v2"?v:document.body.dataset.homeDefault==="v2"?"v2":"v1";};
/* On a day something's on, V2 leads with it ("auto"); the visitor can put the ordinary homepage
   first instead ("normal"). Only the order of the homepage changes -- nothing is hidden for good. */
const homeContext=()=>homePref(HOME_CONTEXT_KEY)==="normal"?"normal":"auto";
/* "loading" until the content arrives, then "ready" -- or "failed", when V2 just steps aside. */
let pulseState="loading",pulseDay=null;
/* One part of the homepage going wrong mustn't stop the rest from drawing. */
function safely(fn){try{fn();}catch(e){console.error(e);}}

function syncHomeVersion(){
  const demo=homeDemo(),v2=!!demo||homeVersion()==="v2";
  document.body.classList.toggle("home-v2",v2);
  document.body.classList.toggle("home-demo",!!demo);
  const on=demo?"demo":v2?"v2":"v1";
  document.querySelectorAll("[data-home-version]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.homeVersion===on)));
  safely(renderClubPulse);
}

/* ---- Race Day demo ----
   For showing people what V2 does on a gala day, on any day. It lives in the address
   (?demo=race-day, or ?demo=home-meet for one with live results), not in the browser, so a demo
   link can be sent round, and nobody is left in demo mode by a refresh or a later visit. The sample
   gala is labelled as a sample; its outside links (live results, league, documents) don't go
   anywhere, and only Full meet details and the venue page are real. It changes nothing saved --
   not the V1/V2 choice, not the Race Day / Club Home choice. */
const HOME_DEMOS={"race-day":"Team gala, no live results","home-meet":"Home meet, live results","two-galas":"Two galas in one day"};
const homeDemo=()=>{const d=new URLSearchParams(location.search).get("demo");return HOME_DEMOS[d]?d:null;};
function setHomeDemo(d){
  const u=new URL(location.href);
  if(d)u.searchParams.set("demo",d);else u.searchParams.delete("demo");
  history.replaceState(null,"",u.pathname+u.search+u.hash);
}
let demoCtx="auto";
/* The sample galas for a demo, most important first. */
function demoEvents(key){
  const today=isoToday();
  const arena=venue=>({id:"demo-arena",demo:true,type:"teamMeet",title:"Arena League — Round 1",league:"Arena League",start:today,
    venue,poolType:"25m Short Course",leagueUrl:"#demo",
    notes:"Warm-up 17:00 · Racing 18:00. Team sheets have been emailed — please arrive by 16:45 in club kit.",
    docLinks:[{label:"Team sheet",url:"#demo"}]});
  if(key==="home-meet")return [{id:"demo-meet",demo:true,type:"meet",title:"BPSC Autumn Meet",start:today,end:isoShift(today,1),
    venue:"Basildon Sporting Village",poolType:"25m Short Course",liveUrl:"#demo",streamUrl:"#demo",notes:"Spectator seating opens at 08:15.",
    docLinks:[{label:"Programme",url:"#demo"},{label:"Visitor information",url:"#demo"}]}];
  if(key==="two-galas")return [{id:"demo-800",demo:true,type:"meet",title:"BPSC 800m Gala",start:today,
    venue:"Basildon Sporting Village",poolType:"25m Short Course",liveUrl:"#demo",notes:"Warm-up 08:00 · First heat 09:00. Lap counters needed — please see the programme.",
    docLinks:[{label:"Programme",url:"#demo"}]},arena("London Aquatics Centre")];
  return [arena("Basildon Sporting Village")];
}

/* Links in the panel come from what an editor typed; anything that isn't a plain link is dropped. */
const pulseHref=u=>{const s=String(u||"").trim();return s&&!/^(javascript|data|vbscript):/i.test(s)?s:"";};
const pulseLinkAttrs=it=>heroFeedContent(it).linkAttrs;
/* "Tomorrow", "Saturday" (this week), or "In 12 days" */
function pulseWhen(iso){
  const n=feedDaysBetween(isoToday(),iso);
  if(n===1)return "Tomorrow";
  if(n<7)return new Date(iso+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long"});
  return `In ${n} days`;
}

/* The buttons an event gets, built only from what's actually filled in -- never an empty button,
   never a made-up link. Live results only while the gala is on AND has a live link (meetLive):
   a pulsing button that goes nowhere is worse than no button. The live stream follows the same rule. */
function pulseActions(it){
  const out=[];
  const add=(href,label,o={})=>{const h=pulseHref(href);if(h&&label)out.push({href:h,label,...o});};
  if(meetLive(it))add(it.liveUrl,"Live results",{live:true,ext:true});
  if(meetStreaming(it))add(it.streamUrl,"Watch live stream",{stream:true,ext:true});
  const docs=(it.docLinks||[]).filter(l=>l&&pulseHref(l.url));
  docs.slice(0,3).forEach(l=>add(l.url,l.label||l.text||"Meet document"));
  if(it.leagueUrl)add(it.leagueUrl,"League information",{ext:true});
  if(it.type==="social"){
    if(it.link)add(it.link,"Details / tickets");
    add(`article?id=${it.id}`,"Event details");
  }
  if(isMeet(it))add("open-meets",docs.length>3?"All meet documents":"Full meet details");
  if(isHomeVenue(it))add("venue","Venue & getting here");
  return out;
}
function pulseButtons(list){
  return list.map((a,i)=>`<a class="btn small${a.live?" live":i===0?"":" ghost"}" href="${esc(a.href)}"${a.ext?' target="_blank" rel="noopener"':""}>${a.live?'<span class="live-dot" aria-hidden="true"></span>':a.stream?'<span class="stream-play" aria-hidden="true">▶</span>':""}${esc(a.label)}${a.ext?'<span class="sr-only"> (opens in a new tab)</span>':""}</a>`).join("");
}

const PULSE_STYLES={race:"Race Day",home_meet:"Home Meet",championship:"Championships"};
/* The event panel: what's on, where, and the ways into it. Wording keeps who's hosting clear --
   a county championship says who runs it rather than implying it's ours. */
/* idx 0 is the lead panel; any further gala on the same day gets a slimmer one below it (n of them
   at most -- PULSE_MAX_PANELS), with its own buttons, live results included. */
const PULSE_MAX_PANELS=3;
function pulseEventPanel(it,alsoToday,idx=0){
  const meet=isMeet(it),live=meetLive(it)||meetStreaming(it);
  const champs=/champ/i.test(it.title||"")||/regional|national/i.test(it.level||"");
  /* the editor's pick (homepageMode) wins; otherwise worked out from the gala */
  const tag=PULSE_STYLES[it.homepageMode]||(!meet?"Club Event":it.type==="meet"&&isHomeVenue(it)?"Home Meet":it.type==="externalMeet"&&champs?"Championships":"Race Day");
  const who=it.type==="teamMeet"?(it.league||"Team gala")
    :it.type==="meet"?"Hosted by BPSC"
    :it.type==="externalMeet"?(it.host?`Hosted by ${it.host}`:"Open meet")
    :"Club Calendar";
  const day=eventDayLabel(it);
  const dayText=day==="Today"?(meet?"Racing today":"Today"):day==="Under way"?`Under way · ${fmtDate(it.start)} – ${fmtDate(it.end)}`:day;
  const where=[it.venue?`${dayText} at ${it.venue}`:dayText,it.poolType||""].filter(Boolean).join(" · ");
  const note=meet?it.notes:it.blurb;
  const actions=pulseActions(it);
  const also=alsoToday.length?`<p class="pulse-also"><span>Also today:</span> ${alsoToday.map(x=>`<a ${pulseLinkAttrs(x)}>${esc(x.title)}</a>`).join(", ")}</p>`:"";
  const tid="pulseEventTitle"+(idx||"");
  return `<article class="pulse-event${live?" is-live":""}${idx?" is-secondary":""}" aria-labelledby="${tid}">
    <div class="pulse-event-main">
      <p class="pulse-event-tags"><span class="pulse-tag">${esc(tag)}</span>${live?'<span class="pulse-live-flag"><span class="live-dot" aria-hidden="true"></span>Live now</span>':""}<span class="pulse-who">${esc(who)}</span></p>
      <h3 class="display pulse-event-title" id="${tid}">${esc(it.title)}</h3>
      <p class="pulse-where">${esc(where)}</p>
      ${note?`<p class="pulse-note">${esc(note)}</p>`:""}
      ${also}
    </div>
    ${actions.length?`<div class="pulse-actions">${pulseButtons(actions)}</div>`:""}
  </article>`;
}

/* A training change is the first thing a parent needs on the day -- visible, but not an alarm. */
function pulseTrainingNotice(t){
  const when=!meetRunning(t)?"Tomorrow":t.end&&t.end!==t.start?`Today · until ${fmtDate(t.end)}`:"Today";
  return `<article class="pulse-notice tap-card">
    <p class="pulse-notice-k"><span class="pulse-notice-tag">Session update</span><span>${esc(when)}</span></p>
    <h3>${esc(t.title)}</h3>
    ${t.note?`<p class="pulse-notice-note">${esc(t.note)}</p>`:""}
    <div class="pulse-notice-foot">${cardLink('href="club-calendar"',"View details →")}</div>
  </article>`;
}

/* Today / Next / Results / This week: only the cells that have something real to say. While the
   event panel leads, "Today" is already said by it; on Club Home it's the one line that keeps
   the event in view. */
function pulseStrip(p,lead){
  const cell=(k,v,s,attrs,ext)=>`<a class="pulse-cell" ${attrs}${ext?' target="_blank" rel="noopener"':""}>
      <span class="pulse-k">${k}</span><span class="pulse-v">${esc(v)}</span>${s?`<span class="pulse-s">${esc(s)}${ext?'<span class="sr-only"> (opens in a new tab)</span>':""}</span>`:""}</a>`;
  const cells=[];
  if(!lead&&p.focus){
    const f=p.focus;
    const more=p.today.slice(1);
    cells.push(cell(p.today.some(x=>meetLive(x)||meetStreaming(x))?'<span class="live-dot" aria-hidden="true"></span>Today · live':"Today",f.title,
      more.length?`Also ${more.map(x=>x.title).join(", ")}`
        :[eventDayLabel(f)==="Today"?"":eventDayLabel(f),f.venue].filter(Boolean).join(" · ")||"See details →",pulseLinkAttrs(f)));
  }else if(!p.focus&&!p.training.length){
    cells.push(cell("Today","No training changes posted","Squad timetables →",'href="timetables"'));
  }
  if(p.next)cells.push(cell("Next",p.next.title,`${pulseWhen(p.nextDay)} · ${fmtDate(p.nextDay)}`,pulseLinkAttrs(p.next)));
  if(p.results){const h=pulseHref(p.results.resultsUrl);if(h)cells.push(cell("Results",p.results.title,"Results are in →",`href="${esc(h)}"`,true));}
  if(p.weekNews)cells.push(cell("This week",`${p.weekNews} new club ${p.weekNews===1?"story":"stories"}`,"Club News →",'href="news"'));
  else if(p.weekEvents)cells.push(cell("This week",`${p.weekEvents} ${p.weekEvents===1?"event":"events"} coming up`,"Club Calendar →",'href="club-calendar"'));
  return cells.length?`<div class="pulse-strip-wrap">
      <div class="pulse-strip-frame"><nav class="pulse-strip" aria-label="Club at a glance">${cells.join("")}</nav></div>
      <div class="pulse-strip-dots" aria-hidden="true"></div>
    </div>`:"";
}

function renderClubPulse(){
  const el=$("#clubPulse");
  if(!el)return;
  const body=document.body;
  body.classList.remove("home-event","home-live");
  const demo=homeDemo();
  /* V1, still loading, or nothing loaded: no panel, and the ordinary homepage carries on below
     (a demo needs nothing loaded -- its gala is made up) */
  if(!body.classList.contains("home-v2")||(pulseState!=="ready"&&!demo)){el.hidden=true;el.innerHTML="";return;}
  const samples=demo?demoEvents(demo):[];
  const p=clubPulse(DB.feed.concat(samples));
  /* the samples lead whatever else is really on today */
  if(samples.length){p.today=samples.concat(p.today.filter(x=>!samples.includes(x)));p.focus=samples[0];}
  const ctx=demo?demoCtx:homeContext(),f=p.focus;
  const lead=!!f&&ctx==="auto";
  const panels=lead?p.today.slice(0,PULSE_MAX_PANELS):[];
  body.classList.toggle("home-event",lead);
  /* the banner's red pill points at the first gala that's live (renderMeets); it only steps aside
     when that gala's own panel is showing its live button, so no live link drops off the page */
  const pillGala=DB.feed.filter(isMeet).sort(byStart).find(meetLive);
  body.classList.toggle("home-live",!!pillGala&&panels.includes(pillGala));
  const label=f&&(isMeet(f)?"Race Day":"Club Event");
  const opt=(key,text)=>`<button type="button" class="pulse-ctx-btn" data-home-context="${key}" aria-pressed="${ctx===key}">${text}</button>`;
  const switcher=f?`<div class="pulse-ctx" role="group" aria-label="What the homepage shows first"><span class="pulse-ctx-label" aria-hidden="true">Viewing</span>${opt("auto",label)}${opt("normal","Club Home")}</div>`:"";
  const date=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const demoBar=demo?`<div class="pulse-demo" role="group" aria-label="Race Day demo">
      <p class="pulse-demo-note"><strong>Demo</strong> · sample galas, not real events</p>
      ${Object.entries(HOME_DEMOS).map(([k,l])=>`<button type="button" class="pulse-demo-btn" data-home-demo="${k}" aria-pressed="${k===demo}">${esc(l)}</button>`).join("")}
      <button type="button" class="pulse-demo-btn pulse-demo-exit" data-home-demo="">Exit demo</button>
    </div>`:"";
  el.innerHTML=`<div class="container">
    ${demoBar}
    <div class="pulse-head"><h2 class="pulse-title" id="pulseTitle">Today at BPSC <span class="pulse-date">${esc(date)}</span></h2>${switcher}</div>
    ${p.training.map(pulseTrainingNotice).join("")}
    ${panels.map((it,i)=>pulseEventPanel(it,i===0?p.today.slice(panels.length):[],i)).join("")}
    ${pulseStrip(p,lead)}
  </div>`;
  el.hidden=false;
  pulseDay=isoToday();
  wirePulseStrip();
}

/* On a phone the strip is one row you swipe (site.css), so it has to say so: a fade with an arrow
   at whichever edge has more, and leaning bars underneath for where you are (tap one to jump).
   It also steps along by itself every PULSE_STRIP_MS, looping back to the start -- until the
   visitor touches it, from when they're in charge. It doesn't move while the tab is in the
   background, while it's off screen, or at all for anyone who has asked for reduced motion.
   Where everything fits (computers), there's nothing to scroll and none of this shows. */
const PULSE_STRIP_MS=5000;
let pulseStripTimer=null,pulseStripSync=null;
const reduceMotion=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function wirePulseStrip(){
  clearInterval(pulseStripTimer);pulseStripTimer=null;pulseStripSync=null;
  const strip=$("#clubPulse .pulse-strip"),frame=strip&&strip.parentElement,dotsEl=$("#clubPulse .pulse-strip-dots");
  if(!strip||!dotsEl)return;
  /* where scroll-snap can actually stop: each box's start, until the row's end is reached */
  const stops=()=>{
    const max=strip.scrollWidth-strip.clientWidth;
    if(max<=2)return [];
    const first=strip.firstElementChild.offsetLeft;
    return [...strip.querySelectorAll(".pulse-cell")].map(c=>c.offsetLeft-first).filter(x=>x<max-2).concat(max);
  };
  const current=list=>list.reduce((best,x,i)=>Math.abs(x-strip.scrollLeft)<Math.abs(list[best]-strip.scrollLeft)?i:best,0);
  let dotCount=-1;
  const sync=()=>{
    const list=stops(),i=current(list);
    frame.classList.toggle("more-left",list.length>0&&strip.scrollLeft>2);
    frame.classList.toggle("more-right",list.length>0&&strip.scrollLeft<list[list.length-1]-2);
    if(list.length!==dotCount){
      dotCount=list.length;
      dotsEl.innerHTML=list.map((_,j)=>`<button type="button" class="pulse-strip-dot" data-stop="${j}" tabindex="-1"></button>`).join("");
    }
    dotsEl.querySelectorAll(".pulse-strip-dot").forEach((d,j)=>d.classList.toggle("active",j===i));
  };
  const go=i=>{const list=stops();if(list.length)strip.scrollTo({left:list[(i+list.length)%list.length],behavior:reduceMotion()?"auto":"smooth"});};
  const stop=()=>{clearInterval(pulseStripTimer);pulseStripTimer=null;};
  let queued=false;
  strip.addEventListener("scroll",()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();});},{passive:true});
  ["pointerdown","touchstart","wheel","focusin"].forEach(ev=>strip.addEventListener(ev,stop,{passive:true}));
  dotsEl.addEventListener("click",e=>{const d=e.target.closest("[data-stop]");if(d){stop();go(+d.dataset.stop);}});
  pulseStripSync=sync;
  sync();
  if(reduceMotion()||!stops().length)return;
  pulseStripTimer=setInterval(()=>{
    if(document.hidden||!strip.isConnected)return;
    const r=strip.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    const list=stops();
    if(list.length)go(current(list)+1);
  },PULSE_STRIP_MS);
}
/* turning the phone round (or resizing) can change how many boxes fit */
let pulseStripResize;
window.addEventListener("resize",()=>{clearTimeout(pulseStripResize);pulseStripResize=setTimeout(()=>{if(pulseStripSync)pulseStripSync();},120);});

document.addEventListener("click",e=>{
  const v=e.target.closest("[data-home-version]");
  if(v){
    if(v.getAttribute("aria-pressed")==="true")return;
    const pick=v.dataset.homeVersion;
    if(pick==="demo"){startHomeDemo("race-day");return;}
    setHomeDemo(null);
    setHomePref(HOME_VERSION_KEY,pick);
    syncHomeVersion();
    toast(pick==="v2"?"The new homepage":"Classic homepage — switch back any time");
    return;
  }
  const d=e.target.closest("[data-home-demo]");
  if(d){
    if(d.getAttribute("aria-pressed")==="true")return;
    if(d.dataset.homeDemo)startHomeDemo(d.dataset.homeDemo);
    else{setHomeDemo(null);syncHomeVersion();toast("Demo ended");}
    return;
  }
  /* the sample gala's outside links have nowhere real to go */
  const fake=e.target.closest('a[href="#demo"]');
  if(fake){e.preventDefault();toast("Demo — on a real race day this opens the gala's own link");return;}
  const c=e.target.closest("[data-home-context]");
  if(c){
    if(c.getAttribute("aria-pressed")==="true")return;
    if(homeDemo())demoCtx=c.dataset.homeContext;   // a demo doesn't touch the visitor's real choice
    else setHomePref(HOME_CONTEXT_KEY,c.dataset.homeContext);
    safely(renderClubPulse);
    /* the buttons were redrawn: keep keyboard focus on the one just chosen */
    const again=document.querySelector(`[data-home-context="${c.dataset.homeContext}"]`);
    if(again)again.focus();
  }
});
function startHomeDemo(key){
  const first=!homeDemo();
  setHomeDemo(key);demoCtx="auto";
  syncHomeVersion();
  if(!first)return;
  toast("Race Day demo — a sample gala");
  /* the panel is at the top of the page, the button down by the slideshow -- bring it up to just
     under the sticky header, so the "sample gala" note isn't hidden behind it */
  const el=$("#clubPulse");
  if(el)window.scrollTo({top:Math.max(0,el.getBoundingClientRect().top+scrollY-(document.querySelector("header.site")?.offsetHeight||0)-8),
    behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
/* A tab left open overnight (or a phone woken the next morning) shouldn't still show yesterday. */
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&pulseDay&&pulseDay!==isoToday())safely(renderClubPulse);});
if($("#homeVersion"))syncHomeVersion();

/* ================= INIT ================= */
const CONTENT_SLOTS="#meetsList,#otherMeetsList,#teamMeetsList,#completedMeetsList,#coachesList,#academyCoachesList,#rolesList,#newsList,#ttBody,#socialsList,#compList,#leagueList,#committeeList,#committeeDetail";
document.querySelectorAll(CONTENT_SLOTS).forEach(el=>{el.innerHTML=`<p style="color:var(--muted)">Loading…</p>`;});
loadContent().then(()=>{
  /* Admins can hide a meet from the public site (without deleting it) by unticking "Show on
     the website" in the members' area; members.js keeps the full list, but nothing here should. */
  DB.feed=DB.feed.filter(it=>it.visible!==false).map(it=>isMeet(it)?autoCloseEntries(it):it);
  /* drawn on its own, so a slip anywhere else on the page can't take Club Pulse with it (or vice versa) */
  pulseState="ready";safely(renderClubPulse);
}).then(renderAllPublic).catch(e=>{
  console.error("Could not load content",e);
  if(pulseState!=="ready"){pulseState="failed";document.body.classList.add("content-failed");safely(renderClubPulse);}
  document.querySelectorAll(CONTENT_SLOTS)
    .forEach(el=>{el.innerHTML=`<p style="color:var(--muted)">Content couldn't be loaded just now. Please refresh the page.</p>`;});
});
