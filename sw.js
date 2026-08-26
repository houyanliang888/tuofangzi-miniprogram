const CACHE='tuofangzi-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./领码.html','./icons/icon.svg','./icons/icon-144.png','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // 对页面（导航 / index.html / 领码.html）采用 network-first，保证修复 bug 后客户打开即自动更新
  if(e.request.mode==='navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('领码.html')){
    e.respondWith(
      fetch(e.request).then(res=>{
        const cp=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp));
        return res;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  // 其他静态资源（图标等）cache-first，省流量
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const cp=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
