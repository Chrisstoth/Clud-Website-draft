/* ================= DATA (in-memory for this prototype) ================= */
/* Squad timetable seed, taken from the lane allocation plan (week of 13 Aug 2026).
   Spec format: "Day HH:MM-HH:MM locKey" separated by ";" — land sessions use the "land" key. */
const TT_LOC={lc:"BSV Long Course",deep:"BSV Short Course – Deep End",shallow:"BSV Short Course – Shallow End",bill:"Billericay Pool",land:"BSV Meeting Room"};
function ttSeed(spec){
  return spec.split(";").map(x=>{
    const [day,times,loc]=x.trim().split(/\s+/),[start,end]=times.split("-");
    return {day,start,end,loc:TT_LOC[loc],type:loc==="land"?"land":"pool"};
  });
}
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
    /* Sample external open meets and team meets — placeholders to replace with real dates and links. */
    {id:30, type:"externalMeet", title:"London Legacy Open Meet", host:"London Aquatics Centre", level:"Level 3", poolType:"50m Long Course", start:"2026-12-05", end:"2026-12-06", venue:"London Aquatics Centre, Stratford", closing:"", status:"open", entryUrl:"", resultsUrl:"", notes:"Club entries are submitted by the Open Meets Secretary — check the meet conditions for qualifying times."},
    {id:31, type:"externalMeet", title:"Essex County Championships", host:"Essex County ASA", level:"Level 2", poolType:"25m Short Course", start:"2027-01-23", end:"2027-01-31", venue:"Venue TBC", closing:"", status:"closed", entryUrl:"", resultsUrl:"", notes:"County qualifying times apply."},
    {id:32, type:"teamMeet", title:"Arena League — Round 1", league:"Arena League", start:"2026-10-17", end:"", venue:"Venue TBC", poolType:"25m Short Course", notes:"Team selected by the coaches — selected swimmers will be contacted directly with arrival times.", leagueUrl:"", resultsUrl:""},
    {id:33, type:"teamMeet", title:"Essex League — Round 1", league:"Essex League", start:"2026-11-07", end:"", venue:"Venue TBC", poolType:"25m Short Course", notes:"Team selected by the coaches.", leagueUrl:"", resultsUrl:""},
    {id:7, type:"social", title:"Summer BBQ & Fun Gala", start:"2026-08-15", blurb:"Family fun gala followed by the annual BBQ on the field. Bring the whole family — inflatables race included.", link:"#", color:"linear-gradient(135deg,#f26b21,#ffb25e)"},
    {id:8, type:"social", title:"Quiz Night Fundraiser", start:"2026-09-25", blurb:"Teams of six, bar open, proceeds towards new club timing equipment. Book your table early!", link:"#", color:"linear-gradient(135deg,#101014,#3c3c46)"},
    {id:9, type:"social", title:"Presentation Evening", start:"2026-09-04", blurb:"Celebrating the season — trophies, awards and the famous coaches' review of the year.", link:"#", color:"linear-gradient(135deg,#d4551a,#101014)"},
    {id:10, type:"news", tag:"Racing", title:"Club Championships wrap-up", start:"2026-05-18", blurb:"Results, personal bests and a huge thank you to the volunteers who made the weekend happen."},
    {id:11, type:"news", tag:"Club", title:"New Academy intake open", start:"2026-07-01", blurb:"Spaces opening in our Academy squads for swimmers moving up from lessons — see Join Us for details."},
    {id:13, type:"news", tag:"Trips", title:"Swim Camp 2026 — Lanzarote", start:"2026-08-20", blurb:"Places open for our warm-weather training camp at Club La Santa — intensive poolside sessions for squads moving up in level.", img:"images/WS-Spain-lanzarote-Costa-Teguise-03-Sports-Abroad.jpg"},
    {id:14, type:"news", tag:"Racing", title:"Summer Nationals", start:"2026-07-28", blurb:"Good luck to our qualified swimmers racing at Ponds Forge this summer — the whole club will be behind you.", img:"images/Ponds_Forge_Summer_Meet_2024_branding_1200x675.avif"},
    {id:15, type:"news", tag:"Volunteering", title:"Timekeepers course", start:"2026-08-05", blurb:"A free Swim England Timekeeping course is running next month — no experience needed, and it's the easiest way to start volunteering poolside.", img:"images/Timekeepers-course.webp"},
    {id:17, type:"training", title:"No Friday training — pool maintenance", start:"2026-07-24", end:"", note:"Basildon Sporting Village pool closed for planned maintenance. All squads unaffected on other training days."},
    {id:18, type:"training", title:"Half-term altered times", start:"2026-10-26", end:"2026-10-30", note:"Squad times shift earlier during half-term week — check the noticeboard for your squad's slot."}
  ],
  coaches: [
    {id:1, name:"Doug Campbell", role:"Head Coach", quals:"Swim England Senior Coach · DBS · Safeguarding & first aid", squads:["Performance","National/Regional prep"], photo:"images/coaches/Capture.JPG"},
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
  squads: [
    {id:1, name:"Gold 1", lead:"Doug C", sessions:ttSeed("Mon 05:30-07:00 lc; Mon 19:30-20:30 deep; Tue 18:30-20:00 deep; Wed 05:30-07:00 lc; Thu 05:30-07:00 deep; Thu 18:15-19:15 land; Thu 19:15-21:00 lc; Fri 18:00-19:30 shallow; Sun 06:00-07:45 deep; Sun 07:45-08:45 land; Sun 16:15-18:15 lc")},
    {id:2, name:"Gold 2", lead:"Doug C", sessions:ttSeed("Mon 05:30-07:00 lc; Mon 18:30-19:30 deep; Tue 05:30-07:00 shallow; Thu 05:30-07:00 deep; Thu 18:15-19:15 land; Thu 19:15-21:00 lc; Fri 18:00-19:00 deep; Sun 06:00-07:45 shallow; Sun 07:45-08:45 land; Sun 16:15-18:15 lc")},
    {id:3, name:"Gold 3", lead:"Steph S", sessions:ttSeed("Mon 17:30-18:30 deep; Tue 05:30-07:00 deep; Wed 05:30-07:00 lc; Wed 19:00-20:00 deep; Thu 17:15-18:15 land; Fri 05:30-07:00 lc; Fri 19:30-20:30 shallow; Sun 06:45-07:30 land; Sun 07:45-08:45 deep; Sun 16:15-18:15 lc")},
    {id:4, name:"Silver 1", lead:"Chris S", sessions:ttSeed("Mon 05:30-07:00 lc; Mon 20:30-21:30 deep; Tue 20:00-21:00 deep; Wed 05:30-07:00 lc; Thu 05:30-07:00 shallow; Thu 18:15-19:15 land; Fri 20:30-21:30 shallow; Sun 06:00-07:45 shallow; Sun 07:45-08:45 land")},
    {id:5, name:"Silver 2", lead:"TBC", sessions:ttSeed("Tue 05:30-07:00 deep; Tue 20:00-21:00 deep; Wed 20:00-21:00 deep; Thu 17:15-18:15 land; Fri 05:30-07:00 lc; Fri 20:30-21:30 shallow; Sun 06:45-07:30 land; Sun 07:45-08:45 shallow")},
    {id:6, name:"Silver 3", lead:"TBC", sessions:ttSeed("Tue 05:30-07:00 deep; Tue 17:30-18:30 deep; Thu 05:30-07:00 deep; Thu 17:15-18:15 land; Fri 20:00-21:00 deep; Sun 06:45-07:30 land; Sun 07:45-08:45 shallow")},
    {id:7, name:"Bronze", lead:"TBC", sessions:ttSeed("Mon 20:30-21:30 deep; Thu 05:30-07:00 deep; Thu 17:15-18:15 land; Fri 19:00-20:00 deep; Sun 06:45-07:30 land")},
    {id:8, name:"Junior Pathway", lead:"Nigel B", sessions:ttSeed("Mon 19:30-20:30 deep; Tue 05:30-07:00 shallow; Tue 20:15-21:15 bill; Thu 05:30-07:00 shallow; Thu 17:15-18:15 land; Fri 19:00-20:00 deep; Sun 06:00-07:45 deep; Sun 06:45-07:30 land; Sun 07:45-08:45 deep")},
    {id:9, name:"Red Hats", lead:"Chris S", sessions:ttSeed("Wed 18:00-19:00 deep; Fri 19:30-20:30 shallow; Sat 15:00-16:00 deep")},
    {id:10, name:"Blue Hats", lead:"TBC", sessions:ttSeed("Wed 17:00-18:00 deep; Sat 15:00-16:00 deep")},
    {id:11, name:"Yellow Hats", lead:"Abi R", sessions:ttSeed("Sat 15:00-16:00 deep")},
    {id:12, name:"Green Hats", lead:"Tierna K", sessions:ttSeed("Sat 15:00-16:00 deep")},
    {id:13, name:"Masters", lead:"Jack P", sessions:ttSeed("Mon 20:30-21:30 deep; Wed 20:00-21:00 deep; Fri 05:30-07:00 lc; Fri 20:00-21:00 deep")}
  ],
  enquiries: [
    {id:1, parent:"A. Sample", email:"sample@example.com", swimmer:"Charlie", dob:"2015-03-02", type:"Competitive trial", detail:"SE 1234567 · County", notes:"Best 50 free 34.2 (25m). Available Tues/Thurs.", received:"Mon 6 Jul, 09:41"}
  ],
  /* Default picture set for news items that don't have their own photo uploaded — editable by
     the webmaster in the members' area. "key" is the stable lookup used by "default:<key>"
     tokens stored on news items, so it's set once at creation and not exposed for editing.
     Leave "img" empty and the gradient+icon placeholder shows instead — so this works with
     zero real photo files. Drop real photos anywhere (e.g. images/defaults/) and either upload
     them through the admin form or paste the path directly into "img". */
  newsDefaults: [
    {id:1, key:"racing",       label:"Racing",         icon:"🏆", bg:"linear-gradient(135deg,#d4551a,#101014)", img:""},
    {id:2, key:"club",         label:"Club",           icon:"🏊", bg:"linear-gradient(135deg,#f26b21,#ffb25e)", img:""},
    {id:3, key:"volunteering", label:"Volunteering",   icon:"🤝", bg:"linear-gradient(135deg,#101014,#3c3c46)", img:""},
    {id:4, key:"trips",        label:"Trips & camps",  icon:"✈️", bg:"linear-gradient(135deg,#1a6fd4,#5eb6ff)", img:""},
    {id:5, key:"social",       label:"Social",         icon:"🎉", bg:"linear-gradient(135deg,#7a1ad4,#c15eff)", img:""},
    {id:6, key:"general",      label:"General",        icon:"📣", bg:"linear-gradient(135deg,#3c3c46,#101014)", img:""}
  ]
};
let nextId = 100;

/* ================= PERSISTENCE (localStorage) =================
   Prototype-grade "database": saves the whole DB object to this browser's
   localStorage after every admin edit, and reloads it on startup. Survives
   refreshes/reopening on the same device, but is not shared between devices —
   there's no server, so an edit made on one phone/PC isn't seen by another. */
const STORAGE_KEY="bpsc_db_v1";
function saveDB(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({db:DB,nextId}));}
  catch(e){
    console.warn("Could not save to localStorage",e);
    toast("Couldn't save — this browser's storage is full. Try removing an item with a large photo.");
  }
}
function loadDB(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return;
    const saved=JSON.parse(raw);
    Object.keys(DB).forEach(k=>{if(saved.db&&saved.db[k])DB[k]=saved.db[k];});
    if(saved.nextId>nextId)nextId=saved.nextId;
  }catch(e){console.warn("Could not load from localStorage",e);}
}
loadDB();

/* Photos come off phones at 3–12MB, far larger than any card displays them. Shrinking them
   on upload keeps pages quick to load and stops one photo filling the whole storage budget.
   JPEG (not PNG) because these are photographs, and the source may be HEIC/PNG/anything. */
const IMG_MAX_EDGE=1600, IMG_QUALITY=0.8;
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,IMG_MAX_EDGE/Math.max(img.width,img.height));
      const c=document.createElement("canvas");
      c.width=Math.round(img.width*scale);
      c.height=Math.round(img.height*scale);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg",IMG_QUALITY));
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("That file couldn't be read as an image"));};
    img.src=url;
  });
}
const dataUrlKB=s=>Math.round(s.length*0.75/1024);

/* Resolves a news item's img field (real path/data-URL, "default:<key>" token, or empty) into
   a CSS background + optional icon glyph. Shared by the news grid, the hero carousel and the
   swatch buttons in the picker. Looks defaults up live in DB.newsDefaults so webmaster edits
   to the default picture library apply immediately. A default with a real "img" set wins over
   its gradient. */
function resolveNewsImage(img){
  if(!img)return null;
  if(img.indexOf("default:")===0){
    const d=DB.newsDefaults.find(x=>x.key===img.slice(8));
    if(!d)return null;
    return d.img?{css:`url('${esc(d.img)}') center/cover no-repeat`,icon:null}:{css:d.bg,icon:d.icon};
  }
  return {css:`url('${esc(img)}') center/cover no-repeat`,icon:null};
}

/* ================= HELPERS ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2600);}
function fmtDate(iso){if(!iso)return"";const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
function dateParts(iso){const d=new Date(iso+"T12:00:00");return{d:d.getDate(),m:d.toLocaleDateString("en-GB",{month:"short"})};}

/* A meet moves to "Completed galas" automatically once its last day (end, or start for one-day meets) has passed. */
function isoToday(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
const meetDone=m=>(m.end||m.start)<isoToday();

/* Three kinds of meet share the Open Meets page: "meet" = open meet hosted by BPSC, "externalMeet" = open meet
   hosted by someone else (county champs etc.), "teamMeet" = league/team gala (no entries or volunteers). */
const MEET_TYPES=["meet","externalMeet","teamMeet"];
const isMeet=it=>MEET_TYPES.includes(it.type);

const TT_DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TT_DAY_NAMES={Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday"};
const ttPeriod=s=>s.start<"12:00"?"AM":"PM";
const ttSort=(a,b)=>TT_DAYS.indexOf(a.day)-TT_DAYS.indexOf(b.day)||a.start.localeCompare(b.start);

const MOON_ICON='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
const SUN_ICON='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>';
function syncThemeToggles(){
  const on=document.body.classList.contains("theme-dark");
  document.querySelectorAll(".theme-toggle").forEach(t=>{t.setAttribute("aria-pressed",on);t.innerHTML=on?MOON_ICON:SUN_ICON;});
  return on;
}
function toggleTheme(e){e&&e.preventDefault();document.body.classList.toggle("theme-dark");
  const on=syncThemeToggles();
  try{localStorage.setItem("bpsc_theme",on?"dark":"light");}catch(err){}
  toast(on?"Black & orange theme":"Light theme");}
document.querySelectorAll(".theme-toggle").forEach(t=>t.addEventListener("click",toggleTheme));
syncThemeToggles();
