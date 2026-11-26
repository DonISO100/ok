import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";/* empty css               */i.registerModules([o]);var s=null,c=0,l=0,u=100,d=[{field:`id`,headerName:t(`ID`),width:80},{field:`reviewStatus`,headerName:t(`Status`),width:140,filter:`agTextColumnFilter`,cellRenderer:e=>{let t=e.value,n=`review-badge `;switch(e.data.reviewResult){case 0:n+=`review-pending`;break;case 1:n+=`review-approved`;break;case 2:n+=`review-rejected`;break;case 3:n+=`review-modified`}return`<span class="${n}">${t}</span>`}},{field:`userName`,headerName:t(`User`),flex:1,minWidth:150,filter:`agTextColumnFilter`,cellRenderer:e=>{let t=e.data.userId,r=e.value;return`<a href="${n}/admin/user/${t}" style="color: #3498db;">${r}</a>`}},{field:`dataId`,headerName:t(`Data`),width:80},{field:`rowId`,headerName:t(`Row`),width:80},{field:`originalText`,headerName:t(`Original`),flex:1,minWidth:200,filter:`agTextColumnFilter`,tooltipField:`originalText`},{field:`suggestedText`,headerName:t(`Suggested`),flex:1,minWidth:200,filter:`agTextColumnFilter`,tooltipField:`suggestedText`,cellStyle:{fontWeight:`500`,color:`#27ae60`}},{field:`dateTime`,headerName:t(`Submitted`),width:160,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],f={theme:r,columnDefs:d,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0,tooltipShowDelay:500};async function p(t){t.innerHTML=`
        <div class="stats-detail">
            <div class="stats-detail-header">
                <h2>
                    <button class="stats-back-btn" id="back-to-dashboard">
                        <i class="fas fa-arrow-left"></i> <span data-i18n="Back">Back</span>
                    </button>
                    <span data-i18n="Guest Edit Statistics">Guest Edit Statistics</span>
                </h2>
            </div>
            
            <div class="stats-summary-row" id="summary-row">
                <!-- Summary will be loaded -->
            </div>
            
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
                    <input type="text" id="filter-search" placeholder="Search by user or text..." data-i18n-placeholder="Search by user or text..." />
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
    `,e.translateIn(t),document.getElementById(`back-to-dashboard`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`${n}/admin/stats`),window.dispatchEvent(new PopStateEvent(`popstate`))}),document.getElementById(`apply-filters`)?.addEventListener(`click`,()=>{c=0,h()}),document.getElementById(`clear-filters`)?.addEventListener(`click`,()=>{document.getElementById(`filter-from`).value=``,document.getElementById(`filter-to`).value=``,document.getElementById(`filter-search`).value=``,c=0,h()}),document.getElementById(`filter-search`)?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(c=0,h())}),document.getElementById(`prev-page`)?.addEventListener(`click`,()=>{c>0&&(c--,h())}),document.getElementById(`next-page`)?.addEventListener(`click`,()=>{(c+1)*u<l&&(c++,h())});let r=document.getElementById(`grid-container`);r&&(s=a(r,f)),await m(),await h()}async function m(){let t=document.getElementById(`summary-row`);if(t)try{let r=await(await fetch(`${n}/api/admin/stats/guest-edits/summary`,{credentials:`include`})).json();if(r.success){let n=r.summary;t.innerHTML=`
                <div class="stats-summary-card">
                    <div class="stats-summary-value" style="color: #f39c12;">${n.pending}</div>
                    <div class="stats-summary-label" data-i18n="Pending">Pending</div>
                </div>
                <div class="stats-summary-card">
                    <div class="stats-summary-value" style="color: #27ae60;">${n.approved}</div>
                    <div class="stats-summary-label" data-i18n="Approved">Approved</div>
                </div>
                <div class="stats-summary-card">
                    <div class="stats-summary-value" style="color: #e74c3c;">${n.rejected}</div>
                    <div class="stats-summary-label" data-i18n="Rejected">Rejected</div>
                </div>
                <div class="stats-summary-card">
                    <div class="stats-summary-value" style="color: #3498db;">${n.approvedWithChanges}</div>
                    <div class="stats-summary-label" data-i18n="Modified">Modified</div>
                </div>
                <div class="stats-summary-card">
                    <div class="stats-summary-value">${n.total}</div>
                    <div class="stats-summary-label" data-i18n="Total">Total</div>
                </div>
            `,e.translateIn(t)}}catch(e){console.error(`Error loading summary:`,e)}}async function h(){let e=document.getElementById(`filter-from`)?.value,t=document.getElementById(`filter-to`)?.value,r=document.getElementById(`filter-search`)?.value;try{let i=await(await fetch(`${n}/api/admin/stats/guest-edits`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({fromDate:e||null,toDate:t||null,search:r||null,skip:c*u,take:u})})).json();i.success&&(l=i.total,s?.setGridOption(`rowData`,i.edits),g())}catch(e){console.error(`Error loading data:`,e)}}function g(){let e=document.getElementById(`pagination-info`),n=document.getElementById(`prev-page`),r=document.getElementById(`next-page`),i=l>0?c*u+1:0,a=Math.min((c+1)*u,l);e&&(e.textContent=t(`Showing {0} - {1} of {2} records`,[i,a,l.toLocaleString()])),n&&(n.disabled=c===0),r&&(r.disabled=(c+1)*u>=l)}function _(){s&&=(s.destroy(),null),c=0,l=0}export{_ as cleanup,p as render};