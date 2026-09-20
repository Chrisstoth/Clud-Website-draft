/* Orange edge only when entries can actually be made: an open meet, upcoming, status open, and an entry pack link set. */
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
  const upcomingOpen=upcoming.filter(m=>m.type!=="teamMeet"),upcomingTeam=upcoming.filter(m=>m.type==="teamMeet");
  const upcomingOurs=upcomingOpen.filter(m=>m.type==="meet"),upcomingOthers=upcomingOpen.filter(m=>m.type==="externalMeet");
  const extLink=(url,label,cls="big ghost")=>`<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  /* Live results are published by the poolside laptop to a separate host, so this is always an external link. */
  const liveLink=url=>`<a class="btn big live" href="${esc(url)}" target="_blank" rel="noopener"><span class="live-dot"></span>Live results</a>`;
  const meetCard=m=>{
    const done=meetDone(m),team=m.type==="teamMeet",ours=m.type==="meet";
    const dp=dateParts(m.start);
    const pills=[
      meetLive(m)?'<span class="pill live"><span class="live-dot"></span>Live now</span>':"",
      done?'<span class="pill closed">Completed</span>':team?"":m.status==="open"?'<span class="pill open">Entries open</span>':'<span class="pill closed">Entries closed</span>',
      team?`<span class="pill results">${esc(m.league||"Team meet")}</span>`:ours?'<span class="pill hosted">BPSC hosted</span>':"",
      m.level&&!team?`<span class="pill level">${esc(m.level)}</span>`:""
    ].join("");
    let actions;
    if(done)actions=m.resultsUrl?extLink(m.resultsUrl,"Results","big"):`<span class="btn big disabled" aria-disabled="true">Results coming soon</span>`;
    else if(team)actions=m.leagueUrl?extLink(m.leagueUrl,"League info"):"";
    else actions=(meetHasEntry(m)?extLink(m.entryUrl,"Entry pack","big"):`<span class="btn big disabled" aria-disabled="true">${m.status==="open"?"Entry pack coming soon":"Entries closed"}</span>`)
      +(m.officialsUrl?extLink(m.officialsUrl,"Officials sign-up"):"")
      +(m.volunteerUrl?extLink(m.volunteerUrl,"Volunteer here")
        :m.type==="meet"?`<a class="btn big ghost" href="volunteering">Volunteer here</a>`:"");
    /* A gala in progress leads with its live-results button, whatever else the card offers. */
    if(meetLive(m))actions=liveLink(m.liveUrl)+actions;
    const dates=m.end?`${fmtDate(m.start)} – ${fmtDate(m.end)}`:fmtDate(m.start);
    const extraLinks=[
      m.conditionsUrl?`Meet conditions &amp; details: <a href="${esc(m.conditionsUrl)}">${esc(m.conditionsLabel||"View conditions")}</a>`:"",
      m.entryFileUrl?`Sports Systems entry file: <a href="${esc(m.entryFileUrl)}">${esc(m.entryFileLabel||"Download entry file")}</a>`:"",
      m.resultsFileUrl?`Sports Systems results file: <a href="${esc(m.resultsFileUrl)}">${esc(m.resultsFileLabel||"Download results file")}</a>`:"",
      m.currentEntriesUrl?`Current entries: <a href="${esc(m.currentEntriesUrl)}">View entries</a>`:""
    ].filter(Boolean).map(line=>`<div class="link-line">${line}</div>`).join("");
    const r=resolveNewsImage(m.img);
    const thumb=r?`<div class="news-thumb" style="background:${r.css}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
    return `<article class="card meet${meetLive(m)?" live":""}${done?" done":""}${meetHasEntry(m)?" entries-open":""}${ours?" ours":""}">
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
  const isHome=m=>/basildon/i.test(m.venue||"");
  const clubUpcoming=upcoming.filter(m=>m.type==="meet");
  const next=clubUpcoming.find(isHome)||clubUpcoming[0]||upcomingOpen[0];
  $("#nextMeetCard").innerHTML=next?`
    <p class="eyebrow">Next ${isHome(next)?"Basildon ":""}meet</p>
    <h3>${esc(next.title)}</h3>
    <div class="meta"><div>${esc(next.venue)}</div><div>${fmtDate(next.start)}${next.closing?` · entries close ${fmtDate(next.closing)}`:""}</div></div>
    <div style="margin-top:16px"><a class="btn small" href="open-meets">Details &amp; entry pack</a></div>`
    :`<p class="eyebrow">Next Basildon meet</p><h3>Dates coming soon</h3>
    <div class="meta"><div>The next season's meets will be published here once confirmed.</div></div>`;
}
/* The Academy coaches get their own block under the squad coaches; coaches.html holds the
   heading, which stays hidden while nobody carries the "Academy Coach" role. */
function coachCard(c){
  const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");
  const squads=(c.squads||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join("");
  const photoStyle=c.photo?`background-image:url('${esc(c.photo)}')`:"";
  return `<article class="card coach">
    <div class="coach-photo" style="${photoStyle}">${c.photo?"":`<span class="avatar">${esc(ini)}</span>`}</div>
    <h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div>
    ${c.quals?`<div class="quals">${esc(c.quals)}</div>`:""}
    <div class="squads">${squads}</div></article>`;
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
function renderRoles(){
  if(!$("#rolesList"))return;
  $("#rolesList").innerHTML=DB.roles.map(r=>`
    <article class="card role-card"><h3>${esc(r.title)}</h3>
      <div class="meta">
        <span><strong>Commitment</strong>${esc(r.commitment)}</span>
        <span><strong>Training</strong>${esc(r.training)}</span>
      </div>
      <p>${esc(r.blurb)}</p></article>`).join("");
}
function renderWelfare(){
  if(!$("#welfareBody"))return;
  $("#welfareBody").innerHTML=sanitizeArticleHtml(DB.welfare[0]?.body||WELFARE_DEFAULT_BODY);
}

/* ================= SQUAD TIMETABLES =================
   Two views: one squad's week (AM/PM grid on desktop, day list on phones), or every squad on one day.
   AM/PM is derived from each session's start time so it can never disagree with the time. */
const ttMinutes=t=>{const [h,m]=t.split(":").map(Number);return h*60+m;};
const ttTodayKey=()=>TT_DAYS[(new Date().getDay()+6)%7];
const ttLandTag=s=>s.type==="land"?'<span class="tt-tag">Land</span>':"";
let ttView="squad",ttDay=ttTodayKey(),ttSquadId=null;
try{ttSquadId=+localStorage.getItem("bpsc_tt_squad")||null;}catch(e){}

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
  return `<article class="card comp-card${meetHasEntry(m)?" entries-open":""}${ours?" ours":""}">
    <div class="comp-top">
      <div class="comp-date"><span class="d">${dp.d}</span><span class="m">${dp.m}</span></div>
      <h3>${esc(m.title)}</h3>
    </div>
    ${ours?'<div><span class="pill hosted">BPSC hosted</span></div>':""}
    <div class="comp-meta">${esc(m.venue||"Venue TBC")}${m.poolType?` · ${esc(m.poolType)}`:""}</div>
    <div class="comp-foot">
      <span class="comp-status">${m.type==="teamMeet"?esc(m.league||"Team meet"):meetHasEntry(m)?"":open?"Entry pack soon":"Entries closed"}</span>
      <a href="open-meets">Full details →</a>
    </div></article>`;
}
function renderSocials(){
  if(!$("#calGrid"))return;
  renderCalendarGrid();
  const socials=DB.feed.filter(it=>it.type==="social").sort((a,b)=>a.start<b.start?-1:1);
  $("#socialsList").innerHTML=socials.length?socials.map(it=>{
    const r=resolveNewsImage(it.img);
    const artBg=r?`linear-gradient(160deg,rgba(16,16,20,.15),rgba(16,16,20,.65)),${r.css}`:it.color;
    return `
    <article class="card social-card">
      <div class="art" style="background:${artBg}">${esc(it.title)}</div>
      <div class="body"><div class="when">${esc(fmtDate(it.start))}</div><p>${esc(it.blurb)}</p>
      ${it.link?`<div><a class="btn small" href="${esc(it.link)}">Details / tickets</a></div>`:""}
      <div><a class="btn small ghost" href="article?id=${it.id}">Read more →</a></div></div>
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
window.addEventListener("resize",()=>["socialsList","compList","leagueList"].forEach(updateCatArrows));
const HERO_SLIDE_BG=[
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#3a5570,#1c2c3d)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#4a5a3a,#1c2c22)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#5a4a3a,#2c1c1c)"
];
let heroIndex=0;
let newsTagFilter=null;

/* ================= NEWS TIMELINE =================
   Club News reads as one scroller running backwards through time: whatever landed in the last
   week sits at the top, the rest of the current month under it, then a deliberate full-width
   break ("Previous history") before the month-by-month archive. The break matters -- without it
   a reader scrolling past this week's two stories has no way to tell that what follows is old
   news rather than more of the same. The sticky bar above the timeline is the way back and
   forth through it: Newer/Older step between periods, and the chips jump straight to one.

   Eras are assigned by decreasing recency and rendered in that order, so the page is always
   strictly newest-first even when a month boundary falls mid-week. A story dated ahead of today
   (scheduled, or an announcement about something still to come) gets its own "Coming up" era
   above this week rather than being buried under it. */
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
  const thumb=r?`<div class="news-thumb" style="background:${r.css}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
  return `<article class="card news-card${featured?" is-latest":""}">${thumb}<p class="eyebrow">${esc(n.tag)}</p>
    <h3 style="font-size:1.05rem;margin-top:6px">${esc(n.title)}</h3>
    <p class="news-date"><time datetime="${esc(n.start)}">${fmtDate(n.start)}</time></p>
    <p style="color:var(--muted);font-size:.9rem;margin-top:8px">${esc(n.blurb)}</p>
    <div style="margin-top:14px"><a class="btn small ghost" href="article?id=${n.id}">Read more →</a></div></article>`;
}
function renderNews(){
  if(!$("#newsList"))return;
  const all=DB.feed.filter(it=>it.type==="news").sort((a,b)=>a.start<b.start?1:-1);
  const tags=[...new Set(all.map(n=>n.tag).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(newsTagFilter&&!tags.includes(newsTagFilter))newsTagFilter=null;
  if($("#newsTagChips")){
    $("#newsTagChips").innerHTML=[`<button type="button" class="news-tag-chip${newsTagFilter?"":" active"}" data-tag="">All</button>`]
      .concat(tags.map(t=>`<button type="button" class="news-tag-chip${t===newsTagFilter?" active":""}" data-tag="${esc(t)}">${esc(t)}</button>`)).join("");
  }
  const list=newsTagFilter?all.filter(n=>n.tag===newsTagFilter):all;
  if(!list.length){
    $("#newsList").innerHTML=`<p style="color:var(--muted)">${newsTagFilter?`No news articles tagged "${esc(newsTagFilter)}" yet.`:"No news articles yet."}</p>`;
    renderNewsJump([]);
    return;
  }
  const today=new Date(isoToday()+"T12:00:00");
  const eras=[];
  list.forEach(n=>{
    const era=newsEraFor(n.start,today);
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

/* Hero carousel: pulls across the whole feed (meets, socials, news) so it reads as one connected
   "what's happening" strip rather than club news alone — sorted by closeness to today's date. */
function heroFeedContent(it){
  if(isMeet(it))return {tag:it.type==="teamMeet"?"Team Meet":"Open Meet",title:it.title,blurb:`${it.venue||"Venue TBC"} · ${fmtDate(it.start)}`,linkAttrs:'href="open-meets"',img:it.img||null};
  if(it.type==="social")return {tag:"Club Calendar",title:it.title,blurb:it.blurb||fmtDate(it.start),linkAttrs:`href="article?id=${it.id}"`,img:it.img||null};
  if(it.type==="training")return {tag:"Training change",title:it.title,blurb:it.note||fmtDate(it.start),linkAttrs:'href="club-calendar"',img:it.img||null};
  return {tag:`${it.tag} · Club News`,title:it.title,blurb:it.blurb,linkAttrs:`href="article?id=${it.id}"`,img:it.img||null};
}
function renderHeroFeed(){
  if(!$("#heroSlides"))return;
  const today=new Date();
  const items=DB.feed.filter(it=>it.start)
    .map(it=>({it,diff:Math.abs(new Date(it.start+"T12:00:00")-today)}))
    .sort((a,b)=>a.diff-b.diff)
    .slice(0,6)
    .map(x=>x.it);
  $("#heroSlides").innerHTML=items.map((it,i)=>{
    const c=heroFeedContent(it);
    const r=c.img?resolveNewsImage(c.img):null;
    const bg=r?`linear-gradient(160deg,rgba(16,16,20,.55),rgba(16,16,20,.15) 65%),${r.css}`:HERO_SLIDE_BG[i%HERO_SLIDE_BG.length];
    return `
    <div class="hero-slide" style="background:${bg}">
      <div class="hero-news-card">
        <p class="eyebrow">${esc(c.tag)}</p>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.blurb)}</p>
        <a ${c.linkAttrs}>Read more →</a>
      </div>
    </div>`;
  }).join("");
  $("#heroDots").innerHTML=items.map((_,i)=>`<button class="hero-dot" data-i="${i}" aria-label="Story ${i+1} of ${items.length}"></button>`).join("");
  heroIndex=0;
  updateHeroSlide();
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
if($("#heroPhotoStrip")){
  $("#heroPrev").addEventListener("click",()=>{heroIndex--;updateHeroSlide();});
  $("#heroNext").addEventListener("click",()=>{heroIndex++;updateHeroSlide();});
  $("#heroDots").addEventListener("click",e=>{const b=e.target.closest(".hero-dot");if(b){heroIndex=+b.dataset.i;updateHeroSlide();}});
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
    deltaX=0;updateHeroSlide();});
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
  const back=it.type==="social"?{href:"club-calendar",label:"← Back to Club Calendar"}:{href:"news",label:"← Back to Club News"};
  view.innerHTML=articleContentHtml(it)
    +(it.link?`<div style="margin-top:18px"><a class="btn small" href="${esc(it.link)}" target="_blank" rel="noopener">Details / tickets →</a></div>`:"")
    +`<div style="margin-top:28px"><a class="btn small ghost" href="${back.href}">${back.label}</a></div>`;
  wireArticleGallery((it.photos||[]).length);
}
function renderAllPublic(){renderMeets();renderCoaches();renderTimetable();renderRoles();renderSocials();renderNews();renderHeroFeed();renderArticle();renderWelfare();}

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
  }));
  /* default pathway so a form is always visible and swaps in place */
  document.querySelector('.path-card[data-path="lessons"]').classList.add("sel");
  $("#joinLessons").hidden=false;
  $("#joinLessons").addEventListener("submit",e=>submitEnquiry(e,"Academy / lessons",f=>f.get("stage")));
  $("#joinCompetitive").addEventListener("submit",e=>submitEnquiry(e,"Competitive trial",f=>`SE ${f.get("seNo")} · ${f.get("level")}`));
}

/* ================= INIT ================= */
const CONTENT_SLOTS="#meetsList,#otherMeetsList,#teamMeetsList,#completedMeetsList,#coachesList,#academyCoachesList,#rolesList,#newsList,#ttBody,#socialsList,#compList,#leagueList";
document.querySelectorAll(CONTENT_SLOTS).forEach(el=>{el.innerHTML=`<p style="color:var(--muted)">Loading…</p>`;});
loadContent().then(()=>{
  /* Admins can hide a meet from the public site (without deleting it) by unticking "Show on
     the website" in the members' area; members.js keeps the full list, but nothing here should. */
  DB.feed=DB.feed.filter(it=>it.visible!==false);
}).then(renderAllPublic).catch(e=>{
  console.error("Could not load content",e);
  document.querySelectorAll(CONTENT_SLOTS)
    .forEach(el=>{el.innerHTML=`<p style="color:var(--muted)">Content couldn't be loaded just now. Please refresh the page.</p>`;});
});
