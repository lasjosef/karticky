const V="karticky-v5";
const CORE=["./","index.html","core.js","manifest.webmanifest","icon-192.png","icon-512.png","badge-96.png"];
importScripts("core.js");
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.hostname.endsWith("googleapis.com")&&!u.hostname.startsWith("fonts"))return; // Drive always online
  if(u.hostname==="accounts.google.com"||u.hostname.endsWith("googleusercontent.com"))return;
  if(e.request.mode==="navigate"){ // page: network first, offline from cache
    e.respondWith(fetch(e.request.url,{cache:"no-cache"}).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put("index.html",c));}return r;}).catch(()=>caches.match("index.html")));
    return;
  }
  if(u.origin===location.origin){ // own files: network first so updates arrive, cache when offline
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));}return r;})));
});

/* ---------- a card in your notifications ---------- */
async function showCard(){
  const d=await DB.get("data")||emptyData();
  const items=(d.items||[]).filter(c=>!c.del);
  const cats=d.cats&&d.cats.length?d.cats:DEFAULT_CATS;
  const opts={icon:"icon-192.png",badge:"badge-96.png",tag:"tipcard",renotify:true};
  if(!items.length) return self.registration.showNotification("Tip Cards",{...opts,body:"Heard a good line today? Add it.",data:{}});
  let c=dueCards(items)[0], fresh=false;
  if(!c){ // nothing due: bring back a card you haven't seen for a while
    const old=items.slice().sort((a,b)=>(a.lastSeen||"")<(b.lastSeen||"")?-1:1).slice(0,5);
    c=old[Math.floor(Math.random()*old.length)]; fresh=true; }
  const cat=cats.find(x=>x.id===c.cat)||{emoji:"✨",name:"Tip"};
  const title=c.cue&&c.cue.trim()?`${cat.emoji} ${c.cue}`:`${cat.emoji} ${cat.name}${fresh?" · refresher":""}`;
  return self.registration.showNotification(title,{...opts,body:c.text,data:{id:c.id,practice:fresh},
    actions:[{action:"know",title:"✓ Know it"},{action:"again",title:"✕ Not yet"}]});
}
self.addEventListener("push",e=>{e.waitUntil(showCard());});
self.addEventListener("message",e=>{ if(e.data&&e.data.showCard) e.waitUntil(showCard()); });
async function tellPages(){ const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true}); cs.forEach(c=>c.postMessage({reload:true})); }
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const data=e.notification.data||{};
  if((e.action==="know"||e.action==="again")&&data.id){
    e.waitUntil((async()=>{
      const d=await DB.get("data")||emptyData();
      const c=(d.items||[]).find(x=>x.id===data.id); if(!c) return;
      const n=swipeCard(c,e.action==="know",!!data.practice);
      d.items=d.items.map(x=>x.id===n.id?n:x);
      await DB.set("data",d); await tellPages(); // the app syncs it to Drive next time it's open
    })());
    return;
  }
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{
    for(const c of cs){ if(c.url.includes("/karticky/")){ c.postMessage({reload:true}); return c.focus(); } }
    return self.clients.openWindow("./#today");
  }));
});
