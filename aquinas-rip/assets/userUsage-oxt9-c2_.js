import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";/* empty css               */i.registerModules([o]);var s=null,c=null,l=0,u=0,d=100,f=[{field:`id`,headerName:t(`ID`),width:80},{field:`userName`,headerName:t(`User`),flex:1,minWidth:200,filter:`agTextColumnFilter`},{field:`obj`,headerName:t(`Action`),width:150,filter:`agTextColumnFilter`,cellRenderer:e=>{let t=e.value,n=`#2c3e50`;return t===`READ CHECK`?n=`#3498db`:t===`WRITE CHECK`&&(n=`#27ae60`),`<span style="color: ${n}; font-weight: 500;">${t}</span>`}},{field:`value`,headerName:t(`Details`),flex:2,minWidth:200,filter:`agTextColumnFilter`},{field:`lastDateTime`,headerName:t(`Time`),width:180,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],p=[{field:`userName`,headerName:t(`User`),flex:1,minWidth:200,filter:`agTextColumnFilter`},{field:`reads`,headerName:t(`Total Reads`),width:120,cellRenderer:e=>`<span style="color: #3498db; font-weight: 600;">${e.value.toLocaleString()}</span>`},{field:`edits`,headerName:t(`Total Edits`),width:120,cellRenderer:e=>`<span style="color: #27ae60; font-weight: 600;">${e.value.toLocaleString()}</span>`},{field:`readsLast7Days`,headerName:t(`Reads (7d)`),width:110},{field:`editsLast7Days`,headerName:t(`Edits (7d)`),width:110},{field:`lastActivity`,headerName:t(`Last Active`),width:180,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],m={theme:r,columnDefs:f,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0},h={theme:r,columnDefs:p,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0};async function g(t){t.innerHTML=`
        <div class="stats-detail">
            <div class="stats-detail-header">
                <h2>
                    <button class="stats-back-btn" id="back-to-dashboard">
                        <i class="fas fa-arrow-left"></i> <span data-i18n="Back">Back</span>
                    </button>
                    <span data-i18n="User Activity Statistics">User Activity Statistics</span>
                </h2>
            </div>
            
            <div class="stats-tabs">
                <button class="stats-tab active" data-tab="activity" data-i18n="Activity Log">Activity Log</button>
                <button class="stats-tab" data-tab="summary" data-i18n="User Summary">User Summary</button>
            </div>
            
            <div id="tab-activity" class="tab-content">
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
                        <input type="text" id="filter-search" placeholder="Search by user or details..." data-i18n-placeholder="Search by user or details..." />
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
                
                <div class="stats-grid-container" id="activity-grid"></div>
                
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
            
            <div id="tab-summary" class="tab-content" style="display: none;">
                <div class="stats-grid-container" id="summary-grid"></div>
            </div>
        </div>
    `,e.translateIn(t),t.querySelectorAll(`.stats-tab`).forEach(e=>{e.addEventListener(`click`,()=>{v(e.getAttribute(`data-tab`))})}),document.getElementById(`back-to-dashboard`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`${n}/admin/stats`),window.dispatchEvent(new PopStateEvent(`popstate`))}),document.getElementById(`apply-filters`)?.addEventListener(`click`,()=>{l=0,y()}),document.getElementById(`clear-filters`)?.addEventListener(`click`,()=>{document.getElementById(`filter-action`).value=``,document.getElementById(`filter-from`).value=``,document.getElementById(`filter-to`).value=``,document.getElementById(`filter-search`).value=``,l=0,y()}),document.getElementById(`filter-search`)?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(l=0,y())}),document.getElementById(`prev-page`)?.addEventListener(`click`,()=>{l>0&&(l--,y())}),document.getElementById(`next-page`)?.addEventListener(`click`,()=>{(l+1)*d<u&&(l++,y())});let r=document.getElementById(`activity-grid`);r&&(s=a(r,m));let i=document.getElementById(`summary-grid`);i&&(c=a(i,h)),await _(),await y(),await b()}async function _(){try{let t=await(await fetch(`${n}/api/admin/stats/user-usage/actions`,{credentials:`include`})).json();if(t.success){let n=document.getElementById(`filter-action`);n&&t.actions.length>0&&(n.innerHTML=`<option value="" data-i18n="All Actions">All Actions</option>`+t.actions.map(e=>`<option value="${e.obj}">${e.obj} (${e.count.toLocaleString()})</option>`).join(``),e.translateIn(n))}}catch(e){console.error(`Error loading actions:`,e)}}function v(e){document.querySelectorAll(`.stats-tab`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)});let t=document.getElementById(`tab-activity`),n=document.getElementById(`tab-summary`);t&&(t.style.display=e===`activity`?`block`:`none`),n&&(n.style.display=e===`summary`?`block`:`none`),e===`activity`?s?.sizeColumnsToFit():c?.sizeColumnsToFit()}async function y(){let e=document.getElementById(`filter-action`)?.value,t=document.getElementById(`filter-from`)?.value,r=document.getElementById(`filter-to`)?.value,i=document.getElementById(`filter-search`)?.value;try{let a=await(await fetch(`${n}/api/admin/stats/user-usage`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({object:e||null,fromDate:t||null,toDate:r||null,search:i||null,skip:l*d,take:d})})).json();a.success&&(u=a.total,s?.setGridOption(`rowData`,a.stats),x())}catch(e){console.error(`Error loading activity data:`,e)}}async function b(){try{let e=await(await fetch(`${n}/api/admin/stats/user-usage/summary`,{credentials:`include`})).json();e.success&&c?.setGridOption(`rowData`,e.summary)}catch(e){console.error(`Error loading summary data:`,e)}}function x(){let e=document.getElementById(`pagination-info`),n=document.getElementById(`prev-page`),r=document.getElementById(`next-page`),i=u>0?l*d+1:0,a=Math.min((l+1)*d,u);e&&(e.textContent=t(`Showing {0} - {1} of {2} records`,[i,a,u.toLocaleString()])),n&&(n.disabled=l===0),r&&(r.disabled=(l+1)*d>=u)}function S(){s&&=(s.destroy(),null),c&&=(c.destroy(),null),l=0,u=0}export{S as cleanup,g as render};