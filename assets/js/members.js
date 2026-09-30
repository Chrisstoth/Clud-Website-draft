/* ================= ROLES & PERMISSIONS ================= */
const ROLES = {
  meets:      {label:"Open Meets Secretary", desc:"Add club, external & team meets, entry packs & results", sections:["feed"], feedTypes:["meet","externalMeet","teamMeet"]},
  coaching:   {label:"Coaching Lead",        desc:"Edit coach profiles & squad timetables", sections:["coaches","squads"]},
  volunteers: {label:"Volunteer Coordinator",desc:"Edit volunteer role explainers",   sections:["roles"]},
  socials:    {label:"Socials Team",         desc:"Add events, links & graphics",     sections:["feed","instagram"], feedTypes:["social"]},
  comms:      {label:"Comms / Club News",    desc:"Post club news & announcements",   sections:["feed","instagram"], feedTypes:["news"]},
  training:   {label:"Coaching / Training Changes", desc:"Post key training schedule changes", sections:["feed"], feedTypes:["training"]},
  membership: {label:"Membership Team",      desc:"View trial & squad enquiries",     sections:["enquiries"]},
  welfare:    {label:"Welfare Officer",      desc:"Edit the Welfare & Safeguarding page", sections:["welfare"]},
  secretary:  {label:"Club Secretary",       desc:"Edit the Club Committee page",     sections:["committee"]},
  webmaster:  {label:"Webmaster",            desc:"Full access to every section",     sections:["feed","coaches","squads","roles","enquiries","newsDefaults","welfare","committee","instagram","images"], feedTypes:["meet","externalMeet","teamMeet","social","news","training"]}
};
const SECTION_META = {
  feed:{name:"Club Feed", empty:"Nothing published yet — add the first item."},
  coaches:{name:"Coaches & Squads", empty:"No coaches listed yet."},
  squads:{name:"Squad Timetables", empty:"No squads yet — add the first one."},
  roles:{name:"Volunteer Roles", empty:"No roles yet."},
  enquiries:{name:"Trial Enquiries (inbox)", empty:"No enquiries yet — the public Join Us form feeds this inbox."},
  newsDefaults:{name:"Default News Pictures", empty:"No default picture categories yet."},
  welfare:{name:"Welfare & Safeguarding Page", empty:""},
  committee:{name:"Club Committee", empty:"No committee roles yet."},
  instagram:{name:"Instagram on the News Page", empty:""},
  images:{name:"Manage Images", empty:""}
};
/* One type per feed item; a role's feedTypes controls which of these it can add/see */
const FEED_TYPE_META = {
  meet:{label:"Open Meet — hosted by BPSC",short:"BPSC Open Meets"},
  externalMeet:{label:"Open Meet — other host (e.g. county champs)",short:"Other Open Meets"},
  teamMeet:{label:"Team Meet (e.g. Arena League, Essex League)",short:"Team Meets"},
  social:{label:"Social / Event",short:"Socials"},
  news:{label:"Club News",short:"Club News"},
  training:{label:"Key Training Change",short:"Training Changes"}
};


const NEW_DEFAULT_GRADIENTS=["linear-gradient(135deg,#d4551a,#101014)","linear-gradient(135deg,#f26b21,#ffb25e)","linear-gradient(135deg,#101014,#3c3c46)","linear-gradient(135deg,#1a6fd4,#5eb6ff)","linear-gradient(135deg,#7a1ad4,#c15eff)","linear-gradient(135deg,#3c3c46,#101014)"];
function slugify(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

/* Field schemas drive the mock edit forms. Feed items are keyed by their type ("meet"/"social"/"news"). */
const SCHEMAS = {
  meet:[
    {k:"title",label:"Meet name",type:"text",req:1},
    {k:"visible",label:"Show on the website (untick to hide without deleting)",type:"checkbox"},
    {k:"level",label:"Level / type",type:"select",opts:["Level 1","Level 2","Level 3","Level 4","Club"]},
    {k:"license",label:"Licence number (optional)",type:"text"},
    {k:"poolType",label:"Pool / course (e.g. 25m Short Course)",type:"text"},
    {k:"start",label:"Start date",type:"date",req:1},
    {k:"end",label:"End date (optional)",type:"date"},
    {k:"venue",label:"Venue & pool",type:"text",req:1},
    {k:"closing",label:"Entries close",type:"date"},
    {k:"status",label:"Entry status (moves to Completed galas automatically after the last day)",type:"select",opts:["open","closed"]},
    {k:"entryUrl",label:"Entry pack link (URL)",type:"text"},
    {k:"officialsUrl",label:"Officials sign-up link (URL — button hidden if blank)",type:"text"},
    {k:"volunteerUrl",label:"Volunteer here link (URL — leave blank to use the Volunteering page)",type:"text"},
    {k:"liveUrl",label:"Live results link (URL — red LIVE button shows only on the days of the gala)",type:"text"},
    {k:"resultsUrl",label:"Results link (URL — shown once the gala is completed)",type:"text"},
    {k:"docLinks",label:"Meet documents & links",type:"links"},
    {k:"notes",label:"Notes for parents & swimmers",type:"textarea"},
    {k:"img",label:"Picture",type:"imagepicker"}
  ],
  coaches:[
    {k:"photo",label:"Coach photo",type:"imagepicker",swatches:false},
    {k:"name",label:"Name",type:"text",req:1},
    {k:"role",label:"Coaching role",type:"text",req:1},
    {k:"quals",label:"Qualifications & checks",type:"text"},
    {k:"squadsRaw",label:"Squads (comma-separated)",type:"text"}
  ],
  roles:[
    {k:"title",label:"Role title",type:"text",req:1},
    {k:"category",label:"Section",type:"select",opts:[["volunteering","Volunteering"],["team_manager","Team Manager"],["officiating","Officiating"]],req:1},
    {k:"commitment",label:"Typical commitment",type:"text"},
    {k:"training",label:"Training provided",type:"text"},
    {k:"blurb",label:"What it involves",type:"textarea",req:1}
  ],
  committee:[
    {k:"title",label:"Role title",type:"text",req:1},
    {k:"tier",label:"Group",type:"select",opts:[["committee","Committee"],["executive","Executive Committee"]],req:1},
    {k:"person",label:"Who holds it (leave blank, or \"Vacant\", if nobody does)",type:"text"},
    {k:"photo",label:"Photo (optional)",type:"imagepicker",swatches:false},
    {k:"email",label:"Contact email",type:"text"},
    {k:"commitment",label:"Typical time commitment",type:"text"},
    {k:"summary",label:"One-line summary (optional — shown above the bullets)",type:"textarea"},
    {k:"skillsRaw",label:"Skills & experience (one per line)",type:"textarea"},
    {k:"dutiesRaw",label:"Main duties (one per line)",type:"textarea"}
  ],
  externalMeet:[
    {k:"title",label:"Meet name (e.g. Essex County Championships)",type:"text",req:1},
    {k:"visible",label:"Show on the website (untick to hide without deleting)",type:"checkbox"},
    {k:"host",label:"Hosted by (e.g. Essex County ASA)",type:"text",req:1},
    {k:"level",label:"Level / type",type:"select",opts:["Level 1","Level 2","Level 3","Level 4","Regional","National","Other"]},
    {k:"license",label:"Licence number (optional)",type:"text"},
    {k:"poolType",label:"Pool / course (e.g. 50m Long Course)",type:"text"},
    {k:"start",label:"Start date",type:"date",req:1},
    {k:"end",label:"End date (optional)",type:"date"},
    {k:"venue",label:"Venue & pool",type:"text",req:1},
    {k:"closing",label:"Entries close",type:"date"},
    {k:"status",label:"Entry status (moves to Completed galas automatically after the last day)",type:"select",opts:["open","closed"]},
    {k:"entryUrl",label:"Entry pack link (URL)",type:"text"},
    {k:"officialsUrl",label:"Officials sign-up link (URL — button hidden if blank)",type:"text"},
    {k:"volunteerUrl",label:"Volunteer link (URL — button hidden if blank)",type:"text"},
    {k:"liveUrl",label:"Live results link (URL — red LIVE button shows only on the days of the gala)",type:"text"},
    {k:"resultsUrl",label:"Results link (URL — shown once the gala is completed)",type:"text"},
    {k:"docLinks",label:"Meet documents & links",type:"links"},
    {k:"notes",label:"Notes for parents & swimmers",type:"textarea"},
    {k:"img",label:"Picture",type:"imagepicker"}
  ],
  teamMeet:[
    {k:"title",label:"Meet name (e.g. Arena League — Round 1)",type:"text",req:1},
    {k:"visible",label:"Show on the website (untick to hide without deleting)",type:"checkbox"},
    {k:"league",label:"League / competition (e.g. Arena League, Essex League)",type:"text",req:1},
    {k:"poolType",label:"Pool / course (e.g. 25m Short Course)",type:"text"},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"end",label:"End date (optional)",type:"date"},
    {k:"venue",label:"Venue & pool",type:"text"},
    {k:"notes",label:"Info for parents & swimmers (team selection, arrival times…)",type:"textarea"},
    {k:"leagueUrl",label:"League info link (URL — optional)",type:"text"},
    {k:"liveUrl",label:"Live results link (URL — red LIVE button shows only on the days of the gala)",type:"text"},
    {k:"resultsUrl",label:"Results link (URL — shown once the gala is completed)",type:"text"},
    {k:"docLinks",label:"Meet documents & links",type:"links"},
    {k:"img",label:"Picture",type:"imagepicker"}
  ],
  social:[
    {k:"title",label:"Event name",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"blurb",label:"Summary (shown on the card and homepage)",type:"textarea",req:1},
    {k:"link",label:"Tickets / sign-up link (URL)",type:"text"},
    {k:"color",label:"Card graphic",type:"select",opts:[
      ["linear-gradient(135deg,#f26b21,#ffb25e)","Phoenix orange"],
      ["linear-gradient(135deg,#101014,#3c3c46)","Club black"],
      ["linear-gradient(135deg,#d4551a,#101014)","Ember fade"]]},
    {k:"img",label:"Picture (optional, replaces card graphic)",type:"imagepicker"},
    {k:"photos",label:"Photo gallery (shown as a slideshow on the article page)",type:"gallery"},
    {k:"heroPhotos",label:"Homepage pictures",type:"heropics"},
    {k:"pinUntil",label:"Pin to front of homepage until (optional — leave blank for the normal order)",type:"date"},
    {k:"body",label:"Full write-up (shown on the article page)",type:"richtext"}
  ],
  news:[
    {k:"tag",label:"Category tag (e.g. Racing, Club, Trips)",type:"text",req:1},
    {k:"squads",label:"Which squads is this for?",type:"squadpicks"},
    {k:"title",label:"Headline",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"blurb",label:"Summary (shown in the news list and homepage)",type:"textarea",req:1},
    {k:"img",label:"Picture (thumbnail; used as the cover if there's no gallery yet)",type:"imagepicker"},
    {k:"photos",label:"Photo gallery (shown as a slideshow on the article page)",type:"gallery"},
    {k:"heroPhotos",label:"Homepage pictures",type:"heropics"},
    {k:"pinUntil",label:"Pin to front of homepage until (optional — leave blank for the normal order)",type:"date"},
    {k:"body",label:"Article content",type:"richtext"}
  ],
  training:[
    {k:"title",label:"What's changing",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"end",label:"End date (optional, for a range)",type:"date"},
    {k:"note",label:"Details for parents & swimmers",type:"textarea"},
    {k:"img",label:"Picture",type:"imagepicker"}
  ],
  newsDefaults:[
    {k:"label",label:"Category name",type:"text",req:1},
    {k:"icon",label:"Fallback icon (emoji, shown until a photo is set)",type:"text"},
    {k:"img",label:"Photo",type:"imagepicker",swatches:false}
  ]
};

/* ================= ADMIN ================= */
/* session holds the signed-in account's permissions: which sections they may edit, and
   for the shared feed, which kinds of item. The database enforces the same limits, so a
   tampered page still cannot write anything this account isn't allowed to. */
let session=null;
let adminSection=null, editingId=null;
/* Club Feed list filter: item type and (for Club News) category tag; "" means all. Kept across
   saves so the list doesn't jump back to everything after each edit. */
let feedFilter={type:"",tag:""};

function renderLogin(message){
  $("#whoAmI").innerHTML="";
  $("#adminBody").innerHTML=`<div class="login-wrap"><div class="card">
    <p class="eyebrow" style="color:var(--ember)">Members' area</p>
    <h2 class="display" style="font-size:1.8rem;margin-top:6px">Sign in</h2>
    <p style="color:var(--muted);font-size:.92rem;margin-top:10px">Enter your club email address and we'll send you a sign-in link. There's no password to remember.</p>
    ${message?`<div class="admin-note" style="margin-top:16px">${esc(message)}</div>`:""}
    <form class="stack" id="loginForm" style="margin-top:18px">
      <label class="f">Club email address<input type="email" name="email" required autocomplete="email" placeholder="you@phoenixbasildonsc.org"></label>
      <label class="f" id="passwordField" hidden>Password<input type="password" name="password" autocomplete="current-password"></label>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" type="submit" id="loginSubmit">Email me a sign-in link</button>
        <button class="btn ghost" type="button" id="loginMode">Use a password instead</button>
      </div>
    </form>
  </div></div>`;
  let usePassword=false;
  $("#loginMode").addEventListener("click",()=>{
    usePassword=!usePassword;
    $("#passwordField").hidden=!usePassword;
    $("#passwordField").querySelector("input").required=usePassword;
    $("#loginSubmit").textContent=usePassword?"Sign in":"Email me a sign-in link";
    $("#loginMode").textContent=usePassword?"Email me a link instead":"Use a password instead";
    if(usePassword)$("#passwordField").querySelector("input").focus();
  });
  $("#loginForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const f=new FormData(e.target),email=f.get("email").trim(),btn=$("#loginSubmit"),label=btn.textContent;
    btn.disabled=true;btn.textContent=usePassword?"Signing in…":"Sending…";
    const {error}=usePassword
      ? await sb.auth.signInWithPassword({email,password:f.get("password")})
      /* shouldCreateUser:false — this is a closed area. Accounts are created by the webmaster
         in the Supabase dashboard, so a stranger entering an address gets no link. */
      : await sb.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.href.split("#")[0]}});
    btn.disabled=false;btn.textContent=label;
    if(error)return toast(loginErrorMessage(error));
    if(usePassword)return start();
    $("#adminBody").querySelector(".card").innerHTML=`
      <p class="eyebrow" style="color:var(--ember)">Check your inbox</p>
      <h2 class="display" style="font-size:1.6rem;margin-top:6px">Sign-in link sent</h2>
      <p style="color:var(--muted);font-size:.92rem;margin-top:10px">We've emailed a link to <strong>${esc(email)}</strong>. Open it on this device to sign in. The link expires after an hour.</p>`;
  });
}
/* Supabase's own wording is accurate but unhelpful to a volunteer who mistyped an address
   or asked for one link too many. */
function loginErrorMessage(error){
  const m=error.message||"";
  if(/signups not allowed/i.test(m))return "That address isn't set up as a club editor. Check the spelling, or ask the webmaster to add you.";
  if(/rate limit|too many/i.test(m))return "Too many sign-in emails in a short time. Wait an hour, or sign in with your password instead.";
  if(/invalid login credentials/i.test(m))return "That email and password don't match. Try again, or email yourself a sign-in link.";
  return m;
}

function renderAdminShell(){
  const role=session.role;
  $("#whoAmI").innerHTML=`Signed in as <strong>${esc(role.label)}</strong> · <a href="#" id="logout" style="color:var(--muted)">sign out</a>`;
  $("#logout").addEventListener("click",async e=>{e.preventDefault();await sb.auth.signOut();session=null;renderLogin("You've been signed out.");});
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
    if(isMeet(it)){
      /* Flag a gala that is running today so the Open Meets Secretary can see at a glance whether the live link is set. */
      const state=meetRunning(it)?(it.liveUrl?"● LIVE NOW — results linked":"● running today — add live results link"):meetDone(it)?(it.resultsUrl?"completed · results linked":"completed · add results link"):it.type==="teamMeet"?(it.league||"team meet"):"entries "+it.status;
      const who=it.type==="externalMeet"?` · host: ${it.host||"?"}`:"";
      return {t:it.title,s:`${typeLabel}${who} · ${fmtDate(it.start)} · ${it.venue||"Venue TBC"} · ${state}`};
    }
    if(it.type==="social")return {t:it.title,s:`${typeLabel} · ${fmtDate(it.start)}`};
    if(it.type==="news")return {t:it.title,s:`${typeLabel} · ${it.tag}${(it.squads||[]).length?" · for "+it.squads.join(", "):""}${it.start?" · "+fmtDate(it.start):""}`};
    if(it.type==="training")return {t:it.title,s:`${typeLabel} · ${fmtDate(it.start)}${it.end?" – "+fmtDate(it.end):""}`};
  }
  switch(sec){
    case "coaches":return {t:it.name,s:it.role};
    case "squads":{const n=(it.sessions||[]).length;return {t:it.name,s:`Lead squad coach: ${it.lead||"TBC"} · ${n} session${n===1?"":"s"} a week`};}
    case "roles":{const catLabel={officiating:"Officiating",team_manager:"Team Manager",volunteering:"Volunteering"}[it.category]||"Volunteering";
      return {t:it.title,s:`${catLabel}${it.commitment?" · "+it.commitment:""}`};}
    case "committee":return {t:it.title,s:`${it.tier==="executive"?"Executive · ":""}${it.person||"Vacant"}`};
    case "newsDefaults":return {t:it.label,s:it.img?"Custom photo set":`Gradient placeholder ${it.icon||""}`};
  }
}
function feedItemsForRole(role){return DB.feed.filter(it=>role.feedTypes.includes(it.type));}

/* Where a Club Feed item stands on the homepage slideshow today. Worked out with the same
   heroFeedItems() the homepage runs (core.js), so these badges can't drift from what visitors
   actually see. Pinned items count down to their pin date; other events drop off once their
   last day has passed; ordinary news has no end date -- newer stories push it off. */
const homepageSlides=()=>heroFeedItems(DB.feed.filter(it=>it.visible!==false));
const daysUntil=iso=>Math.round((new Date(iso+"T12:00:00")-new Date(isoToday()+"T12:00:00"))/86400000);
const daysLeftLabel=n=>n<=0?"last day today":n===1?"1 day left":`${n} days left`;
function homeStatus(it,slides){
  const slot=slides.indexOf(it),pinned=heroPinned(it);
  let until="";
  if(pinned)until=`pinned until ${fmtDate(it.pinUntil)} · ${daysLeftLabel(daysUntil(it.pinUntil))}`;
  else if(slot>=0&&heroIsEvent(it))until=`until ${fmtDate(it.end||it.start)} · ${daysLeftLabel(daysUntil(it.end||it.start))}`;
  else if(slot>=0)until="until newer stories push it off";
  return {slot,pinned,until};
}
function homeBadges(it,slides){
  if(it.visible===false)return `<span class="feed-badge off">Hidden from site</span>`;
  const h=homeStatus(it,slides),b=[];
  if(h.slot>=0)b.push(`<span class="feed-badge home">On homepage · slide ${h.slot+1} of ${slides.length}</span>`);
  if(h.pinned)b.push(`<span class="feed-badge pin">📌 Pinned to the front · ${esc(daysLeftLabel(daysUntil(it.pinUntil)))}</span>`);
  if(h.pinned&&h.slot<0)b.push(`<span class="feed-badge off">Not showing — the slideshow is full of other pinned items</span>`);
  if(!h.pinned&&h.slot>=0)b.push(`<span class="feed-badge note">${esc(h.until)}</span>`);
  if(!h.pinned&&it.pinUntil&&daysUntil(it.pinUntil)>=-14)b.push(`<span class="feed-badge note">Pin ended ${esc(fmtDate(it.pinUntil))}</span>`);
  return b.length?`<div class="feed-badges">${b.join("")}</div>`:"";
}
/* The slideshow as it stands today, in order, at the top of the Club Feed. Items this role can
   edit link down to their row; the rest (another team's) are listed for context only. */
function homepagePanelHtml(slides,role){
  if(!slides.length)return `<div class="home-panel"><h3 class="admin-sub">On the homepage now</h3><p style="color:var(--muted)">Nothing on the homepage slideshow at the moment.</p></div>`;
  return `<div class="home-panel"><h3 class="admin-sub">On the homepage now</h3><ol class="home-slides">${slides.map(it=>{
    const h=homeStatus(it,slides),mine=role.feedTypes.includes(it.type);
    const title=mine?`<button type="button" class="home-slide-link" data-jump="${it.id}">${esc(it.title)}</button>`:`<span>${esc(it.title)}</span>`;
    return `<li class="${h.pinned?"is-pinned":""}">${title}
      <span class="home-slide-meta">${esc(heroFeedContent(it).tag)} · ${h.pinned?"📌 ":""}${esc(h.until)}</span></li>`;
  }).join("")}</ol></div>`;
}
function renderAdminSection(){
  const main=$("#adminMain"),sec=adminSection,role=session.role;
  if(sec==="enquiries"){
    main.innerHTML=`<h2>${SECTION_META.enquiries.name}</h2>
      <div class="admin-note">Read-only inbox in this draft. Enquiries submitted through the public <em>Join Us</em> form appear here instantly. In the real build these could also forward to the membership email.</div>
      ${DB.enquiries.length?DB.enquiries.map(q=>`<div class="item-row"><div>
        <div class="t">${esc(q.swimmer)} — ${esc(q.type)}</div>
        <div class="s">${esc(q.parent)} · ${esc(q.email)} · DOB ${esc(q.dob)} · ${esc(q.detail)} · received ${esc(q.received)}</div>
        ${q.notes?`<div class="s inbox-msg">“${esc(q.notes)}”</div>`:""}
      </div></div>`).join(""):`<p style="color:var(--muted)">${SECTION_META.enquiries.empty}</p>`}`;
    return;
  }
  if(sec==="welfare"){
    showWelfareForm();
    return;
  }
  if(sec==="instagram"){
    showInstagramSection();
    return;
  }
  if(sec==="images"){
    showImagesSection();
    return;
  }
  const items=sec==="feed"?feedItemsForRole(role):DB[sec];
  const note=sec==="feed"&&role.feedTypes.length>1
    ?"Changes here publish straight to the public page — no webmaster needed. This feed is shared across several types of item; pick the type when you add something new."
    :"Changes here publish straight to the public page — no webmaster needed.";
  const slides=sec==="feed"?homepageSlides():[];
  const rowHtml=it=>{const s=itemSummary(sec,it);
    const h=sec==="feed"?homeStatus(it,slides):null;
    const cls=h?(h.pinned&&h.slot>=0?" is-pinned":h.slot>=0?" on-home":""):"";
    return `
      <div class="item-block" data-item-block="${it.id}">
      <div class="item-row${cls}"><div><div class="t">${esc(s.t)}</div><div class="s">${esc(s.s)}</div>${sec==="feed"?homeBadges(it,slides):""}</div>
      <div class="acts"><button class="btn small ghost" data-edit="${it.id}">Edit</button>
      <button class="btn small dangerous" data-del="${it.id}">Delete</button></div></div>
      <div class="edit-slot" id="editSlot-${it.id}"></div>
      </div>`;};
  /* Feed: filter chips for type (when the role has more than one) and Club News category, then
     upcoming in date order, anything whose last day has passed in its own section below (most recent first) */
  const feedListHtml=()=>{
    const galasOnly=role.feedTypes.every(t=>MEET_TYPES.includes(t));
    if(feedFilter.type&&!role.feedTypes.includes(feedFilter.type))feedFilter={type:"",tag:""};
    const newsShown=role.feedTypes.includes("news")&&(feedFilter.type==="news"||role.feedTypes.length===1);
    const tags=newsShown?[...new Set(items.filter(it=>it.type==="news"&&it.tag).map(it=>it.tag))].sort((a,b)=>a.localeCompare(b)):[];
    if(!tags.includes(feedFilter.tag))feedFilter.tag="";
    const chip=(attr,val,label,n,on)=>`<button type="button" class="news-tag-chip${on?" active":""}" ${attr}="${esc(val)}">${esc(label)} <span class="chip-n">${n}</span></button>`;
    const typeChips=role.feedTypes.length>1?`<div class="news-tag-chips admin-filter" id="feedTypeChips">
        ${chip("data-ftype","","All",items.length,!feedFilter.type)}
        ${role.feedTypes.map(t=>[t,items.filter(it=>it.type===t).length]).filter(([t,n])=>n||feedFilter.type===t)
          .map(([t,n])=>chip("data-ftype",t,FEED_TYPE_META[t].short,n,feedFilter.type===t)).join("")}</div>`:"";
    const newsItems=items.filter(it=>it.type==="news");
    const tagChips=tags.length>1?`<div class="news-tag-chips admin-filter" id="feedTagChips"><span class="admin-filter-label">Category</span>
        ${chip("data-ftag","","All",newsItems.length,!feedFilter.tag)}
        ${tags.map(t=>chip("data-ftag",t,t,newsItems.filter(it=>it.tag===t).length,feedFilter.tag===t)).join("")}</div>`:"";
    const shown=items.filter(it=>(!feedFilter.type||it.type===feedFilter.type)&&(!feedFilter.tag||it.tag===feedFilter.tag));
    const byDate=[...shown].sort((a,b)=>(a.start||"").localeCompare(b.start||""));
    const upcoming=byDate.filter(it=>!it.start||!meetDone(it)),past=byDate.filter(it=>it.start&&meetDone(it)).reverse();
    return `${typeChips}${tagChips}
      <h3 class="admin-sub">${galasOnly?"Upcoming galas":"Upcoming"}</h3>
      ${upcoming.length?upcoming.map(rowHtml).join(""):`<p style="color:var(--muted)">Nothing upcoming${shown.length<items.length?" matching this filter":""}.</p>`}
      ${past.length?`<h3 class="admin-sub">${galasOnly?"Past galas":"Past items"}</h3>${past.map(rowHtml).join("")}`:""}`;
  };
  let listHtml;
  if(!items.length)listHtml=`<p style="color:var(--muted)">${SECTION_META[sec].empty}</p>`;
  else if(sec==="feed")listHtml=feedListHtml();
  else listHtml=items.map(rowHtml).join("");
  main.innerHTML=`<h2>${SECTION_META[sec].name}</h2>
    <div class="admin-note">${note}</div>
    ${sec==="feed"?homepagePanelHtml(slides,role):""}
    <div style="margin-bottom:18px"><button class="btn small" id="addNew">+ Add new</button></div>
    <div id="itemList">${listHtml}</div>
    <div id="formSlot"></div>`;
  $("#addNew").addEventListener("click",()=>{
    document.querySelectorAll(".edit-slot").forEach(s=>s.innerHTML="");
    editingId=null;
    if(sec==="feed"&&role.feedTypes.length>1)showFeedTypeChooser();
    else showForm(sec,null,sec==="feed"?role.feedTypes[0]:undefined);
  });
  main.addEventListener("click",e=>{
    /* The edit form opens inside this list, so its own buttons bubble up to here -- they must
       never be mistaken for the list's Edit/Delete buttons. */
    if(e.target.closest("#adminForm"))return;
    /* Filter chips redraw just the list, closing any edit form open inside it */
    const fchip=e.target.closest("[data-ftype],[data-ftag]");
    if(fchip){
      if(fchip.dataset.ftype!==undefined)feedFilter={type:fchip.dataset.ftype,tag:""};
      else feedFilter.tag=fchip.dataset.ftag;
      editingId=null;
      $("#itemList").innerHTML=feedListHtml();
      return;
    }
    /* "On the homepage now" titles jump to that item's row, clearing a filter that hides it */
    const jump=e.target.closest("[data-jump]");
    if(jump){
      const find=()=>document.querySelector(`[data-item-block="${jump.dataset.jump}"]`);
      if(!find()){feedFilter={type:"",tag:""};editingId=null;$("#itemList").innerHTML=feedListHtml();}
      const block=find();
      if(block){
        block.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
        block.classList.remove("flash");void block.offsetWidth;block.classList.add("flash");
      }
      return;
    }
    const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-del]");
    if(ed){
      const clickedId=+ed.dataset.edit,wasOpen=editingId===clickedId;
      document.querySelectorAll(".edit-slot").forEach(s=>s.innerHTML="");
      $("#formSlot").innerHTML="";
      editingId=null;
      if(!wasOpen)showForm(sec,clickedId);
    }
    if(del)deleteItem(sec,+del.dataset.del);
  });
}

/* Every write goes to the database, then the local copy is reloaded so the list on screen
   matches what was actually stored (ids, defaults, anything a policy refused). */
async function publishItem(sec,id,data){
  const s=SECTIONS[sec];
  const row=s.to(data);
  const {error}=id?await sb.from(s.table).update(row).eq("id",id):await sb.from(s.table).insert(row);
  if(error){toast(saveErrorMessage(error));return false;}
  await loadContent();
  renderAdminShell();
  toast(id?"Saved — live on the public site":"Published to the public site");
  return true;
}
async function deleteItem(sec,id){
  const {error}=await sb.from(SECTIONS[sec].table).delete().eq("id",id);
  if(error)return toast(saveErrorMessage(error));
  await loadContent();
  renderAdminShell();
  toast("Deleted and unpublished");
}
/* Policy refusals come back as permission errors; say what that means in club terms. */
function saveErrorMessage(error){
  const permission=error.code==="42501"||/row-level security|permission/i.test(error.message||"");
  return permission?"Your account isn't allowed to change that. Ask the webmaster if this looks wrong.":`Couldn't save: ${error.message}`;
}

function showFeedTypeChooser(){
  const role=session.role;
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

/* Squad timetable editor: squad details plus a repeatable row per weekly session. */
function sessRowHtml(s={}){
  const dayOpts=TT_DAYS.map(d=>`<option value="${d}" ${s.day===d?"selected":""}>${TT_DAY_NAMES[d]}</option>`).join("");
  return `<div class="sess-row" data-sess>
    <select data-k="day" aria-label="Day">${dayOpts}</select>
    <input type="time" data-k="start" value="${esc(s.start||"")}" aria-label="Start time" required>
    <input type="time" data-k="end" value="${esc(s.end||"")}" aria-label="End time" required>
    <span class="sess-ampm" aria-label="AM or PM">${s.start?ttPeriod(s):"–"}</span>
    <input type="text" data-k="loc" value="${esc(s.loc||"")}" list="ttLocList" placeholder="Location" aria-label="Location" required>
    <select data-k="type" aria-label="Session type"><option value="pool">Pool</option><option value="land" ${s.type==="land"?"selected":""}>Land</option></select>
    <button type="button" class="sess-del" data-sess-del aria-label="Remove session">×</button>
  </div>`;
}
function showSquadForm(id){
  const sq=id?DB.squads.find(x=>x.id===id):{name:"",lead:"",sessions:[]};
  const locs=[...new Set([...Object.values(TT_LOC),...DB.squads.flatMap(x=>(x.sessions||[]).map(s=>s.loc))].filter(Boolean))].sort();
  const formTarget=id?document.getElementById("editSlot-"+id):$("#formSlot");
  formTarget.innerHTML=`<form class="stack squad-form" id="adminForm" style="margin-top:10px">
    <div class="form-title">${id?"Edit squad":"Add new"} — Squad Timetable</div>
    <label class="f">Squad name<input type="text" name="name" value="${esc(sq.name)}" required></label>
    <label class="f">Lead squad coach<input type="text" name="lead" value="${esc(sq.lead||"")}" list="ttCoachList" placeholder="e.g. Doug C — leave blank to show TBC"></label>
    <datalist id="ttCoachList">${DB.coaches.map(c=>`<option value="${esc(c.name)}">`).join("")}</datalist>
    <datalist id="ttLocList">${locs.map(l=>`<option value="${esc(l)}">`).join("")}</datalist>
    <div>
      <div class="sess-title">Weekly sessions</div>
      <div class="sess-rows" id="sessRows">
        <div class="sess-row sess-head" aria-hidden="true"><span>Day</span><span>Start</span><span>End</span><span>AM/PM</span><span>Location</span><span>Type</span><span></span></div>
        ${[...(sq.sessions||[])].sort(ttSort).map(sessRowHtml).join("")}
      </div>
      <button type="button" class="btn small ghost" id="addSess">+ Add session</button>
      <p class="hint" style="margin-top:8px">AM/PM is set automatically from the start time. Sessions are sorted by day and time when you save.</p>
    </div>
    <div style="display:flex;gap:10px"><button class="btn" type="submit">${id?"Save & publish":"Publish"}</button>
    <button class="btn ghost" type="button" id="cancelForm">Cancel</button></div></form>`;
  formTarget.scrollIntoView({behavior:"smooth",block:"nearest"});
  const rows=$("#sessRows");
  rows.addEventListener("input",e=>{
    if(e.target.dataset.k!=="start")return;
    const v=e.target.value;
    e.target.closest("[data-sess]").querySelector(".sess-ampm").textContent=v?ttPeriod({start:v}):"–";
  });
  rows.addEventListener("click",e=>{const b=e.target.closest("[data-sess-del]");if(b)b.closest("[data-sess]").remove();});
  $("#addSess").addEventListener("click",()=>{
    const last=[...rows.querySelectorAll("[data-sess]")].pop();
    const prev=last?{day:last.querySelector('[data-k="day"]').value,loc:last.querySelector('[data-k="loc"]').value}:{};
    rows.insertAdjacentHTML("beforeend",sessRowHtml(prev));
    rows.lastElementChild.querySelector('[data-k="start"]').focus();
  });
  $("#cancelForm").addEventListener("click",()=>{formTarget.innerHTML="";editingId=null;});
  $("#adminForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const rowEls=[...rows.querySelectorAll("[data-sess]")];
    const sessions=rowEls.map(r=>{const o={};r.querySelectorAll("[data-k]").forEach(i=>o[i.dataset.k]=i.value.trim());return o;});
    const bad=sessions.findIndex(s=>s.end<=s.start);
    if(bad>-1){toast("Each session's end time must be after its start time");rowEls[bad].querySelector('[data-k="end"]').focus();return;}
    const f=new FormData(e.target);
    const submit=e.target.querySelector('button[type="submit"]');
    submit.disabled=true;
    await publishItem("squads",id,{name:f.get("name").trim(),lead:f.get("lead").trim(),sessions:sessions.sort(ttSort)});
    submit.disabled=false;
  });
}

/* Meet documents & links editor: one row per link, in the order they show on the card. */
function docLinkRowHtml(l={}){
  const hlOpts=LINK_HIGHLIGHTS.map(([k,name])=>`<option value="${k}" ${(l.hl||"")===k?"selected":""}>${name}</option>`).join("");
  return `<div class="doclink-row${l.hl?" hl-"+esc(l.hl):""}" data-doclink>
    <input type="text" data-k="label" value="${esc(l.label||"")}" placeholder="Name, e.g. Meet conditions & details" aria-label="Name">
    <input type="text" data-k="text" value="${esc(l.text||"")}" placeholder="Link text, e.g. View conditions" aria-label="Link text">
    <input type="text" data-k="url" value="${esc(l.url||"")}" placeholder="Link (https://…)" aria-label="Link (URL)" inputmode="url">
    <select data-k="hl" aria-label="Highlight colour">${hlOpts}</select>
    <span class="doclink-move"><button type="button" data-doclink-up aria-label="Move up">↑</button><button type="button" data-doclink-down aria-label="Move down">↓</button></span>
    <button type="button" class="sess-del" data-doclink-del aria-label="Remove link">×</button>
  </div>`;
}
function showForm(sec,id,forcedType){
  editingId=id;
  if(sec==="squads")return showSquadForm(id);
  const isFeed=sec==="feed";
  const it=id?(isFeed?DB.feed.find(x=>x.id===id):DB[sec].find(x=>x.id===id)):(isFeed?{type:forcedType}:{});
  const type=isFeed?(it.type||forcedType):null;
  const schemaKey=isFeed?type:sec;
  if(sec==="coaches"&&it.squads)it.squadsRaw=it.squads.join(", ");
  if(sec==="committee"){it.skillsRaw=(it.skills||[]).join("\n");it.dutiesRaw=(it.duties||[]).join("\n");}
  /* Coach and committee photos are drawn as plain square headshots, not through the framing
     helpers, so framing is only offered where it actually takes effect. */
  const canFrame=isFeed||sec==="newsDefaults";
  const fields=SCHEMAS[schemaKey].map(f=>{
    const val=esc(it[f.k]??"");
    if(f.type==="textarea")return `<label class="f">${f.label}<textarea name="${f.k}" rows="3" ${f.req?"required":""}>${val}</textarea></label>`;
    if(f.type==="checkbox")return `<label class="f checkbox-f"><input type="checkbox" name="${f.k}" ${it[f.k]===false?"":"checked"}> ${f.label}</label>`;
    if(f.type==="squadpicks"){
      /* Squads come from Squad Timetables. A name the story already carries but that list no
         longer has (renamed or removed) is still offered, ticked, so saving can't drop it silently. */
      const picked=it[f.k]||[];
      const names=[...new Set(DB.squads.map(s=>s.name).concat(picked))];
      return `<div class="f">${f.label}
        <p class="hint" style="margin:0">People following a ticked squad see this story marked as theirs, and a count of new stories on the Club News link. Leave them all unticked for news that's for the whole club.</p>
        ${names.length?`<div class="squad-picks">${names.map(n=>`<label class="checkbox-f squad-pick"><input type="checkbox" data-squadpick value="${esc(n)}" ${picked.includes(n)?"checked":""}> ${esc(n)}</label>`).join("")}</div>`
          :`<p class="hint" style="margin:0">No squads set up yet — they come from Squad Timetables.</p>`}
      </div>`;
    }
    if(f.type==="select"){
      const opts=f.opts.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${it[f.k]===v?"selected":""}>${esc(l)}</option>`;}).join("");
      return `<label class="f">${f.label}<select name="${f.k}">${opts}</select></label>`;
    }
    if(f.type==="imagepicker"){
      const current=it[f.k]||"";
      const r=resolveNewsImage(current);
      const showSwatches=f.swatches!==false;
      const swatches=showSwatches?DB.newsDefaults.map(d=>{
        const swBg=d.img?`url('${esc(d.img)}') center/cover no-repeat`:d.bg;
        return `<button type="button" class="img-swatch${current===("default:"+d.key)?" selected":""}" data-default="${d.key}" style="background:${swBg}" title="${esc(d.label)}" aria-label="${esc(d.label)}">${d.img?"":d.icon}</button>`;
      }).join(""):"";
      return `<div class="f">${f.label}
        <div class="img-picker">
          <div class="img-preview${r?" "+r.cls:" empty"}" id="imgPreview" style="${r?r.style:""}">${r&&r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>
          ${showSwatches?`<div class="img-swatches">${swatches}</div>`:""}
          <div class="img-add-row">
            <label class="img-upload-btn">Upload your own photo<input type="file" accept="image/*" id="imgUploadInput" style="display:none"></label>
            <button type="button" class="img-upload-btn" id="imgLibraryBtn">Choose from library</button>
          </div>
          <button type="button" class="img-clear-btn" id="imgClearBtn">No picture</button>
        </div>
        <p class="hint" id="imgFromGallery" hidden style="margin:0">Using the first photo from the gallery below.</p>
        ${canFrame?`<button type="button" class="btn small ghost img-frame-btn" id="imgFrameBtn"${isUploadedPhoto(current)?"":" hidden"}>Adjust framing</button>`:""}
        <input type="hidden" name="${f.k}" id="imgHiddenInput" value="${val}">
      </div>`;
    }
    if(f.type==="heropics"){
      return `<div class="f">${f.label}
        <p class="hint" style="margin:0">Normally the homepage slideshow uses the gallery above. If you've made a version of a picture that suits the homepage better — a wide banner for the slanted computer slide, say, or a squarer one for phones — give that screen its own pictures.</p>
        <div class="hero-sets" id="heroSets">${["hd","hp"].map(k=>`<div class="hero-set" data-set="${k}"></div>`).join("")}</div>
      </div>`;
    }
    if(f.type==="gallery"){
      return `<div class="f">${f.label}
        <div class="gallery-picker">
          <div class="gallery-thumbs" id="galleryThumbs"></div>
          <div class="img-add-row">
            <label class="img-upload-btn">Add photos<input type="file" accept="image/*" multiple id="galleryAddInput" style="display:none"></label>
            <button type="button" class="img-upload-btn" id="galleryLibraryBtn">Choose from library</button>
          </div>
          <p class="hint" style="margin-top:2px">Photos are compressed automatically. The first photo doubles as the card thumbnail. Tap <b>Frame</b> to choose what stays in view when a page crops it; × removes one.</p>
        </div>
      </div>`;
    }
    if(f.type==="links"){
      return `<div class="f">${f.label}
        <div class="doclink-rows" id="docLinkRows">${(it[f.k]||[]).map(docLinkRowHtml).join("")}</div>
        <button type="button" class="btn small ghost" id="addDocLink" style="justify-self:start">+ Add link</button>
        <p class="hint" style="margin:0">Shown in the card's "Meet documents &amp; links" panel, in this order, as <b>Name: link text</b> — e.g. conditions, entry file, results file, warm-up times. Link text is optional. Pick a highlight colour to make a line stand out.</p>
      </div>`;
    }
    if(f.type==="richtext"){
      return `<div class="f">${f.label}
        <div class="rte-toolbar" id="rteToolbar">
          <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
          <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
          <button type="button" data-cmd="formatBlock" data-val="&lt;h3&gt;" title="Subheading">H3</button>
          <button type="button" data-cmd="formatBlock" data-val="&lt;p&gt;" title="Paragraph">¶</button>
          <button type="button" data-cmd="insertUnorderedList" title="Bullet list">•⁠—</button>
          <button type="button" data-cmd="insertOrderedList" title="Numbered list">1.—</button>
          <button type="button" data-cmd="createLink" title="Insert link">🔗</button>
          <label class="rte-img-btn" title="Insert photo">🖼️ Photo<input type="file" accept="image/*" id="rteImgInput" style="display:none"></label>
          <button type="button" data-rte-library title="Insert a photo that's already been uploaded">🗂️ Library</button>
        </div>
        <div class="rte-editor article-body" id="rteEditor" contenteditable="true">${sanitizeArticleHtml(it[f.k])}</div>
        <p class="hint" style="margin-top:6px">This box shows exactly how the article text will look on the page.</p>
      </div>`;
    }
    return `<label class="f">${f.label}<input type="${f.type}" name="${f.k}" value="${val}" ${f.req?"required":""}></label>`;
  }).join("");
  const titleLabel=isFeed?FEED_TYPE_META[type].label:SECTION_META[sec].name;
  const canPreview=isFeed&&(type==="news"||type==="social");
  const formTarget=id?document.getElementById("editSlot-"+id):$("#formSlot");
  formTarget.innerHTML=`<form class="stack" id="adminForm" style="margin-top:10px">
    <div class="form-title">${id?"Edit item":"Add new"} — ${titleLabel}</div>
    ${canPreview?`<button type="button" class="btn small ghost" id="previewBtn" style="justify-self:start">Preview as article page</button>`:""}
    ${fields}
    ${isFeed?`<input type="hidden" name="heroCard" id="heroCardInput" value="${esc(it.heroCard||"")}">`:""}
    <div style="display:flex;gap:10px"><button class="btn" type="submit">${id?"Save & publish":"Publish"}</button>
    <button class="btn ghost" type="button" id="cancelForm">Cancel</button></div></form>`;
  formTarget.scrollIntoView({behavior:"smooth",block:"nearest"});
  /* Opens the framing editor on a set of photos (the gallery, one screen's own homepage pictures,
     or the one picture), starting at photo i, showing only the views those photos appear in. On
     a feed item it also carries the story's homepage card (its live text from this form, and
     where it sits), since that card covers part of every photo the homepage shows for the story.
     Returns the re-framed URLs, or null on cancel. */
  const frame=async(urls,i=0,views)=>{
    const cardInput=$("#heroCardInput");
    let card=null;
    if(cardInput){
      const live=Object.fromEntries(new FormData(formTarget.querySelector("#adminForm")).entries());
      card={...heroFeedContent({...live,type}),layout:cardInput.value};
    }
    const res=await openFramingEditor(urls,i,card,views);
    if(!res)return null;
    if(cardInput)cardInput.value=res.layout;
    return res.urls;
  };
  /* With a gallery, its first photo IS the picture (it overwrites "img" on save), so the picture
     field follows the gallery rather than offering choices that would be thrown away. */
  const galleryField=SCHEMAS[schemaKey].find(f=>f.type==="gallery");
  let galleryPhotos=galleryField?[...(it.photos||[])]:null;
  /* A homepage screen ("hd" computer, "hp" phone) can have its own pictures instead of the
     gallery's. Switching back to "same as gallery" only sets them aside -- they come back if the
     admin changes their mind before saving. An own set left empty also falls back to the gallery. */
  const heroSetsField=SCHEMAS[schemaKey].find(f=>f.type==="heropics");
  const heroSets={hd:[...(it.heroPhotos?.hd||[])],hp:[...(it.heroPhotos?.hp||[])]};
  const heroOwn={hd:heroSets.hd.length>0,hp:heroSets.hp.length>0};
  const heroUsed=k=>heroOwn[k]&&heroSets[k].length>0;
  /* the views the gallery (or the single picture) actually shows up in */
  const galleryViews=()=>FRAME_VIEWS.map(v=>v.key).filter(k=>!heroUsed(k));
  let syncPicture=()=>{};
  let setGallery=()=>{};
  const imgHidden=$("#imgHiddenInput");
  if(imgHidden){
    const preview=$("#imgPreview");
    const setPreview=val=>{
      const r=resolveNewsImage(val);
      preview.className=`img-preview${r?" "+r.cls:" empty"}`;
      preview.style.cssText=r?r.style:"";
      preview.innerHTML=r&&r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:"";
      preview.classList.toggle("empty",!r);
      if($("#imgFrameBtn"))$("#imgFrameBtn").hidden=!isUploadedPhoto(val);
    };
    syncPicture=()=>{
      const fromGallery=!!galleryPhotos?.length;
      formTarget.querySelectorAll(".img-swatches,.img-picker .img-add-row,#imgClearBtn").forEach(el=>el.hidden=fromGallery);
      $("#imgFromGallery").hidden=!fromGallery;
      if(!fromGallery)return;
      imgHidden.value=galleryPhotos[0];
      formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.remove("selected"));
      setPreview(imgHidden.value);
    };
    $("#imgFrameBtn")?.addEventListener("click",async()=>{
      if(galleryPhotos?.length){
        const framed=await frame(galleryPhotos,0,galleryViews());
        if(framed)setGallery(framed);
        return;
      }
      const framed=await frame([imgHidden.value],0,galleryViews());
      if(framed){imgHidden.value=framed[0];setPreview(framed[0]);}
    });
    formTarget.querySelectorAll(".img-swatch").forEach(btn=>{
      btn.addEventListener("click",()=>{
        imgHidden.value="default:"+btn.dataset.default;
        formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.toggle("selected",b===btn));
        setPreview(imgHidden.value);
      });
    });
    $("#imgUploadInput").addEventListener("change",async e=>{
      const file=e.target.files[0];
      if(!file)return;
      const label=e.target.closest(".img-upload-btn");
      const labelText=label.firstChild;
      const original=labelText.nodeValue;
      labelText.nodeValue="Uploading…";
      try{
        imgHidden.value=await uploadImage(file);
        formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.remove("selected"));
        setPreview(imgHidden.value);
        toast("Photo uploaded");
      }catch(err){
        toast(err.message||"Couldn't upload that photo");
      }finally{
        labelText.nodeValue=original;
        e.target.value="";
      }
    });
    $("#imgLibraryBtn").addEventListener("click",async()=>{
      const urls=await pickLibraryImages({single:true});
      if(!urls)return;
      imgHidden.value=urls[0];
      formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.remove("selected"));
      setPreview(imgHidden.value);
    });
    $("#imgClearBtn").addEventListener("click",()=>{
      imgHidden.value="";
      formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.remove("selected"));
      setPreview("");
    });
  }
  if(galleryField){
    const renderGalleryThumbs=()=>{
      syncPicture();
      $("#galleryThumbs").innerHTML=galleryPhotos.length?galleryPhotos.map((url,i)=>
        `<div class="gallery-thumb"><img src="${esc(url)}" alt="" style="${photoImgStyle(url)}">
          <button type="button" class="gallery-thumb-del" data-photo-del="${i}" aria-label="Remove this photo">×</button>
          <button type="button" class="gallery-thumb-frame" data-photo-frame="${i}">Frame</button></div>`).join("")
        :`<p class="hint" style="margin:0">No photos yet.</p>`;
    };
    setGallery=urls=>{galleryPhotos=urls;renderGalleryThumbs();};
    renderGalleryThumbs();
    $("#galleryThumbs").addEventListener("click",async e=>{
      const del=e.target.closest("[data-photo-del]");
      if(del){galleryPhotos.splice(+del.dataset.photoDel,1);renderGalleryThumbs();return;}
      const frameBtn=e.target.closest("[data-photo-frame]");
      if(!frameBtn)return;
      const framed=await frame(galleryPhotos,+frameBtn.dataset.photoFrame,galleryViews());
      if(framed)setGallery(framed);
    });
    $("#galleryLibraryBtn").addEventListener("click",async()=>{
      const urls=await pickLibraryImages();
      if(urls){addNewPhotos(galleryPhotos,urls);renderGalleryThumbs();}
    });
    $("#galleryAddInput").addEventListener("change",async e=>{
      const files=[...e.target.files];
      if(!files.length)return;
      const label=e.target.closest("label"),original=label.firstChild.nodeValue;
      for(const file of files){
        label.firstChild.nodeValue="Uploading…";
        try{galleryPhotos.push(await uploadImage(file));renderGalleryThumbs();}
        catch(err){toast(err.message||"Couldn't upload that photo");}
      }
      label.firstChild.nodeValue=original;
      e.target.value="";
    });
  }
  if(heroSetsField){
    const SET_LABELS={hd:"On a computer — the wide, slanted slide",hp:"On a phone"};
    const renderHeroSet=k=>{
      const own=heroOwn[k],list=heroSets[k];
      formTarget.querySelector(`.hero-set[data-set="${k}"]`).innerHTML=`<div class="hero-set-head">
          <span class="hero-set-title">${SET_LABELS[k]}</span>
          <span class="frame-seg"><button type="button" data-set-mode="" class="${own?"":"on"}">Same as gallery</button><button type="button" data-set-mode="own" class="${own?"on":""}">Own pictures</button></span>
        </div>
        ${own?`<div class="gallery-thumbs">${list.length?list.map((url,i)=>
          `<div class="gallery-thumb"><img src="${esc(url)}" alt="" style="${photoImgStyle(withFraming(url,{...imgFraming(url),ad:imgFraming(url)[k]}))}">
            <button type="button" class="gallery-thumb-del" data-set-del="${i}" aria-label="Remove this photo">×</button>
            <button type="button" class="gallery-thumb-frame" data-set-frame="${i}">Frame</button></div>`).join("")
          :`<p class="hint" style="margin:0">No pictures yet — the gallery is used here until you add some.</p>`}</div>
        <div class="img-add-row">
          <label class="img-upload-btn">Add photos<input type="file" accept="image/*" multiple data-set-add style="display:none"></label>
          <button type="button" class="img-upload-btn" data-set-library>Choose from library</button>
        </div>`:""}`;
    };
    ["hd","hp"].forEach(renderHeroSet);
    $("#heroSets").addEventListener("click",async e=>{
      const box=e.target.closest(".hero-set");if(!box)return;
      const k=box.dataset.set;
      const mode=e.target.closest("[data-set-mode]");
      if(mode){heroOwn[k]=!!mode.dataset.setMode;return renderHeroSet(k);}
      if(e.target.closest("[data-set-library]")){
        const urls=await pickLibraryImages();
        if(urls){addNewPhotos(heroSets[k],urls);renderHeroSet(k);}
        return;
      }
      const del=e.target.closest("[data-set-del]");
      if(del){heroSets[k].splice(+del.dataset.setDel,1);return renderHeroSet(k);}
      const fb=e.target.closest("[data-set-frame]");
      if(fb){
        const framed=await frame(heroSets[k],+fb.dataset.setFrame,[k]);
        if(framed){heroSets[k]=framed;renderHeroSet(k);}
      }
    });
    $("#heroSets").addEventListener("change",async e=>{
      if(!e.target.matches("[data-set-add]"))return;
      const k=e.target.closest(".hero-set").dataset.set;
      const files=[...e.target.files];
      if(!files.length)return;
      const label=e.target.closest("label");
      label.firstChild.nodeValue="Uploading…";
      for(const file of files){
        try{heroSets[k].push(await uploadImage(file));}
        catch(err){toast(err.message||"Couldn't upload that photo");}
      }
      renderHeroSet(k);
    });
  }
  const docLinkRows=$("#docLinkRows");
  if(docLinkRows){
    docLinkRows.addEventListener("change",e=>{
      if(e.target.dataset.k!=="hl")return;
      const row=e.target.closest("[data-doclink]");
      row.className="doclink-row"+(e.target.value?" hl-"+e.target.value:"");
    });
    docLinkRows.addEventListener("click",e=>{
      const row=e.target.closest("[data-doclink]");if(!row)return;
      if(e.target.closest("[data-doclink-del]"))row.remove();
      else if(e.target.closest("[data-doclink-up]")&&row.previousElementSibling)row.after(row.previousElementSibling);
      else if(e.target.closest("[data-doclink-down]")&&row.nextElementSibling)row.before(row.nextElementSibling);
    });
    $("#addDocLink").addEventListener("click",()=>{
      docLinkRows.insertAdjacentHTML("beforeend",docLinkRowHtml());
      docLinkRows.lastElementChild.querySelector('[data-k="label"]').focus();
    });
  }
  const rteEditor=$("#rteEditor");
  if(rteEditor){
    $("#rteToolbar").addEventListener("click",e=>{
      if(e.target.closest("[data-rte-library]"))return insertLibraryImages(rteEditor);
      const b=e.target.closest("[data-cmd]");if(!b)return;
      rteEditor.focus();
      if(b.dataset.cmd==="createLink"){
        const url=prompt("Link URL (https://…)");
        if(url)document.execCommand("createLink",false,url);
        return;
      }
      document.execCommand(b.dataset.cmd,false,b.dataset.val||null);
    });
    $("#rteImgInput").addEventListener("change",async e=>{
      const file=e.target.files[0];
      if(!file)return;
      try{
        const url=await uploadImage(file);
        rteEditor.focus();
        document.execCommand("insertHTML",false,`<img src="${url}" alt="">`);
      }catch(err){toast(err.message||"Couldn't upload that photo");}
      e.target.value="";
    });
    /* Pasting from Word/Docs/etc drags in fonts, colours and classes the sanitizer would strip
       anyway — inserting as plain text keeps the editor honest about what will actually publish. */
    rteEditor.addEventListener("paste",e=>{
      e.preventDefault();
      document.execCommand("insertText",false,(e.clipboardData||window.clipboardData).getData("text/plain"));
    });
  }
  $("#previewBtn")?.addEventListener("click",()=>{
    const liveData=Object.fromEntries(new FormData(formTarget.querySelector("#adminForm")).entries());
    liveData.type=type;
    liveData.id=it.id;
    if(galleryField)liveData.photos=galleryPhotos;
    if(rteEditor)liveData.body=sanitizeArticleHtml(rteEditor.innerHTML);
    showArticlePreview(liveData);
  });
  $("#cancelForm").addEventListener("click",()=>{formTarget.innerHTML="";editingId=null;});
  $("#adminForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target).entries());
    /* FormData omits an unchecked checkbox entirely, so read those straight off the inputs. */
    SCHEMAS[schemaKey].filter(f=>f.type==="checkbox").forEach(f=>{data[f.k]=formTarget.querySelector(`[name="${f.k}"]`).checked;});
    if(SCHEMAS[schemaKey].some(f=>f.type==="squadpicks"))
      data.squads=[...formTarget.querySelectorAll("[data-squadpick]:checked")].map(i=>i.value);
    if(sec==="coaches"){data.squads=(data.squadsRaw||"").split(",").map(s=>s.trim()).filter(Boolean);delete data.squadsRaw;}
    if(sec==="committee"){
      data.skills=(data.skillsRaw||"").split("\n").map(s=>s.trim()).filter(Boolean);delete data.skillsRaw;
      data.duties=(data.dutiesRaw||"").split("\n").map(s=>s.trim()).filter(Boolean);delete data.dutiesRaw;
    }
    if(isFeed)data.type=type;
    if(galleryField)data.photos=galleryPhotos;
    if(docLinkRows){
      /* The row inputs carry data-k rather than name, so FormData skips them; gather them here.
         A row with no name, text or link is just dropped; one with words but no link is a mistake. */
      const rowEls=[...docLinkRows.querySelectorAll("[data-doclink]")];
      const links=rowEls.map(r=>{const o={};r.querySelectorAll("[data-k]").forEach(i=>o[i.dataset.k]=i.value.trim());return o;});
      const bad=links.findIndex(l=>!l.url&&(l.label||l.text));
      if(bad>-1){toast("Each document or link needs its link (URL) — or remove that line");rowEls[bad].querySelector('[data-k="url"]').focus();return;}
      data.docLinks=links.filter(l=>l.url);
    }
    if(heroSetsField){
      const own=Object.fromEntries(["hd","hp"].filter(heroUsed).map(k=>[k,heroSets[k]]));
      data.heroPhotos=Object.keys(own).length?own:null;
    }
    if(rteEditor)data.body=sanitizeArticleHtml(rteEditor.innerHTML);
    if(galleryField&&galleryPhotos.length)data.img=galleryPhotos[0];
    if(!id&&sec==="newsDefaults"){
      const base=slugify(data.label)||"category";
      let uniq=base,n=2;while(DB.newsDefaults.some(x=>x.key===uniq))uniq=`${base}-${n++}`;
      data.key=uniq;
      data.bg=NEW_DEFAULT_GRADIENTS[DB.newsDefaults.length%NEW_DEFAULT_GRADIENTS.length];
    }
    const submit=e.target.querySelector('button[type="submit"]');
    submit.disabled=true;
    await publishItem(sec,id,data);
    submit.disabled=false;
  });
}

/* "Preview as article page" renders the in-progress form through the exact same markup as the
   public article page (articleContentHtml, in core.js), so what an admin sees here is what
   publishes — not a stand-in. */
function showArticlePreview(it){
  let overlay=document.getElementById("articlePreviewOverlay");
  if(!overlay){
    overlay=document.createElement("div");
    overlay.id="articlePreviewOverlay";
    overlay.className="preview-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.classList.remove("open");});
  }
  overlay.innerHTML=`<div class="preview-overlay-inner">
    <div class="preview-overlay-bar">
      <span>Preview — exactly how this will appear on the site</span>
      <button type="button" class="btn small ghost" id="previewClose">Close</button>
    </div>
    <div class="preview-overlay-body"><div class="container article-container">${articleContentHtml(it)}</div></div>
  </div>`;
  overlay.classList.add("open");
  document.getElementById("previewClose").addEventListener("click",()=>overlay.classList.remove("open"));
  wireArticleGallery((it.photos||[]).length);
}

/* Framing editor. Everything is set separately for each of the four views an article is seen in
   (FRAME_VIEWS in core.js): the admin picks a view with the tabs, and the one preview shows that
   view while they tap the spot that must stay in view, zoom in on it, or tick "whole photo" for
   posters and logos. The homepage previews are to-scale replicas of the real slides with the
   story's card on top, slant and all, and on those two tabs the card itself can be laid out
   for that screen too (side and size on a computer, top/bottom and size on a phone). A gallery
   is framed as a set: the strip along the top switches photo. Framing is stored on each photo's
   URL (imgFraming in core.js), the card layout on the story (feed.hero_card, see
   heroCardClasses). "only" limits the tabs to the views these photos are actually used in -- a
   computer-only homepage picture has nothing to frame for phones or the article page.
   Resolves to {urls, layout}, or null if they cancel. */
const isUploadedPhoto=v=>!!v&&!String(v).startsWith("default:");
/* A real slide's size in px (see .hero-slide in site.css): drawn at that size, then scaled to fit. */
const HERO_REPLICAS={hd:{w:1100,h:520,cls:"frame-hero-desk"},hp:{w:360,h:340,cls:"frame-hero-phone"}};
const ARTICLE_RATIOS={ad:"16/10",ap:"4/3"};
/* The homepage card's options on each screen. Each row switches one hero_card word on or off. */
const CARD_OPTIONS={
  hd:[{label:"Position",token:"right",items:[["","Left"],["right","Right"]]},
      {label:"Size",token:"compact",items:[["","Full"],["compact","Title only"]]}],
  hp:[{label:"Position",token:"p-top",items:[["","Bottom"],["p-top","Top"]]},
      {label:"Size",token:"p-compact",items:[["","Full"],["p-compact","Title only"]]}]
};
function framePreviewHtml(view,card){
  const r=HERO_REPLICAS[view];
  if(!r)return `<div class="frame-preview photo" data-paint="${view}" style="aspect-ratio:${ARTICLE_RATIOS[view]}"></div>`;
  return `<div class="frame-hero-fig ${r.cls}">
    <div class="fh" data-w="${r.w}" style="aspect-ratio:${r.w}/${r.h}">
      <div class="fh-inner" style="width:${r.w}px;height:${r.h}px">
        <div class="fh-photo photo" data-paint="${view}"></div><div class="fh-shade"></div>
        ${card?`<div class="fh-card">
          <p class="eyebrow">${esc(card.tag)}</p>
          <h3>${esc(card.title||"Your headline")}</h3>
          <p class="fh-blurb">${esc(card.blurb||"")}</p>
          <span class="fh-link">Read more →</span>
        </div>`:""}
      </div>
    </div>
  </div>`;
}
function openFramingEditor(urls,start,card,only){
  return new Promise(resolve=>{
    const frames=urls.map(u=>({url:u,v:imgFraming(u)}));
    let cur=Math.max(0,Math.min(start||0,frames.length-1));
    const views=FRAME_VIEWS.filter(v=>!only||only.includes(v.key));
    let view=views[0].key;
    const fr=()=>frames[cur].v[view];
    const layout=new Set(String(card?.layout||"").split(/\s+/).filter(t=>HERO_CARD_TOKENS.includes(t)));
    let overlay=document.getElementById("framingOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="framingOverlay";
      overlay.className="preview-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML=`<div class="preview-overlay-inner" role="dialog" aria-label="Frame this photo">
      <div class="preview-overlay-bar">
        <span id="frameTitle">Frame this photo</span>
        <span style="display:flex;gap:8px">
          <button type="button" class="btn small ghost" data-act="cancel">Cancel</button>
          <button type="button" class="btn small" data-act="done">Done</button>
        </span>
      </div>
      <div class="frame-body">
        ${frames.length>1?`<div class="frame-strip" id="frameStrip">${frames.map((f,i)=>
          `<button type="button" data-photo="${i}" aria-label="Photo ${i+1}"><img src="${esc(String(f.url).split("#")[0])}" alt="" style="${photoImgStyle(f.url)}"></button>`).join("")}</div>`:""}
        <div class="frame-seg frame-seg-views" role="tablist">${views.map(v=>`<button type="button" role="tab" data-view="${v.key}">${v.label}</button>`).join("")}</div>
        <div id="framePreview"></div>
        <div class="frame-card-opts" id="frameCardOpts"></div>
        <div class="frame-controls">
          <p class="hint" style="margin:0">Tap (or drag) on the part of the photo that must stay in view in <b id="frameViewName"></b> — zoom closes in on that spot. Every tab keeps its own settings.</p>
          <div class="frame-stage" id="frameStage"><img alt="" draggable="false"><span class="frame-marker" id="frameMarker"></span></div>
          <div class="frame-zoom">
            <span class="frame-label">Zoom</span>
            <input type="range" id="frameZoom" min="1" max="${ZOOM_MAX}" step="0.05" aria-label="Zoom">
            <output id="frameZoomOut"></output>
          </div>
          <label class="f checkbox-f"><input type="checkbox" id="frameFit"> Show the whole photo, uncropped</label>
          <p class="hint" style="margin:-10px 0 0">Best for posters, logos and anything with writing on it. Any gap around the photo is filled in black.</p>
          ${views.length>1?`<button type="button" class="frame-copy" id="frameCopy">Use this photo framing for all ${views.length===4?"four":views.length} views</button>`:""}
        </div>
      </div>
    </div>`;
    const q=sel=>overlay.querySelector(sel);
    const stage=q("#frameStage"),marker=q("#frameMarker"),fitBox=q("#frameFit"),zoomIn=q("#frameZoom");
    const layoutValue=()=>HERO_CARD_TOKENS.filter(t=>layout.has(t)).join(" ");
    /* The replica is laid out at a real slide's pixel size and scaled down to its box, so the
       card's type, padding and slant land exactly where they will on the live page. */
    const fitReplica=()=>overlay.querySelectorAll(".fh").forEach(fh=>fh.style.setProperty("--s",fh.clientWidth/fh.dataset.w));
    const resizeObs=new ResizeObserver(fitReplica);
    const draw=()=>{
      const f=fr(),photo=frames[cur];
      marker.style.left=`${f.x}%`;marker.style.top=`${f.y}%`;
      stage.classList.toggle("fit",f.fit);
      fitBox.checked=f.fit;
      zoomIn.disabled=f.fit;
      zoomIn.value=f.zoom;
      q("#frameZoomOut").textContent=f.fit?"—":`${f.zoom.toFixed(1)}×`;
      overlay.querySelectorAll("[data-paint]").forEach(el=>{
        const k=el.dataset.paint;
        el.style.cssText=`${k in ARTICLE_RATIOS?`aspect-ratio:${ARTICLE_RATIOS[k]};`:""}${photoUrlVar(photo.url)};${frameVars(photo.v[k])}`;
      });
      overlay.querySelectorAll(".fh-card").forEach(el=>el.className="fh-card"+heroCardClasses(layoutValue()));
      overlay.querySelectorAll("#frameCardOpts [data-token]").forEach(b=>
        b.classList.toggle("on",b.dataset.v?layout.has(b.dataset.token):!layout.has(b.dataset.token)));
      /* the strip thumbnail of the photo being framed follows its article-page framing */
      const thumb=overlay.querySelector(`#frameStrip [data-photo="${cur}"] img`);
      if(thumb)thumb.style.cssText=photoImgStyle(withFraming(photo.url,photo.v));
    };
    /* A tab swaps the one preview (and the card options, which only the homepage has). */
    const showView=v=>{
      view=v;
      const label=FRAME_VIEWS.find(x=>x.key===view).label;
      overlay.querySelectorAll(".frame-seg-views [data-view]").forEach(b=>{
        b.classList.toggle("on",b.dataset.view===view);
        b.setAttribute("aria-selected",b.dataset.view===view);
      });
      q("#frameViewName").textContent=label.toLowerCase();
      resizeObs.disconnect();
      q("#framePreview").innerHTML=framePreviewHtml(view,card);
      overlay.querySelectorAll(".fh").forEach(fh=>resizeObs.observe(fh));
      const opts=card&&CARD_OPTIONS[view];
      q("#frameCardOpts").hidden=!opts;
      q("#frameCardOpts").innerHTML=opts?`<p class="hint" style="margin:0">The story's card on ${view==="hd"?"a computer":"a phone"} — the same for all its photos. Move it off whatever matters in the picture.</p>
        <div class="frame-card-row">${opts.map(o=>`<span class="frame-opt"><span class="frame-label">${o.label}</span>
          <span class="frame-seg">${o.items.map(([v,l])=>`<button type="button" data-token="${o.token}" data-v="${v}">${l}</button>`).join("")}</span></span>`).join("")}</div>`:"";
      draw();
      fitReplica();
    };
    const showPhoto=i=>{
      cur=i;
      stage.querySelector("img").src=String(frames[cur].url).split("#")[0];
      if(frames.length>1)q("#frameTitle").textContent=`Frame photo ${cur+1} of ${frames.length}`;
      overlay.querySelectorAll("#frameStrip [data-photo]").forEach((b,j)=>b.classList.toggle("on",j===cur));
      draw();
    };
    const place=e=>{
      const f=fr();
      if(f.fit)return;
      const r=stage.querySelector("img").getBoundingClientRect();
      f.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
      f.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
      draw();
    };
    stage.addEventListener("pointerdown",e=>{stage.setPointerCapture(e.pointerId);place(e);});
    stage.addEventListener("pointermove",e=>{if(stage.hasPointerCapture(e.pointerId))place(e);});
    fitBox.addEventListener("change",()=>{fr().fit=fitBox.checked;draw();});
    zoomIn.addEventListener("input",()=>{fr().zoom=+zoomIn.value;draw();});
    const close=result=>{
      overlay.classList.remove("open");
      resizeObs.disconnect();
      document.removeEventListener("keydown",onKey);
      resolve(result);
    };
    const onKey=e=>{if(e.key==="Escape")close(null);};
    document.addEventListener("keydown",onKey);
    overlay.onclick=e=>{
      if(e.target===overlay)return close(null);
      const pick=e.target.closest("[data-photo]");
      if(pick)return showPhoto(+pick.dataset.photo);
      const tab=e.target.closest("[data-view]");
      if(tab)return showView(tab.dataset.view);
      if(e.target.closest("#frameCopy")){
        const f=fr();
        for(const v of views)frames[cur].v[v.key]={...f};
        toast("Photo framing copied to every view");
        return draw();
      }
      const opt=e.target.closest("[data-token]");
      if(opt){
        if(opt.dataset.v)layout.add(opt.dataset.token);else layout.delete(opt.dataset.token);
        return draw();
      }
      const act=e.target.closest("[data-act]")?.dataset.act;
      if(act==="cancel")return close(null);
      if(act==="done")close({urls:frames.map(f=>withFraming(f.url,f.v)),layout:layoutValue()});
    };
    overlay.classList.add("open");
    showPhoto(cur);
    showView(view);
  });
}

/* The Welfare & Safeguarding page is a single document rather than a list of items, so it
   gets its own editor instead of going through showForm/SCHEMAS — one rich-text box, a Save
   button, and a "Preview the page" button using the exact same markup the public page
   renders (welfarePageHtml, in core.js), so what an admin sees here is what publishes. */
function showWelfareForm(){
  const main=$("#adminMain"),current=DB.welfare[0];
  main.innerHTML=`<h2>${SECTION_META.welfare.name}</h2>
    <div class="admin-note">Changes here publish straight to the public Welfare page — no webmaster needed.</div>
    <form class="stack" id="welfareForm" style="margin-top:10px">
      <div class="f">
        <div class="rte-toolbar" id="rteToolbar">
          <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
          <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
          <button type="button" data-cmd="formatBlock" data-val="&lt;h3&gt;" title="Subheading">H3</button>
          <button type="button" data-cmd="formatBlock" data-val="&lt;p&gt;" title="Paragraph">¶</button>
          <button type="button" data-cmd="insertUnorderedList" title="Bullet list">•⁠—</button>
          <button type="button" data-cmd="insertOrderedList" title="Numbered list">1.—</button>
          <button type="button" data-cmd="createLink" title="Insert link">🔗</button>
          <label class="rte-img-btn" title="Insert photo">🖼️ Photo<input type="file" accept="image/*" id="rteImgInput" style="display:none"></label>
          <button type="button" data-rte-library title="Insert a photo that's already been uploaded">🗂️ Library</button>
        </div>
        <div class="rte-editor article-body" id="rteEditor" contenteditable="true">${sanitizeArticleHtml(current?current.body:WELFARE_DEFAULT_BODY)}</div>
        <p class="hint" style="margin-top:6px">This box shows exactly how the page text will look — headings, bold, links, lists and photos, in place.</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" type="submit">Save &amp; publish</button>
        <button type="button" class="btn small ghost" id="welfarePreviewBtn">Preview the page</button>
      </div>
    </form>`;
  const rteEditor=$("#rteEditor");
  $("#rteToolbar").addEventListener("click",e=>{
    if(e.target.closest("[data-rte-library]"))return insertLibraryImages(rteEditor);
    const b=e.target.closest("[data-cmd]");if(!b)return;
    rteEditor.focus();
    if(b.dataset.cmd==="createLink"){
      const url=prompt("Link URL (https://… or mailto:…)");
      if(url)document.execCommand("createLink",false,url);
      return;
    }
    document.execCommand(b.dataset.cmd,false,b.dataset.val||null);
  });
  $("#rteImgInput").addEventListener("change",async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const url=await uploadImage(file);
      rteEditor.focus();
      document.execCommand("insertHTML",false,`<img src="${url}" alt="">`);
    }catch(err){toast(err.message||"Couldn't upload that photo");}
    e.target.value="";
  });
  /* Pasting from Word/Docs/etc drags in fonts, colours and classes the sanitizer would strip
     anyway — inserting as plain text keeps the editor honest about what will actually publish. */
  rteEditor.addEventListener("paste",e=>{
    e.preventDefault();
    document.execCommand("insertText",false,(e.clipboardData||window.clipboardData).getData("text/plain"));
  });
  $("#welfarePreviewBtn").addEventListener("click",()=>{
    showWelfarePreview(sanitizeArticleHtml(rteEditor.innerHTML));
  });
  $("#welfareForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const submit=e.target.querySelector('button[type="submit"]');
    submit.disabled=true;
    await publishItem("welfare",current?current.id:null,{body:sanitizeArticleHtml(rteEditor.innerHTML)});
    submit.disabled=false;
  });
}
function showWelfarePreview(body){
  let overlay=document.getElementById("articlePreviewOverlay");
  if(!overlay){
    overlay=document.createElement("div");
    overlay.id="articlePreviewOverlay";
    overlay.className="preview-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.classList.remove("open");});
  }
  overlay.innerHTML=`<div class="preview-overlay-inner">
    <div class="preview-overlay-bar">
      <span>Preview — exactly how this will appear on the site</span>
      <button type="button" class="btn small ghost" id="previewClose">Close</button>
    </div>
    <div class="preview-overlay-body"><div class="container">${welfarePageHtml(body)}</div></div>
  </div>`;
  overlay.classList.add("open");
  document.getElementById("previewClose").addEventListener("click",()=>overlay.classList.remove("open"));
}

/* ================= INSTAGRAM =================
   Not a list of items like the other sections: one setting (which Behold feed to read) plus a
   tick per post. The table stores the posts that are HIDDEN rather than the ones shown, so
   anything newly posted on Instagram goes on the News page without anyone visiting here. */
const IG_SETUP_HTML=`<ol>
  <li><strong>Make the club's Instagram a professional account</strong> (skip this if it already is). In the Instagram app: <em>Settings → Account type and tools → Switch to professional account</em>, and pick Business or Creator. It's free and followers won't notice any difference.</li>
  <li>Go to <a href="https://behold.so" target="_blank" rel="noopener">behold.so</a> and sign up for a free account.</li>
  <li>Connect <strong>@basildonphoenix_swim</strong>. Behold sends you to Instagram (or Facebook, if the account is linked to a Facebook Page) to sign in with the club's login and approve access.</li>
  <li>Create a feed for that account. When it asks what kind, choose <strong>JSON</strong>, not a widget. The website draws the cards itself so they match the rest of the site.</li>
  <li>In the feed's settings, set the number of posts as high as the plan allows, so there are still plenty to show if you hide a few.</li>
  <li>Copy the feed link (it looks like <code>https://feeds.behold.so/AbC123xyz</code>), paste it in the box below and press <em>Save feed link</em>.</li>
</ol>
<p><strong>After that:</strong></p>
<ul>
  <li>New posts appear on the News page by themselves. Behold checks Instagram on a schedule, so a new post can take up to about a day to show on the free plan.</li>
  <li>To keep a post off the website, untick it in the list below. It stays on Instagram; this only changes our site.</li>
  <li>If posts stop updating (for example after the Instagram password changes), sign in to Behold and reconnect the account.</li>
</ul>`;
/* ================= MANAGE IMAGES =================
   Every photo in the image store, with where each one is used, so the webmaster can clear out
   ones nothing needs. A photo is "used" when its file name appears anywhere in the site's
   content -- a card picture, gallery, homepage set, article text, coach or committee photo. */
function photoUses(name){
  const uses=[];
  const has=it=>JSON.stringify(it).includes(name);
  for(const it of DB.feed)if(has(it))uses.push(`${FEED_TYPE_META[it.type]?.label.split(" — ")[0]||"Feed"}: ${it.title}`);
  for(const it of DB.coaches)if(has(it))uses.push(`Coach: ${it.name}`);
  for(const it of DB.committee)if(has(it))uses.push(`Committee: ${it.title}`);
  for(const it of DB.newsDefaults)if(has(it))uses.push(`Default news picture: ${it.label}`);
  if(DB.welfare.some(has))uses.push("Welfare & Safeguarding page");
  for(const k of ["squads","roles"])if(DB[k].some(has))uses.push(SECTION_META[k].name);
  return uses;
}
async function listAllImages(){
  const store=sb.storage.from("site-images"),all=[];
  for(let offset=0;;offset+=100){
    const {data,error}=await store.list("",{limit:100,offset,sortBy:{column:"created_at",order:"desc"}});
    if(error)throw error;
    all.push(...data.filter(f=>f.id&&!f.name.startsWith(".")));
    if(data.length<100)return all;
  }
}
async function showImagesSection(){
  const main=$("#adminMain"),name=SECTION_META.images.name;
  main.innerHTML=`<h2>${name}</h2><p style="color:var(--muted);margin-top:16px">Loading…</p>`;
  let files;
  try{files=await listAllImages();}
  catch(e){
    if(adminSection!=="images")return;
    main.innerHTML=`<h2>${name}</h2><div class="admin-note">Couldn't load the photos: ${esc(saveErrorMessage(e))}</div>`;
    return;
  }
  if(adminSection!=="images")return;
  const store=sb.storage.from("site-images");
  const photos=files.map(f=>({name:f.name,url:store.getPublicUrl(f.name).data.publicUrl,day:fmtDate((f.created_at||"").slice(0,10)),uses:photoUses(f.name)}));
  let unusedOnly=false;
  main.innerHTML=`<h2>${name}</h2>
    <div class="admin-note">Every photo uploaded to the site, newest first. Deleting one removes it for good — anywhere it's still used will show a gap instead, so check the <b>Used in</b> list first.</div>
    <div id="imgManager"></div>`;
  const box=$("#imgManager");
  const render=()=>{
    const unused=photos.filter(p=>!p.uses.length).length;
    const shown=unusedOnly?photos.filter(p=>!p.uses.length):photos;
    box.innerHTML=`<div class="img-manage-bar">
        <span class="hint" style="margin:0">${photos.length} photo${photos.length===1?"":"s"} · ${unused} not used anywhere</span>
        <label class="f checkbox-f"><input type="checkbox" id="imgUnusedOnly"${unusedOnly?" checked":""}> Only show unused photos</label>
      </div>
      ${shown.length?`<div class="img-manage-grid">${shown.map(p=>`<div class="img-manage-card">
          <a href="${esc(p.url)}" target="_blank" rel="noopener" class="img-manage-thumb"><img src="${esc(p.url)}" alt="" loading="lazy"></a>
          <div class="img-manage-info">
            <div class="s">Uploaded ${esc(p.day)}</div>
            ${p.uses.length?`<div class="s img-manage-uses"><b>Used in:</b> ${p.uses.map(esc).join("; ")}</div>`:`<div class="s img-manage-unused">Not used anywhere</div>`}
          </div>
          <button type="button" class="btn small dangerous" data-img-del="${esc(p.name)}">Delete</button>
        </div>`).join("")}</div>`
      :`<p style="color:var(--muted)">${photos.length?"Every photo is in use.":"No photos have been uploaded yet."}</p>`}`;
  };
  render();
  box.addEventListener("change",e=>{if(e.target.id==="imgUnusedOnly"){unusedOnly=e.target.checked;render();}});
  box.addEventListener("click",async e=>{
    const btn=e.target.closest("[data-img-del]");if(!btn)return;
    const photo=photos.find(p=>p.name===btn.dataset.imgDel);
    const warning=photo.uses.length
      ?`This photo is still used in:\n\n• ${photo.uses.join("\n• ")}\n\nDeleting it will leave a gap in those places. Delete it anyway?`
      :"Delete this photo for good? This can't be undone.";
    if(!confirm(warning))return;
    btn.disabled=true;
    btn.textContent="Deleting…";
    /* a refused delete comes back as an empty list rather than an error */
    const {data,error}=await store.remove([photo.name]);
    if(error||!data?.length){
      btn.disabled=false;
      btn.textContent="Delete";
      return toast(error?saveErrorMessage(error):"Your account isn't allowed to delete photos. Ask the webmaster if this looks wrong.");
    }
    photos.splice(photos.indexOf(photo),1);
    render();
    toast("Photo deleted");
  });
}

async function showInstagramSection(){
  const main=$("#adminMain"),name=SECTION_META.instagram.name;
  main.innerHTML=`<h2>${name}</h2><p style="color:var(--muted);margin-top:16px">Loading…</p>`;
  let settings;
  try{settings=await loadInstagramSettings();}
  catch(e){
    if(adminSection!=="instagram")return;
    main.innerHTML=`<h2>${name}</h2>
      <div class="admin-note">The Instagram settings haven't been set up in the database yet. The webmaster needs to run <code>supabase/migrations/014_instagram_settings.sql</code> in the Supabase SQL Editor. (${esc(e.message||e)})</div>`;
    return;
  }
  /* the loads above are async -- if someone clicked another section meanwhile, leave it be */
  if(adminSection!=="instagram")return;
  let hidden=settings.hidden;
  const feedUrl=settings.feedId?`https://feeds.behold.so/${settings.feedId}`:"";
  main.innerHTML=`<h2>${name}</h2>
    <div class="admin-note">The News page shows the club's latest Instagram posts as a row of cards, brought in automatically through a free service called Behold. New posts are shown by default; untick any you'd rather keep off the website. Changes publish straight away.</div>
    <details class="ig-setup"${settings.feedId?"":" open"}>
      <summary>How to connect the club's Instagram (one-off setup)</summary>
      <div class="ig-setup-body">${IG_SETUP_HTML}</div>
    </details>
    <form class="stack" id="igFeedForm" style="margin-top:22px">
      <label class="f">Behold feed link<input name="feed" value="${esc(feedUrl)}" placeholder="https://feeds.behold.so/…" autocomplete="off"></label>
      <p class="hint" style="margin-top:-8px">Paste the whole link or just the code at the end. Clear the box and save to turn the Instagram row off.</p>
      <div><button class="btn" type="submit">Save feed link</button></div>
    </form>
    <h3 class="admin-sub">Posts</h3>
    <div id="igPosts">${settings.feedId?`<p style="color:var(--muted)">Loading posts from Instagram…</p>`
      :`<p style="color:var(--muted)">Once the feed link is saved, the latest posts appear here, each with a tick to show or hide it.</p>`}</div>`;

  $("#igFeedForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const raw=e.target.feed.value.trim(),id=beholdFeedId(raw);
    if(raw&&!id)return toast("That doesn't look like a Behold feed link");
    const btn=e.target.querySelector('button[type="submit"]');
    btn.disabled=true;
    try{
      /* check the feed actually answers before publishing it, so a typo can't blank the row */
      if(id)await fetchBeholdPosts(id);
      const {error}=await sb.from("instagram_settings").upsert({id:1,feed_id:id||null});
      if(error)throw new Error(saveErrorMessage(error));
      toast(id?"Feed saved — Instagram posts are now on the News page":"Instagram row turned off");
      showInstagramSection();
    }catch(err){toast(err.message||"Couldn't save the feed link");btn.disabled=false;}
  });

  if(!settings.feedId)return;
  const list=$("#igPosts");
  let posts;
  try{posts=await fetchBeholdPosts(settings.feedId);}
  catch(e){list.innerHTML=`<p style="color:var(--muted)">Couldn't load the posts from Behold: ${esc(e.message)}. Check the feed link above, or try again later.</p>`;return;}
  if(!posts.length){list.innerHTML=`<p style="color:var(--muted)">Behold hasn't returned any posts yet. If the account was only just connected, give it a little while.</p>`;return;}
  list.innerHTML=`<p class="hint" style="margin-bottom:12px">Newest first. The News page shows the newest ${IG_MAX_POSTS} ticked posts.</p>`+posts.map(p=>{
    const img=igPostImage(p),badge=igPostBadge(p),day=(p.timestamp||"").slice(0,10),shown=!hidden.includes(p.id);
    return `<div class="item-row ig-admin-row${shown?"":" is-hidden"}">
      <div class="ig-admin-post">
        ${img?`<img src="${esc(img)}" alt="" loading="lazy">`:`<span class="ig-admin-noimg"></span>`}
        <div><div class="t">${day?esc(fmtDate(day)):"Instagram post"}${badge?` · ${badge}`:""}</div>
          <div class="s ig-admin-caption">${esc(igPostCaption(p))||"<em>No caption</em>"}</div>
          <a class="s" href="${esc(p.permalink)}" target="_blank" rel="noopener">Open on Instagram ↗</a></div>
      </div>
      <label class="f checkbox-f"><input type="checkbox" data-ig-post="${esc(p.id)}"${shown?" checked":""}> Show on website</label>
    </div>`;
  }).join("");
  /* Saves are queued one after another so two quick ticks can't each start from the same old
     list and undo each other. */
  let queue=Promise.resolve();
  list.addEventListener("change",e=>{
    const box=e.target.closest("[data-ig-post]");if(!box)return;
    const id=box.dataset.igPost,show=box.checked,row=box.closest(".ig-admin-row");
    row.classList.toggle("is-hidden",!show);
    queue=queue.then(async()=>{
      const next=show?hidden.filter(h=>h!==id):[...new Set([...hidden,id])];
      const {error}=await sb.from("instagram_settings").upsert({id:1,hidden_posts:next});
      if(error){box.checked=!show;row.classList.toggle("is-hidden",show);return toast(saveErrorMessage(error));}
      hidden=next;
      toast(show?"Showing on the News page":"Hidden from the News page");
    });
  });
}

/* Photos go to the shared image store, so every visitor loads the same file rather than a
   copy embedded in each item. Compressed first — see compressImage in core.js. */
async function uploadImage(file){
  const dataUrl=await compressImage(file);
  const blob=await(await fetch(dataUrl)).blob();
  const name=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
  const {error}=await sb.storage.from("site-images").upload(name,blob,{contentType:"image/jpeg",cacheControl:"31536000"});
  if(error)throw new Error(saveErrorMessage(error));
  return sb.storage.from("site-images").getPublicUrl(name).data.publicUrl;
}

/* The photo library: every photo already in the image store, newest first, so a picture can be
   used again without uploading it twice. Nothing ever deletes from the store, so sharing a photo
   between items is safe, and framing lives in each item's copy of the link, so every use frames
   it separately. Resolves with the chosen links (in the order picked), or null if cancelled. */
const LIBRARY_PAGE=60;
function pickLibraryImages({single=false}={}){
  return new Promise(resolve=>{
    let overlay=document.getElementById("libraryOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="libraryOverlay";
      overlay.className="preview-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML=`<div class="preview-overlay-inner" role="dialog" aria-label="Choose from the photo library">
      <div class="preview-overlay-bar">
        <span>${single?"Choose a photo":"Choose photos"}</span>
        <span style="display:flex;gap:8px">
          <button type="button" class="btn small ghost" data-act="cancel">Cancel</button>
          ${single?"":`<button type="button" class="btn small" data-act="done" disabled>Add photos</button>`}
        </span>
      </div>
      <div class="library-body">
        <p class="hint" style="margin:0">Every photo already uploaded to the site, newest first. ${single?"Tap one to use it.":"Tap to pick one or more — they're added in the order you pick them."}</p>
        <div class="library-grid" id="libraryGrid"></div>
        <p class="hint" id="libraryStatus" style="margin:0">Loading…</p>
        <button type="button" class="btn small ghost library-more" data-act="more" hidden>Load more</button>
      </div>
    </div>`;
    const q=sel=>overlay.querySelector(sel);
    const grid=q("#libraryGrid"),status=q("#libraryStatus"),more=q("[data-act=more]"),done=q("[data-act=done]");
    const store=sb.storage.from("site-images");
    const chosen=[];
    let offset=0;
    const load=async()=>{
      more.hidden=true;
      status.hidden=false;
      status.textContent="Loading…";
      const {data,error}=await store.list("",{limit:LIBRARY_PAGE,offset,sortBy:{column:"created_at",order:"desc"}});
      if(error){status.textContent=`Couldn't load the library: ${saveErrorMessage(error)}`;return;}
      offset+=data.length;
      /* folders come back without an id; Supabase's ".emptyFolderPlaceholder" isn't a photo */
      grid.insertAdjacentHTML("beforeend",data.filter(f=>f.id&&!f.name.startsWith(".")).map(f=>{
        const url=store.getPublicUrl(f.name).data.publicUrl,day=fmtDate((f.created_at||"").slice(0,10));
        return `<button type="button" class="library-item" data-url="${esc(url)}" aria-label="Photo uploaded ${esc(day)}">
          <img src="${esc(url)}" alt="" loading="lazy"><span class="library-num"></span><span class="library-date">${esc(day)}</span></button>`;
      }).join(""));
      status.hidden=grid.children.length>0;
      status.textContent="No photos have been uploaded yet.";
      more.hidden=data.length<LIBRARY_PAGE;
    };
    const paint=()=>{
      grid.querySelectorAll("[data-url]").forEach(b=>{
        const i=chosen.indexOf(b.dataset.url);
        b.classList.toggle("on",i>=0);
        b.querySelector(".library-num").textContent=i>=0?i+1:"";
      });
      done.disabled=!chosen.length;
      done.textContent=chosen.length>1?`Add ${chosen.length} photos`:chosen.length?"Add 1 photo":"Add photos";
    };
    const close=result=>{
      overlay.classList.remove("open");
      document.removeEventListener("keydown",onKey);
      resolve(result);
    };
    const onKey=e=>{if(e.key==="Escape")close(null);};
    document.addEventListener("keydown",onKey);
    overlay.onclick=e=>{
      if(e.target===overlay)return close(null);
      const item=e.target.closest("[data-url]");
      if(item){
        if(single)return close([item.dataset.url]);
        const i=chosen.indexOf(item.dataset.url);
        if(i>=0)chosen.splice(i,1);else chosen.push(item.dataset.url);
        return paint();
      }
      const act=e.target.closest("[data-act]")?.dataset.act;
      if(act==="cancel")return close(null);
      if(act==="done")return close(chosen.slice());
      if(act==="more")load();
    };
    overlay.classList.add("open");
    overlay.scrollTop=0;
    load();
  });
}
/* Adds library photos to a list, skipping any it already has (whatever their framing). */
const addNewPhotos=(list,urls)=>{
  for(const u of urls)if(!list.some(p=>String(p).split("#")[0]===u))list.push(u);
};
/* The library opens over the text editor, so remember where the caret was and put the photos there. */
async function insertLibraryImages(editor){
  const sel=getSelection();
  const range=sel.rangeCount&&editor.contains(sel.anchorNode)?sel.getRangeAt(0).cloneRange():null;
  const urls=await pickLibraryImages();
  if(!urls)return;
  editor.focus();
  if(range){sel.removeAllRanges();sel.addRange(range);}
  document.execCommand("insertHTML",false,urls.map(u=>`<img src="${esc(u)}" alt="">`).join(""));
}

/* ================= INIT =================
   A sign-in link lands back on this page with the session in the URL; supabase-js picks it
   up, so just ask who is signed in, then match them to their row in the members table. */
async function start(){
  const {data:{session:auth}}=await sb.auth.getSession();
  if(!auth)return renderLogin();
  const {data:member,error}=await sb.from("members").select("*").ilike("email",auth.user.email).maybeSingle();
  if(error)return renderLogin(`Couldn't check your account: ${error.message}`);
  if(!member||!ROLES[member.role]){
    await sb.auth.signOut();
    return renderLogin(`${auth.user.email} isn't set up as a club editor yet. Ask the webmaster to add you.`);
  }
  const defaults=ROLES[member.role];
  session={email:member.email,role:{...defaults,label:member.label||defaults.label,feedTypes:member.feed_types||defaults.feedTypes||[]}};
  adminSection=session.role.sections[0];
  try{await loadContent();}
  catch(e){return renderLogin(`Couldn't load the club content: ${e.message}`);}
  renderAdminShell();
}
start();
