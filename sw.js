/* ================= SERVICE WORKER =================
   Exists so the site can be installed as an app. It deliberately caches very little:
   everything the pages show comes live from Supabase, so pages always try the network
   first and only fall back to a saved copy (or a small "you're offline" page) when
   there is no connection. Stylesheets, scripts and images are versioned with ?v=, so
   they are served from the cache and refreshed in the background.
   Bump VERSION to throw the old caches away. */
const VERSION="bpsc-v1";
const PAGES=VERSION+"-pages",ASSETS=VERSION+"-assets";

const OFFLINE_HTML=`<!DOCTYPE html><html lang="en-GB"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline — Basildon &amp; Phoenix SC</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111116;color:#fff;
font-family:Montserrat,system-ui,sans-serif;text-align:center;padding:20px}h1{font-size:1.4rem;margin:18px 0 8px}
p{color:#c9c9cf;max-width:32ch;margin:0 auto 20px}button{background:#f5841f;color:#101014;border:0;border-radius:10px;
padding:12px 22px;font:inherit;font-weight:700;cursor:pointer}</style></head><body><div>
<img src="assets/img/icon-192.png" width="96" height="96" alt="">
<h1>You're offline</h1><p>Club news, meets and the calendar need an internet connection. Check your signal and try again.</p>
<button onclick="location.reload()">Try again</button></div></body></html>`;

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(ASSETS).then(c=>c.addAll(["assets/img/icon-192.png"])).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>!k.startsWith(VERSION)).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  // Supabase, CDNs, fonts, Instagram: leave to the browser untouched
  if(req.method!=="GET"||url.origin!==location.origin)return;

  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(PAGES).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req,{cacheName:PAGES})
      .then(hit=>hit||new Response(OFFLINE_HTML,{headers:{"Content-Type":"text/html; charset=utf-8"}}))));
    return;
  }

  if(url.pathname.startsWith("/assets/")||url.pathname.startsWith("/images/")){
    e.respondWith(caches.open(ASSETS).then(c=>c.match(req).then(hit=>{
      const fresh=fetch(req).then(res=>{if(res.ok)c.put(req,res.clone());return res;});
      if(hit){e.waitUntil(fresh.catch(()=>{}));return hit;}
      return fresh;
    })));
  }
});
