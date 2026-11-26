import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";/* empty css               */i.registerModules([o]);var s=null,c=0,l=0,u=100,d=[{field:`id`,headerName:t(`ID`),width:80},{field:`userName`,headerName:t(`User/IP`),flex:1,minWidth:150,filter:`agTextColumnFilter`},{field:`obj`,headerName:t(`Action`),width:150,filter:`agTextColumnFilter`},{field:`value`,headerName:t(`Value`),flex:2,minWidth:200,filter:`agTextColumnFilter`},{field:`lastDateTime`,headerName:t(`Last Activity`),width:180,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``},{field:`firstDateTime`,headerName:t(`First Activity`),width:180,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],f={theme:r,columnDefs:d,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0};async function p(t){t.innerHTML=`
        <div class="stats-detail">
            <div class="stats-detail-header">
                <h2>
                    <button class="stats-back-btn" id="back-to-dashboard">
                        <i class="fas fa-arrow-left"></i> <span data-i18n="Back">Back</span>
                    </button>
                    <span data-i18n="Public Usage Statistics">Public Usage Statistics</span>
                </h2>
            </div>
            
            <div class="stats-summary-row" id="summary-row">
                <!-- Summary cards will be loaded here -->
            </div>
            
            <div class="stats-filter-bar">
                <div class="stats-filter-group">
                    <label data-i18n="Action:">Action:</label>
                    <select id="filter-action">
                        <option value="" data-i18n="All Actions">All Actions</option>
                    </select>
                </div>
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
                    <input type="text" id="filter-search" data-i18n-placeholder="Search by user, IP, or value..." placeholder="Search by user, IP, or value..." />
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
            
            <div class="stats-grid-container" id="grid-container"></div>
            
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
    `,e.translateIn(t),document.getElementById(`back-to-dashboard`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`${n}/admin/stats`),window.dispatchEvent(new PopStateEvent(`popstate`))}),document.getElementById(`apply-filters`)?.addEventListener(`click`,()=>{c=0,g()}),document.getElementById(`clear-filters`)?.addEventListener(`click`,()=>{document.getElementById(`filter-action`).value=``,document.getElementById(`filter-from`).value=``,document.getElementById(`filter-to`).value=``,document.getElementById(`filter-search`).value=``,c=0,g()}),document.getElementById(`filter-search`)?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(c=0,g())}),document.getElementById(`prev-page`)?.addEventListener(`click`,()=>{c>0&&(c--,g())}),document.getElementById(`next-page`)?.addEventListener(`click`,()=>{(c+1)*u<l&&(c++,g())});let r=document.getElementById(`grid-container`);r&&(s=a(r,f)),await m(),await g()}async function m(){try{let e=await(await fetch(`${n}/api/admin/stats/public-usage/summary`,{credentials:`include`})).json();e.success&&h(e.summary)}catch(e){console.error(`Error loading summary:`,e)}}function h(t){let n=document.getElementById(`summary-row`);if(!n)return;let r=t.reduce((e,t)=>e+t.total,0),i=t.reduce((e,t)=>e+t.last7Days,0),a=t.reduce((e,t)=>e+t.last30Days,0);n.innerHTML=`
        <div class="stats-summary-card">
            <div class="stats-summary-value">${r.toLocaleString()}</div>
            <div class="stats-summary-label" data-i18n="Total Records">Total Records</div>
        </div>
        <div class="stats-summary-card">
            <div class="stats-summary-value">${i.toLocaleString()}</div>
            <div class="stats-summary-label" data-i18n="Last 7 Days">Last 7 Days</div>
        </div>
        <div class="stats-summary-card">
            <div class="stats-summary-value">${a.toLocaleString()}</div>
            <div class="stats-summary-label" data-i18n="Last 30 Days">Last 30 Days</div>
        </div>
        ${t.slice(0,3).map(e=>`
            <div class="stats-summary-card">
                <div class="stats-summary-value">${e.total.toLocaleString()}</div>
                <div class="stats-summary-label">${e.obj}</div>
            </div>
        `).join(``)}
    `,e.translateIn(n);let o=document.getElementById(`filter-action`);o&&t.length>0&&(o.innerHTML=`<option value="" data-i18n="All Actions">All Actions</option>`+t.map(e=>`<option value="${e.obj}">${e.obj} (${e.total.toLocaleString()})</option>`).join(``),e.translateIn(o))}async function g(){let e=document.getElementById(`filter-action`)?.value,t=document.getElementById(`filter-from`)?.value,r=document.getElementById(`filter-to`)?.value,i=document.getElementById(`filter-search`)?.value;try{let a=await(await fetch(`${n}/api/admin/stats/public-usage`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({object:e||null,fromDate:t||null,toDate:r||null,search:i||null,skip:c*u,take:u})})).json();a.success&&(l=a.total,s?.setGridOption(`rowData`,a.stats),_())}catch(e){console.error(`Error loading data:`,e)}}function _(){let e=document.getElementById(`pagination-info`),n=document.getElementById(`prev-page`),r=document.getElementById(`next-page`),i=c*u+1,a=Math.min((c+1)*u,l);e&&(e.textContent=t(`Showing {0} - {1} of {2} records`,[i,a,l.toLocaleString()])),n&&(n.disabled=c===0),r&&(r.disabled=(c+1)*u>=l)}function v(){s&&=(s.destroy(),null),c=0,l=0}export{v as cleanup,p as render};