@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}

/* ── THEME VARIABLES ── */
:root{
  --c0:#0b0b0f;--c1:#13131a;--c2:#1c1c27;--c3:#26263a;--c4:#8585a0;--c5:#b5b5cc;--c6:#e8e8f5;
  --applied:#3b82f6;--applied-bg:#0d1f3c;
  --screen:#8b5cf6;--screen-bg:#1e0d3c;
  --interview:#f59e0b;--interview-bg:#2d1f00;
  --offer:#10b981;--offer-bg:#0d2d1f;
  --rejected:#ef4444;--rejected-bg:#2d0d0d;
  --accent:#6366f1;
  --surface:#fff;--text:#0b0b0f;--sub:#555;
  color-scheme:dark;
}
[data-theme="light"]{
  --c0:#f4f4fb;--c1:#ffffff;--c2:#eeeef8;--c3:#d8d8ef;--c4:#8888aa;--c5:#555577;--c6:#0b0b0f;
  --applied-bg:#dbeafe;--screen-bg:#ede9fe;--interview-bg:#fef3c7;--offer-bg:#d1fae5;--rejected-bg:#fee2e2;
  color-scheme:light;
}

body{background:var(--c0);color:var(--c6);font-family:'Syne',sans-serif;min-height:100vh;transition:background .25s,color .25s}

/* ── LOGIN ── */
.login-screen{display:flex;align-items:center;justify-content:center;min-height:100vh}
.login-card{background:var(--c1);border:.5px solid var(--c3);border-radius:20px;padding:3rem 2.5rem;text-align:center;max-width:360px;width:100%}
.login-logo{font-family:'DM Serif Display',serif;font-size:2rem;color:var(--c6);letter-spacing:-.02em;margin-bottom:.5rem}
.login-logo span{color:var(--accent);font-style:italic}
.login-sub{font-size:13px;color:var(--c4);margin-bottom:2rem;line-height:1.6}
.google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:var(--c2);border:.5px solid var(--c3);border-radius:10px;padding:12px 20px;color:var(--c5);font-size:14px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:.2s}
.google-btn:hover{background:var(--c3);color:var(--c6)}
.google-icon{width:18px;height:18px;flex-shrink:0}

/* ── TOP BAR ── */
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:8px}
.logo{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--c6);letter-spacing:-.02em}
.logo span{color:var(--accent);font-style:italic}
.top-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.user-avatar{width:32px;height:32px;border-radius:50%;border:.5px solid var(--c3);object-fit:cover;background:var(--c2)}
.user-name{font-size:12px;color:var(--c4)}
.sync-dot{width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0}
.sync-dot.syncing{background:#f59e0b;animation:pulse 1s infinite}
.sync-dot.err{background:#ef4444}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.icon-btn{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:6px 10px;color:var(--c4);cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px;font-family:'Syne',sans-serif;transition:.15s}
.icon-btn:hover{color:var(--c5);border-color:var(--c4)}
.icon-btn.active-view{background:var(--accent);border-color:var(--accent);color:#fff}

/* ── STATS ROW ── */
.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:2rem}
@media(max-width:600px){.stats-row{grid-template-columns:repeat(3,1fr)}.stat.s-offer{grid-column:span 1}.stat.s-all{grid-column:span 3}}
@media(max-width:400px){.stats-row{grid-template-columns:1fr 1fr}}
.stat{background:var(--c1);border:.5px solid var(--c3);border-radius:12px;padding:14px 16px;cursor:pointer;transition:.2s}
.stat:hover{border-color:var(--c4);background:var(--c2)}
.stat.active{border-width:1px}
.stat-num{font-family:'DM Mono',monospace;font-size:1.5rem;font-weight:500;line-height:1}
.stat-label{font-size:11px;color:var(--c4);margin-top:4px;text-transform:uppercase;letter-spacing:.06em}
.stat.s-all .stat-num{color:var(--c6)}.stat.s-all.active{border-color:var(--c5)}
.stat.s-applied .stat-num{color:var(--applied)}.stat.s-applied.active{border-color:var(--applied)}
.stat.s-screen .stat-num{color:var(--screen)}.stat.s-screen.active{border-color:var(--screen)}
.stat.s-interview .stat-num{color:var(--interview)}.stat.s-interview.active{border-color:var(--interview)}
.stat.s-offer .stat-num{color:var(--offer)}.stat.s-offer.active{border-color:var(--offer)}

/* ── TOOLBAR ── */
.toolbar{display:flex;align-items:center;gap:10px;margin-bottom:1.5rem;flex-wrap:wrap}
.search-wrap{flex:1;min-width:160px;position:relative}
.search-wrap i{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--c4);font-size:13px}
.search-input{width:100%;background:var(--c1);border:.5px solid var(--c3);border-radius:8px;padding:9px 12px 9px 34px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none;transition:.2s}
.search-input::placeholder{color:var(--c4)}
.search-input:focus{border-color:var(--accent);background:var(--c2)}
.sort-select{background:var(--c1);border:.5px solid var(--c3);border-radius:8px;padding:9px 10px;font-size:12px;color:var(--c5);font-family:'Syne',sans-serif;outline:none;cursor:pointer}
.sort-select:focus{border-color:var(--accent)}
option{background:var(--c1)}
.add-btn{background:var(--accent);border:none;border-radius:8px;padding:9px 18px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'Syne',sans-serif;white-space:nowrap;transition:.15s}
.add-btn:hover{opacity:.9;transform:translateY(-1px)}

/* ── QUICK ADD BAR ── */
.quick-add-bar{display:flex;gap:8px;margin-bottom:1rem;background:var(--c1);border:.5px solid var(--accent);border-radius:10px;padding:10px 12px;align-items:center;flex-wrap:wrap}
.quick-add-bar.hidden{display:none}
.quick-input{background:var(--c2);border:.5px solid var(--c3);border-radius:7px;padding:7px 10px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none;transition:.2s}
.quick-input:focus{border-color:var(--accent)}
.quick-input.qi-title{flex:2;min-width:120px}
.quick-input.qi-company{flex:2;min-width:100px}
.quick-select{background:var(--c2);border:.5px solid var(--c3);border-radius:7px;padding:7px 10px;font-size:12px;color:var(--c5);font-family:'Syne',sans-serif;outline:none;cursor:pointer}
.quick-save-btn{background:var(--accent);border:none;border-radius:7px;padding:7px 14px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;white-space:nowrap}
.quick-cancel-btn{background:transparent;border:none;padding:7px;color:var(--c4);cursor:pointer;font-size:13px}
.quick-hint{font-size:11px;color:var(--c4);flex-basis:100%}

/* ── BULK BAR ── */
.bulk-bar{display:none;align-items:center;gap:10px;margin-bottom:1rem;background:var(--c2);border:.5px solid var(--c3);border-radius:10px;padding:10px 14px;flex-wrap:wrap}
.bulk-bar.visible{display:flex}
.bulk-info{font-size:13px;color:var(--c5);flex:1}
.bulk-status-wrap{display:flex;gap:6px;flex-wrap:wrap}
.bulk-status-btn{background:var(--c1);border:.5px solid var(--c3);border-radius:20px;padding:4px 12px;font-size:12px;cursor:pointer;color:var(--c5);font-family:'Syne',sans-serif;transition:.15s}
.bulk-status-btn:hover{border-color:var(--c4);color:var(--c6)}
.bulk-del-btn{background:transparent;border:.5px solid var(--rejected);border-radius:8px;padding:4px 12px;font-size:12px;color:var(--rejected);cursor:pointer;font-family:'Syne',sans-serif}
.bulk-del-btn:hover{background:var(--rejected-bg)}
.bulk-clear{background:transparent;border:none;padding:4px;color:var(--c4);cursor:pointer;font-size:13px}

/* ── DUPLICATE WARNING ── */
.dup-warning{background:#2d1f00;border:.5px solid var(--interview);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--interview);display:none;margin-bottom:8px;align-items:center;gap:8px}
.dup-warning.visible{display:flex}
.dup-warning i{flex-shrink:0}

/* ── JOB CARDS ── */
.jobs-list{display:flex;flex-direction:column;gap:8px}
.job-card{background:var(--c1);border:.5px solid var(--c3);border-radius:12px;padding:14px 16px;cursor:pointer;transition:.18s;position:relative;overflow:hidden}
.job-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:12px 0 0 12px}
.job-card.applied::before{background:var(--applied)}
.job-card.screening::before{background:var(--screen)}
.job-card.interview::before{background:var(--interview)}
.job-card.offer::before{background:var(--offer)}
.job-card.rejected::before{background:var(--rejected)}
.job-card:hover{border-color:var(--c4);background:var(--c2);transform:translateX(2px)}
.job-card.selected{border-color:var(--accent);background:var(--c2)}
.job-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}
.job-title{font-size:14px;font-weight:600;color:var(--c6);line-height:1.3;display:flex;align-items:center;gap:8px}
.job-status{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap;text-transform:uppercase;letter-spacing:.05em;flex-shrink:0}
.job-status.applied{color:var(--applied);background:var(--applied-bg)}
.job-status.screening{color:var(--screen);background:var(--screen-bg)}
.job-status.interview{color:var(--interview);background:var(--interview-bg)}
.job-status.offer{color:var(--offer);background:var(--offer-bg)}
.job-status.rejected{color:var(--rejected);background:var(--rejected-bg)}
.job-company{font-size:13px;color:var(--c5);margin-bottom:6px}
.job-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.job-tag{font-size:11px;color:var(--c4);display:flex;align-items:center;gap:4px}
.job-tag i{font-size:11px}
.job-tags-row{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.tag-chip{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;letter-spacing:.04em}
.tag-priority{background:#2d1f00;color:#f59e0b}
.tag-referral{background:#0d2d1f;color:#10b981}
.tag-cold{background:#1e0d3c;color:#8b5cf6}
.tag-custom{background:var(--c3);color:var(--c5)}
.follow-up-badge{font-size:10px;color:#f59e0b;display:flex;align-items:center;gap:3px;margin-top:4px}
.follow-up-badge.overdue{color:var(--rejected)}
.cb-wrap{position:relative;width:16px;height:16px;flex-shrink:0}
.cb-wrap input{position:absolute;opacity:0;width:0;height:0}
.cb-mark{width:16px;height:16px;border:.5px solid var(--c3);border-radius:4px;background:var(--c2);display:flex;align-items:center;justify-content:center;transition:.15s}
.cb-wrap input:checked ~ .cb-mark{background:var(--accent);border-color:var(--accent)}
.cb-mark i{font-size:10px;color:#fff;display:none}
.cb-wrap input:checked ~ .cb-mark i{display:block}

/* days-since badge */
.days-badge{font-size:10px;font-family:'DM Mono',monospace;color:var(--c4);background:var(--c2);border-radius:20px;padding:2px 7px;flex-shrink:0}
.days-badge.stale{color:#f59e0b}
.days-badge.very-stale{color:var(--rejected)}

/* interview round badge */
.round-badge{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--interview-bg);color:var(--interview);flex-shrink:0}

/* rejection reason on card */
.rejection-reason{font-size:11px;color:var(--rejected);opacity:.8;margin-top:3px;display:flex;align-items:center;gap:4px}

/* ── KANBAN VIEW ── */
.kanban-board{display:grid;grid-template-columns:repeat(5,minmax(200px,1fr));gap:12px;overflow-x:auto;padding-bottom:1rem}
@media(max-width:900px){.kanban-board{grid-template-columns:repeat(3,minmax(180px,1fr))}}
@media(max-width:600px){.kanban-board{grid-template-columns:repeat(2,minmax(160px,1fr))}}
.kanban-col{background:var(--c1);border:.5px solid var(--c3);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:200px}
.kanban-col-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.kanban-col-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.kanban-col-title.applied{color:var(--applied)}
.kanban-col-title.screening{color:var(--screen)}
.kanban-col-title.interview{color:var(--interview)}
.kanban-col-title.offer{color:var(--offer)}
.kanban-col-title.rejected{color:var(--rejected)}
.kanban-count{font-family:'DM Mono',monospace;font-size:11px;color:var(--c4)}
.kanban-card{background:var(--c2);border:.5px solid var(--c3);border-radius:9px;padding:10px 12px;cursor:pointer;transition:.15s}
.kanban-card:hover{border-color:var(--c4);transform:translateY(-1px)}
.kanban-card-title{font-size:12px;font-weight:600;color:var(--c6);margin-bottom:2px;line-height:1.3}
.kanban-card-co{font-size:11px;color:var(--c4)}
.kanban-card-meta{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.kanban-card-days{font-size:10px;font-family:'DM Mono',monospace;color:var(--c4)}
.kanban-card-days.stale{color:#f59e0b}
.kanban-card-days.very-stale{color:var(--rejected)}
.kanban-empty{font-size:11px;color:var(--c3);text-align:center;padding:1rem 0;font-style:italic}

/* ── EMPTY STATE ── */
.empty-state{text-align:center;padding:4rem 2rem;color:var(--c4)}
.empty-icon{font-size:3rem;margin-bottom:1rem;opacity:.3}
.empty-title{font-size:1rem;font-weight:600;color:var(--c5);margin-bottom:.5rem}
.empty-sub{font-size:13px;line-height:1.6;max-width:280px;margin:0 auto 1.5rem}
.empty-cta{background:var(--accent);border:none;border-radius:8px;padding:10px 20px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif}
.no-results{text-align:center;padding:3rem;color:var(--c4);font-size:14px}
.loading-state{text-align:center;padding:3rem;color:var(--c4);font-size:14px;display:flex;align-items:center;justify-content:center;gap:10px}
.spinner{width:16px;height:16px;border:2px solid var(--c3);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── ADD/EDIT MODAL ── */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;align-items:center;justify-content:center;padding:1rem}
.modal-overlay.open{display:flex}
.modal{background:var(--c1);border:.5px solid var(--c3);border-radius:16px;padding:1.5rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
.modal-title{font-size:1.1rem;font-weight:600;margin-bottom:1.25rem;color:var(--c6)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:480px){.form-row{grid-template-columns:1fr}}
.form-group{margin-bottom:1rem}
.form-label{font-size:12px;font-weight:600;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;display:block}
.form-input,.form-select,.form-textarea{width:100%;background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none;transition:.2s}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--accent)}
.form-select{cursor:pointer}
.form-textarea{resize:vertical;min-height:70px}
.tags-input-wrap{display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:6px 10px;min-height:40px;cursor:text}
.tags-input-wrap:focus-within{border-color:var(--accent)}
.tag-item{display:flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:var(--c3);color:var(--c5)}
.tag-item button{background:none;border:none;color:inherit;cursor:pointer;font-size:12px;padding:0;line-height:1;opacity:.6}
.tag-item button:hover{opacity:1}
.tag-text-input{background:none;border:none;outline:none;font-family:'Syne',sans-serif;font-size:12px;color:var(--c6);min-width:80px;flex:1}
.tag-text-input::placeholder{color:var(--c4)}
.modal-actions{display:flex;gap:8px;margin-top:1.25rem}
.btn-save{flex:1;background:var(--accent);border:none;border-radius:8px;padding:10px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:.15s}
.btn-save:hover{opacity:.9}
.btn-cancel{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:10px 16px;color:var(--c4);font-size:13px;cursor:pointer;font-family:'Syne',sans-serif;transition:.15s}
.btn-cancel:hover{border-color:var(--c5);color:var(--c5)}

/* interview round section in modal */
.round-section{display:none}
.round-section.visible{display:block}
.round-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.round-btn{background:var(--c2);border:.5px solid var(--c3);border-radius:20px;padding:5px 13px;font-size:12px;cursor:pointer;color:var(--c5);font-family:'Syne',sans-serif;transition:.15s}
.round-btn.active{background:var(--interview-bg);border-color:var(--interview);color:var(--interview)}

/* rejection reason section in modal */
.reject-section{display:none}
.reject-section.visible{display:block}

/* ── DETAIL PANEL ── */
.detail-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100;justify-content:flex-end}
.detail-overlay.open{display:flex}
.detail-panel{background:var(--c1);border-left:.5px solid var(--c3);width:100%;max-width:440px;height:100vh;padding:1.25rem;overflow-y:auto;display:flex;flex-direction:column;gap:14px}
.detail-close{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:6px 10px;color:var(--c4);cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;align-self:flex-start;font-family:'Syne',sans-serif}
.detail-close:hover{color:var(--c5)}
.detail-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.detail-role{font-family:'DM Serif Display',serif;font-size:1.35rem;color:var(--c6);line-height:1.2}
.detail-co{font-size:13px;color:var(--c5);margin-top:2px}
.edit-btn{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:6px 12px;color:var(--c4);font-size:12px;cursor:pointer;font-family:'Syne',sans-serif;display:flex;align-items:center;gap:5px;white-space:nowrap;flex-shrink:0}
.edit-btn:hover{color:var(--c5);border-color:var(--c4)}
.detail-field{background:var(--c2);border-radius:10px;padding:11px 13px}
.detail-field-label{font-size:11px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
.detail-field-val{font-size:13px;color:var(--c5);white-space:pre-wrap}
.detail-field-val a{color:var(--accent);text-decoration:none}
.detail-field-val a:hover{text-decoration:underline}
.status-change-label{font-size:11px;color:var(--c4);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em}
.status-btns{display:flex;flex-wrap:wrap;gap:6px}
.status-btn{background:var(--c2);border:.5px solid var(--c3);border-radius:20px;padding:5px 13px;font-size:12px;cursor:pointer;color:var(--c5);font-family:'Syne',sans-serif;transition:.15s}
.status-btn.applied.active{color:var(--applied);border-color:var(--applied);background:var(--applied-bg)}
.status-btn.screening.active{color:var(--screen);border-color:var(--screen);background:var(--screen-bg)}
.status-btn.interview.active{color:var(--interview);border-color:var(--interview);background:var(--interview-bg)}
.status-btn.offer.active{color:var(--offer);border-color:var(--offer);background:var(--offer-bg)}
.status-btn.rejected.active{color:var(--rejected);border-color:var(--rejected);background:var(--rejected-bg)}
.activity-section{}
.activity-header{font-size:11px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.activity-log{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto;margin-bottom:10px}
.activity-item{background:var(--c2);border-radius:8px;padding:9px 12px}
.activity-text{font-size:12px;color:var(--c5)}
.activity-time{font-size:11px;color:var(--c4);margin-top:2px;font-family:'DM Mono',monospace}
.activity-input-row{display:flex;gap:6px}
.activity-input{flex:1;background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:8px 11px;font-size:12px;color:var(--c6);font-family:'Syne',sans-serif;outline:none}
.activity-input:focus{border-color:var(--accent)}
.activity-add-btn{background:var(--accent);border:none;border-radius:8px;padding:8px 12px;color:#fff;font-size:12px;cursor:pointer;font-family:'Syne',sans-serif;white-space:nowrap}
.del-btn{background:transparent;border:.5px solid #2d0d0d;border-radius:8px;padding:8px 14px;color:var(--rejected);font-size:12px;cursor:pointer;font-family:'Syne',sans-serif;display:flex;align-items:center;gap:6px;transition:.15s}
.del-btn:hover{background:var(--rejected-bg)}

/* detail interview round section */
.detail-round-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.detail-round-label{font-size:11px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em}

/* rejection reason prompt in detail */
.reject-prompt{background:var(--rejected-bg);border:.5px solid var(--rejected);border-radius:10px;padding:11px 13px}
.reject-prompt-label{font-size:11px;color:var(--rejected);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;opacity:.8}
.reject-reason-btns{display:flex;flex-wrap:wrap;gap:6px}
.reject-reason-btn{background:var(--c2);border:.5px solid var(--c3);border-radius:20px;padding:4px 12px;font-size:11px;cursor:pointer;color:var(--c5);font-family:'Syne',sans-serif;transition:.15s}
.reject-reason-btn:hover{border-color:var(--rejected);color:var(--rejected)}
.reject-reason-btn.active{background:var(--rejected-bg);border-color:var(--rejected);color:var(--rejected)}

/* ── ADMIN ── */
.admin-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;align-items:center;justify-content:center;padding:1rem}
.admin-overlay.open{display:flex}
.admin-modal{background:var(--c1);border:.5px solid var(--c3);border-radius:16px;padding:1.5rem;width:100%;max-width:780px;max-height:90vh;overflow-y:auto}
.admin-modal h2{font-size:1.1rem;font-weight:600;color:var(--c6);margin-bottom:1.25rem;display:flex;align-items:center;gap:8px}
.admin-modal h2 i{color:var(--accent)}
.admin-table{width:100%;border-collapse:collapse;font-size:12px}
.admin-table th{text-align:left;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;font-size:11px;padding:6px 10px;border-bottom:.5px solid var(--c3)}
.admin-table td{padding:10px;border-bottom:.5px solid var(--c2);color:var(--c5);vertical-align:middle}
.admin-table tr:last-child td{border-bottom:none}
.admin-user-cell{display:flex;align-items:center;gap:8px}
.admin-avatar{width:26px;height:26px;border-radius:50%;object-fit:cover;background:var(--c2);flex-shrink:0}
.admin-name{color:var(--c6);font-weight:600}
.admin-email{font-size:11px;color:var(--c4)}
.ip-badge{background:var(--c2);border:.5px solid var(--c3);border-radius:6px;padding:2px 8px;font-family:'DM Mono',monospace;font-size:11px;color:var(--accent)}
.admin-loading{text-align:center;padding:2rem;color:var(--c4);font-size:13px}
.admin-stat-card{background:var(--c2);border:.5px solid var(--c3);border-radius:10px;padding:12px 14px;min-width:90px}
.admin-stat-val{font-family:'DM Mono',monospace;font-size:1.4rem;font-weight:500;color:var(--c6);line-height:1}
.admin-stat-label{font-size:10px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
.admin-close-btn{margin-top:1rem;background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:8px 16px;color:var(--c4);font-size:13px;cursor:pointer;font-family:'Syne',sans-serif}
.admin-close-btn:hover{color:var(--c5);border-color:var(--c5)}
.you-badge{font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 7px;margin-left:4px;font-weight:600}
.admin-expand-btn{background:transparent;border:.5px solid var(--c3);border-radius:6px;padding:3px 8px;font-size:11px;color:var(--c4);cursor:pointer;font-family:'Syne',sans-serif}
.admin-expand-btn:hover{border-color:var(--accent);color:var(--accent)}
.admin-ban-btn{background:transparent;border:.5px solid var(--rejected);border-radius:6px;padding:3px 8px;font-size:11px;color:var(--rejected);cursor:pointer;font-family:'Syne',sans-serif}
.admin-ban-btn:hover{background:var(--rejected-bg)}
.admin-job-list{background:var(--c2);border-radius:8px;padding:10px;margin-top:6px;display:none;font-size:12px}
.admin-job-list.open{display:block}
.admin-job-row{padding:5px 0;border-bottom:.5px solid var(--c3);color:var(--c5)}
.admin-job-row:last-child{border-bottom:none}

/* ── KEYBOARD SHORTCUT HINT ── */
.kbd{display:inline-block;background:var(--c2);border:.5px solid var(--c3);border-radius:4px;padding:1px 5px;font-family:'DM Mono',monospace;font-size:10px;color:var(--c4)}

/* ── ANALYTICS ── */
.analytics-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:150;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto}
.analytics-overlay.open{display:flex}
.analytics-modal{background:var(--c1);border:.5px solid var(--c3);border-radius:20px;padding:1.75rem;width:100%;max-width:860px;margin:auto;display:flex;flex-direction:column;gap:1.25rem}
.analytics-header{display:flex;align-items:center;justify-content:space-between;gap:8px}
.analytics-title{font-family:'DM Serif Display',serif;font-size:1.4rem;color:var(--c6);letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
.analytics-title i{color:var(--accent);font-size:1.1rem}
.analytics-close-btn{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:6px 12px;color:var(--c4);font-size:12px;cursor:pointer;font-family:'Syne',sans-serif;display:flex;align-items:center;gap:5px}
.analytics-close-btn:hover{color:var(--c5);border-color:var(--c4)}
/* KPI row */
.analytics-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
@media(max-width:600px){.analytics-kpi-row{grid-template-columns:1fr 1fr}}
.analytics-kpi{background:var(--c2);border:.5px solid var(--c3);border-radius:12px;padding:14px 16px}
.analytics-kpi-val{font-family:'DM Mono',monospace;font-size:1.6rem;font-weight:500;line-height:1;color:var(--c6)}
.analytics-kpi-label{font-size:11px;color:var(--c4);margin-top:5px;text-transform:uppercase;letter-spacing:.06em}
.analytics-kpi-sub{font-size:11px;color:var(--c4);margin-top:2px;font-family:'DM Mono',monospace}
/* section */
.analytics-section{background:var(--c2);border:.5px solid var(--c3);border-radius:14px;padding:16px}
.analytics-section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--c4);margin-bottom:12px}
/* funnel */
.funnel-rows{display:flex;flex-direction:column;gap:6px}
.funnel-row{display:flex;align-items:center;gap:10px}
.funnel-label{font-size:12px;color:var(--c5);width:90px;flex-shrink:0;text-align:right}
.funnel-bar-wrap{flex:1;background:var(--c3);border-radius:20px;height:10px;overflow:hidden}
.funnel-bar{height:100%;border-radius:20px;transition:width .4s cubic-bezier(.4,0,.2,1)}
.funnel-count{font-family:'DM Mono',monospace;font-size:11px;color:var(--c4);width:24px;flex-shrink:0}
.funnel-pct{font-family:'DM Mono',monospace;font-size:11px;width:38px;flex-shrink:0;text-align:right}
/* response time chart */
.resp-bars{display:flex;align-items:flex-end;gap:6px;height:80px}
.resp-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.resp-bar{width:100%;background:var(--accent);border-radius:4px 4px 0 0;min-height:2px;opacity:.8;transition:height .4s}
.resp-bar-label{font-size:10px;color:var(--c4);text-align:center;white-space:nowrap;font-family:'DM Mono',monospace}
/* rejection breakdown */
.reject-rows{display:flex;flex-direction:column;gap:6px}
.reject-row{display:flex;align-items:center;gap:10px}
.reject-label{font-size:12px;color:var(--c5);flex:1}
.reject-bar-wrap{width:100px;background:var(--c3);border-radius:20px;height:6px;flex-shrink:0}
.reject-bar{height:100%;border-radius:20px;background:var(--rejected)}
.reject-count{font-family:'DM Mono',monospace;font-size:11px;color:var(--c4);width:20px;text-align:right;flex-shrink:0}
/* two col grid */
.analytics-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:640px){.analytics-grid-2{grid-template-columns:1fr}}
/* weekly activity */
.weekly-bars{display:flex;align-items:flex-end;gap:4px;height:60px}
.weekly-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
.weekly-bar{width:100%;background:var(--applied);border-radius:3px 3px 0 0;min-height:1px;opacity:.75}
.weekly-bar-label{font-size:9px;color:var(--c4);font-family:'DM Mono',monospace}
/* status donut via conic-gradient */
.donut-wrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.donut{width:80px;height:80px;border-radius:50%;flex-shrink:0}
.donut-legend{display:flex;flex-direction:column;gap:5px}
.donut-legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--c5)}
.donut-swatch{width:10px;height:10px;border-radius:50%;flex-shrink:0}
/* insight chips */
.insights-row{display:flex;flex-wrap:wrap;gap:8px}
.insight-chip{background:var(--c2);border:.5px solid var(--c3);border-radius:20px;padding:6px 12px;font-size:12px;color:var(--c5);display:flex;align-items:center;gap:6px}
.insight-chip i{font-size:11px}
.insight-chip.good{border-color:var(--offer);color:var(--offer)}
.insight-chip.warn{border-color:var(--interview);color:var(--interview)}
.insight-chip.bad{border-color:var(--rejected);color:var(--rejected)}
/* empty analytics */
.analytics-empty{text-align:center;padding:2.5rem;color:var(--c4);font-size:13px}

/* ── MISC ── */
.app{display:flex;flex-direction:column;min-height:100vh;padding:1.5rem 1.25rem}
@media(max-width:480px){.app{padding:1rem .75rem}}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
.view-toggle{display:flex;gap:4px}

/* ── EMAIL AUTH DIVIDER ── */
.auth-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--c4);font-size:12px}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:.5px;background:var(--c3)}
.email-auth-form{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.email-auth-input{background:var(--c2);border:.5px solid var(--c3);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none;transition:.2s;width:100%}
.email-auth-input:focus{border-color:var(--accent)}
.email-btn{background:var(--accent);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:.15s}
.email-btn:hover{opacity:.88}
.email-btn.secondary{background:transparent;border:.5px solid var(--c3);color:var(--c5)}
.email-btn.secondary:hover{border-color:var(--c4);color:var(--c6)}
.auth-error{font-size:12px;color:var(--rejected);text-align:center;min-height:16px}
.forgot-link{font-size:12px;color:var(--c4);text-align:center;cursor:pointer;background:none;border:none;font-family:'Syne',sans-serif;margin-top:2px}
.forgot-link:hover{color:var(--accent)}

/* ── KANBAN DRAG ── */
.kanban-card.dragging{opacity:.4;transform:scale(.97)}
.kanban-col.drag-over{border-color:var(--accent);background:rgba(99,102,241,.06)}

/* ── RESUME TRACKER (in form) ── */
.resume-ver-wrap{display:flex;gap:6px;align-items:center}
.resume-ver-badge{font-family:'DM Mono',monospace;font-size:11px;background:var(--c3);color:var(--c5);border-radius:20px;padding:2px 10px;display:inline-block}

/* ── PWA INSTALL BANNER ── */
.pwa-banner{display:none;align-items:center;gap:10px;background:var(--c2);border:.5px solid var(--accent);border-radius:10px;padding:10px 14px;margin-bottom:1rem;flex-wrap:wrap}
.pwa-banner.visible{display:flex}
.pwa-banner-text{flex:1;font-size:13px;color:var(--c5)}
.pwa-banner-text strong{color:var(--c6)}
.pwa-install-btn{background:var(--accent);border:none;border-radius:8px;padding:7px 14px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;white-space:nowrap}
.pwa-dismiss-btn{background:transparent;border:none;padding:4px;color:var(--c4);cursor:pointer;font-size:13px}

/* ── AI WRITING ASSISTANT ── */
.ai-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;align-items:center;justify-content:center;padding:1rem}
.ai-overlay.open{display:flex}
.ai-modal{background:var(--c1);border:.5px solid var(--c3);border-radius:16px;padding:1.5rem;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;gap:14px}
.ai-modal-header{display:flex;align-items:center;justify-content:space-between}
.ai-modal-title{font-size:1.05rem;font-weight:600;color:var(--c6);display:flex;align-items:center;gap:8px}
.ai-modal-title i{color:var(--accent)}
.ai-mode-tabs{display:flex;gap:6px}
.ai-mode-tab{background:var(--c2);border:.5px solid var(--c3);border-radius:20px;padding:5px 13px;font-size:12px;cursor:pointer;color:var(--c5);font-family:'Syne',sans-serif;transition:.15s}
.ai-mode-tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
.ai-jd-textarea{width:100%;background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:10px 12px;font-size:13px;color:var(--c6);font-family:'Syne',sans-serif;outline:none;resize:vertical;min-height:130px;transition:.2s}
.ai-jd-textarea:focus{border-color:var(--accent)}
.ai-resume-note{font-size:12px;color:var(--c4);display:flex;align-items:center;gap:6px}
.ai-resume-note a{color:var(--accent)}
.ai-generate-btn{background:var(--accent);border:none;border-radius:8px;padding:10px 20px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;display:flex;align-items:center;gap:8px;transition:.15s;align-self:flex-start}
.ai-generate-btn:disabled{opacity:.5;cursor:not-allowed}
.ai-output-wrap{display:none;flex-direction:column;gap:8px}
.ai-output-wrap.visible{display:flex}
.ai-output-label{font-size:11px;color:var(--c4);text-transform:uppercase;letter-spacing:.06em;display:flex;align-items:center;justify-content:space-between}
.ai-output{background:var(--c2);border:.5px solid var(--c3);border-radius:8px;padding:12px;font-size:13px;color:var(--c5);line-height:1.7;white-space:pre-wrap;max-height:320px;overflow-y:auto}
.ai-copy-btn{background:transparent;border:.5px solid var(--c3);border-radius:8px;padding:5px 12px;color:var(--c4);font-size:11px;cursor:pointer;font-family:'Syne',sans-serif;display:flex;align-items:center;gap:5px;transition:.15s}
.ai-copy-btn:hover{border-color:var(--accent);color:var(--accent)}
.ai-copy-btn.copied{border-color:var(--offer);color:var(--offer)}
.ai-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}

/* ── MATCH SCORE (fit rating) ── */
.match-score-wrap{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}
.match-star{background:none;border:none;font-size:18px;cursor:pointer;color:var(--c3);padding:0 1px;line-height:1;transition:.1s}
.match-star.lit{color:#f59e0b}
.match-star:hover{transform:scale(1.15)}
.match-score-label{font-size:11px;color:var(--c4);margin-left:4px}
.card-match-score{font-size:11px;color:#f59e0b;display:flex;align-items:center;gap:2px}

/* ── IMPORT CSV ── */
.import-drop{border:1.5px dashed var(--c3);border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:.2s;color:var(--c4);font-size:13px}
.import-drop:hover,.import-drop.drag-over{border-color:var(--accent);color:var(--accent)}
.import-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:300;align-items:center;justify-content:center;padding:1rem}
.import-modal-overlay.open{display:flex}
.import-modal{background:var(--c1);border:.5px solid var(--c3);border-radius:16px;padding:1.5rem;width:100%;max-width:440px}
.import-modal h3{font-size:1rem;font-weight:600;color:var(--c6);margin-bottom:1rem;display:flex;align-items:center;gap:8px}
.import-preview{max-height:180px;overflow-y:auto;margin:12px 0;font-size:12px;color:var(--c5)}
.import-preview-row{padding:4px 0;border-bottom:.5px solid var(--c2)}
.import-actions{display:flex;gap:8px;margin-top:1rem}