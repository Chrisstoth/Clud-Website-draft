/* Orange edge only when entries can actually be made: an open meet, upcoming, status open, and an entry pack link set. */
const meetHasEntry=m=>m.type!=="teamMeet"&&!meetDone(m)&&m.status==="open"&&!!m.entryUrl;
function renderMeets(){
  const all=DB.feed.filter(isMeet).sort((a,b)=>a.start<b.start?-1:1);
  const upcoming=all.filter(m=>!meetDone(m)),completed=all.filter(meetDone).reverse();
  const upcomingOpen=upcoming.filter(m=>m.type!=="teamMeet"),upcomingTeam=upcoming.filter(m=>m.type==="teamMeet");
  const extLink=(url,label,cls="big ghost")=>`<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  const meetCard=m=>{
    const done=meetDone(m),team=m.type==="teamMeet";
    const dp=dateParts(m.start);
    const pills=[
      done?'<span class="pill closed">Completed</span>':team?"":m.status==="open"?'<span class="pill open">Entries open</span>':'<span class="pill closed">Entries closed</span>',
      team?`<span class="pill results">${esc(m.league||"Team meet")}</span>`:m.type==="meet"?'<span class="pill results">BPSC hosted</span>':"",
      m.level&&!team?`<span class="pill level">${esc(m.level)}</span>`:""
    ].join("");
    let actions;
    if(done)actions=m.resultsUrl?extLink(m.resultsUrl,"Results","big"):`<span class="btn big disabled" aria-disabled="true">Results coming soon</span>`;
    else if(team)actions=m.leagueUrl?extLink(m.leagueUrl,"League info"):"";
    else actions=(meetHasEntry(m)?extLink(m.entryUrl,"Entry pack","big"):`<span class="btn big disabled" aria-disabled="true">${m.status==="open"?"Entry pack coming soon":"Entries closed"}</span>`)
      +(m.officialsUrl?extLink(m.officialsUrl,"Officials sign-up"):"")
      +(m.volunteerUrl?extLink(m.volunteerUrl,"Volunteer here")
        :m.type==="meet"?`<a class="btn big ghost" href="volunteering">Volunteer here</a>`:"");
    const dates=m.end?`${fmtDate(m.start)} – ${fmtDate(m.end)}`:fmtDate(m.start);
    const extraLinks=[
      m.conditionsUrl?`Meet conditions &amp; details: <a href="${esc(m.conditionsUrl)}">${esc(m.conditionsLabel||"View conditions")}</a>`:"",
      m.entryFileUrl?`Sports Systems entry file: <a href="${esc(m.entryFileUrl)}">${esc(m.entryFileLabel||"Download entry file")}</a>`:"",
      m.currentEntriesUrl?`Current entries: <a href="${esc(m.currentEntriesUrl)}">View entries</a>`:""
    ].filter(Boolean).map(line=>`<div class="link-line">${line}</div>`).join("");
    const r=resolveNewsImage(m.img);
    const thumb=r?`<div class="news-thumb" style="background:${r.css}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
    return `<article class="card meet${done?" done":""}${meetHasEntry(m)?" entries-open":""}">
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
    $("#meetsList").innerHTML=upcomingOpen.length?upcomingOpen.map(meetCard).join(""):`<p style="color:var(--muted)">No upcoming open meets yet — check back soon.</p>`;
    $("#teamMeetsList").innerHTML=upcomingTeam.length?upcomingTeam.map(meetCard).join(""):`<p style="color:var(--muted)">No team meets scheduled yet.</p>`;
    $("#completedMeetsList").innerHTML=completed.length?completed.map(meetCard).join(""):`<p style="color:var(--muted)">No completed galas yet.</p>`;
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
function renderCoaches(){
  if(!$("#coachesList"))return;
  $("#coachesList").innerHTML=DB.coaches.map(c=>{
    const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");
    const squads=(c.squads||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join("");
    const photoStyle=c.photo?`background-image:url('${esc(c.photo)}')`:"";
    return `<article class="card coach">
      <div class="coach-photo" style="${photoStyle}">${c.photo?"":`<span class="avatar">${esc(ini)}</span>`}</div>
      <h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div>
      <div class="quals">${esc(c.quals)}</div>
      <div class="squads">${squads}</div></article>`;
  }).join("");
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
    const chips=dayItems.map(it=>{const c=calCatInfo(it);return `<div class="cal-chip ${c.cls}" title="${esc(c.label)}: ${esc(it.title)}">${esc(it.title)}</div>`;}).join("");
    html+=`<div class="cal-day${inMonth?"":" out"}${iso&&iso===todayIso?" today":""}"><div class="cal-daynum">${inMonth?dayNum:""}</div>${chips}</div>`;
  }
  $("#calGrid").innerHTML=html;
}
/* Compact calendar card: date + title share the top line; open entries get a pulsing orange edge instead of a pill. */
function meetRowCard(m){
  const dp=dateParts(m.start),open=m.status==="open";
  return `<article class="card comp-card${meetHasEntry(m)?" entries-open":""}">
    <div class="comp-top">
      <div class="comp-date"><span class="d">${dp.d}</span><span class="m">${dp.m}</span></div>
      <h3>${esc(m.title)}</h3>
    </div>
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
      ${it.link?`<div><a class="btn small" href="${esc(it.link)}">Details / tickets</a></div>`:""}</div>
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
function renderNews(){
  if(!$("#newsList"))return;
  const list=DB.feed.filter(it=>it.type==="news").sort((a,b)=>a.start<b.start?-1:1);
  $("#newsList").innerHTML=list.map(n=>{
    const r=resolveNewsImage(n.img);
    const thumb=r?`<div class="news-thumb" style="background:${r.css}">${r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>`:"";
    return `<div class="card">${thumb}<p class="eyebrow">${esc(n.tag)}</p><h3 style="font-size:1.05rem;margin-top:6px">${esc(n.title)}</h3><p style="color:var(--muted);font-size:.9rem;margin-top:8px">${esc(n.blurb)}</p></div>`;
  }).join("");
}
/* Hero carousel: pulls across the whole feed (meets, socials, news) so it reads as one connected
   "what's happening" strip rather than club news alone — sorted by closeness to today's date. */
function heroFeedContent(it){
  if(isMeet(it))return {tag:it.type==="teamMeet"?"Team Meet":"Open Meet",title:it.title,blurb:`${it.venue||"Venue TBC"} · ${fmtDate(it.start)}`,linkAttrs:'href="open-meets"',img:it.img||null};
  if(it.type==="social")return {tag:"Club Calendar",title:it.title,blurb:it.blurb||fmtDate(it.start),linkAttrs:'href="club-calendar"',img:it.img||null};
  if(it.type==="training")return {tag:"Training change",title:it.title,blurb:it.note||fmtDate(it.start),linkAttrs:'href="club-calendar"',img:it.img||null};
  return {tag:`${it.tag} · Club News`,title:it.title,blurb:it.blurb,linkAttrs:'href="news"',img:it.img||null};
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
function renderAllPublic(){renderMeets();renderCoaches();renderTimetable();renderRoles();renderSocials();renderNews();renderHeroFeed();}

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
$("#burger").addEventListener("click",()=>{
  const n=$("#mainNav");n.classList.toggle("open");
  $("#burger").setAttribute("aria-expanded",n.classList.contains("open"));
});

/* ================= JOIN FORM → INBOX ================= */
function submitEnquiry(e,type,detailFn){
  e.preventDefault();
  const f=new FormData(e.target);
  DB.enquiries.unshift({id:nextId++,parent:f.get("parent"),email:f.get("email"),swimmer:f.get("swimmer"),dob:f.get("dob"),type,detail:detailFn(f),notes:f.get("notes"),received:"Just now"});
  saveDB();
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
renderAllPublic();
