
/* ================= DATA (in-memory for this prototype) ================= */
const DB = {
  /* Unified feed: every newsworthy/schedulable thing lives here, tagged by type.
     "meet" = open meets/galas, "social" = club socials & events, "news" = announcements. */
  feed: [
    {id:1, type:"meet", title:"BPSC End of Season SC L3 Meet", level:"Level 3", license:"3ER261281", poolType:"25m Short Course", start:"2026-07-11", end:"2026-07-12", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"http://www.galaorganiser.co.uk/entry/meetentry.php?Meet=BASTEO26", resultsUrl:"", notes:"Officials wanted — please declare your availability.", conditionsUrl:"#", conditionsLabel:"2026 BPSC End of Season SC Meet L3 – Conditions", entryFileUrl:"#", entryFileLabel:"EO26_EntryData", officialsUrl:"https://swim-meet.com/Availability/?m=9133", currentEntriesUrl:"https://www.galaorganiser.co.uk/entry/meet_entries.php?Meet=BASTEO26"},
    {id:2, type:"meet", title:"BPSC Season Opener SC L3", level:"Level 3", poolType:"25m Short Course", start:"2026-09-12", end:"2026-09-13", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:""},
    {id:3, type:"meet", title:"BPSC 800m Distance Qualifier", level:"Club", start:"2026-10-10", end:"", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:""},
    {id:4, type:"meet", title:"BPSC Autumn Qualifier", level:"Club", start:"2026-10-31", end:"2026-11-01", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:"Volunteers needed — see the Volunteering page!"},
    {id:5, type:"meet", title:"BPSC 1500m Distance Qualifier", level:"Club", start:"2026-11-14", end:"", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:""},
    {id:6, type:"meet", title:"BPSC Last Chance County Qualifier", level:"Club", start:"2026-11-28", end:"2026-11-29", venue:"Basildon Sporting Village", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:""},
    {id:7, type:"social", title:"Summer BBQ & Fun Gala", start:"2026-08-15", blurb:"Family fun gala followed by the annual BBQ on the field. Bring the whole family — inflatables race included.", link:"#", color:"linear-gradient(135deg,#f26b21,#ffb25e)"},
    {id:8, type:"social", title:"Quiz Night Fundraiser", start:"2026-09-25", blurb:"Teams of six, bar open, proceeds towards new club timing equipment. Book your table early!", link:"#", color:"linear-gradient(135deg,#101014,#3c3c46)"},
    {id:9, type:"social", title:"Presentation Evening", start:"2026-11-21", blurb:"Celebrating the season — trophies, awards and the famous coaches' review of the year.", link:"#", color:"linear-gradient(135deg,#d4551a,#101014)"},
    {id:10, type:"news", tag:"Racing", title:"Club Championships wrap-up", start:"2026-05-18", blurb:"Results, personal bests and a huge thank you to the volunteers who made the weekend happen."},
    {id:11, type:"news", tag:"Club", title:"New Academy intake open", start:"2026-07-01", blurb:"Spaces opening in our Academy squads for swimmers moving up from lessons — see Join Us for details."},
    {id:12, type:"news", tag:"Volunteering", title:"Timekeepers needed", start:"2026-07-08", blurb:"We're short on timekeepers for the Autumn Qualifier — no experience needed, full briefing given poolside."},
    {id:13, type:"news", tag:"Trips", title:"Swim Camp 2026 — Lanzarote", start:"2026-08-20", blurb:"Places open for our warm-weather training camp at Club La Santa — intensive poolside sessions for squads moving up in level.", img:"images/WS-Spain-lanzarote-Costa-Teguise-03-Sports-Abroad.jpg"},
    {id:14, type:"news", tag:"Racing", title:"Summer Nationals", start:"2026-07-28", blurb:"Good luck to our qualified swimmers racing at Ponds Forge this summer — the whole club will be behind you.", img:"images/Ponds_Forge_Summer_Meet_2024_branding_1200x675.avif"},
    {id:15, type:"news", tag:"Volunteering", title:"Timekeepers course", start:"2026-08-05", blurb:"A free Swim England Timekeeping course is running next month — no experience needed, and it's the easiest way to start volunteering poolside.", img:"images/Timekeepers-course.webp"}
  ],
  coaches: [
    {id:1, name:"Sam Carter", role:"Head Coach", quals:"Swim England Senior Coach · DBS · Safeguarding & first aid", squads:["Performance","National/Regional prep"]},
    {id:2, name:"Priya Shah", role:"Development Coach", quals:"Swim England Coach (Level 2) · DBS · Safeguarding", squads:["Development","County prep"]},
    {id:3, name:"Jamie Round", role:"Youth & Sprint Coach", quals:"Swim England Coach (Level 2) · DBS · Safeguarding", squads:["Youth Sprint","Transition"]},
    {id:4, name:"Ella Moore", role:"Academy Lead", quals:"Swim England Assistant Coach · DBS · Safeguarding", squads:["Academy — Green to Red hats"]}
  ],
  roles: [
    {id:1, title:"Timekeeper", commitment:"~2 galas per season", training:"30-min poolside briefing", blurb:"The classic first step. Sit poolside with a stopwatch, time your lane, enjoy the best seats in the house. No experience needed — we'll show you everything before the first race."},
    {id:2, title:"Licensed Official (Judge Level 1+)", commitment:"A few meets per year", training:"Free Swim England course + mentored poolside hours", blurb:"Progress from Timekeeper to Judge, Starter and beyond. The club funds your training, and every licensed meet we enter needs us to supply officials — you make racing possible."},
    {id:3, title:"Team Manager", commitment:"League rounds & selected meets", training:"Swim England Team Manager modules (funded)", blurb:"Look after our swimmers on poolside at away galas — registration, marshalling, and keeping the team fed, warm and where they need to be."},
    {id:4, title:"Meet Helpers (home galas)", commitment:"Ad-hoc — sign-up sheets per event", training:"None needed", blurb:"Home meets need runners, refreshments, spectator desk and set-up/pack-down crews. Great for family members who want to help without a regular commitment."},
    {id:5, title:"Committee & Welfare", commitment:"Monthly meeting + role duties", training:"Role handover + Wavepower training for welfare", blurb:"Treasurer, secretary, membership, welfare officer — the roles that keep the club running and safe. Talk to any committee member if you're curious."}
  ],
  enquiries: [
    {id:1, parent:"A. Sample", email:"sample@example.com", swimmer:"Charlie", dob:"2015-03-02", type:"Competitive trial", detail:"SE 1234567 · County", notes:"Best 50 free 34.2 (25m). Available Tues/Thurs.", received:"Mon 6 Jul, 09:41"}
  ]
};
let nextId = 100;

/* ================= ROLES & PERMISSIONS ================= */
const ROLES = {
  meets:      {label:"Open Meets Secretary", desc:"Add galas, entry packs & results", sections:["feed"], feedTypes:["meet"]},
  coaching:   {label:"Coaching Lead",        desc:"Edit coach profiles & squads",     sections:["coaches"]},
  volunteers: {label:"Volunteer Coordinator",desc:"Edit volunteer role explainers",   sections:["roles"]},
  socials:    {label:"Socials Team",         desc:"Add events, links & graphics",     sections:["feed"], feedTypes:["social"]},
  comms:      {label:"Comms / Club News",    desc:"Post club news & announcements",   sections:["feed"], feedTypes:["news"]},
  membership: {label:"Membership Team",      desc:"View trial & squad enquiries",     sections:["enquiries"]},
  webmaster:  {label:"Webmaster",            desc:"Full access to every section",     sections:["feed","coaches","roles","enquiries"], feedTypes:["meet","social","news"]}
};
const SECTION_META = {
  feed:{name:"Club Feed", empty:"Nothing published yet — add the first item."},
  coaches:{name:"Coaches & Squads", empty:"No coaches listed yet."},
  roles:{name:"Volunteer Roles", empty:"No roles yet."},
  enquiries:{name:"Trial Enquiries (inbox)", empty:"No enquiries yet — the public Join Us form feeds this inbox."}
};
/* One type per feed item; a role's feedTypes controls which of these it can add/see */
const FEED_TYPE_META = {
  meet:{label:"Open Meet"},
  social:{label:"Social / Event"},
  news:{label:"Club News"}
};

/* Field schemas drive the mock edit forms. Feed items are keyed by their type ("meet"/"social"/"news"). */
const SCHEMAS = {
  meet:[
    {k:"title",label:"Meet name",type:"text",req:1},
    {k:"level",label:"Level / type",type:"select",opts:["Level 1","Level 2","Level 3","Level 4","Club","Team event"]},
    {k:"license",label:"Licence number (optional)",type:"text"},
    {k:"poolType",label:"Pool / course (e.g. 25m Short Course)",type:"text"},
    {k:"start",label:"Start date",type:"date",req:1},
    {k:"end",label:"End date (optional)",type:"date"},
    {k:"venue",label:"Venue & pool",type:"text",req:1},
    {k:"closing",label:"Entries close",type:"date"},
    {k:"status",label:"Status",type:"select",opts:["open","closed","results"]},
    {k:"entryUrl",label:"Entry link (URL)",type:"text"},
    {k:"resultsUrl",label:"Results link (URL)",type:"text"},
    {k:"conditionsUrl",label:"Meet conditions & details link (URL)",type:"text"},
    {k:"conditionsLabel",label:"Meet conditions link text",type:"text"},
    {k:"entryFileUrl",label:"Sports Systems entry file link (URL)",type:"text"},
    {k:"entryFileLabel",label:"Entry file link text",type:"text"},
    {k:"officialsUrl",label:"Officials availability link (URL)",type:"text"},
    {k:"currentEntriesUrl",label:"Current entries link (URL)",type:"text"},
    {k:"notes",label:"Notes for parents & swimmers",type:"textarea"}
  ],
  coaches:[
    {k:"name",label:"Name",type:"text",req:1},
    {k:"role",label:"Coaching role",type:"text",req:1},
    {k:"quals",label:"Qualifications & checks",type:"text"},
    {k:"squadsRaw",label:"Squads (comma-separated)",type:"text"}
  ],
  roles:[
    {k:"title",label:"Role title",type:"text",req:1},
    {k:"commitment",label:"Typical commitment",type:"text"},
    {k:"training",label:"Training provided",type:"text"},
    {k:"blurb",label:"What it involves",type:"textarea",req:1}
  ],
  social:[
    {k:"title",label:"Event name",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"blurb",label:"Details",type:"textarea"},
    {k:"link",label:"Tickets / sign-up link (URL)",type:"text"},
    {k:"color",label:"Card graphic",type:"select",opts:[
      ["linear-gradient(135deg,#f26b21,#ffb25e)","Phoenix orange"],
      ["linear-gradient(135deg,#101014,#3c3c46)","Club black"],
      ["linear-gradient(135deg,#d4551a,#101014)","Ember fade"]]}
  ],
  news:[
    {k:"tag",label:"Category tag (e.g. Racing, Club, Trips)",type:"text",req:1},
    {k:"title",label:"Headline",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"blurb",label:"Summary",type:"textarea",req:1},
    {k:"img",label:"Photo path (optional, e.g. images/photo.jpg)",type:"text"}
  ]
};

/* ================= HELPERS ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2600);}
function fmtDate(iso){if(!iso)return"";const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
function dateParts(iso){const d=new Date(iso+"T12:00:00");return{d:d.getDate(),m:d.toLocaleDateString("en-GB",{month:"short"})};}

/* ================= PUBLIC RENDERERS ================= */
function renderMeets(){
  const list=DB.feed.filter(it=>it.type==="meet").sort((a,b)=>a.start<b.start?-1:1);
  $("#meetsList").innerHTML=list.map(m=>{
    const dp=dateParts(m.start);
    const pill=m.status==="open"?'<span class="pill open">Entries open</span>':m.status==="results"?'<span class="pill results">Results out</span>':'<span class="pill closed">Entries closed</span>';
    const links=[m.entryUrl?`<a class="btn small" href="${esc(m.entryUrl)}">Entry pack</a>`:"",m.resultsUrl?`<a class="btn small ghost" href="${esc(m.resultsUrl)}">Results</a>`:""].join("");
    const dates=m.end?`${fmtDate(m.start)} – ${fmtDate(m.end)}`:fmtDate(m.start);
    const extraLinks=[
      m.conditionsUrl?`Meet conditions &amp; details: <a href="${esc(m.conditionsUrl)}">${esc(m.conditionsLabel||"View conditions")}</a>`:"",
      m.entryFileUrl?`Sports Systems entry file: <a href="${esc(m.entryFileUrl)}">${esc(m.entryFileLabel||"Download entry file")}</a>`:"",
      m.officialsUrl?`Officials wanted — <a href="${esc(m.officialsUrl)}">declare your availability</a>`:"",
      m.currentEntriesUrl?`Current entries: <a href="${esc(m.currentEntriesUrl)}">View entries</a>`:""
    ].filter(Boolean).map(line=>`<div class="link-line">${line}</div>`).join("");
    return `<article class="card meet">
      <div class="datebox"><div class="d">${dp.d}</div><div class="m">${dp.m}</div></div>
      <div>
        <div class="row">${pill}<span class="pill level">${esc(m.level)}</span></div>
        <h3>${esc(m.title)}</h3>
        <div class="venue">${esc(m.venue)}${m.poolType?` · ${esc(m.poolType)}`:""} · ${dates}</div>
        ${m.license?`<div style="font-size:.82rem;color:var(--muted);margin-top:2px">Licence ${esc(m.license)}</div>`:""}
        ${m.notes?`<p style="margin-top:10px;font-size:.94rem;color:var(--body2)">${esc(m.notes)}</p>`:""}
        ${m.closing&&m.status==="open"?`<div class="closing">Entries close <strong>${fmtDate(m.closing)}</strong></div>`:""}
        ${links?`<div class="links">${links}</div>`:""}
        ${extraLinks?`<details class="info" style="margin-top:12px"><summary>Meet documents &amp; links</summary><div class="body">${extraLinks}</div></details>`:""}
      </div></article>`;
  }).join("");
  const isHome=m=>/basildon/i.test(m.venue);
  const next=list.find(m=>m.status==="open"&&isHome(m))||list.find(isHome)||list.find(m=>m.status==="open")||list[0];
  $("#nextMeetCard").innerHTML=next?`
    <p class="eyebrow">Next Basildon meet</p>
    <h3>${esc(next.title)}</h3>
    <div class="meta"><div>${esc(next.venue)}</div><div>${fmtDate(next.start)}${next.closing?` · entries close ${fmtDate(next.closing)}`:""}</div></div>
    <div style="margin-top:16px"><a class="btn small" href="#meets" data-nav="meets">Details &amp; entry pack</a></div>`:"";
}
function renderCoaches(){
  $("#coachesList").innerHTML=DB.coaches.map(c=>{
    const ini=c.name.split(" ").map(w=>w[0]).slice(0,2).join("");
    const squads=(c.squads||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join("");
    return `<article class="card coach"><div class="avatar">${esc(ini)}</div>
      <h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div>
      <div class="quals">${esc(c.quals)}</div>
      <div class="squads">${squads}</div></article>`;
  }).join("");
}
function renderRoles(){
  $("#rolesList").innerHTML=DB.roles.map(r=>`
    <article class="card role-card"><h3>${esc(r.title)}</h3>
      <div class="meta">
        <span><strong>Commitment</strong>${esc(r.commitment)}</span>
        <span><strong>Training</strong>${esc(r.training)}</span>
      </div>
      <p>${esc(r.blurb)}</p></article>`).join("");
}
function renderSocials(){
  const list=DB.feed.filter(it=>it.type==="social"||it.type==="meet").sort((a,b)=>a.start<b.start?-1:1);
  $("#socialsList").innerHTML=list.map(it=>{
    if(it.type==="meet"){
      const pill=it.status==="open"?'<span class="pill open">Entries open</span>':it.status==="results"?'<span class="pill results">Results out</span>':'<span class="pill closed">Entries closed</span>';
      return `<article class="card social-card">
        <div class="art" style="background:linear-gradient(135deg,var(--flame),var(--flame-dark))">${esc(it.title)}</div>
        <div class="body"><div class="when">${esc(fmtDate(it.start))} · Open Meet</div>
        <div class="row" style="margin:6px 0">${pill}</div>
        <p>${esc(it.venue)}${it.poolType?` · ${esc(it.poolType)}`:""}</p>
        <div><a class="btn small ghost" href="#meets" data-nav="meets">Full meet details</a></div></div>
      </article>`;
    }
    return `<article class="card social-card">
      <div class="art" style="background:${it.color}">${esc(it.title)}</div>
      <div class="body"><div class="when">${esc(fmtDate(it.start))}</div><p>${esc(it.blurb)}</p>
      ${it.link?`<div><a class="btn small" href="${esc(it.link)}">Details / tickets</a></div>`:""}</div>
    </article>`;
  }).join("");
}
const HERO_SLIDE_BG=[
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#3a5570,#1c2c3d)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#4a5a3a,#1c2c22)",
  "linear-gradient(160deg,rgba(16,16,20,.5),rgba(16,16,20,.1) 65%),repeating-linear-gradient(120deg,rgba(255,255,255,.05) 0 3px,transparent 3px 6px),linear-gradient(135deg,#5a4a3a,#2c1c1c)"
];
let heroIndex=0;
function renderNews(){
  const list=DB.feed.filter(it=>it.type==="news").sort((a,b)=>a.start<b.start?-1:1);
  $("#newsList").innerHTML=list.map(n=>`
    <div class="card">${n.img?`<div class="news-thumb" style="background-image:url('${esc(n.img)}')"></div>`:""}<p class="eyebrow">${esc(n.tag)}</p><h3 style="font-size:1.05rem;margin-top:6px">${esc(n.title)}</h3><p style="color:var(--muted);font-size:.9rem;margin-top:8px">${esc(n.blurb)}</p></div>`).join("");
}
/* Hero carousel: pulls across the whole feed (meets, socials, news) so it reads as one connected
   "what's happening" strip rather than club news alone — sorted by closeness to today's date. */
function heroFeedContent(it){
  if(it.type==="meet")return {tag:"Open Meet",title:it.title,blurb:`${it.venue} · ${fmtDate(it.start)}`,linkAttrs:'href="#meets" data-nav="meets"',img:null};
  if(it.type==="social")return {tag:"Club Calendar",title:it.title,blurb:it.blurb||fmtDate(it.start),linkAttrs:'href="#socials" data-nav="socials"',img:null};
  return {tag:`${it.tag} · Club News`,title:it.title,blurb:it.blurb,linkAttrs:'href="#info-news" data-nav="info" data-anchor="info-news"',img:it.img||null};
}
function renderHeroFeed(){
  const today=new Date();
  const items=DB.feed.filter(it=>it.start)
    .map(it=>({it,diff:Math.abs(new Date(it.start+"T12:00:00")-today)}))
    .sort((a,b)=>a.diff-b.diff)
    .slice(0,6)
    .map(x=>x.it);
  $("#heroSlides").innerHTML=items.map((it,i)=>{
    const c=heroFeedContent(it);
    const bg=c.img?`linear-gradient(160deg,rgba(16,16,20,.55),rgba(16,16,20,.15) 65%),url('${esc(c.img)}') center/cover no-repeat`:HERO_SLIDE_BG[i%HERO_SLIDE_BG.length];
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
    track.style.transform=`translateX(-${slideEl.offsetLeft-inset}px)`;
    $("#heroPrev").style.left=`${Math.max(inset+10,10)}px`;
    $("#heroNext").style.right=`${Math.max(inset+10,10)}px`;
  }
  document.querySelectorAll(".hero-slide").forEach((s,i)=>s.classList.toggle("active",i===heroIndex));
  document.querySelectorAll(".hero-dot").forEach((d,i)=>d.classList.toggle("active",i===heroIndex));
  $("#heroPrev").disabled=heroIndex===0;
  $("#heroNext").disabled=heroIndex===n-1;
}
$("#heroPrev").addEventListener("click",()=>{heroIndex--;updateHeroSlide();});
$("#heroNext").addEventListener("click",()=>{heroIndex++;updateHeroSlide();});
$("#heroDots").addEventListener("click",e=>{const b=e.target.closest(".hero-dot");if(b){heroIndex=+b.dataset.i;updateHeroSlide();}});
let heroResizeTimer;
window.addEventListener("resize",()=>{clearTimeout(heroResizeTimer);heroResizeTimer=setTimeout(updateHeroSlide,100);});
(function(){
  const strip=$("#heroPhotoStrip");let startX=0,deltaX=0,dragging=false;
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
function renderAllPublic(){renderMeets();renderCoaches();renderRoles();renderSocials();renderNews();renderHeroFeed();}

/* ================= ROUTER ================= */
const infoDropdown=$("#infoDropdown"), infoToggle=$("#infoToggle");
function closeInfoMenu(){infoDropdown.classList.remove("open");infoToggle.setAttribute("aria-expanded","false");}
function go(page,anchor){
  document.querySelectorAll("section.page").forEach(s=>s.classList.remove("visible"));
  const el=$("#page-"+page); (el||$("#page-home")).classList.add("visible");
  document.querySelectorAll("nav.main a[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===page));
  $("#mainNav").classList.remove("open");
  closeInfoMenu();
  if(anchor){
    const target=document.getElementById(anchor);
    if(target){requestAnimationFrame(()=>target.scrollIntoView({behavior:"smooth"}));return;}
  }
  window.scrollTo({top:0});
}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-nav]");
  if(a){e.preventDefault();go(a.dataset.nav,a.dataset.anchor);}
});
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
document.querySelectorAll(".path-card").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".path-card").forEach(x=>x.classList.toggle("sel",x===b));
  const p=b.dataset.path;
  $("#joinLessons").hidden = p!=="lessons";
  $("#joinCompetitive").hidden = p!=="competitive";
}));
/* default pathway so a form is always visible and swaps in place */
(function(){const first=document.querySelector('.path-card[data-path="lessons"]');first.classList.add("sel");$("#joinLessons").hidden=false;})();
function submitEnquiry(e,type,detailFn){
  e.preventDefault();
  const f=new FormData(e.target);
  DB.enquiries.unshift({id:nextId++,parent:f.get("parent"),email:f.get("email"),swimmer:f.get("swimmer"),dob:f.get("dob"),type,detail:detailFn(f),notes:f.get("notes"),received:"Just now"});
  e.target.reset();
  toast("Enquiry sent — the membership team will be in touch");
}
$("#joinLessons").addEventListener("submit",e=>submitEnquiry(e,"Academy / lessons",f=>f.get("stage")));
$("#joinCompetitive").addEventListener("submit",e=>submitEnquiry(e,"Competitive trial",f=>`SE ${f.get("seNo")} · ${f.get("level")}`));

/* ================= ADMIN ================= */
let session=null; // {roleKey}
let adminSection=null, editingId=null;

function openAdmin(){$("#admin").classList.add("open");document.body.style.overflow="hidden";session?renderAdminShell():renderLogin();}
function closeAdmin(){$("#admin").classList.remove("open");document.body.style.overflow="";}
["adminLinkFoot"].forEach(id=>{const el=document.getElementById(id);el&&el.addEventListener("click",e=>{e.preventDefault();openAdmin();});});
$("#adminClose").addEventListener("click",closeAdmin);

function renderLogin(){
  $("#whoAmI").innerHTML="";
  $("#adminBody").innerHTML=`<div class="login-wrap"><div class="card">
    <p class="eyebrow" style="color:var(--ember)">Members' area</p>
    <h2 class="display" style="font-size:1.8rem;color:#fff;margin-top:6px">Choose your role to log in</h2>
    <p style="color:#a9a9b2;font-size:.92rem;margin-top:10px">In the real build each person has their own login tied to a role. In this prototype, just pick a role to see exactly what that person can edit — and nothing else.</p>
    <div class="role-pick" id="rolePick">
      ${Object.entries(ROLES).map(([k,r])=>`<button data-role="${k}"><span>${r.label}<br><span class="desc">${r.desc}</span></span><span aria-hidden="true">→</span></button>`).join("")}
    </div>
  </div></div>`;
  $("#rolePick").addEventListener("click",e=>{
    const b=e.target.closest("button[data-role]"); if(!b)return;
    session={roleKey:b.dataset.role};
    adminSection=ROLES[session.roleKey].sections[0];
    renderAdminShell();
    toast("Logged in as "+ROLES[session.roleKey].label+" (demo)");
  });
}

function renderAdminShell(){
  const role=ROLES[session.roleKey];
  $("#whoAmI").innerHTML=`Signed in as <strong>${role.label}</strong> · <a href="#" id="logout" style="color:#a9a9b2">switch role</a>`;
  $("#logout").addEventListener("click",e=>{e.preventDefault();session=null;renderLogin();});
  $("#adminBody").innerHTML=`<div class="admin-shell">
    <div class="admin-side">${role.sections.map(s=>`<button data-sec="${s}" class="${s===adminSection?"active":""}">${SECTION_META[s].name}</button>`).join("")}</div>
    <div class="admin-main" id="adminMain"></div></div>`;
  $("#adminBody").querySelector(".admin-side").addEventListener("click",e=>{
    const b=e.target.closest("button[data-sec]");if(!b)return;
    adminSection=b.dataset.sec;editingId=null;renderAdminShell();
  });
  renderAdminSection();
}

function itemSummary(sec,it){
  if(sec==="feed"){
    const typeLabel=FEED_TYPE_META[it.type].label;
    if(it.type==="meet")return {t:it.title,s:`${typeLabel} · ${fmtDate(it.start)} · ${it.venue} · ${it.status}`};
    if(it.type==="social")return {t:it.title,s:`${typeLabel} · ${fmtDate(it.start)}`};
    if(it.type==="news")return {t:it.title,s:`${typeLabel} · ${it.tag}${it.start?" · "+fmtDate(it.start):""}`};
  }
  switch(sec){
    case "coaches":return {t:it.name,s:it.role};
    case "roles":return {t:it.title,s:it.commitment};
  }
}
function feedItemsForRole(role){return DB.feed.filter(it=>role.feedTypes.includes(it.type));}
function renderAdminSection(){
  const main=$("#adminMain"),sec=adminSection,role=ROLES[session.roleKey];
  if(sec==="enquiries"){
    main.innerHTML=`<h2>${SECTION_META.enquiries.name}</h2>
      <div class="admin-note">Read-only inbox in this draft. Enquiries submitted through the public <em>Join Us</em> form appear here instantly. In the real build these could also forward to the membership email.</div>
      ${DB.enquiries.length?DB.enquiries.map(q=>`<div class="item-row"><div>
        <div class="t">${esc(q.swimmer)} — ${esc(q.type)}</div>
        <div class="s">${esc(q.parent)} · ${esc(q.email)} · DOB ${esc(q.dob)} · ${esc(q.detail)} · received ${esc(q.received)}</div>
        ${q.notes?`<div class="s inbox-msg">“${esc(q.notes)}”</div>`:""}
      </div></div>`).join(""):`<p style="color:#a9a9b2">${SECTION_META.enquiries.empty}</p>`}`;
    return;
  }
  const items=sec==="feed"?feedItemsForRole(role):DB[sec];
  const note=sec==="feed"&&role.feedTypes.length>1
    ?"Changes here publish straight to the public page — no webmaster needed. This feed is shared across meets, socials and news; you can add or edit any type. (Prototype: edits reset on refresh.)"
    :"Changes here publish straight to the public page — no webmaster needed. (Prototype: edits reset on refresh.)";
  main.innerHTML=`<h2>${SECTION_META[sec].name}</h2>
    <div class="admin-note">${note}</div>
    <div style="margin-bottom:18px"><button class="btn small" id="addNew">+ Add new</button></div>
    <div id="itemList">${items.length?items.map(it=>{const s=itemSummary(sec,it);return `
      <div class="item-row"><div><div class="t">${esc(s.t)}</div><div class="s">${esc(s.s)}</div></div>
      <div class="acts"><button class="btn small ghost" style="color:#fff" data-edit="${it.id}">Edit</button>
      <button class="btn small dangerous" data-del="${it.id}">Delete</button></div></div>`;}).join(""):`<p style="color:#a9a9b2">${SECTION_META[sec].empty}</p>`}</div>
    <div id="formSlot"></div>`;
  $("#addNew").addEventListener("click",()=>{
    if(sec==="feed"&&role.feedTypes.length>1)showFeedTypeChooser();
    else showForm(sec,null,sec==="feed"?role.feedTypes[0]:undefined);
  });
  main.addEventListener("click",e=>{
    const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-del]");
    if(ed)showForm(sec,+ed.dataset.edit);
    if(del){
      if(sec==="feed")DB.feed=DB.feed.filter(x=>x.id!==+del.dataset.del);
      else DB[sec]=DB[sec].filter(x=>x.id!==+del.dataset.del);
      renderAllPublic();renderAdminShell();toast("Deleted and unpublished");
    }
  });
}

function showFeedTypeChooser(){
  const role=ROLES[session.roleKey];
  $("#formSlot").innerHTML=`<div class="card" style="margin-top:10px">
    <div class="form-title">What are you adding?</div>
    <div class="role-pick" id="feedTypePick" style="margin-top:12px">
      ${role.feedTypes.map(t=>`<button data-type="${t}"><span>${FEED_TYPE_META[t].label}</span><span aria-hidden="true">→</span></button>`).join("")}
    </div></div>`;
  $("#formSlot").scrollIntoView({behavior:"smooth",block:"start"});
  $("#feedTypePick").addEventListener("click",e=>{
    const b=e.target.closest("button[data-type]");if(!b)return;
    showForm("feed",null,b.dataset.type);
  });
}

function showForm(sec,id,forcedType){
  editingId=id;
  const isFeed=sec==="feed";
  const it=id?(isFeed?DB.feed.find(x=>x.id===id):DB[sec].find(x=>x.id===id)):(isFeed?{type:forcedType}:{});
  const type=isFeed?(it.type||forcedType):null;
  const schemaKey=isFeed?type:sec;
  if(sec==="coaches"&&it.squads)it.squadsRaw=it.squads.join(", ");
  const fields=SCHEMAS[schemaKey].map(f=>{
    const val=esc(it[f.k]??"");
    if(f.type==="textarea")return `<label class="f">${f.label}<textarea name="${f.k}" rows="3" ${f.req?"required":""}>${val}</textarea></label>`;
    if(f.type==="select"){
      const opts=f.opts.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${it[f.k]===v?"selected":""}>${esc(l)}</option>`;}).join("");
      return `<label class="f">${f.label}<select name="${f.k}">${opts}</select></label>`;
    }
    return `<label class="f">${f.label}<input type="${f.type}" name="${f.k}" value="${val}" ${f.req?"required":""}></label>`;
  }).join("");
  const titleLabel=isFeed?FEED_TYPE_META[type].label:SECTION_META[sec].name;
  $("#formSlot").innerHTML=`<form class="stack" id="adminForm" style="margin-top:10px">
    <div class="form-title">${id?"Edit item":"Add new"} — ${titleLabel}</div>
    ${fields}
    <div style="display:flex;gap:10px"><button class="btn" type="submit">${id?"Save & publish":"Publish"}</button>
    <button class="btn ghost" style="color:#fff" type="button" id="cancelForm">Cancel</button></div></form>`;
  $("#formSlot").scrollIntoView({behavior:"smooth",block:"start"});
  $("#cancelForm").addEventListener("click",()=>{$("#formSlot").innerHTML="";editingId=null;});
  $("#adminForm").addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target).entries());
    if(sec==="coaches"){data.squads=(data.squadsRaw||"").split(",").map(s=>s.trim()).filter(Boolean);delete data.squadsRaw;}
    if(isFeed)data.type=type;
    const store=isFeed?DB.feed:DB[sec];
    if(id){Object.assign(store.find(x=>x.id===id),data);}
    else{data.id=nextId++;store.push(data);}
    renderAllPublic();renderAdminShell();
    toast(id?"Saved — live on the public page":"Published to the public page");
  });
}

const MOON_ICON='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
const SUN_ICON='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>';
function toggleTheme(e){e&&e.preventDefault();document.body.classList.toggle("theme-dark");
  const on=document.body.classList.contains("theme-dark");
  const t=document.getElementById("themeToggle");
  if(t){t.setAttribute("aria-pressed",on);t.innerHTML=on?MOON_ICON:SUN_ICON;}
  toast(on?"Black & orange theme":"Light theme");}
document.getElementById("themeToggle").addEventListener("click",toggleTheme);

/* ================= INIT ================= */
renderAllPublic();
go("home");
