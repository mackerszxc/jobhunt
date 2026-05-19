// ── PHASE 5: PWA SETUP ──
(()=>{
  // Inject manifest as a blob so no separate file is needed
  const manifest={
    name:'HuntLog',short_name:'HuntLog',
    description:'Track every application, interview, and offer.',
    start_url:'/',display:'standalone',
    background_color:'#0b0b0f',theme_color:'#6366f1',
    icons:[
      {src:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" rx="20" fill="%236366f1"/%3E%3Ctext y=".9em" font-size="80" x="10"%3E📋%3C/text%3E%3C/svg%3E',sizes:'any',type:'image/svg+xml'}
    ]
  };
  const blob=new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'});
  const url=URL.createObjectURL(blob);
  document.getElementById('pwaManifest').href=url;

  // Service worker registration
  if('serviceWorker' in navigator){
    const swCode=`
const CACHE='huntlog-v1';
const PRECACHE=['/'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||new Response('Offline',{status:503}))));
});
self.addEventListener('push',e=>{
  const data=e.data?e.data.json():{title:'HuntLog',body:'You have a follow-up reminder!'};
  e.waitUntil(self.registration.showNotification(data.title||'HuntLog',{body:data.body,icon:'/icon-192.png',badge:'/icon-72.png',tag:'huntlog-reminder',requireInteraction:true}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('/'));});
    `;
    const swBlob=new Blob([swCode],{type:'application/javascript'});
    const swUrl=URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swUrl,{scope:'/'}).catch(()=>{});
  }

  // Install prompt
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    if(!localStorage.getItem('pwaDismissed')){
      document.getElementById('pwaBanner').classList.add('visible');
    }
  });
  window.pwaTriggerInstall=()=>{
    if(!deferredPrompt)return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('pwaBanner').classList.remove('visible');});
  };
  window.pwaDismiss=()=>{
    localStorage.setItem('pwaDismissed','1');
    document.getElementById('pwaBanner').classList.remove('visible');
  };
  // Already installed: hide banner
  window.matchMedia('(display-mode: standalone)').addEventListener('change',e=>{
    if(e.matches)document.getElementById('pwaBanner').classList.remove('visible');
  });
  if(window.matchMedia('(display-mode: standalone)').matches){
    document.getElementById('pwaBanner').classList.remove('visible');
  }
})();

