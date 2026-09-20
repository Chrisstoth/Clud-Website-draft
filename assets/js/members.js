/* ================= ROLES & PERMISSIONS ================= */
const ROLES = {
  meets:      {label:"Open Meets Secretary", desc:"Add club, external & team meets, entry packs & results", sections:["feed"], feedTypes:["meet","externalMeet","teamMeet"]},
  coaching:   {label:"Coaching Lead",        desc:"Edit coach profiles & squad timetables", sections:["coaches","squads"]},
  volunteers: {label:"Volunteer Coordinator",desc:"Edit volunteer role explainers",   sections:["roles"]},
  socials:    {label:"Socials Team",         desc:"Add events, links & graphics",     sections:["feed"], feedTypes:["social"]},
  comms:      {label:"Comms / Club News",    desc:"Post club news & announcements",   sections:["feed"], feedTypes:["news"]},
  training:   {label:"Coaching / Training Changes", desc:"Post key training schedule changes", sections:["feed"], feedTypes:["training"]},
  membership: {label:"Membership Team",      desc:"View trial & squad enquiries",     sections:["enquiries"]},
  welfare:    {label:"Welfare Officer",      desc:"Edit the Welfare & Safeguarding page", sections:["welfare"]},
  secretary:  {label:"Club Secretary",       desc:"Edit the Club Committee page",     sections:["committee"]},
  webmaster:  {label:"Webmaster",            desc:"Full access to every section",     sections:["feed","coaches","squads","roles","enquiries","newsDefaults","welfare","committee"], feedTypes:["meet","externalMeet","teamMeet","social","news","training"]}
};
const SECTION_META = {
  feed:{name:"Club Feed", empty:"Nothing published yet — add the first item."},
  coaches:{name:"Coaches & Squads", empty:"No coaches listed yet."},
  squads:{name:"Squad Timetables", empty:"No squads yet — add the first one."},
  roles:{name:"Volunteer Roles", empty:"No roles yet."},
  enquiries:{name:"Trial Enquiries (inbox)", empty:"No enquiries yet — the public Join Us form feeds this inbox."},
  newsDefaults:{name:"Default News Pictures", empty:"No default picture categories yet."},
  welfare:{name:"Welfare & Safeguarding Page", empty:""},
  committee:{name:"Club Committee", empty:"No committee roles yet."}
};
/* One type per feed item; a role's feedTypes controls which of these it can add/see */
const FEED_TYPE_META = {
  meet:{label:"Open Meet — hosted by BPSC"},
  externalMeet:{label:"Open Meet — other host (e.g. county champs)"},
  teamMeet:{label:"Team Meet (e.g. Arena League, Essex League)"},
  social:{label:"Social / Event"},
  news:{label:"Club News"},
  training:{label:"Key Training Change"}
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
    {k:"conditionsUrl",label:"Meet conditions & details link (URL)",type:"text"},
    {k:"conditionsLabel",label:"Meet conditions link text",type:"text"},
    {k:"entryFileUrl",label:"Sports Systems entry file link (URL)",type:"text"},
    {k:"entryFileLabel",label:"Entry file link text",type:"text"},
    {k:"resultsFileUrl",label:"Sports Systems results file link (URL — the .zip other clubs import)",type:"text"},
    {k:"resultsFileLabel",label:"Results file link text",type:"text"},
    {k:"currentEntriesUrl",label:"Current entries link (URL)",type:"text"},
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
    {k:"conditionsUrl",label:"Meet conditions & details link (URL)",type:"text"},
    {k:"conditionsLabel",label:"Meet conditions link text",type:"text"},
    {k:"resultsFileUrl",label:"Sports Systems results file link (URL — the .zip other clubs import)",type:"text"},
    {k:"resultsFileLabel",label:"Results file link text",type:"text"},
    {k:"currentEntriesUrl",label:"Current entries link (URL)",type:"text"},
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
    {k:"body",label:"Full write-up (shown on the article page)",type:"richtext"}
  ],
  news:[
    {k:"tag",label:"Category tag (e.g. Racing, Club, Trips)",type:"text",req:1},
    {k:"title",label:"Headline",type:"text",req:1},
    {k:"start",label:"Date",type:"date",req:1},
    {k:"blurb",label:"Summary (shown in the news list and homepage)",type:"textarea",req:1},
    {k:"img",label:"Picture (thumbnail; used as the cover if there's no gallery yet)",type:"imagepicker"},
    {k:"photos",label:"Photo gallery (shown as a slideshow on the article page)",type:"gallery"},
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
      const hidden=it.visible===false?" · HIDDEN FROM SITE":"";
      return {t:it.title,s:`${typeLabel}${who} · ${fmtDate(it.start)} · ${it.venue||"Venue TBC"} · ${state}${hidden}`};
    }
    if(it.type==="social")return {t:it.title,s:`${typeLabel} · ${fmtDate(it.start)}`};
    if(it.type==="news")return {t:it.title,s:`${typeLabel} · ${it.tag}${it.start?" · "+fmtDate(it.start):""}`};
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
  const items=sec==="feed"?feedItemsForRole(role):DB[sec];
  const note=sec==="feed"&&role.feedTypes.length>1
    ?"Changes here publish straight to the public page — no webmaster needed. This feed is shared across several types of item; pick the type when you add something new."
    :"Changes here publish straight to the public page — no webmaster needed.";
  const rowHtml=it=>{const s=itemSummary(sec,it);return `
      <div class="item-block" data-item-block="${it.id}">
      <div class="item-row"><div><div class="t">${esc(s.t)}</div><div class="s">${esc(s.s)}</div></div>
      <div class="acts"><button class="btn small ghost" data-edit="${it.id}">Edit</button>
      <button class="btn small dangerous" data-del="${it.id}">Delete</button></div></div>
      <div class="edit-slot" id="editSlot-${it.id}"></div>
      </div>`;};
  let listHtml;
  if(!items.length)listHtml=`<p style="color:var(--muted)">${SECTION_META[sec].empty}</p>`;
  else if(sec==="feed"){
    /* Feed: upcoming in date order, anything whose last day has passed in its own section below (most recent first) */
    const galasOnly=role.feedTypes.every(t=>MEET_TYPES.includes(t));
    const byDate=[...items].sort((a,b)=>(a.start||"").localeCompare(b.start||""));
    const upcoming=byDate.filter(it=>!it.start||!meetDone(it)),past=byDate.filter(it=>it.start&&meetDone(it)).reverse();
    listHtml=`<h3 class="admin-sub">${galasOnly?"Upcoming galas":"Upcoming"}</h3>
      ${upcoming.length?upcoming.map(rowHtml).join(""):`<p style="color:var(--muted)">Nothing upcoming.</p>`}
      ${past.length?`<h3 class="admin-sub">${galasOnly?"Past galas":"Past items"}</h3>${past.map(rowHtml).join("")}`:""}`;
  }
  else listHtml=items.map(rowHtml).join("");
  main.innerHTML=`<h2>${SECTION_META[sec].name}</h2>
    <div class="admin-note">${note}</div>
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

function showForm(sec,id,forcedType){
  editingId=id;
  if(sec==="squads")return showSquadForm(id);
  const isFeed=sec==="feed";
  const it=id?(isFeed?DB.feed.find(x=>x.id===id):DB[sec].find(x=>x.id===id)):(isFeed?{type:forcedType}:{});
  const type=isFeed?(it.type||forcedType):null;
  const schemaKey=isFeed?type:sec;
  if(sec==="coaches"&&it.squads)it.squadsRaw=it.squads.join(", ");
  if(sec==="committee"){it.skillsRaw=(it.skills||[]).join("\n");it.dutiesRaw=(it.duties||[]).join("\n");}
  const fields=SCHEMAS[schemaKey].map(f=>{
    const val=esc(it[f.k]??"");
    if(f.type==="textarea")return `<label class="f">${f.label}<textarea name="${f.k}" rows="3" ${f.req?"required":""}>${val}</textarea></label>`;
    if(f.type==="checkbox")return `<label class="f checkbox-f"><input type="checkbox" name="${f.k}" ${it[f.k]===false?"":"checked"}> ${f.label}</label>`;
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
          <div class="img-preview${r?"":" empty"}" id="imgPreview" style="background:${r?r.css:""}">${r&&r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:""}</div>
          ${showSwatches?`<div class="img-swatches">${swatches}</div>`:""}
          <label class="img-upload-btn">Upload your own photo<input type="file" accept="image/*" id="imgUploadInput" style="display:none"></label>
          <button type="button" class="img-clear-btn" id="imgClearBtn">No picture</button>
        </div>
        <input type="hidden" name="${f.k}" id="imgHiddenInput" value="${val}">
      </div>`;
    }
    if(f.type==="gallery"){
      return `<div class="f">${f.label}
        <div class="gallery-picker">
          <div class="gallery-thumbs" id="galleryThumbs"></div>
          <label class="img-upload-btn">Add photos<input type="file" accept="image/*" multiple id="galleryAddInput" style="display:none"></label>
          <p class="hint" style="margin-top:2px">Photos are compressed automatically. The first photo doubles as the card thumbnail. Use × to remove one.</p>
        </div>
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
    <div style="display:flex;gap:10px"><button class="btn" type="submit">${id?"Save & publish":"Publish"}</button>
    <button class="btn ghost" type="button" id="cancelForm">Cancel</button></div></form>`;
  formTarget.scrollIntoView({behavior:"smooth",block:"nearest"});
  const imgHidden=$("#imgHiddenInput");
  if(imgHidden){
    const preview=$("#imgPreview");
    const setPreview=val=>{
      const r=resolveNewsImage(val);
      preview.style.background=r?r.css:"";
      preview.innerHTML=r&&r.icon?`<span class="news-thumb-icon">${r.icon}</span>`:"";
      preview.classList.toggle("empty",!r);
    };
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
    $("#imgClearBtn").addEventListener("click",()=>{
      imgHidden.value="";
      formTarget.querySelectorAll(".img-swatch").forEach(b=>b.classList.remove("selected"));
      setPreview("");
    });
  }
  const galleryField=SCHEMAS[schemaKey].find(f=>f.type==="gallery");
  let galleryPhotos=galleryField?[...(it.photos||[])]:null;
  if(galleryField){
    const renderGalleryThumbs=()=>{
      $("#galleryThumbs").innerHTML=galleryPhotos.length?galleryPhotos.map((url,i)=>
        `<div class="gallery-thumb"><img src="${esc(url)}" alt=""><button type="button" class="gallery-thumb-del" data-i="${i}" aria-label="Remove this photo">×</button></div>`).join("")
        :`<p class="hint" style="margin:0">No photos yet.</p>`;
    };
    renderGalleryThumbs();
    $("#galleryThumbs").addEventListener("click",e=>{
      const b=e.target.closest("[data-i]");if(!b)return;
      galleryPhotos.splice(+b.dataset.i,1);
      renderGalleryThumbs();
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
  const rteEditor=$("#rteEditor");
  if(rteEditor){
    $("#rteToolbar").addEventListener("click",e=>{
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
    if(sec==="coaches"){data.squads=(data.squadsRaw||"").split(",").map(s=>s.trim()).filter(Boolean);delete data.squadsRaw;}
    if(sec==="committee"){
      data.skills=(data.skillsRaw||"").split("\n").map(s=>s.trim()).filter(Boolean);delete data.skillsRaw;
      data.duties=(data.dutiesRaw||"").split("\n").map(s=>s.trim()).filter(Boolean);delete data.dutiesRaw;
    }
    if(isFeed)data.type=type;
    if(galleryField)data.photos=galleryPhotos;
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
