/* ================= CONTENT STORE =================
   Published content lives in a Supabase (Postgres) database, so an edit made by one
   volunteer is seen by everyone, on every device. This file holds the connection, the
   translation between database rows and the shapes the pages expect, and the loader the
   public pages call before rendering. The editing itself lives in members.js. */
const SUPABASE_URL="https://nvffahmkeekrrvocofod.supabase.co";
/* Publishable key: designed to sit in public code. It grants only what the database's
   row-level security policies allow — anyone may read, only club accounts may write. */
const SUPABASE_KEY="sb_publishable_9bXGN9SgfDyO7UUo9iKtVQ_8eCKHt82";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

/* Locations offered in the timetable editor's location list. */
const TT_LOC={lc:"BSV Long Course",deep:"BSV Short Course – Deep End",shallow:"BSV Short Course – Shallow End",bill:"Billericay Pool",land:"BSV Meeting Room"};

/* In-memory copy of what is published, filled by loadContent() on every page load. */
const DB={feed:[],coaches:[],squads:[],roles:[],newsDefaults:[],enquiries:[]};

/* The database uses snake_case columns and spells the three meet types as separate
   values; the pages were written against these camelCase names, so translate at the edge. */
const FEED_FIELDS={type:"type",title:"title",start:"start_date",end:"end_date",host:"host",league:"league",level:"level",license:"license",poolType:"pool_type",venue:"venue",closing:"closing",status:"status",entryUrl:"entry_url",officialsUrl:"officials_url",volunteerUrl:"volunteer_url",resultsUrl:"results_url",leagueUrl:"league_url",conditionsUrl:"conditions_url",conditionsLabel:"conditions_label",entryFileUrl:"entry_file_url",entryFileLabel:"entry_file_label",currentEntriesUrl:"current_entries_url",notes:"notes",blurb:"blurb",link:"link",color:"color",tag:"tag",note:"note",img:"img"};
const FEED_TYPE_TO_ROW={meet:"meet",externalMeet:"external_meet",teamMeet:"team_meet",social:"social",news:"news",training:"training"};
const FEED_TYPE_FROM_ROW=Object.fromEntries(Object.entries(FEED_TYPE_TO_ROW).map(([k,v])=>[v,k]));

function feedFromRow(row){
  const it={id:row.id,type:FEED_TYPE_FROM_ROW[row.type]};
  for(const [key,col] of Object.entries(FEED_FIELDS))if(key!=="type"&&row[col]!==null)it[key]=row[col];
  return it;
}
function feedToRow(it){
  const row={type:FEED_TYPE_TO_ROW[it.type]};
  for(const [key,col] of Object.entries(FEED_FIELDS))if(key!=="type")row[col]=it[key]===""||it[key]===undefined?null:it[key];
  return row;
}
const coachFromRow=r=>({id:r.id,name:r.name,role:r.role,quals:r.quals||"",squads:r.squads||[],photo:r.photo||""});
const coachToRow=c=>({name:c.name,role:c.role,quals:c.quals||null,squads:c.squads||[],photo:c.photo||null});
const squadFromRow=r=>({id:r.id,name:r.name,lead:r.lead||"",sessions:r.sessions||[]});
const squadToRow=s=>({name:s.name,lead:s.lead||null,sessions:s.sessions||[]});
const roleFromRow=r=>({id:r.id,title:r.title,commitment:r.commitment||"",training:r.training||"",blurb:r.blurb});
const roleToRow=r=>({title:r.title,commitment:r.commitment||null,training:r.training||null,blurb:r.blurb});
const pictureFromRow=r=>({id:r.id,key:r.key,label:r.label,icon:r.icon||"",bg:r.bg||"",img:r.img||""});
const pictureToRow=p=>({key:p.key,label:p.label,icon:p.icon||null,bg:p.bg||null,img:p.img||null});

/* Each members'-area section, and the table and translation it reads and writes. */
const SECTIONS={
  feed:{table:"feed",from:feedFromRow,to:feedToRow,order:"start_date"},
  coaches:{table:"coaches",from:coachFromRow,to:coachToRow,order:"sort_order"},
  squads:{table:"squads",from:squadFromRow,to:squadToRow,order:"sort_order"},
  roles:{table:"volunteer_roles",from:roleFromRow,to:roleToRow,order:"sort_order"},
  newsDefaults:{table:"news_defaults",from:pictureFromRow,to:pictureToRow,order:"id"}
};

async function loadContent(){
  const keys=Object.keys(SECTIONS);
  const results=await Promise.all(keys.map(k=>sb.from(SECTIONS[k].table).select("*").order(SECTIONS[k].order,{ascending:true,nullsFirst:false})));
  const failed=results.find(r=>r.error);
  if(failed)throw failed.error;
  keys.forEach((k,i)=>{DB[k]=results[i].data.map(SECTIONS[k].from);});
}

/* Trial enquiries carry children's names and dates of birth, so they are deliberately kept
   out of the shared database. They stay in this browser until the form is switched over to
   emailing the membership address. */
const ENQUIRY_KEY="bpsc_enquiries_v1";
function loadEnquiries(){try{DB.enquiries=JSON.parse(localStorage.getItem(ENQUIRY_KEY)||"[]");}catch(e){DB.enquiries=[];}}
function saveEnquiries(){
  try{localStorage.setItem(ENQUIRY_KEY,JSON.stringify(DB.enquiries));}
  catch(e){toast("Couldn't save that enquiry in this browser");}
}
loadEnquiries();

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
