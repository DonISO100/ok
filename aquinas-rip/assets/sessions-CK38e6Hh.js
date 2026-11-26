import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";/* empty css               */i.registerModules([o]);var s=null,c=null,l=`active`,u=0,d=0,f=100,p=[{headerName:t(`Status`),width:90,cellRenderer:()=>`<span class="session-active">${t(`Active`)}</span>`},{field:`userName`,headerName:t(`User`),flex:1,minWidth:150,filter:`agTextColumnFilter`,cellRenderer:e=>{let t=e.data.userId,r=e.value;return`<a href="${n}/admin/user/${t}" style="color: #3498db;">${r}</a>`}},{field:`workName`,headerName:t(`Work`),flex:1,minWidth:150,filter:`agTextColumnFilter`,cellRenderer:e=>e.data.workId?`<a href="${n}/admin/work/${e.data.workId}" style="color: #27ae60;">${e.value}</a>`:``},{field:`dataId`,headerName:t(`Data`),width:80},{field:`rowId`,headerName:t(`Row`),width:80},{field:`ipAddress`,headerName:t(`IP Address`),width:130,filter:`agTextColumnFilter`},{field:`startDateTime`,headerName:t(`Started`),width:160,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``},{field:`lastDateTime`,headerName:t(`Last Activity`),width:160,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],m=[{field:`id`,headerName:t(`ID`),width:80},{field:`userName`,headerName:t(`User`),flex:1,minWidth:150,filter:`agTextColumnFilter`,cellRenderer:e=>{let t=e.data.userId,r=e.value;return`<a href="${n}/admin/user/${t}" style="color: #3498db;">${r}</a>`}},{field:`workName`,headerName:t(`Work`),flex:1,minWidth:150,filter:`agTextColumnFilter`,cellRenderer:e=>e.data.workId?`<a href="${n}/admin/work/${e.data.workId}" style="color: #27ae60;">${e.value}</a>`:``},{field:`ipAddress`,headerName:t(`IP Address`),width:130,filter:`agTextColumnFilter`},{field:`startDateTime`,headerName:t(`Started`),width:160,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``},{field:`lastDateTime`,headerName:t(`Last Activity`),width:160,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],h={theme:r,columnDefs:p,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0},g={theme:r,columnDefs:m,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0};async function _(t){t.innerHTML=`
        <div class="stats-detail">
            <div class="stats-detail-header">
                <h2>
                    <button class="stats-back-btn" id="back-to-dashboard">
                        <i class="fas fa-arrow-left"></i> <span data-i18n="Back">Back</span>
                    </button>
                    <span data-i18n="Session Statistics">Session Statistics</span>
                </h2>
                <button class="btn btn-secondary" id="refresh-sessions">
                    <i class="fas fa-sync-alt"></i> <span data-i18n="Refresh">Refresh</span>
                </button>
            </div>
            
            <div class="stats-tabs">
                <button class="stats-tab active" data-tab="active" data-i18n="Active Sessions">Active Sessions</button>
                <button class="stats-tab" data-tab="history" data-i18n="Session History">Session History</button>
            </div>
            
            <div id="tab-active" class="tab-content">
                <div class="stats-summary-row" id="active-summary">
                    <!-- Summary will be loaded -->
                </div>
                <div class="stats-grid-container" id="active-grid"></div>
            </div>
            
            <div id="tab-history" class="tab-content" style="display: none;">
                <div class="stats-filter-bar">
                    <div class="stats-filter-group">
                        <label data-i18n="From:">From:</label>
                        <input type="date" id="filter-from" />
                    </div>
                    <div class="stats-filter-group">
                        <label data-i18n="To:">To:</label>
                        <input type="date" id="filter-to" />
                    </div>
                    <div class="stats-search-wrapper">
                        <i class="fas fa-search"></i>
                        <input type="text" id="filter-search" placeholder="Search by user..." data-i18n-placeholder="Search by user..." />
                    </div>
                    <div class="stats-filter-actions">
                        <button class="btn btn-primary" id="apply-filters">
                            <i class="fas fa-filter"></i> <span data-i18n="Apply">Apply</span>
                        </button>
                        <button class="btn btn-secondary" id="clear-filters">
                            <i class="fas fa-times"></i> <span data-i18n="Clear">Clear</span>
                        </button>
                    </div>
                </div>
                
                <div class="stats-grid-container" id="history-grid"></div>
                
                <div class="stats-pagination">
                    <div class="stats-pagination-info" id="pagination-info" data-i18n="Showing 0 - 0 of 0 records">
                        Showing 0 - 0 of 0 records
                    </div>
                    <div class="stats-pagination-controls">
                        <button id="prev-page" disabled><i class="fas fa-chevron-left"></i> <span data-i18n="Previous">Previous</span></button>
                        <button id="next-page" disabled><span data-i18n="Next">Next</span> <i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),t.querySelectorAll(`.stats-tab`).forEach(e=>{e.addEventListener(`click`,()=>{v(e.getAttribute(`data-tab`))})}),document.getElementById(`back-to-dashboard`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`${n}/admin/stats`),window.dispatchEvent(new PopStateEvent(`popstate`))}),document.getElementById(`refresh-sessions`)?.addEventListener(`click`,()=>{l===`active`?y():b()}),document.getElementById(`apply-filters`)?.addEventListener(`click`,()=>{u=0,b()}),document.getElementById(`clear-filters`)?.addEventListener(`click`,()=>{document.getElementById(`filter-from`).value=``,document.getElementById(`filter-to`).value=``,document.getElementById(`filter-search`).value=``,u=0,b()}),document.getElementById(`filter-search`)?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(u=0,b())}),document.getElementById(`prev-page`)?.addEventListener(`click`,()=>{u>0&&(u--,b())}),document.getElementById(`next-page`)?.addEventListener(`click`,()=>{(u+1)*f<d&&(u++,b())});let r=document.getElementById(`active-grid`);r&&(s=a(r,h));let i=document.getElementById(`history-grid`);i&&(c=a(i,g)),await y()}function v(e){l=e,document.querySelectorAll(`.stats-tab`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)});let t=document.getElementById(`tab-active`),n=document.getElementById(`tab-history`);t&&(t.style.display=e===`active`?``:`none`),n&&(n.style.display=e===`history`?``:`none`),e===`active`?s?.sizeColumnsToFit():(c?.sizeColumnsToFit(),b())}async function y(){let t=document.getElementById(`active-summary`);try{let r=await(await fetch(`${n}/api/admin/stats/sessions`,{credentials:`include`})).json();r.success&&(s?.setGridOption(`rowData`,r.sessions),t&&(t.innerHTML=`
                    <div class="stats-summary-card">
                        <div class="stats-summary-value" style="color: #27ae60;">${r.total}</div>
                        <div class="stats-summary-label" data-i18n="Active Sessions">Active Sessions</div>
                    </div>
                    <div class="stats-summary-card">
                        <div class="stats-summary-value">${new Set(r.sessions.map(e=>e.userId)).size}</div>
                        <div class="stats-summary-label" data-i18n="Unique Users">Unique Users</div>
                    </div>
                `,e.translateIn(t)))}catch(e){console.error(`Error loading active sessions:`,e)}}async function b(){let e=document.getElementById(`filter-from`)?.value,t=document.getElementById(`filter-to`)?.value,r=document.getElementById(`filter-search`)?.value;try{let i=await(await fetch(`${n}/api/admin/stats/sessions/history`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({fromDate:e||null,toDate:t||null,search:r||null,skip:u*f,take:f})})).json();i.success&&(d=i.total,c?.setGridOption(`rowData`,i.sessions),x())}catch(e){console.error(`Error loading session history:`,e)}}function x(){let e=document.getElementById(`pagination-info`),n=document.getElementById(`prev-page`),r=document.getElementById(`next-page`),i=d>0?u*f+1:0,a=Math.min((u+1)*f,d);e&&(e.textContent=t(`Showing {0} - {1} of {2} records`,[i,a,d.toLocaleString()])),n&&(n.disabled=u===0),r&&(r.disabled=(u+1)*f>=d)}function S(){s&&=(s.destroy(),null),c&&=(c.destroy(),null),u=0,d=0,l=`active`}export{S as cleanup,_ as render};