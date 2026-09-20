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
const DB={feed:[],coaches:[],squads:[],roles:[],newsDefaults:[],welfare:[],committee:[],enquiries:[]};

/* The database uses snake_case columns and spells the three meet types as separate
   values; the pages were written against these camelCase names, so translate at the edge. */
const FEED_FIELDS={type:"type",title:"title",start:"start_date",end:"end_date",host:"host",league:"league",level:"level",license:"license",poolType:"pool_type",venue:"venue",closing:"closing",status:"status",entryUrl:"entry_url",officialsUrl:"officials_url",volunteerUrl:"volunteer_url",resultsUrl:"results_url",liveUrl:"live_url",leagueUrl:"league_url",conditionsUrl:"conditions_url",conditionsLabel:"conditions_label",entryFileUrl:"entry_file_url",entryFileLabel:"entry_file_label",resultsFileUrl:"results_file_url",resultsFileLabel:"results_file_label",currentEntriesUrl:"current_entries_url",notes:"notes",blurb:"blurb",link:"link",color:"color",tag:"tag",note:"note",img:"img",photos:"photos",body:"body",visible:"visible"};
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
  /* "visible" is a not-null column; types whose form has no visibility checkbox never set it,
     so treat "not provided" as visible rather than writing a null the database would reject. */
  if(row.visible===null)row.visible=true;
  return row;
}
const coachFromRow=r=>({id:r.id,name:r.name,role:r.role,quals:r.quals||"",squads:r.squads||[],photo:r.photo||""});
const coachToRow=c=>({name:c.name,role:c.role,quals:c.quals||null,squads:c.squads||[],photo:c.photo||null});
const squadFromRow=r=>({id:r.id,name:r.name,lead:r.lead||"",sessions:r.sessions||[]});
const squadToRow=s=>({name:s.name,lead:s.lead||null,sessions:s.sessions||[]});
const roleFromRow=r=>({id:r.id,title:r.title,category:r.category||"volunteering",commitment:r.commitment||"",training:r.training||"",blurb:r.blurb});
const roleToRow=r=>({title:r.title,category:r.category||"volunteering",commitment:r.commitment||null,training:r.training||null,blurb:r.blurb});
const pictureFromRow=r=>({id:r.id,key:r.key,label:r.label,icon:r.icon||"",bg:r.bg||"",img:r.img||""});
const pictureToRow=p=>({key:p.key,label:p.label,icon:p.icon||null,bg:p.bg||null,img:p.img||null});
const welfareFromRow=r=>({id:r.id,body:r.body||""});
const welfareToRow=w=>({body:w.body||""});
const committeeFromRow=r=>({id:r.id,title:r.title,tier:r.tier||"committee",person:r.person||"",email:r.email||"",photo:r.photo||"",summary:r.summary||"",commitment:r.commitment||"",skills:r.skills||[],duties:r.duties||[]});
const committeeToRow=c=>({title:c.title,tier:c.tier||"committee",person:c.person||null,email:c.email||null,photo:c.photo||null,summary:c.summary||null,commitment:c.commitment||null,skills:c.skills||[],duties:c.duties||[]});

/* Each members'-area section, and the table and translation it reads and writes. */
const SECTIONS={
  feed:{table:"feed",from:feedFromRow,to:feedToRow,order:"start_date"},
  coaches:{table:"coaches",from:coachFromRow,to:coachToRow,order:"sort_order"},
  squads:{table:"squads",from:squadFromRow,to:squadToRow,order:"sort_order"},
  roles:{table:"volunteer_roles",from:roleFromRow,to:roleToRow,order:"sort_order"},
  newsDefaults:{table:"news_defaults",from:pictureFromRow,to:pictureToRow,order:"id"},
  welfare:{table:"welfare_page",from:welfareFromRow,to:welfareToRow,order:"id"},
  committee:{table:"committee_roles",from:committeeFromRow,to:committeeToRow,order:"sort_order"}
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

/* Shown on the Welfare & Safeguarding page (and in its admin editor) until the welfare_page
   row loads or if it's ever emptied out — the real content is normally in the database, kept
   here only as a fallback so the page is never blank. */
const WELFARE_DEFAULT_BODY=`<p><strong>If you believe a child or adult to be in immediate danger, call 999</strong>, then notify our Welfare Officer for further advice. If no immediate danger is apparent, contact our Welfare Officer directly — you don't need to go through your coach or the committee first.</p>
<h3>Club Welfare Officers</h3>
<ul>
<li>Katie Doel — BPSC Welfare Officer — <a href="mailto:welfare@phoenixbasildonsc.org">welfare@phoenixbasildonsc.org</a></li>
<li>Kathy Morey — BPSC Welfare Officer — <a href="mailto:welfare@phoenixbasildonsc.org">welfare@phoenixbasildonsc.org</a></li>
</ul>
<h3>Swim England contacts</h3>
<ul>
<li>Cheryl Ellis — Essex Welfare Officer — <a href="mailto:welfare@essexswimming.org">welfare@essexswimming.org</a></li>
<li>Fran Vesztrocy — East Region Welfare Officer — <a href="mailto:eastwelfare@swimming.org">eastwelfare@swimming.org</a></li>
</ul>
<h3>Safeguarding policy</h3>
<p>Swim England's Wavepower child safeguarding policy manual sets out our safeguarding procedures — see the <a href="https://www.swimming.org/swimengland/wavepower-child-safeguarding-for-clubs/">Wavepower policy manual</a>. See also <a href="policies">Club Policies</a> for our codes of conduct, and <a href="coaches">Coaches &amp; Squads</a> for DBS checks and safeguarding training.</p>
<h3>Other safeguarding organisations and resources</h3>
<p>Recommended by Swim England — the full list is <a href="https://www.swimming.org/swimengland/other-safeguarding-organisations-resources/">here</a>.</p>
<ul>
<li><a href="https://www.escb.co.uk/working-with-children/concerns-about-the-welfare-of-a-child/">Essex Safeguarding Children Board</a></li>
<li><a href="https://www.essex.gov.uk/adult-social-care-and-health/report-concern-about-adult/report-concern-about-child">Essex County Council — Children's Social Care</a></li>
<li><a href="https://www.activeessex.org/dealing-with-a-concern/">Active Essex — Dealing with a concern</a></li>
</ul>`;

/* Full public Welfare & Safeguarding page markup, shared by the page itself (site.js, body
   only — the page-head there is static HTML) and the admin "preview as welfare page" (members.js,
   whole thing) so an admin sees exactly what will publish. */
function welfarePageHtml(body){
  return `<div class="page-head">
      <p class="eyebrow">Every swimmer. Every time.</p>
      <h2 class="display">Welfare &amp; Safeguarding</h2>
      <div class="lane-rope"></div>
      <p>Safeguarding is everyone's responsibility. Here's what to do if you have a concern, who to contact, and where our policies live.</p>
    </div>
    <div class="article-body article-container" style="max-width:760px">${sanitizeArticleHtml(body||WELFARE_DEFAULT_BODY)}</div>`;
}

/* ================= ARTICLES (news & socials) =================
   Article bodies are written with a WYSIWYG editor in the members' area (members.js) and stored
   as HTML. Sanitized again here on the way out, in case a row was ever edited by hand in the
   database — DOMPurify is only loaded on the pages that actually render or edit article bodies
   (article.html, members.html), so this is a no-op everywhere else. */
const ARTICLE_TAGS=["p","br","strong","b","em","i","u","h3","ul","ol","li","a","img","blockquote"];
const ARTICLE_ATTR=["href","src","alt"];
if(window.DOMPurify){
  DOMPurify.addHook("afterSanitizeAttributes",node=>{
    if(node.tagName==="A"){node.setAttribute("target","_blank");node.setAttribute("rel","noopener noreferrer");}
  });
}
function sanitizeArticleHtml(html){
  return window.DOMPurify?DOMPurify.sanitize(html||"",{ALLOWED_TAGS:ARTICLE_TAGS,ALLOWED_ATTR:ARTICLE_ATTR}):"";
}

/* Gallery + body markup, shared by the public article page (site.js) and the admin "preview as
   article page" (members.js) so an admin sees exactly what will publish. */
function articleGalleryHtml(photos){
  if(!photos||!photos.length)return "";
  return `<div class="article-gallery">
    <div class="article-gallery-track" id="agTrack">
      ${photos.map(p=>`<div class="article-gallery-slide"><img src="${esc(p)}" alt=""></div>`).join("")}
    </div>
    ${photos.length>1?`
    <button type="button" class="gallery-arrow prev" id="agPrev" aria-label="Previous photo">‹</button>
    <button type="button" class="gallery-arrow next" id="agNext" aria-label="Next photo">›</button>
    <div class="gallery-dots" id="agDots">${photos.map((_,i)=>`<button type="button" class="gallery-dot${i===0?" active":""}" data-i="${i}" aria-label="Photo ${i+1} of ${photos.length}"></button>`).join("")}</div>`:""}
  </div>`;
}
/* Wires up whichever gallery was just inserted into the DOM (there is only ever one on screen
   at a time — the public article page, or the admin preview overlay). */
function wireArticleGallery(n){
  const track=document.getElementById("agTrack");
  if(!track||!n||n<2)return;
  let idx=0;
  const dots=()=>document.querySelectorAll(".gallery-dot");
  const update=()=>{
    dots().forEach((d,i)=>d.classList.toggle("active",i===idx));
    const prev=document.getElementById("agPrev"),next=document.getElementById("agNext");
    if(prev)prev.disabled=idx===0;
    if(next)next.disabled=idx===n-1;
  };
  const go=i=>{idx=Math.max(0,Math.min(i,n-1));track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});update();};
  document.getElementById("agPrev")?.addEventListener("click",()=>go(idx-1));
  document.getElementById("agNext")?.addEventListener("click",()=>go(idx+1));
  document.getElementById("agDots")?.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b)go(+b.dataset.i);});
  let scrollTimer;
  track.addEventListener("scroll",()=>{
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>{idx=Math.round(track.scrollLeft/track.clientWidth);update();},80);
  },{passive:true});
  update();
}
/* Full article view: eyebrow/title/date, gallery (falls back to the single cover picture used
   elsewhere on the site when there's no gallery yet), then the rich body (or the summary, for an
   article that hasn't had a body written yet). */
function articleContentHtml(it){
  const photos=it.photos||[];
  const cover=!photos.length?resolveNewsImage(it.img):null;
  const dateLabel=it.start?fmtDate(it.start):"";
  const eyebrow=it.type==="news"?(it.tag||"Club News"):"Club Calendar · Social";
  const media=photos.length?articleGalleryHtml(photos)
    :(cover?`<div class="article-cover" style="background:${cover.css}">${cover.icon?`<span class="news-thumb-icon">${cover.icon}</span>`:""}</div>`:"");
  const bodyHtml=sanitizeArticleHtml(it.body||"")||`<p>${esc(it.blurb||"")}</p>`;
  return `<div class="page-head">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h2 class="display">${esc(it.title||"Untitled")}</h2>
      <div class="lane-rope"></div>
      ${dateLabel?`<p style="color:var(--muted)">${esc(dateLabel)}</p>`:""}
    </div>
    ${media}
    <div class="article-body">${bodyHtml}</div>`;
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

/* Open meets (BPSC-hosted or another club's) aren't published with entries/officials/volunteering
   details until they're getting close, so a meet still 4+ months out just clutters the Open Meets
   page with a near-empty card. Team/league galas are exempt -- those are fixed-season fixtures
   people want to see well ahead. */
function isoPlusMonths(n){const d=new Date();d.setMonth(d.getMonth()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const meetTooFarAhead=m=>m.type!=="teamMeet"&&m.start>isoPlusMonths(4);

/* A meet is "running" from its first day to its last day inclusive -- that's the window in which the
   live results feed from the poolside laptop is worth pointing people at. meetLive() also needs a
   liveUrl, because a gala with no results page set up has nothing to show. */
const meetRunning=m=>{const t=isoToday();return m.start<=t&&t<=(m.end||m.start);};
const meetLive=m=>!!m.liveUrl&&meetRunning(m);

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
