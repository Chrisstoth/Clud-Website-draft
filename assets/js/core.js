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
const FEED_FIELDS={type:"type",title:"title",start:"start_date",end:"end_date",host:"host",league:"league",level:"level",license:"license",poolType:"pool_type",venue:"venue",closing:"closing",status:"status",entryUrl:"entry_url",officialsUrl:"officials_url",volunteerUrl:"volunteer_url",resultsUrl:"results_url",liveUrl:"live_url",leagueUrl:"league_url",conditionsUrl:"conditions_url",conditionsLabel:"conditions_label",entryFileUrl:"entry_file_url",entryFileLabel:"entry_file_label",resultsFileUrl:"results_file_url",resultsFileLabel:"results_file_label",currentEntriesUrl:"current_entries_url",notes:"notes",blurb:"blurb",link:"link",color:"color",tag:"tag",note:"note",img:"img",photos:"photos",body:"body",visible:"visible",heroCard:"hero_card",heroPhotos:"hero_photos",pinUntil:"pin_until"};
const FEED_TYPE_TO_ROW={meet:"meet",externalMeet:"external_meet",teamMeet:"team_meet",social:"social",news:"news",training:"training"};
const FEED_TYPE_FROM_ROW=Object.fromEntries(Object.entries(FEED_TYPE_TO_ROW).map(([k,v])=>[v,k]));

function feedFromRow(row){
  const it={id:row.id,type:FEED_TYPE_FROM_ROW[row.type]};
  for(const [key,col] of Object.entries(FEED_FIELDS))if(key!=="type"&&row[col]!==null)it[key]=row[col];
  /* The day it was first saved (read-only, never written back): tells the homepage whether a news
     story was written ahead of its date -- i.e. it's about something coming up (renderHeroFeed). */
  if(row.created_at)it.created=isoDay(new Date(row.created_at));
  return it;
}
function feedToRow(it){
  const row={type:FEED_TYPE_TO_ROW[it.type]};
  for(const [key,col] of Object.entries(FEED_FIELDS))if(key!=="type")row[col]=it[key]===""||it[key]===undefined?null:it[key];
  /* "visible" and "photos" are not-null columns; types whose form has no visibility checkbox
     or gallery (meets, training) never set them, so fill in the column default rather than
     writing a null the database would reject. */
  if(row.visible===null)row.visible=true;
  if(row.photos===null)row.photos=[];
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
   what a box needs to draw it: {cls, style, icon} for class="thing ${r.cls}" style="${r.style}",
   plus "bg" (the plain CSS background) for the gradient defaults, which aren't photos. Shared by
   the news grid, the hero carousel and the picker. Looks defaults up live in DB.newsDefaults so
   webmaster edits to the default picture library apply immediately. A default with a real "img"
   set wins over its gradient. "pair" picks per-view framing -- see photoLook. */
function resolveNewsImage(img,pair){
  if(!img)return null;
  if(img.indexOf("default:")===0){
    const d=DB.newsDefaults.find(x=>x.key===img.slice(8));
    if(!d)return null;
    return d.img?photoLook(d.img,pair):{cls:"",style:`background:${d.bg}`,bg:d.bg,icon:d.icon};
  }
  return photoLook(img,pair);
}

/* Framing. Every place crops a photo differently -- a wide slanted strip on the homepage, near
   square on phones, 16:10 on the article page -- so an admin frames each photo separately for
   each of the four views an article is really seen in (FRAME_VIEWS): the spot that must stay in
   view (focus, percent across/down), how far to zoom in on it, or "fit" to show the whole photo
   uncropped (posters and logos). Zooming happens around the focus point, so that spot never
   drifts out of frame however far in the admin goes.

   It rides in the URL fragment, which never reaches the server: the same URL loads the same
   file everywhere and no column had to change shape. The article-page framing is the base
   ("#focus=30,70&zoom=1.6", or "#fit") and is also what small cards and thumbnails use; the other
   views are stored only where they differ from it ("&hd=20,40,1.8", "&hp=fit").  */
const ZOOM_MAX=3;
const FRAME_VIEWS=[
  {key:"hd",label:"Homepage — computer"},
  {key:"hp",label:"Homepage — phone"},
  {key:"ad",label:"Article page"},
  {key:"ap",label:"Article — phone"}
];
const FRAME_CENTRE={x:50,y:50,zoom:1,fit:false};
const okPct=n=>Number.isFinite(n)&&n>=0&&n<=100;
const clampZoom=z=>Number.isFinite(z)?Math.min(ZOOM_MAX,Math.max(1,z)):1;
function parseViewFrame(v){
  if(v==="fit")return {...FRAME_CENTRE,fit:true};
  const [x,y,z]=String(v||"").split(",").map(Number);
  return okPct(x)&&okPct(y)?{x,y,zoom:clampZoom(z),fit:false}:null;
}
const viewFrameToken=f=>f.fit?"fit":`${Math.round(f.x)},${Math.round(f.y)},${Math.round(f.zoom*100)/100}`;
/* -> {hd,hp,ad,ap}, every view filled in (falling back to the base). */
function imgFraming(url){
  const p=new URLSearchParams(String(url||"").split("#")[1]||"");
  const [x,y]=(p.get("focus")||"").split(",").map(Number);
  const base=p.has("fit")?{...FRAME_CENTRE,fit:true}
    :{...(okPct(x)&&okPct(y)?{x,y}:{x:50,y:50}),zoom:clampZoom(Number(p.get("zoom"))),fit:false};
  const views={ad:base};
  for(const k of ["hd","hp","ap"])views[k]=parseViewFrame(p.get(k))||{...base};
  return views;
}
function withFraming(url,views){
  const clean=String(url).split("#")[0];
  const b=views.ad;
  const parts=[];
  if(b.fit)parts.push("fit");
  else{
    if(Math.round(b.x)!==50||Math.round(b.y)!==50)parts.push(`focus=${Math.round(b.x)},${Math.round(b.y)}`);
    if(b.zoom>1.001)parts.push(`zoom=${Math.round(b.zoom*100)/100}`);
  }
  for(const k of ["hd","hp","ap"])if(viewFrameToken(views[k])!==viewFrameToken(b))parts.push(`${k}=${viewFrameToken(views[k])}`);
  return parts.length?`${clean}#${parts.join("&")}`:clean;
}
/* One view's framing as the custom properties the .photo class draws from (site.css). */
const frameVars=(f,sfx="")=>`--pos${sfx}:${f.x}% ${f.y}%;--size${sfx}:${f.fit?"contain":"cover"};--z${sfx}:${f.fit?1:f.zoom}`;
const photoUrlVar=url=>`--img:url('${esc(String(url).split("#")[0])}')`;
/* What a box needs to draw a framed photo. With no pair it uses the base (article-page)
   framing -- right for cards and thumbnails. With a pair ("hero" or "article") it carries the
   wide and narrow views of that place, and the .photo-hero / .photo-article classes switch
   between them at the same breakpoints the layouts themselves switch at. */
const FRAME_PAIRS={hero:["hd","hp"],article:["ad","ap"]};
function photoLook(url,pair){
  const v=imgFraming(url);
  if(!pair)return {cls:"photo",style:`${photoUrlVar(url)};${frameVars(v.ad)}`,icon:null};
  const [wide,narrow]=FRAME_PAIRS[pair];
  return {cls:`photo photo-${pair}`,style:`${photoUrlVar(url)};${frameVars(v[wide],"-w")};${frameVars(v[narrow],"-n")}`,icon:null};
}
/* The base framing for an <img> (admin thumbnails), where object-fit does the cropping. */
function photoImgStyle(url){
  const f=imgFraming(url).ad;
  if(f.fit)return "object-fit:contain";
  const pos=`${f.x}% ${f.y}%`;
  return `object-position:${pos}`+(f.zoom>1?`;transform:scale(${f.zoom});transform-origin:${pos}`:"");
}

/* Homepage hero card text for any feed item. Lives here rather than in site.js so the framing
   editor in the members' area can put the real card over its homepage previews. */
function heroFeedContent(it){
  if(isMeet(it))return {tag:it.type==="teamMeet"?"Team Meet":"Open Meet",title:it.title,blurb:`${it.venue||"Venue TBC"} · ${fmtDate(it.start)}`,linkAttrs:'href="open-meets"',img:it.img||null};
  if(it.type==="social")return {tag:"Club Calendar",title:it.title,blurb:it.blurb||fmtDate(it.start),linkAttrs:`href="article?id=${it.id}"`,img:it.img||null};
  if(it.type==="training")return {tag:"Training change",title:it.title,blurb:it.note||fmtDate(it.start),linkAttrs:'href="club-calendar"',img:it.img||null};
  return {tag:`${it.tag} · Club News`,title:it.title,blurb:it.blurb,linkAttrs:`href="article?id=${it.id}"`,img:it.img||null};
}
/* An item's hero_card setting as the classes the card takes: space-separated words, each for one
   screen -- computer: "right", "compact"; phone: "p-top", "p-compact"; empty is the default
   (left/bottom, full size). Whitelisted, since it ends up in a class attribute. */
const HERO_CARD_TOKENS=["right","compact","p-top","p-compact"];
const heroCardClasses=v=>String(v||"").split(/\s+/).filter(t=>HERO_CARD_TOKENS.includes(t)).map(t=>` card-${t}`).join("");

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
      ${photos.map(p=>{const r=photoLook(p,"article");return `<div class="article-gallery-slide ${r.cls}" style="${r.style}" role="img" aria-label="Photo"></div>`;}).join("")}
    </div>
    ${photos.length>1?`
    <button type="button" class="gallery-arrow prev" id="agPrev" aria-label="Previous photo">‹</button>
    <button type="button" class="gallery-arrow next" id="agNext" aria-label="Next photo">›</button>
    <div class="gallery-dots" id="agDots">${photos.map((_,i)=>`<button type="button" class="gallery-dot${i===0?" active":""}" data-i="${i}" aria-label="Photo ${i+1} of ${photos.length}"></button>`).join("")}</div>`:""}
  </div>`;
}
/* Wires up whichever gallery was just inserted into the DOM (there is only ever one on screen
   at a time -- the public article page, or the admin preview overlay). It plays itself as a
   slideshow, looping, until someone touches it: from then on they're in charge. No autoplay
   for people who've asked their device for reduced motion. */
const GALLERY_AUTOPLAY_MS=7000;
function wireArticleGallery(n){
  const track=document.getElementById("agTrack");
  if(!track||!n||n<2)return;
  let idx=0,auto=null;
  const stop=()=>{clearInterval(auto);auto=null;};
  const update=()=>document.querySelectorAll(".gallery-dot").forEach((d,i)=>d.classList.toggle("active",i===idx));
  const go=(i,byUser)=>{
    if(byUser)stop();
    idx=(i+n)%n;
    track.scrollTo({left:track.clientWidth*idx,behavior:"smooth"});
    update();
  };
  document.getElementById("agPrev")?.addEventListener("click",()=>go(idx-1,true));
  document.getElementById("agNext")?.addEventListener("click",()=>go(idx+1,true));
  document.getElementById("agDots")?.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b)go(+b.dataset.i,true);});
  ["pointerdown","wheel"].forEach(ev=>track.addEventListener(ev,stop,{passive:true}));
  let scrollTimer;
  track.addEventListener("scroll",()=>{
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>{idx=Math.round(track.scrollLeft/track.clientWidth);update();},80);
  },{passive:true});
  update();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  auto=setInterval(()=>{
    if(!track.isConnected)return stop();   // the admin preview was closed or re-rendered
    if(!document.hidden)go(idx+1);
  },GALLERY_AUTOPLAY_MS);
}
/* Full article view: eyebrow/title/date, gallery (falls back to the single cover picture used
   elsewhere on the site when there's no gallery yet), then the rich body (or the summary, for an
   article that hasn't had a body written yet). */
function articleContentHtml(it){
  const photos=it.photos||[];
  const cover=!photos.length?resolveNewsImage(it.img,"article"):null;
  const dateLabel=it.start?fmtDate(it.start):"";
  const eyebrow=it.type==="news"?(it.tag||"Club News"):"Club Calendar · Social";
  const media=photos.length?articleGalleryHtml(photos)
    :(cover?`<div class="article-cover ${cover.cls}" style="${cover.style}">${cover.icon?`<span class="news-thumb-icon">${cover.icon}</span>`:""}</div>`:"");
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
function isoDay(n){return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
function isoToday(){return isoDay(new Date());}
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

/* ================= INSTAGRAM (via Behold) =================
   Behold (behold.so) holds the club's Instagram login and serves its latest posts as JSON.
   Which feed to read, and which posts an editor has hidden, live in the single-row
   instagram_settings table -- kept out of SECTIONS/loadContent on purpose, so a missing table
   only switches the Instagram row off rather than failing every page's content load. */
/* how many posts the News page row shows (the members' area quotes it too) */
const IG_MAX_POSTS=12;
async function loadInstagramSettings(){
  const {data,error}=await sb.from("instagram_settings").select("*").eq("id",1).maybeSingle();
  if(error)throw error;
  return {feedId:(data&&data.feed_id)||"",hidden:(data&&data.hidden_posts)||[]};
}
/* Accepts the feed ID on its own or the whole feed URL Behold shows (https://feeds.behold.so/<id>). */
function beholdFeedId(input){
  const s=String(input||"").trim();
  const m=s.match(/feeds\.behold\.so\/([A-Za-z0-9_-]+)/);
  return m?m[1]:/^[A-Za-z0-9_-]+$/.test(s)?s:"";
}
async function fetchBeholdPosts(feedId){
  const r=await fetch(`https://feeds.behold.so/${encodeURIComponent(feedId)}`);
  if(!r.ok)throw new Error(r.status===404?"Behold doesn't recognise that feed ID":`Behold replied with an error (${r.status})`);
  const data=await r.json();
  /* newer Behold feeds wrap the posts with profile details; older ones are a bare array */
  return (Array.isArray(data)?data:data.posts||[]).filter(p=>p&&p.id&&p.permalink);
}
/* videos/reels carry their still in thumbnailUrl; Behold's resized copies are lighter */
const igPostImage=p=>(p.sizes&&p.sizes.medium&&p.sizes.medium.mediaUrl)||(p.mediaType==="VIDEO"?p.thumbnailUrl:p.mediaUrl)||p.thumbnailUrl||"";
const igPostCaption=p=>(p.prunedCaption||p.caption||"").trim();
const igPostBadge=p=>p.mediaType==="VIDEO"?(p.isReel?"Reel":"Video"):p.mediaType==="CAROUSEL_ALBUM"?"Album":"";

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
