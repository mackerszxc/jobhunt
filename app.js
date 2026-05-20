import{initializeApp}from'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail}from'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import{getFirestore,collection,addDoc,updateDoc,deleteDoc,doc,onSnapshot,serverTimestamp,query,orderBy,getDocs,setDoc,getDoc,writeBatch,Timestamp,enableMultiTabIndexedDbPersistence}from'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const cfg={apiKey:"AIzaSyB-xA4vENp_eCgMdepm_GWqVlIqvC5McQM",authDomain:"jobhunt-e2f07.firebaseapp.com",projectId:"jobhunt-e2f07",storageBucket:"jobhunt-e2f07.firebasestorage.app",messagingSenderId:"598345435005",appId:"1:598345435005:web:cdffe4894b48b84d34ee14"};
const fbApp=initializeApp(cfg);
const auth=getAuth(fbApp);
const db=getFirestore(fbApp);

// Phase 1: Offline persistence (multi-tab safe)
enableMultiTabIndexedDbPersistence(db).catch(()=>{});

// Phase 1: Admin check via custom claims (falls back to hardcoded UID during transition)
const ADMIN_UID='DYd2v8s2uwdpFumzBCeUHX3qs0M2';
async function isAdmin(user){
  if(!user)return false;
  try{
    const idToken=await user.getIdTokenResult();
    return idToken.claims.admin===true||user.uid===ADMIN_UID;
  }catch{return user.uid===ADMIN_UID;}
}

const SM={applied:{label:'Applied'},screening:{label:'Screening'},interview:{label:'Interview'},offer:{label:'Offer'},rejected:{label:'Rejected'}};
const REJECT_REASONS={no_response:'No response',skills_gap:'Skills gap',salary_mismatch:'Salary mismatch',position_filled:'Position filled',culture_fit:'Culture fit',withdrew:'I withdrew',other:'Other'};
const ROUND_LABELS={1:'Round 1 · Phone Screen',2:'Round 2 · Technical',3:'Round 3 · Final',4:'Offer Stage'};
let jobs=[],currentFilter='all',currentSearch='',currentSort='date-desc',openJobId=null,unsubJobs=null,currentUser=null;
let selectedIds=new Set();
let editingJobId=null;
let modalTags=[];
let currentRound=0; // 0 = not set
let currentView='list'; // 'list' or 'kanban'

// ── THEME ──
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  const btn=document.getElementById('themeBtn');
  if(btn)btn.innerHTML=t==='light'?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>';
  localStorage.setItem('theme',t);
}
window.toggleTheme=()=>{
  const current=document.documentElement.getAttribute('data-theme')||'dark';
  applyTheme(current==='dark'?'light':'dark');
};
applyTheme(localStorage.getItem('theme')||'dark');

// ── SYNC ──
function setSyncState(s){
  const d=document.getElementById('syncDot');
  d.className='sync-dot'+(s==='syncing'?' syncing':s==='err'?' err':'');
}

// ── FORMATTING ──
function fmt(ts){
  if(!ts)return'—';
  const d=ts.toDate?ts.toDate():new Date(ts);
  if(isNaN(d))return'—';
  return d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
}
function fmtFull(ts){
  if(!ts)return'';
  const d=ts.toDate?ts.toDate():new Date(ts);
  if(isNaN(d))return'';
  return d.toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
function parseLocalDate(s){
  if(!s)return null;
  const[y,m,d]=s.split('-').map(Number);
  return new Date(y,m-1,d);
}
function toDateInput(ts){
  if(!ts)return'';
  const d=ts.toDate?ts.toDate():(ts instanceof Date?ts:new Date(ts));
  if(isNaN(d))return'';
  return d.toISOString().split('T')[0];
}
function fmtFollowup(ts){
  if(!ts)return null;
  const d=ts.toDate?ts.toDate():new Date(ts);
  if(isNaN(d))return null;
  const now=new Date();now.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  const diff=Math.round((d-now)/(1000*60*60*24));
  if(diff<0)return{label:`Overdue by ${-diff}d`,overdue:true};
  if(diff===0)return{label:'Follow up today',overdue:true};
  return{label:`Follow up in ${diff}d`,overdue:false};
}

// ── DAYS SINCE ──
function daysSince(ts){
  if(!ts)return null;
  const d=ts.toDate?ts.toDate():new Date(ts);
  if(isNaN(d))return null;
  const now=new Date();now.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return Math.round((now-d)/(1000*60*60*24));
}
function daysBadgeHtml(ts){
  const n=daysSince(ts);
  if(n===null)return'';
  const cls=n>30?'very-stale':n>14?'stale':'';
  const label=n===0?'today':n===1?'1d ago':`${n}d ago`;
  return`<span class="days-badge ${cls}">${label}</span>`;
}

// ── COUNTS ──
function updateCounts(){
  document.getElementById('cnt-all').textContent=jobs.length;
  ['applied','screening','interview','offer'].forEach(s=>{
    const el=document.getElementById('cnt-'+(s==='screening'?'screen':s));
    if(el)el.textContent=jobs.filter(j=>j.status===s).length;
  });
}

// ── SORT ──
function sortedJobs(arr){
  const a=[...arr];
  switch(currentSort){
    case'date-asc':return a.sort((x,y)=>tsMs(x.date)-tsMs(y.date));
    case'company-asc':return a.sort((x,y)=>(x.company||'').localeCompare(y.company||''));
    case'company-desc':return a.sort((x,y)=>(y.company||'').localeCompare(x.company||''));
    case'title-asc':return a.sort((x,y)=>(x.title||'').localeCompare(y.title||''));
    case'status':return a.sort((x,y)=>Object.keys(SM).indexOf(x.status)-Object.keys(SM).indexOf(y.status));
    case'salary-desc':return a.sort((x,y)=>parseSalary(y.salary)-parseSalary(x.salary));
    case'stale':return a.sort((x,y)=>tsMs(x.date)-tsMs(y.date)); // oldest first = most stale
    default:return a.sort((x,y)=>tsMs(y.date)-tsMs(x.date));
  }
}
function tsMs(ts){if(!ts)return 0;const d=ts.toDate?ts.toDate():new Date(ts);return isNaN(d)?0:d.getTime();}
function parseSalary(s){if(!s)return 0;const m=s.match(/[\d,]+/);return m?parseInt(m[0].replace(/,/g,''),10):0;}

// ── TAG CHIP HTML ──
const TAG_COLORS={priority:'tag-priority',referral:'tag-referral','cold apply':'tag-cold','cold':'tag-cold'};
function tagChipHtml(tag){const cls=TAG_COLORS[tag.toLowerCase()]||'tag-custom';return`<span class="tag-chip ${cls}">${tag}</span>`;}

// ── VIEW TOGGLE ──
window.setView=function(v){
  currentView=v;
  localStorage.setItem('view',v);
  document.getElementById('listViewBtn').classList.toggle('active-view',v==='list');
  document.getElementById('kanbanViewBtn').classList.toggle('active-view',v==='kanban');
  // sort select: hide in kanban
  document.getElementById('sortSelect').style.display=v==='kanban'?'none':'';
  render();
};
// restore saved view
const savedView=localStorage.getItem('view')||'list';
// will call setView after render is defined

// ── RENDER ──
function render(){
  updateCounts();
  const q=currentSearch.toLowerCase();
  let visible=jobs.filter(j=>{
    const mf=currentFilter==='all'||j.status===currentFilter;
    // search: title, company, location, tags, notes, recruiter
    const ms=!q||(j.title||'').toLowerCase().includes(q)||(j.company||'').toLowerCase().includes(q)||(j.location||'').toLowerCase().includes(q)||(j.tags||[]).some(t=>t.toLowerCase().includes(q))||(j.notes||'').toLowerCase().includes(q)||(j.recruiter||'').toLowerCase().includes(q);
    return mf&&ms;
  });
  visible=sortedJobs(visible);

  if(jobs.length===0){
    document.getElementById('jobsList').innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No applications yet</div>
        <div class="empty-sub">Start tracking your job search by adding your first application. Every journey starts somewhere.</div>
        <button class="empty-cta" onclick="openAdd()">Add your first job</button>
      </div>`;
    document.getElementById('noResults').style.display='none';
    return;
  }

  if(currentView==='kanban'){
    renderKanban(visible);
  } else {
    renderList(visible);
  }
}

function renderList(visible){
  const container=document.getElementById('jobsList');
  container.className='jobs-list';
  container.innerHTML=visible.map(j=>{
    const fu=j.followupDate?fmtFollowup(j.followupDate):null;
    const tags=(j.tags||[]).map(tagChipHtml).join('');
    const isSelected=selectedIds.has(j.id);
    const roundHtml=j.status==='interview'&&j.interviewRound?`<span class="round-badge">${ROUND_LABELS[j.interviewRound]||`Round ${j.interviewRound}`}</span>`:'';
    const rejectHtml=j.status==='rejected'&&j.rejectReason?`<div class="rejection-reason"><i class="fa-solid fa-circle-xmark"></i>${REJECT_REASONS[j.rejectReason]||j.rejectReason}</div>`:'';
    const matchHtml=j.matchScore?`<span class="card-match-score" title="Fit score: ${j.matchScore}/5">${'★'.repeat(j.matchScore)}${'☆'.repeat(5-j.matchScore)}</span>`:'';
    return`<div class="job-card ${j.status}${isSelected?' selected':''}" onclick="window._cardClick(event,'${j.id}')">
      <div class="job-top">
        <div class="job-title">
          <label class="cb-wrap" onclick="event.stopPropagation()">
            <input type="checkbox" ${isSelected?'checked':''} onchange="window._toggleSelect('${j.id}',this.checked)"/>
            <div class="cb-mark"><i class="fa-solid fa-check"></i></div>
          </label>
          ${j.title||''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          ${daysBadgeHtml(j.date)}
          <div class="job-status ${j.status}">${SM[j.status]?.label||j.status}</div>
        </div>
      </div>
      <div class="job-company">${j.company||''}</div>
      ${roundHtml?`<div style="margin-bottom:4px">${roundHtml}</div>`:''}
      <div class="job-meta">
        ${j.location?`<span class="job-tag"><i class="fa-solid fa-location-dot"></i>${j.location}</span>`:''}
        ${j.salary?`<span class="job-tag"><i class="fa-solid fa-peso-sign"></i>${j.salary}</span>`:''}
        <span class="job-tag"><i class="fa-solid fa-calendar"></i>${fmt(j.date)}</span>
        ${j.url?`<span class="job-tag"><i class="fa-solid fa-link"></i>Link</span>`:''}
        ${j.recruiter?`<span class="job-tag"><i class="fa-solid fa-user-tie"></i>${j.recruiter.split('·')[0].trim()}</span>`:''}
        ${matchHtml}
      </div>
      ${tags?`<div class="job-tags-row">${tags}</div>`:''}
      ${rejectHtml}
      ${fu?`<div class="follow-up-badge${fu.overdue?' overdue':''}"><i class="fa-solid fa-bell"></i>${fu.label}</div>`:''}
    </div>`;
  }).join('');
  document.getElementById('noResults').style.display=visible.length?'none':'block';
}

function renderKanban(visible){
  const container=document.getElementById('jobsList');
  container.className='';
  const cols=Object.keys(SM);
  const byStatus={};
  cols.forEach(s=>{byStatus[s]=[];});
  visible.forEach(j=>{if(byStatus[j.status])byStatus[j.status].push(j);});
  container.innerHTML=`<div class="kanban-board" id="kanbanBoard">${cols.map(s=>{
    const cards=byStatus[s];
    const cardsHtml=cards.length?cards.map(j=>{
      const n=daysSince(j.date);
      const daysClass=n>30?'very-stale':n>14?'stale':'';
      const daysLabel=n===null?'':(n===0?'today':n===1?'1d ago':`${n}d ago`);
      return`<div class="kanban-card" draggable="true" data-id="${j.id}" data-status="${j.status}" onclick="window._openDetail('${j.id}')">
        <div class="kanban-card-title">${j.title||''}</div>
        <div class="kanban-card-co">${j.company||''}</div>
        ${j.status==='interview'&&j.interviewRound?`<div style="margin-top:4px"><span class="round-badge" style="font-size:9px;padding:1px 6px">${ROUND_LABELS[j.interviewRound]||`R${j.interviewRound}`}</span></div>`:''}
        <div class="kanban-card-meta">
          <div class="kanban-card-days ${daysClass}">${daysLabel}</div>
          ${(j.tags||[]).length?`<span class="tag-chip tag-custom" style="font-size:9px">${j.tags[0]}</span>`:''}
        </div>
      </div>`;
    }).join(''):`<div class="kanban-empty">empty</div>`;
    return`<div class="kanban-col" data-status="${s}">
      <div class="kanban-col-header">
        <span class="kanban-col-title ${s}">${SM[s].label}</span>
        <span class="kanban-count">${cards.length}</span>
      </div>
      ${cardsHtml}
    </div>`;
  }).join('')}</div>`;
  document.getElementById('noResults').style.display='none';
  // Attach drag-and-drop
  initKanbanDragDrop();
}

// ── KANBAN DRAG & DROP ──
let dragId=null;
function initKanbanDragDrop(){
  document.querySelectorAll('.kanban-card[draggable]').forEach(card=>{
    card.addEventListener('dragstart',e=>{
      dragId=card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';
    });
    card.addEventListener('dragend',()=>{
      card.classList.remove('dragging');
      document.querySelectorAll('.kanban-col').forEach(c=>c.classList.remove('drag-over'));
    });
  });
  document.querySelectorAll('.kanban-col').forEach(col=>{
    col.addEventListener('dragover',e=>{
      e.preventDefault();
      document.querySelectorAll('.kanban-col').forEach(c=>c.classList.remove('drag-over'));
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave',()=>col.classList.remove('drag-over'));
    col.addEventListener('drop',async e=>{
      e.preventDefault();
      col.classList.remove('drag-over');
      const newStatus=col.dataset.status;
      if(!dragId||!newStatus||!currentUser)return;
      const job=jobs.find(j=>j.id===dragId);
      if(!job||job.status===newStatus){dragId=null;return;}
      setSyncState('syncing');
      await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,dragId),{status:newStatus});
      await addDoc(collection(db,`users/${currentUser.uid}/jobs/${dragId}/activity`),{
        text:`Moved to "${SM[newStatus]?.label}" via Kanban`,ts:serverTimestamp()
      });
      dragId=null;
    });
  });
}

function updateBulkBar(){
  const bar=document.getElementById('bulkBar');
  const n=selectedIds.size;
  if(n===0){bar.classList.remove('visible');return;}
  bar.classList.add('visible');
  document.getElementById('bulkInfo').textContent=`${n} selected`;
  document.getElementById('bulkStatusWrap').innerHTML=Object.entries(SM).map(([k,v])=>
    `<button class="bulk-status-btn" onclick="bulkChangeStatus('${k}')">${v.label}</button>`
  ).join('');
}

window._cardClick=function(e,id){
  if(e.target.closest('.cb-wrap'))return;
  window._openDetail(id);
};
window._toggleSelect=function(id,checked){
  if(checked)selectedIds.add(id);else selectedIds.delete(id);
  updateBulkBar();render();
};
window.clearSelection=function(){selectedIds.clear();updateBulkBar();render();};
window.bulkChangeStatus=async function(s){
  if(!currentUser||selectedIds.size===0)return;
  if(!confirm(`Change ${selectedIds.size} jobs to "${SM[s]?.label}"?`))return;
  setSyncState('syncing');
  const batch=writeBatch(db);
  selectedIds.forEach(id=>{batch.update(doc(db,`users/${currentUser.uid}/jobs`,id),{status:s});});
  await batch.commit();
  selectedIds.clear();updateBulkBar();
};
window.bulkDelete=async function(){
  if(!currentUser||selectedIds.size===0)return;
  if(!confirm(`Delete ${selectedIds.size} application(s)?`))return;
  setSyncState('syncing');
  const batch=writeBatch(db);
  selectedIds.forEach(id=>{batch.delete(doc(db,`users/${currentUser.uid}/jobs`,id));});
  await batch.commit();
  selectedIds.clear();updateBulkBar();
};

// ── SUBSCRIBE ──
function subscribeJobs(uid){
  if(unsubJobs)unsubJobs();
  const q2=query(collection(db,`users/${uid}/jobs`),orderBy('date','desc'));
  unsubJobs=onSnapshot(q2,snap=>{
    jobs=snap.docs.map(d=>({id:d.id,...d.data()}));
    setSyncState('ok');render();
  },()=>setSyncState('err'));
}

// ── AUTH ──
onAuthStateChanged(auth,async user=>{
  currentUser=user;
  if(user){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('mainApp').style.display='flex';
    document.getElementById('userAvatar').src=user.photoURL||'';
    document.getElementById('userName').textContent=user.displayName?.split(' ')[0]||user.email?.split('@')[0]||'';
    setSyncState('syncing');
    subscribeJobs(user.uid);
    const admin=await isAdmin(user);
    document.getElementById('adminBtn').style.display=admin?'flex':'none';
  }else{
    document.getElementById('loginScreen').style.display='flex';
    document.getElementById('mainApp').style.display='none';
    if(unsubJobs)unsubJobs();
    jobs=[];
  }
});

async function getClientIP(){try{const r=await fetch('https://api.ipify.org?format=json');const d=await r.json();return d.ip||'unknown';}catch{return'unknown';}}

window.signInGoogle=async()=>{
  try{
    const result=await signInWithPopup(auth,new GoogleAuthProvider());
    const user=result.user;
    const ip=await getClientIP();
    await setDoc(doc(db,'users',user.uid),{
      displayName:user.displayName||'',email:user.email||'',photoURL:user.photoURL||'',
      lastLoginIP:ip,lastLoginAt:serverTimestamp(),banned:false
    },{merge:true});
    const snap=await getDoc(doc(db,'users',user.uid));
    if(snap.data()?.banned){await signOut(auth);alert('Your account has been suspended.');return;}
  }catch(e){alert('Sign-in failed: '+e.message);}
};
window.signOutUser=()=>signOut(auth);

// Phase 1: Email/password auth
function showAuthError(msg){
  const el=document.getElementById('authError');
  if(el){el.textContent=msg;setTimeout(()=>{el.textContent='';},4000);}
}
window.signInEmail=async()=>{
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPassword').value;
  if(!email||!pass){showAuthError('Enter email and password.');return;}
  try{
    await signInWithEmailAndPassword(auth,email,pass);
  }catch(e){showAuthError(e.code==='auth/wrong-password'||e.code==='auth/user-not-found'?'Invalid credentials.':e.message);}
};
window.signUpEmail=async()=>{
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPassword').value;
  if(!email||!pass){showAuthError('Enter email and password.');return;}
  if(pass.length<6){showAuthError('Password must be at least 6 characters.');return;}
  try{
    const cred=await createUserWithEmailAndPassword(auth,email,pass);
    await setDoc(doc(db,'users',cred.user.uid),{
      displayName:email.split('@')[0],email,photoURL:'',lastLoginAt:serverTimestamp(),banned:false
    },{merge:true});
  }catch(e){showAuthError(e.code==='auth/email-already-in-use'?'Account already exists. Sign in instead.':e.message);}
};
window.resetPassword=async()=>{
  const email=document.getElementById('authEmail').value.trim();
  if(!email){showAuthError('Enter your email first.');return;}
  try{await sendPasswordResetEmail(auth,email);showAuthError('Reset email sent! Check your inbox.');}
  catch(e){showAuthError(e.message);}
};

window.filterStat=function(el,f){
  currentFilter=f;
  document.querySelectorAll('.stat').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');render();
};
window.onSearch=function(v){currentSearch=v;render();};
window.onSort=function(v){currentSort=v;render();};

// ── QUICK ADD ──
let quickAddOpen=false;
window.toggleQuickAdd=function(){
  quickAddOpen=!quickAddOpen;
  document.getElementById('quickAddBar').classList.toggle('hidden',!quickAddOpen);
  document.getElementById('quickAddBtn').classList.toggle('active-view',quickAddOpen);
  if(quickAddOpen){document.getElementById('qa-title').focus();}
};
window.qaKeydown=function(e){
  if(e.key==='Enter')saveQuickAdd();
  if(e.key==='Escape'){toggleQuickAdd();}
};
window.saveQuickAdd=async function(){
  if(!currentUser)return;
  const title=document.getElementById('qa-title').value.trim();
  const company=document.getElementById('qa-company').value.trim();
  if(!title||!company){document.getElementById('qa-title').focus();return;}
  // duplicate check
  const dup=jobs.find(j=>j.title.toLowerCase()===title.toLowerCase()&&j.company.toLowerCase()===company.toLowerCase());
  if(dup&&!confirm(`"${title}" at ${company} already exists. Add anyway?`))return;
  setSyncState('syncing');
  const status=document.getElementById('qa-status').value;
  const today=new Date();
  const dateTs=Timestamp.fromDate(new Date(today.getFullYear(),today.getMonth(),today.getDate()));
  const ref=await addDoc(collection(db,`users/${currentUser.uid}/jobs`),{
    title,company,status,date:dateTs,location:'',salary:'',notes:'',url:'',tags:[],followupDate:null,recruiter:'',interviewRound:0,rejectReason:'',resumeUrl:'',resumeVersion:''
  });
  await addDoc(collection(db,`users/${currentUser.uid}/jobs/${ref.id}/activity`),{
    text:`Application added as "${SM[status]?.label}" via quick add`,ts:serverTimestamp()
  });
  // clear fields, keep open for next entry
  document.getElementById('qa-title').value='';
  document.getElementById('qa-company').value='';
  document.getElementById('qa-title').focus();
};

// ── TAG INPUT ──
window.handleTagInput=function(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const val=e.target.value.trim().replace(/,$/,'');
    if(val&&!modalTags.includes(val)){
      modalTags.push(val);
      renderModalTags();
    }
    e.target.value='';
  }
};
function renderModalTags(){
  const wrap=document.getElementById('tagsWrap');
  const input=document.getElementById('tagInput');
  wrap.querySelectorAll('.tag-item').forEach(t=>t.remove());
  modalTags.forEach((tag,i)=>{
    const chip=document.createElement('span');
    chip.className='tag-item';
    chip.innerHTML=`${tag}<button onclick="removeTag(${i})" type="button">&times;</button>`;
    wrap.insertBefore(chip,input);
  });
}
window.removeTag=function(i){modalTags.splice(i,1);renderModalTags();};

// ── STATUS CHANGE IN MODAL ──
window.onStatusChange=function(){
  const s=document.getElementById('f-status').value;
  document.getElementById('roundSection').classList.toggle('visible',s==='interview');
  document.getElementById('rejectSection').classList.toggle('visible',s==='rejected');
};

// ── INTERVIEW ROUND ──
window.selectRound=function(r){
  currentRound=r;
  document.querySelectorAll('.round-btn').forEach((b,i)=>b.classList.toggle('active',i+1===r));
};
function renderRoundBtns(selected){
  currentRound=selected||0;
  document.querySelectorAll('.round-btn').forEach((b,i)=>b.classList.toggle('active',i+1===selected));
}

// ── DUPLICATE CHECK ──
window.checkDuplicate=function(){
  if(editingJobId)return; // skip when editing
  const title=(document.getElementById('f-title').value||'').trim().toLowerCase();
  const company=(document.getElementById('f-company').value||'').trim().toLowerCase();
  if(!title||!company){document.getElementById('dupWarning').classList.remove('visible');return;}
  const dup=jobs.find(j=>j.title.toLowerCase()===title&&j.company.toLowerCase()===company);
  const warn=document.getElementById('dupWarning');
  if(dup){
    document.getElementById('dupWarningText').textContent=`Possible duplicate: "${dup.title}" at ${dup.company} (${SM[dup.status]?.label})`;
    warn.classList.add('visible');
  }else{
    warn.classList.remove('visible');
  }
};

// ── ADD / EDIT MODAL ──
window.openAdd=function(){
  editingJobId=null;
  modalTags=[];
  currentRound=0;
  document.getElementById('modalTitle').textContent='Add new application';
  document.getElementById('saveBtn').textContent='Save application';
  document.getElementById('dupWarning').classList.remove('visible');
  ['f-title','f-company','f-location','f-salary','f-notes','f-url','f-followup','f-recruiter','f-resumeUrl','f-resumeVersion'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('f-status').value='applied';
  document.getElementById('f-rejectreason').value='';
  document.getElementById('roundSection').classList.remove('visible');
  document.getElementById('rejectSection').classList.remove('visible');
  renderRoundBtns(0);
  const today=new Date();
  document.getElementById('f-date').value=today.toISOString().split('T')[0];
  renderModalTags();
  document.getElementById('addModal').classList.add('open');
  setTimeout(()=>document.getElementById('f-title').focus(),50);
};
window.closeAdd=function(){
  document.getElementById('addModal').classList.remove('open');
  editingJobId=null;modalTags=[];currentRound=0;
};
window.openEdit=function(){
  if(!openJobId)return;
  const j=jobs.find(x=>x.id===openJobId);if(!j)return;
  editingJobId=openJobId;
  modalTags=[...(j.tags||[])];
  currentRound=j.interviewRound||0;
  document.getElementById('modalTitle').textContent='Edit application';
  document.getElementById('saveBtn').textContent='Save changes';
  document.getElementById('dupWarning').classList.remove('visible');
  document.getElementById('f-title').value=j.title||'';
  document.getElementById('f-company').value=j.company||'';
  document.getElementById('f-location').value=j.location||'';
  document.getElementById('f-salary').value=j.salary||'';
  document.getElementById('f-notes').value=j.notes||'';
  document.getElementById('f-url').value=j.url||'';
  document.getElementById('f-recruiter').value=j.recruiter||'';
  document.getElementById('f-resumeUrl').value=j.resumeUrl||'';
  document.getElementById('f-resumeVersion').value=j.resumeVersion||'';
  document.getElementById('f-status').value=j.status||'applied';
  document.getElementById('f-rejectreason').value=j.rejectReason||'';
  document.getElementById('f-date').value=toDateInput(j.date);
  document.getElementById('f-followup').value=toDateInput(j.followupDate);
  document.getElementById('roundSection').classList.toggle('visible',j.status==='interview');
  document.getElementById('rejectSection').classList.toggle('visible',j.status==='rejected');
  renderRoundBtns(currentRound);
  renderModalTags();
  document.getElementById('addModal').classList.add('open');
};

window.saveJob=async function(){
  if(!currentUser)return;
  const title=document.getElementById('f-title').value.trim();
  const company=document.getElementById('f-company').value.trim();
  if(!title||!company){alert('Please enter a job title and company.');return;}
  // duplicate guard on new entries
  if(!editingJobId){
    const dup=jobs.find(j=>j.title.toLowerCase()===title.toLowerCase()&&j.company.toLowerCase()===company.toLowerCase());
    if(dup&&!confirm(`"${title}" at ${company} already exists. Save anyway?`))return;
  }
  setSyncState('syncing');
  const status=document.getElementById('f-status').value;
  const dateVal=document.getElementById('f-date').value;
  const followupVal=document.getElementById('f-followup').value;
  const dateTs=dateVal?Timestamp.fromDate(parseLocalDate(dateVal)):serverTimestamp();
  const followupTs=followupVal?Timestamp.fromDate(parseLocalDate(followupVal)):null;
  const data={
    title,company,
    location:document.getElementById('f-location').value.trim(),
    status,
    salary:document.getElementById('f-salary').value.trim(),
    notes:document.getElementById('f-notes').value.trim(),
    url:document.getElementById('f-url').value.trim(),
    recruiter:document.getElementById('f-recruiter').value.trim(),
    resumeUrl:document.getElementById('f-resumeUrl').value.trim(),
    resumeVersion:document.getElementById('f-resumeVersion').value.trim(),
    tags:modalTags,
    followupDate:followupTs,
    date:dateTs,
    interviewRound:status==='interview'?currentRound:0,
    rejectReason:status==='rejected'?(document.getElementById('f-rejectreason').value||''):''
  };
  if(editingJobId){
    await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,editingJobId),data);
    await addDoc(collection(db,`users/${currentUser.uid}/jobs/${editingJobId}/activity`),{
      text:'Application details updated',ts:serverTimestamp()
    });
    window.closeAdd();
    await window._openDetail(editingJobId);
  }else{
    const ref=await addDoc(collection(db,`users/${currentUser.uid}/jobs`),data);
    await addDoc(collection(db,`users/${currentUser.uid}/jobs/${ref.id}/activity`),{
      text:`Application added as "${SM[status]?.label}"`,ts:serverTimestamp()
    });
    window.closeAdd();
  }
};

// ── DETAIL PANEL ──
window._openDetail=async function(id){
  openJobId=id;window._currentOpenJobId=id;
  const j=jobs.find(x=>x.id===id);if(!j)return;
  document.getElementById('d-title').textContent=j.title||'';
  document.getElementById('d-company').textContent=j.company||'';
  document.getElementById('d-location').textContent=j.location||'—';
  document.getElementById('d-salary').textContent=j.salary||'—';
  document.getElementById('d-notes').textContent=j.notes||'No notes.';
  document.getElementById('d-date').textContent=`${fmt(j.date)} — ${daysBadgeHtml(j.date).replace(/<[^>]+>/g,'')}`;
  // Recruiter
  const recWrap=document.getElementById('d-recruiter-wrap');
  if(j.recruiter){document.getElementById('d-recruiter').textContent=j.recruiter;recWrap.style.display='block';}
  else{recWrap.style.display='none';}
  // URL
  const urlWrap=document.getElementById('d-url-wrap');
  if(j.url){
    document.getElementById('d-url').innerHTML=`<a href="${j.url}" target="_blank" rel="noopener">${j.url}</a>`;
    urlWrap.style.display='block';
  }else{urlWrap.style.display='none';}
  // Resume
  const resumeWrap=document.getElementById('d-resume-wrap');
  if(j.resumeUrl||j.resumeVersion){
    const link=j.resumeUrl?`<a href="${j.resumeUrl}" target="_blank" rel="noopener">${j.resumeVersion||j.resumeUrl}</a>`:(j.resumeVersion||'');
    document.getElementById('d-resume').innerHTML=link;
    resumeWrap.style.display='block';
  }else{resumeWrap.style.display='none';}
  // Follow-up
  const fuWrap=document.getElementById('d-followup-wrap');
  if(j.followupDate){
    const fu=fmtFollowup(j.followupDate);
    const base=fmt(j.followupDate);
    document.getElementById('d-followup').textContent=fu?`${base} — ${fu.label}`:base;
    fuWrap.style.display='block';
  }else{fuWrap.style.display='none';}
  // Tags
  const tagsWrap=document.getElementById('d-tags-wrap');
  if(j.tags&&j.tags.length){
    document.getElementById('d-tags').innerHTML=j.tags.map(tagChipHtml).join('');
    tagsWrap.style.display='block';
  }else{tagsWrap.style.display='none';}
  // Interview round
  const roundWrap=document.getElementById('d-round-wrap');
  if(j.status==='interview'){
    const btns=document.getElementById('d-round-btns');
    btns.innerHTML=[1,2,3,4].map(r=>`<button class="round-btn${j.interviewRound===r?' active':''}" onclick="window._setRound(${r})">${ROUND_LABELS[r]}</button>`).join('');
    roundWrap.style.display='block';
  }else{roundWrap.style.display='none';}
  // Rejection reason
  const rejWrap=document.getElementById('d-reject-wrap');
  if(j.status==='rejected'){
    const btns=document.getElementById('d-reject-btns');
    btns.innerHTML=Object.entries(REJECT_REASONS).map(([k,v])=>
      `<button class="reject-reason-btn${j.rejectReason===k?' active':''}" onclick="window._setRejectReason('${k}')">${v}</button>`
    ).join('');
    rejWrap.style.display='block';
  }else{rejWrap.style.display='none';}
  // Status buttons
  document.getElementById('d-statusbtns').innerHTML=Object.entries(SM).map(([k,v])=>
    `<button class="status-btn ${k} ${j.status===k?'active':''}" onclick="window._changeStatus('${k}')">${v.label}</button>`
  ).join('');
  document.getElementById('detailPanel').classList.add('open');
  await loadActivity(id);
};

// set interview round from detail panel
window._setRound=async function(r){
  if(!currentUser||!openJobId)return;
  setSyncState('syncing');
  await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,openJobId),{interviewRound:r});
  await addDoc(collection(db,`users/${currentUser.uid}/jobs/${openJobId}/activity`),{
    text:`Interview stage set to: ${ROUND_LABELS[r]||`Round ${r}`}`,ts:serverTimestamp()
  });
  await window._openDetail(openJobId);
};

// set rejection reason from detail panel
window._setRejectReason=async function(reason){
  if(!currentUser||!openJobId)return;
  setSyncState('syncing');
  await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,openJobId),{rejectReason:reason});
  await window._openDetail(openJobId);
};

async function loadActivity(jobId){
  if(!currentUser)return;
  const log=document.getElementById('d-activitylog');
  log.innerHTML='<div style="font-size:12px;color:var(--c4)">Loading…</div>';
  const snap=await getDocs(query(collection(db,`users/${currentUser.uid}/jobs/${jobId}/activity`),orderBy('ts','desc')));
  if(snap.empty){log.innerHTML='<div style="font-size:12px;color:var(--c4)">No activity yet.</div>';return;}
  log.innerHTML=snap.docs.map(d=>{
    const data=d.data();
    return`<div class="activity-item"><div class="activity-text">${data.text||''}</div><div class="activity-time">${fmtFull(data.ts)}</div></div>`;
  }).join('');
}

window.addActivity=async function(){
  if(!currentUser||!openJobId)return;
  const input=document.getElementById('activityInput');
  const text=input.value.trim();if(!text)return;
  await addDoc(collection(db,`users/${currentUser.uid}/jobs/${openJobId}/activity`),{text,ts:serverTimestamp()});
  input.value='';await loadActivity(openJobId);
};
window.closeDetail=function(){document.getElementById('detailPanel').classList.remove('open');openJobId=null;window._currentOpenJobId=null;};
window._changeStatus=async function(s){
  if(!currentUser||!openJobId)return;
  setSyncState('syncing');
  await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,openJobId),{status:s});
  await addDoc(collection(db,`users/${currentUser.uid}/jobs/${openJobId}/activity`),{
    text:`Status changed to "${SM[s]?.label}"`,ts:serverTimestamp()
  });
  await window._openDetail(openJobId);
};
window.deleteJob=async function(){
  if(!currentUser||!openJobId||!confirm('Delete this application?'))return;
  setSyncState('syncing');
  await deleteDoc(doc(db,`users/${currentUser.uid}/jobs`,openJobId));
  window.closeDetail();
};

// ── ADMIN ──
window.openAdmin=async function(){
  if(!currentUser||!(await isAdmin(currentUser)))return;
  document.getElementById('adminOverlay').classList.add('open');
  const body=document.getElementById('adminBody');
  body.innerHTML='<div class="admin-loading"><div class="spinner"></div> Loading users…</div>';
  try{
    const usersSnap=await getDocs(collection(db,'users'));
    const donutC={applied:'#3b82f6',screening:'#8b5cf6',interview:'#f59e0b',offer:'#10b981',rejected:'#ef4444'};

    const rowData=await Promise.all(usersSnap.docs.map(async d=>{
      const u=d.data();const uid=d.id;
      const jobsSnap=await getDocs(collection(db,`users/${uid}/jobs`));
      const jobCount=jobsSnap.size;
      const lastLogin=u.lastLoginAt?.toDate?.()
        ?u.lastLoginAt.toDate().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}):'—';
      const sc={applied:0,screening:0,interview:0,offer:0,rejected:0};
      jobsSnap.docs.forEach(jd=>{const s=jd.data().status;if(sc[s]!==undefined)sc[s]++;});
      const funnelTip=Object.entries(sc).map(([s,v])=>`${SM[s]?.label||s}: ${v}`).join(' · ');
      // Per-user mini funnel bar (shown under job list toggle)
      const perUserFunnel=Object.entries(sc).map(([s,v])=>{
        const pct=jobCount>0?Math.round((v/jobCount)*100):0;
        return`<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <div style="font-size:10px;color:${donutC[s]};width:70px;text-align:right">${SM[s]?.label||s}</div>
          <div style="flex:1;background:var(--c3);border-radius:20px;height:6px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${donutC[s]};border-radius:20px"></div></div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--c4);width:18px">${v}</div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--c4);width:30px;text-align:right">${pct}%</div>
        </div>`;
      }).join('');
      const isYou=uid===currentUser.uid;
      const bannedBadge=u.banned?'<span style="color:var(--rejected);font-size:11px;margin-left:4px">BANNED</span>':'';
      const jobRows=jobsSnap.docs.map(jd=>{
        const jj=jd.data();
        const days=daysSince(jj.date);
        const daysStr=days!==null?`${days}d ago`:'';
        return`<div class="admin-job-row"><strong>${jj.title||'?'}</strong> @ ${jj.company||'?'} <span class="job-status ${jj.status}" style="font-size:10px;padding:1px 7px">${SM[jj.status]?.label||jj.status}</span>${daysStr?` <span style="color:var(--c4);font-size:11px;font-family:'DM Mono',monospace">${daysStr}</span>`:''}</div>`;
      }).join('')||'<div style="color:var(--c4);font-size:12px">No jobs.</div>';
      const html=`<tr data-uid="${uid}" data-name="${(u.displayName||'').toLowerCase()}" data-email="${(u.email||'').toLowerCase()}" data-banned="${!!u.banned}">
        <td><div class="admin-user-cell"><img class="admin-avatar" src="${u.photoURL||''}" onerror="this.style.display='none'" alt=""/><div><div class="admin-name">${u.displayName||'—'}${isYou?'<span class="you-badge">you</span>':''}${bannedBadge}</div><div class="admin-email">${u.email||''}</div></div></div></td>
        <td><span class="ip-badge">${u.lastLoginIP||'—'}</span></td>
        <td style="font-family:'DM Mono',monospace;font-size:11px;color:var(--c4)">${lastLogin}</td>
        <td style="font-family:'DM Mono',monospace;color:var(--c5)">${jobCount}</td>
        <td style="white-space:nowrap">
          <button class="admin-expand-btn" onclick="toggleAdminJobs('${uid}')"><i class="fa-solid fa-briefcase" style="font-size:10px"></i> Jobs</button>
          <button class="admin-expand-btn" style="margin-left:4px" onclick="toggleAdminFunnel('${uid}')" title="${funnelTip}"><i class="fa-solid fa-chart-bar" style="font-size:10px"></i> Funnel</button>
          <button class="admin-expand-btn" style="margin-left:4px" onclick="adminExportCSV('${uid}')"><i class="fa-solid fa-download" style="font-size:10px"></i> CSV</button>
          ${!isYou?`<button class="admin-ban-btn" style="margin-left:4px" onclick="toggleBan('${uid}',${!!u.banned})">${u.banned?'<i class="fa-solid fa-unlock" style="font-size:10px"></i> Unban':'<i class="fa-solid fa-ban" style="font-size:10px"></i> Ban'}</button>`:''}
        </td>
      </tr>
      <tr id="admin-jobs-${uid}" style="display:none"><td colspan="5"><div class="admin-job-list open">${jobRows}</div></td></tr>
      <tr id="admin-funnel-${uid}" style="display:none"><td colspan="5"><div class="admin-job-list open" style="padding:10px 14px">${perUserFunnel}</div></td></tr>`;
      return{html,counts:sc,jobCount};
    }));

    // Aggregate counts across all users
    const aggCounts={applied:0,screening:0,interview:0,offer:0,rejected:0};
    let aggTotal=0;
    rowData.forEach(r=>{
      Object.entries(r.counts).forEach(([s,v])=>{aggCounts[s]=(aggCounts[s]||0)+v;});
      aggTotal+=r.jobCount;
    });
    const totalUsers=usersSnap.size;
    const bannedCount=usersSnap.docs.filter(d=>d.data().banned).length;
    const aggFunnelHtml=Object.entries(aggCounts).map(([s,v])=>{
      const pct=aggTotal>0?Math.round((v/aggTotal)*100):0;
      return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="font-size:11px;color:${donutC[s]};width:76px;text-align:right;font-weight:600">${SM[s]?.label||s}</div>
        <div style="flex:1;background:var(--c3);border-radius:20px;height:8px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${donutC[s]};border-radius:20px;transition:width .4s"></div></div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--c5);width:24px">${v}</div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--c4);width:36px;text-align:right">${pct}%</div>
      </div>`;
    }).join('');

    body.innerHTML=`
      <!-- Aggregate stats bar -->
      <div style="display:flex;align-items:stretch;gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div class="admin-stat-card"><div class="admin-stat-val">${totalUsers}</div><div class="admin-stat-label">Total users</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val">${aggTotal}</div><div class="admin-stat-label">Total jobs</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" style="color:var(--offer)">${aggCounts.offer}</div><div class="admin-stat-label">Offers</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" style="color:var(--interview)">${aggCounts.interview}</div><div class="admin-stat-label">Interviews</div></div>
        <div class="admin-stat-card"><div class="admin-stat-val" style="color:var(--rejected)">${bannedCount}</div><div class="admin-stat-label">Banned</div></div>
        <div class="admin-stat-card" style="flex:1;min-width:220px">
          <div style="font-size:11px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;font-weight:600">Platform funnel</div>
          ${aggFunnelHtml}
        </div>
      </div>
      <!-- User search filter -->
      <div style="margin-bottom:10px;position:relative">
        <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--c4);font-size:12px"></i>
        <input id="adminSearch" placeholder="Filter by name or email…" oninput="filterAdminRows(this.value)"
          style="width:100%;background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:8px 12px 8px 30px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none"/>
      </div>
      <!-- Users table -->
      <div style="overflow-x:auto">
        <table class="admin-table" id="adminTable">
          <thead><tr><th>User</th><th>Last IP</th><th>Last Login</th><th>Jobs</th><th>Actions</th></tr></thead>
          <tbody id="adminTableBody">${rowData.map(r=>r.html).join('')}</tbody>
        </table>
      </div>
      <div id="adminNoResults" style="display:none;text-align:center;padding:2rem;color:var(--c4);font-size:13px">No users match your filter.</div>`;
  }catch(e){
    body.innerHTML=`<div class="admin-loading" style="color:var(--rejected)"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${e.message}</div>`;
  }
};
window.toggleAdminJobs=function(uid){
  const row=document.getElementById(`admin-jobs-${uid}`);
  if(row)row.style.display=row.style.display==='none'?'table-row':'none';
};
window.toggleAdminFunnel=function(uid){
  const row=document.getElementById(`admin-funnel-${uid}`);
  if(row)row.style.display=row.style.display==='none'?'table-row':'none';
};
window.filterAdminRows=function(q){
  q=(q||'').toLowerCase().trim();
  let shown=0;
  document.querySelectorAll('#adminTableBody tr[data-uid]').forEach(tr=>{
    const match=!q||(tr.dataset.name||'').includes(q)||(tr.dataset.email||'').includes(q)||(tr.dataset.uid||'').includes(q);
    tr.style.display=match?'':'none';
    const uid=tr.dataset.uid||'';
    const jr=document.getElementById(`admin-jobs-${uid}`);
    const fr=document.getElementById(`admin-funnel-${uid}`);
    if(jr&&!match)jr.style.display='none';
    if(fr&&!match)fr.style.display='none';
    if(match)shown++;
  });
  const noRes=document.getElementById('adminNoResults');
  if(noRes)noRes.style.display=shown===0?'block':'none';
};
window.toggleBan=async function(uid,isBanned){
  if(!confirm(isBanned?`Unban this user?`:`Ban this user? They won't be able to sign in.`))return;
  await setDoc(doc(db,'users',uid),{banned:!isBanned},{merge:true});
  await window.openAdmin();
};
window.closeAdmin=()=>document.getElementById('adminOverlay').classList.remove('open');

// Admin: export a specific user's jobs as CSV
window.adminExportCSV=async function(uid){
  try{
    const jobsSnap=await getDocs(collection(db,`users/${uid}/jobs`));
    if(!jobsSnap.size){alert('No jobs for this user.');return;}
    const rows=[['Title','Company','Location','Status','Interview Round','Rejection Reason','Salary','Recruiter','URL','Tags','Follow-up','Notes','Resume URL','Resume Version','Date']];
    jobsSnap.docs.forEach(jd=>{
      const j=jd.data();
      rows.push([
        j.title||'',j.company||'',j.location||'',j.status||'',
        j.interviewRound?ROUND_LABELS[j.interviewRound]||`Round ${j.interviewRound}`:'',
        j.rejectReason?REJECT_REASONS[j.rejectReason]||j.rejectReason:'',
        j.salary||'',j.recruiter||'',j.url||'',
        (j.tags||[]).join('; '),
        j.followupDate?fmt(j.followupDate):'',
        (j.notes||'').replace(/"/g,'""'),
        j.resumeUrl||'',j.resumeVersion||'',
        j.date?.toDate?j.date.toDate().toISOString().split('T')[0]:''
      ]);
    });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download=`huntlog-user-${uid.slice(0,8)}.csv`;a.click();
  }catch(e){alert('Export failed: '+e.message);}
};

// ── EXPORT (updated with new fields) ──
window.exportCSV=function(){
  if(!jobs.length){alert('No jobs to export.');return;}
  const rows=[['Title','Company','Location','Status','Interview Round','Rejection Reason','Salary','Recruiter','URL','Resume URL','Resume Version','Tags','Follow-up','Notes','Date','Days Since']];
  jobs.forEach(j=>rows.push([
    j.title||'',j.company||'',j.location||'',j.status||'',
    j.interviewRound?ROUND_LABELS[j.interviewRound]||`Round ${j.interviewRound}`:'',
    j.rejectReason?REJECT_REASONS[j.rejectReason]||j.rejectReason:'',
    j.salary||'',j.recruiter||'',j.url||'',
    j.resumeUrl||'',j.resumeVersion||'',
    (j.tags||[]).join('; '),
    j.followupDate?fmt(j.followupDate):'',
    (j.notes||'').replace(/"/g,'""'),
    j.date?.toDate?j.date.toDate().toISOString().split('T')[0]:'',
    daysSince(j.date)??''
  ]));
  const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='huntlog-export.csv';a.click();
};

// ── ANALYTICS ──
const REJECT_REASONS_ANALYTICS={no_response:'No response',skills_gap:'Skills gap',salary_mismatch:'Salary mismatch',position_filled:'Pos. filled',culture_fit:'Culture fit',withdrew:'Withdrew',other:'Other'};

window.openAnalytics=function(){
  document.getElementById('analyticsOverlay').classList.add('open');
  renderAnalytics();
};
window.closeAnalytics=function(){
  document.getElementById('analyticsOverlay').classList.remove('open');
};

function renderAnalytics(){
  const body=document.getElementById('analyticsBody');
  if(!jobs.length){body.innerHTML='<div class="analytics-empty">No data yet — add some applications first.</div>';return;}

  // --- KPIs ---
  const total=jobs.length;
  const offers=jobs.filter(j=>j.status==='offer').length;
  const rejected=jobs.filter(j=>j.status==='rejected').length;
  const interviews=jobs.filter(j=>j.status==='interview'||j.status==='offer').length;
  const screenings=jobs.filter(j=>j.status==='screening'||j.status==='interview'||j.status==='offer').length;

  const successRate=total>0?Math.round((offers/total)*100):0;
  const interviewRate=total>0?Math.round((interviews/total)*100):0;
  const screenRate=total>0?Math.round((screenings/total)*100):0;
  const rejRate=total>0?Math.round((rejected/total)*100):0;

  // avg response time: days from applied to first status change (approximation via daysSince)
  // We use: for offers+interviews, avg days since apply date
  const responded=jobs.filter(j=>j.status!=='applied'&&j.date);
  const avgResponse=responded.length>0
    ?Math.round(responded.reduce((acc,j)=>{
        const n=daysSince(j.date);return acc+(n??0);
      },0)/responded.length)
    :null;

  // stalest active jobs
  const active=jobs.filter(j=>j.status==='applied'||j.status==='screening');
  const avgStale=active.length>0
    ?Math.round(active.reduce((acc,j)=>acc+(daysSince(j.date)??0),0)/active.length)
    :null;

  // weekly activity (last 8 weeks)
  const now=new Date();now.setHours(0,0,0,0);
  const weekBuckets=Array(8).fill(0);
  jobs.forEach(j=>{
    const d=j.date?.toDate?j.date.toDate():(j.date?new Date(j.date):null);
    if(!d||isNaN(d))return;
    const diffDays=Math.floor((now-d)/(1000*60*60*24));
    const week=Math.floor(diffDays/7);
    if(week>=0&&week<8)weekBuckets[week]++;
  });
  const weekLabels=['now','1w','2w','3w','4w','5w','6w','7w'];
  const maxWeek=Math.max(...weekBuckets,1);

  // funnel
  const statusCounts={applied:0,screening:0,interview:0,offer:0,rejected:0};
  jobs.forEach(j=>{if(statusCounts[j.status]!==undefined)statusCounts[j.status]++;});

  // rejection reasons
  const rejectBreakdown={};
  jobs.filter(j=>j.status==='rejected').forEach(j=>{
    const r=j.rejectReason||'unknown';
    rejectBreakdown[r]=(rejectBreakdown[r]||0)+1;
  });
  const rejectEntries=Object.entries(rejectBreakdown).sort((a,b)=>b[1]-a[1]);
  const maxReject=rejectEntries.length>0?rejectEntries[0][1]:1;

  // tags frequency
  const tagFreq={};
  jobs.forEach(j=>(j.tags||[]).forEach(t=>{tagFreq[t]=(tagFreq[t]||0)+1;}));
  const topTags=Object.entries(tagFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // status donut via conic-gradient
  const donutColors={applied:'#3b82f6',screening:'#8b5cf6',interview:'#f59e0b',offer:'#10b981',rejected:'#ef4444'};
  const donutSegments=Object.entries(statusCounts).filter(([,v])=>v>0);
  let cumulPct=0;
  const conicParts=donutSegments.map(([s,v])=>{
    const pct=(v/total)*100;
    const part=`${donutColors[s]} ${cumulPct}% ${cumulPct+pct}%`;
    cumulPct+=pct;
    return part;
  });

  // insights
  const insights=[];
  if(successRate>=10)insights.push({cls:'good',icon:'fa-trophy',text:`${successRate}% offer rate — solid pipeline`});
  else if(total>=5&&successRate===0)insights.push({cls:'warn',icon:'fa-triangle-exclamation',text:'No offers yet — keep pushing'});
  if(interviewRate>=30)insights.push({cls:'good',icon:'fa-comments',text:`${interviewRate}% interview rate — strong signal`});
  if(avgStale!==null&&avgStale>21)insights.push({cls:'bad',icon:'fa-clock',text:`Avg ${avgStale}d without update — follow up?`});
  if(rejectBreakdown['no_response']>=3)insights.push({cls:'warn',icon:'fa-ghost',text:`${rejectBreakdown['no_response']} ghosted — diversify channels`});
  if(topTags.length&&topTags[0][0]==='cold apply'&&topTags[0][1]>5)insights.push({cls:'warn',icon:'fa-ice-cream',text:'Mostly cold outreach — try referrals'});
  if(avgResponse!==null&&avgResponse<14)insights.push({cls:'good',icon:'fa-bolt',text:`Avg ${avgResponse}d to hear back — fast pipeline`});

  body.innerHTML=`
    <!-- KPIs -->
    <div class="analytics-kpi-row">
      <div class="analytics-kpi">
        <div class="analytics-kpi-val" style="color:var(--offer)">${successRate}%</div>
        <div class="analytics-kpi-label">Offer rate</div>
        <div class="analytics-kpi-sub">${offers} of ${total}</div>
      </div>
      <div class="analytics-kpi">
        <div class="analytics-kpi-val" style="color:var(--interview)">${interviewRate}%</div>
        <div class="analytics-kpi-label">Interview rate</div>
        <div class="analytics-kpi-sub">${interviews} reached</div>
      </div>
      <div class="analytics-kpi">
        <div class="analytics-kpi-val" style="color:var(--screen)">${screenRate}%</div>
        <div class="analytics-kpi-label">Screen rate</div>
        <div class="analytics-kpi-sub">${screenings} reached</div>
      </div>
      <div class="analytics-kpi">
        <div class="analytics-kpi-val" style="color:var(--rejected)">${rejRate}%</div>
        <div class="analytics-kpi-label">Rejection rate</div>
        <div class="analytics-kpi-sub">${rejected} total</div>
      </div>
    </div>

    ${insights.length?`
    <!-- Insights -->
    <div class="analytics-section">
      <div class="analytics-section-title"><i class="fa-solid fa-lightbulb"></i> Insights</div>
      <div class="insights-row">
        ${insights.map(ins=>`<div class="insight-chip ${ins.cls}"><i class="fa-solid ${ins.icon}"></i>${ins.text}</div>`).join('')}
      </div>
    </div>`:'' }

    <!-- Funnel + Donut -->
    <div class="analytics-grid-2">
      <div class="analytics-section">
        <div class="analytics-section-title">Pipeline funnel</div>
        <div class="funnel-rows">
          ${Object.entries(statusCounts).map(([s,v])=>{
            const pct=total>0?Math.round((v/total)*100):0;
            const barColor=donutColors[s]||'var(--accent)';
            return`<div class="funnel-row">
              <div class="funnel-label" style="color:${barColor}">${SM[s]?.label||s}</div>
              <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${pct}%;background:${barColor}"></div></div>
              <div class="funnel-count">${v}</div>
              <div class="funnel-pct" style="color:${barColor}">${pct}%</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="analytics-section">
        <div class="analytics-section-title">Distribution</div>
        <div class="donut-wrap">
          <div class="donut" style="background:conic-gradient(${conicParts.join(',')})"></div>
          <div class="donut-legend">
            ${donutSegments.map(([s,v])=>`
              <div class="donut-legend-item">
                <div class="donut-swatch" style="background:${donutColors[s]}"></div>
                <span>${SM[s]?.label||s} <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--c4)">${v}</span></span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly activity + avg response -->
    <div class="analytics-grid-2">
      <div class="analytics-section">
        <div class="analytics-section-title">Weekly applications (last 8 weeks)</div>
        <div class="weekly-bars">
          ${[...weekBuckets].reverse().map((v,i)=>`
            <div class="weekly-bar-col">
              <div class="weekly-bar" style="height:${Math.round((v/maxWeek)*50)+2}px;opacity:${.4+.6*(v/maxWeek)}"></div>
              <div class="weekly-bar-label">${weekLabels[[...weekBuckets].length-1-i]}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="analytics-section">
        <div class="analytics-section-title">Response timing</div>
        ${avgResponse!==null?`
          <div style="display:flex;flex-direction:column;gap:10px">
            <div>
              <div style="font-family:'DM Mono',monospace;font-size:2rem;color:var(--c6);line-height:1">${avgResponse}</div>
              <div style="font-size:11px;color:var(--c4);margin-top:4px;text-transform:uppercase;letter-spacing:.06em">avg days to status change</div>
            </div>
            ${avgStale!==null?`<div>
              <div style="font-family:'DM Mono',monospace;font-size:1.4rem;color:${avgStale>21?'var(--rejected)':'var(--c5)'};line-height:1">${avgStale}</div>
              <div style="font-size:11px;color:var(--c4);margin-top:4px;text-transform:uppercase;letter-spacing:.06em">avg days stale (active jobs)</div>
            </div>`:''}
          </div>`:'<div style="color:var(--c4);font-size:12px">Not enough data yet.</div>'}
      </div>
    </div>

    <!-- Rejection reasons + Top tags -->
    <div class="analytics-grid-2">
      ${rejectEntries.length?`
      <div class="analytics-section">
        <div class="analytics-section-title">Rejection breakdown</div>
        <div class="reject-rows">
          ${rejectEntries.map(([k,v])=>`
            <div class="reject-row">
              <div class="reject-label">${REJECT_REASONS_ANALYTICS[k]||k}</div>
              <div class="reject-bar-wrap"><div class="reject-bar" style="width:${Math.round((v/maxReject)*100)}%"></div></div>
              <div class="reject-count">${v}</div>
            </div>`).join('')}
        </div>
      </div>`:`<div class="analytics-section"><div class="analytics-section-title">Rejection breakdown</div><div style="color:var(--c4);font-size:12px">No rejections recorded yet.</div></div>`}

      <div class="analytics-section">
        <div class="analytics-section-title">Top tags</div>
        ${topTags.length?`<div class="reject-rows">
          ${topTags.map(([t,v])=>`
            <div class="reject-row">
              <div class="reject-label">${t}</div>
              <div class="reject-bar-wrap"><div class="reject-bar" style="width:${Math.round((v/topTags[0][1])*100)}%;background:var(--accent)"></div></div>
              <div class="reject-count">${v}</div>
            </div>`).join('')}
        </div>`:'<div style="color:var(--c4);font-size:12px">No tags used yet.</div>'}
      </div>
    </div>
  `;
}

// ── IMPORT CSV ──
let csvParsed=[];
window.openImport=function(){document.getElementById('importModal').classList.add('open');};
window.closeImport=function(){
  document.getElementById('importModal').classList.remove('open');
  document.getElementById('importPreview').innerHTML='';
  document.getElementById('importConfirmBtn').style.display='none';
  document.getElementById('csvFileInput').value='';
  csvParsed=[];
};
window.handleCSVFile=function(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const text=e.target.result;
    const lines=text.split(/\r?\n/).filter(l=>l.trim());
    if(!lines.length)return;
    const headers=lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim().toLowerCase());
    csvParsed=[];
    const preview=document.getElementById('importPreview');
    preview.innerHTML='';
    for(let i=1;i<Math.min(lines.length,200);i++){
      const vals=parseCsvLine(lines[i]);
      const row={};
      headers.forEach((h,idx)=>{row[h]=(vals[idx]||'').replace(/^"|"$/g,'').trim();});
      const title=row.title||row['job title']||row['position']||'';
      const company=row.company||row['company name']||'';
      if(!title&&!company)continue;
      const status=normalizeStatus(row.status||row['application status']||'applied');
      csvParsed.push({title,company,status,
        location:row.location||row.city||'',
        salary:row.salary||row['salary range']||'',
        notes:row.notes||row['note']||'',
        url:row.url||row['job url']||row['link']||''
      });
      const div=document.createElement('div');
      div.className='import-preview-row';
      div.textContent=`${title} @ ${company} — ${status}`;
      preview.appendChild(div);
    }
    document.getElementById('importConfirmBtn').style.display=csvParsed.length?'block':'none';
    document.getElementById('importConfirmBtn').textContent=`Import ${csvParsed.length} jobs`;
  };
  reader.readAsText(file);
};
function parseCsvLine(line){
  const result=[];let current='';let inQuotes=false;
  for(let i=0;i<line.length;i++){
    if(line[i]==='"'){inQuotes=!inQuotes;}
    else if(line[i]===','&&!inQuotes){result.push(current);current='';}
    else{current+=line[i];}
  }
  result.push(current);return result;
}
function normalizeStatus(s){
  s=(s||'').toLowerCase().trim();
  if(s.includes('screen')||s.includes('phone'))return'screening';
  if(s.includes('interview'))return'interview';
  if(s.includes('offer'))return'offer';
  if(s.includes('reject')||s.includes('decline')||s.includes('no'))return'rejected';
  return'applied';
}
window.confirmImport=async function(){
  if(!currentUser||!csvParsed.length)return;
  const btn=document.getElementById('importConfirmBtn');
  btn.textContent='Importing…';btn.disabled=true;
  setSyncState('syncing');
  const today=new Date();
  const dateTs=Timestamp.fromDate(new Date(today.getFullYear(),today.getMonth(),today.getDate()));
  for(const row of csvParsed){
    const ref=await addDoc(collection(db,`users/${currentUser.uid}/jobs`),{
      title:row.title,company:row.company,status:row.status,
      location:row.location,salary:row.salary,notes:row.notes,url:row.url,
      tags:[],followupDate:null,recruiter:'',interviewRound:0,rejectReason:'',date:dateTs
    });
    await addDoc(collection(db,`users/${currentUser.uid}/jobs/${ref.id}/activity`),{
      text:'Imported from CSV',ts:serverTimestamp()
    });
  }
  window.closeImport();
};
// Drag-over on import drop zone
(()=>{
  const drop=document.getElementById('importDrop');
  if(!drop)return;
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-over');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('drag-over'));
  drop.addEventListener('drop',e=>{
    e.preventDefault();drop.classList.remove('drag-over');
    const file=e.dataTransfer.files[0];
    if(file){document.getElementById('csvFileInput').files=e.dataTransfer.files;window.handleCSVFile(file);}
  });
})();

// ── PHASE 4: CLOUD FUNCTIONS (deploy separately via Firebase CLI) ──
// These functions enhance HuntLog with server-side automation.
// Deploy with: firebase deploy --only functions
//
// functions/index.js stubs:
//
// 1. FOLLOW-UP REMINDER EMAILS
//    exports.sendFollowUpReminders = functions.pubsub
//      .schedule('every 24 hours').onRun(async ctx => {
//        const today = new Date(); today.setHours(0,0,0,0);
//        const usersSnap = await admin.firestore().collection('users').get();
//        for (const userDoc of usersSnap.docs) {
//          const uid = userDoc.id; const userData = userDoc.data();
//          if (!userData.email || userData.banned) continue;
//          const jobsSnap = await admin.firestore()
//            .collection(`users/${uid}/jobs`)
//            .where('followupDate', '<=', admin.firestore.Timestamp.fromDate(today))
//            .where('status', 'in', ['applied','screening']).get();
//          if (!jobsSnap.empty) {
//            // send email via SendGrid / Resend / nodemailer
//          }
//        }
//      });
//
// 2. BAN ENFORCEMENT (block sign-in for banned users)
//    exports.enforceUserBan = functions.auth.user().beforeSignIn(async (user) => {
//      const doc = await admin.firestore().doc(`users/${user.uid}`).get();
//      if (doc.exists && doc.data().banned) {
//        throw new functions.auth.HttpsError('permission-denied','Your account has been suspended.');
//      }
//    });
//
// 3. SET ADMIN CUSTOM CLAIM (call once per admin user)
//    exports.setAdminClaim = functions.https.onCall(async (data, ctx) => {
//      if (!ctx.auth || ctx.auth.token.admin !== true) throw new Error('Unauthorized');
//      await admin.auth().setCustomUserClaims(data.uid, { admin: true });
//      return { success: true };
//    });
//
// 4. STALE JOB DIGEST (weekly email summary)
//    exports.weeklyDigest = functions.pubsub.schedule('every monday 08:00').onRun(...);

// ── MATCH / FIT SCORE ──
let currentMatchScore=0;
window.setMatchScore=function(n){
  currentMatchScore=n;
  document.querySelectorAll('.match-star').forEach((s,i)=>{
    s.classList.toggle('lit',i<n);
  });
  const labels=['Not rated','Poor fit','Below average','Average fit','Good fit','Great fit!'];
  const el=document.getElementById('matchScoreLabel');
  if(el)el.textContent=labels[n]||'Not rated';
};

// Reset match stars in openAdd/openEdit (patch into existing functions)
const _origOpenAdd=window.openAdd;
window.openAdd=function(){
  _origOpenAdd();
  currentMatchScore=0;
  window.setMatchScore(0);
};
const _origOpenEdit=window.openEdit;
window.openEdit=function(){
  _origOpenEdit();
  const j=jobs.find(x=>x.id===openJobId);
  currentMatchScore=j?.matchScore||0;
  window.setMatchScore(currentMatchScore);
};

// Patch saveJob to persist matchScore
const _origSaveJob=window.saveJob;
window.saveJob=async function(){
  // inject matchScore into data before save
  const _origAddDoc=window._patchedAddDoc||addDoc;
  // We hook by temporarily overriding the data construction
  // Simpler: patch after the fact — intercept by wrapping at Firestore level is complex,
  // so instead we re-implement the save with matchScore included.
  if(!currentUser)return;
  const title=document.getElementById('f-title').value.trim();
  const company=document.getElementById('f-company').value.trim();
  if(!title||!company){alert('Please enter a job title and company.');return;}
  if(!editingJobId){
    const dup=jobs.find(j=>j.title.toLowerCase()===title.toLowerCase()&&j.company.toLowerCase()===company.toLowerCase());
    if(dup&&!confirm(`"${title}" at ${company} already exists. Save anyway?`))return;
  }
  setSyncState('syncing');
  const status=document.getElementById('f-status').value;
  const dateVal=document.getElementById('f-date').value;
  const followupVal=document.getElementById('f-followup').value;
  const dateTs=dateVal?Timestamp.fromDate(parseLocalDate(dateVal)):serverTimestamp();
  const followupTs=followupVal?Timestamp.fromDate(parseLocalDate(followupVal)):null;
  const data={
    title,company,
    location:document.getElementById('f-location').value.trim(),
    status,
    salary:document.getElementById('f-salary').value.trim(),
    notes:document.getElementById('f-notes').value.trim(),
    url:document.getElementById('f-url').value.trim(),
    recruiter:document.getElementById('f-recruiter').value.trim(),
    resumeUrl:document.getElementById('f-resumeUrl').value.trim(),
    resumeVersion:document.getElementById('f-resumeVersion').value.trim(),
    tags:modalTags,
    followupDate:followupTs,
    date:dateTs,
    interviewRound:status==='interview'?currentRound:0,
    rejectReason:status==='rejected'?(document.getElementById('f-rejectreason').value||''):'',
    matchScore:currentMatchScore||0
  };
  if(editingJobId){
    await updateDoc(doc(db,`users/${currentUser.uid}/jobs`,editingJobId),data);
    await addDoc(collection(db,`users/${currentUser.uid}/jobs/${editingJobId}/activity`),{
      text:'Application details updated',ts:serverTimestamp()
    });
    window.closeAdd();
    await window._openDetail(editingJobId);
  }else{
    const ref=await addDoc(collection(db,`users/${currentUser.uid}/jobs`),data);
    await addDoc(collection(db,`users/${currentUser.uid}/jobs/${ref.id}/activity`),{
      text:`Application added as "${SM[status]?.label}"`,ts:serverTimestamp()
    });
    window.closeAdd();
  }
};

// ── AI WRITING ASSISTANT ──
let aiCurrentMode='cover';
let aiCurrentJob=null; // job context when opened from detail panel

window.openAIAssist=function(jobId){
  aiCurrentJob=jobId?jobs.find(j=>j.id===jobId):null;
  // If opened from detail panel, pre-fill context
  const ctx=document.getElementById('aiJobContext');
  if(aiCurrentJob){
    ctx.textContent=`Context: "${aiCurrentJob.title}" at ${aiCurrentJob.company}`;
  }else{
    ctx.textContent='';
  }
  // Resume note
  const noteEl=document.getElementById('aiResumeNoteText');
  if(aiCurrentJob?.resumeUrl){
    noteEl.innerHTML=`Resume linked: <a href="${aiCurrentJob.resumeUrl}" target="_blank" rel="noopener">${aiCurrentJob.resumeVersion||aiCurrentJob.resumeUrl}</a>`;
  }else{
    noteEl.textContent='Tip: add your resume URL in the job form so the AI can reference it.';
  }
  // Reset output
  document.getElementById('aiOutputWrap').classList.remove('visible');
  document.getElementById('aiOutput').textContent='';
  document.getElementById('aiJDInput').value='';
  setAIMode('cover');
  document.getElementById('aiModal').classList.add('open');
  setTimeout(()=>document.getElementById('aiJDInput').focus(),80);
};

window.closeAIAssist=function(){
  document.getElementById('aiModal').classList.remove('open');
  aiCurrentJob=null;
};

window.setAIMode=function(mode){
  aiCurrentMode=mode;
  document.querySelectorAll('.ai-mode-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('aiTab'+mode.charAt(0).toUpperCase()+mode.slice(1))?.classList.add('active');
  const labels={cover:'Generated cover letter',summary:'Tailored professional summary',prep:'Interview prep questions'};
  const el=document.getElementById('aiOutputLabel');
  if(el)el.textContent=labels[mode]||'Generated output';
  // Update textarea placeholder
  const ta=document.getElementById('aiJDInput');
  if(mode==='prep'){
    ta.placeholder='Paste the job description here — we\'ll generate likely interview questions & suggested answers…';
  }else{
    ta.placeholder='Paste the full job description here…';
  }
};

window.runAIAssist=async function(){
  const jd=document.getElementById('aiJDInput').value.trim();
  if(!jd){document.getElementById('aiJDInput').focus();return;}

  const btn=document.getElementById('aiGenerateBtn');
  btn.disabled=true;
  btn.innerHTML='<span class="ai-spinner"></span> Generating…';

  const outputWrap=document.getElementById('aiOutputWrap');
  const outputEl=document.getElementById('aiOutput');
  outputWrap.classList.remove('visible');
  outputEl.textContent='';

  // Build prompt based on mode
  const jobCtx=aiCurrentJob
    ?`\nJob title being applied to: ${aiCurrentJob.title}\nCompany: ${aiCurrentJob.company}${aiCurrentJob.resumeUrl?`\nResume URL: ${aiCurrentJob.resumeUrl}`:''}${aiCurrentJob.notes?`\nMy notes: ${aiCurrentJob.notes}`:''}`
    :'';

  const prompts={
    cover:`You are an expert career coach and professional writer. Write a compelling, tailored cover letter based on the job description below.${jobCtx}

Guidelines:
- Address it "Dear Hiring Team," (no specific name)
- 3–4 paragraphs: hook, relevant experience, why this company, call to action
- Keep it under 350 words
- Do NOT use filler phrases like "I am writing to express my interest"
- Sound human, specific, and confident
- Do not include any placeholders like [Your Name]; end with "Sincerely," on its own line

Job Description:
${jd}`,

    summary:`You are an expert resume coach. Write a punchy, tailored professional summary (3–5 sentences) that a candidate would put at the top of their resume when applying for this role.${jobCtx}

Guidelines:
- Highlight the 3 most important skills/experiences for THIS specific role
- Use strong action words, no fluff
- Written in third person (omit "I")
- Under 80 words

Job Description:
${jd}`,

    prep:`You are an expert interview coach. Based on this job description, generate the 8 most likely interview questions and a strong suggested answer framework for each.${jobCtx}

Format each as:
Q: [question]
A: [2–3 sentence answer framework using STAR method where appropriate]

Focus on both technical/role-specific AND behavioral questions.

Job Description:
${jd}`
  };

  try{
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer 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'},
      body:JSON.stringify({
        model:'llama-3.3-70b-versatile',
        max_tokens:1000,
        messages:[{role:'user',content:prompts[aiCurrentMode]}]
      })
    });
    const data=await response.json();
    if(data.error){throw new Error(data.error.message||'API error');}
    const text=data.choices?.[0]?.message?.content||'';
    outputEl.textContent=text;
    outputWrap.classList.add('visible');
    // Log to activity if opened in job context
    if(aiCurrentJob&&currentUser){
      const modeLabel={cover:'cover letter',summary:'professional summary',prep:'interview prep'}[aiCurrentMode]||aiCurrentMode;
      await addDoc(collection(db,`users/${currentUser.uid}/jobs/${aiCurrentJob.id}/activity`),{
        text:`AI generated ${modeLabel}`,ts:serverTimestamp()
      });
    }
  }catch(err){
    outputEl.textContent='Error: '+err.message+'\n\nMake sure your Groq API key is valid.';
    outputWrap.classList.add('visible');
  }finally{
    btn.disabled=false;
    btn.innerHTML='<i class="fa-solid fa-sparkles"></i> Generate';
  }
};

window.copyAIOutput=function(){
  const text=document.getElementById('aiOutput').textContent;
  if(!text)return;
  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('aiCopyBtn');
    btn.classList.add('copied');
    btn.innerHTML='<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(()=>{
      btn.classList.remove('copied');
      btn.innerHTML='<i class="fa-solid fa-copy"></i> Copy';
    },2200);
  }).catch(()=>{
    // Fallback for older browsers
    const ta=document.createElement('textarea');
    ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
  });
};

// ── PUSH NOTIFICATION SUBSCRIPTION ──
window.requestPushPermission=async function(){
  if(!('Notification' in window)||!currentUser)return;
  const perm=await Notification.requestPermission();
  if(perm==='granted'){
    try{
      const reg=await navigator.serviceWorker.ready;
      // VAPID public key placeholder — replace with your actual VAPID key
      // Generated via: npx web-push generate-vapid-keys
      const VAPID_PUBLIC='BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZkiTBTXGsL4E4A_XLJpT15mslbk';
      let sub;
      try{
        sub=await reg.pushManager.subscribe({
          userVisibleOnly:true,
          applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC)
        });
      }catch{
        // Subscription failed (likely missing VAPID key) — show notification anyway via SW
        reg.showNotification('HuntLog push enabled!',{
          body:'You\'ll get follow-up reminders here.',
          icon:'/icon-192.png',tag:'huntlog-welcome'
        });
        return;
      }
      // Save subscription endpoint to Firestore for server-side sending
      await setDoc(doc(db,`users/${currentUser.uid}`),{
        pushSubscription:JSON.stringify(sub),
        pushEnabled:true
      },{merge:true});
      alert('Push notifications enabled! You\'ll get follow-up reminders.');
    }catch(e){
      console.warn('Push subscription error:',e);
    }
  }
};

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const rawData=window.atob(base64);
  return Uint8Array.from([...rawData].map(c=>c.charCodeAt(0)));
}

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown',e=>{
  const tag=document.activeElement.tagName.toLowerCase();
  const inInput=tag==='input'||tag==='textarea'||tag==='select';

  if(e.key==='Escape'){
    window.closeAdd();window.closeDetail();window.closeAdmin();window.closeAnalytics();
    if(quickAddOpen)toggleQuickAdd();
    return;
  }
  if(inInput)return; // don't fire shortcuts when typing

  switch(e.key){
    case'n':case'N':e.preventDefault();window.openAdd();break;
    case'q':case'Q':e.preventDefault();window.toggleQuickAdd();break;
    case'/':e.preventDefault();document.getElementById('searchInput').focus();break;
    case't':case'T':window.toggleTheme();break;
    case'l':case'L':window.setView('list');break;
    case'k':case'K':window.setView('kanban');break;
    case'a':case'A':window.openAnalytics();break;
  }
});

// restore view after everything is defined
window.setView(savedView);