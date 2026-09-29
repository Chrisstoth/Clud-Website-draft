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
  const upcomingOpen=upcoming.filter(m=>m.type!=="teamMeet"&&!meetTooFarAhead(m)),upcomingTeam=upcoming.filter(m=>m.type==="teamMeet");
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
    else actions=(meetHasEntry(m)?extLink(m.entryUrl,"Entry pack","big"):"")
      +(m.officialsUrl?extLink(m.officialsUrl,"Officials sign-up"):"")
      +(m.volunteerUrl?extLink(m.volunteerUrl,"Volunteer here"):"");
    /* A gala in progress leads with its live-results button, whatever else the card offers. */
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
    <div style="margin-top:12px"><a class="btn small" href="open-meets">Details &amp; entry pack</a></div>`
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
    /* the darkening keeps the title legible: over a photo it rides on the .photo layer (--shade),
       over a default gradient or the chosen card colour it's just another background layer */
    const shade="linear-gradient(160deg,rgba(16,16,20,.15),rgba(16,16,20,.65))";
    const artStyle=!r?`background:${it.color}`:r.bg?`background:${shade},${r.bg}`:`${r.style};--shade:${shade}`;
    return `
    <article class="card social-card">
      <div class="art ${r?r.cls:""}" style="${artStyle}">${esc(it.title)}</div>
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
  const thumb=r?`<div class="news-thumb ${r.cls}" style="${r.style}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
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
   "what's happening" strip rather than club news alone. Two kinds of item, two rules:
   - events (meets, socials, training changes -- and a news story written ahead of its date,
     e.g. a preview of a gala) are about a day: soonest first, gone once that day (or the end
     date) has passed;
   - announcements (any other news story) are about when they went up: newest first, until
     newer ones push them out.
   Order: anything pinned (feed.pin_until, still in date), then the next HERO_UPCOMING events,
   then the latest news -- with more events filling in if there isn't enough news, and vice versa. */
const HERO_SLOTS=6,HERO_UPCOMING=3;
function heroFeedItems(){
  const today=isoToday();
  const pinned=DB.feed.filter(it=>it.start&&it.pinUntil&&it.pinUntil>=today).sort((a,b)=>a.start<b.start?1:-1);
  const rest=DB.feed.filter(it=>it.start&&!pinned.includes(it));
  const isEvent=it=>it.type!=="news"||it.start>(it.created||today);
  const upcoming=rest.filter(it=>isEvent(it)&&(it.end||it.start)>=today).sort((a,b)=>a.start<b.start?-1:1);
  const news=rest.filter(it=>!isEvent(it)).sort((a,b)=>a.start<b.start?1:-1);
  const room=HERO_SLOTS-pinned.length;
  const nUp=Math.min(upcoming.length,Math.max(HERO_UPCOMING,room-news.length));
  return pinned.concat(upcoming.slice(0,nUp),news).slice(0,HERO_SLOTS);
}
function renderHeroFeed(){
  if(!$("#heroSlides"))return;
  const items=heroFeedItems();
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
      <div class="hero-news-card${heroCardClasses(it.heroCard)}">
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
  const back=it.type==="social"?{href:"club-calendar",label:"← Back to Club Calendar"}:{href:"news",label:"← Back to Club News"};
  view.innerHTML=articleContentHtml(it)
    +(it.link?`<div style="margin-top:18px"><a class="btn small" href="${esc(it.link)}" target="_blank" rel="noopener">Details / tickets →</a></div>`:"")
    +`<div style="margin-top:28px"><a class="btn small ghost" href="${back.href}">${back.label}</a></div>`;
  wireArticleGallery((it.photos||[]).length);
}
function renderAllPublic(){renderMeets();renderCoaches();renderTimetable();renderRoles();renderSocials();renderNews();renderHeroFeed();renderArticle();renderWelfare();renderCommittee();}

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

/* ================= INIT ================= */
const CONTENT_SLOTS="#meetsList,#otherMeetsList,#teamMeetsList,#completedMeetsList,#coachesList,#academyCoachesList,#rolesList,#newsList,#ttBody,#socialsList,#compList,#leagueList,#committeeList,#committeeDetail";
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
