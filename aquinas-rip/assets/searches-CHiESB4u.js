import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{i as r,n as i,r as a,t as o}from"./main.esm-vKLlLbDv.js";/* empty css               */i.registerModules([o]);var s=null,c=0,l=0,u=100,d=[{field:`id`,headerName:t(`ID`),width:80},{field:`userName`,headerName:t(`User/IP`),flex:1,minWidth:180,filter:`agTextColumnFilter`},{field:`type`,headerName:t(`Source`),width:120,filter:`agTextColumnFilter`,cellRenderer:e=>{let n=e.value,r=n,i=`#7f8c8d`;return n===`public`?(r=t(`Public`),i=`#3498db`):n===`user`&&(r=t(`User`),i=`#27ae60`),`<span style="color: ${i}; font-weight: 500;">${r}</span>`}},{field:`value`,headerName:t(`Search Query`),flex:2,minWidth:250,filter:`agTextColumnFilter`,cellRenderer:e=>`<span style="font-family: monospace;">${e.value||``}</span>`},{field:`lastDateTime`,headerName:t(`Time`),width:180,valueFormatter:e=>e.value?new Date(e.value).toLocaleString():``}],f={theme:r,columnDefs:d,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},suppressCellFocus:!0};async function p(t){t.innerHTML=`
        <div class="stats-detail">
            <div class="stats-detail-header">
                <h2>
                    <button class="stats-back-btn" id="back-to-dashboard">
                        <i class="fas fa-arrow-left"></i> <span data-i18n="Back">Back</span>
                    </button>
                    <span data-i18n="Search Statistics">Search Statistics</span>
                </h2>
            </div>
            
            <div class="stats-tabs">
                <button class="stats-tab active" data-tab="recent" data-i18n="Recent Searches">Recent Searches</button>
                <button class="stats-tab" data-tab="popular" data-i18n="Popular Searches">Popular Searches</button>
            </div>
            
            <div id="tab-recent" class="tab-content">
                <div class="stats-filter-bar">
                    <div class="stats-filter-group">
                        <label data-i18n="Source:">Source:</label>
                        <select id="filter-type">
                            <option value="" data-i18n="All Sources">All Sources</option>
                            <option value="public" data-i18n="Public">Public</option>
                            <option value="user" data-i18n="User">User</option>
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
                        <input type="text" id="filter-search" placeholder="Search by query or user..." data-i18n-placeholder="Search by query or user..." />
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
                
                <div class="stats-grid-container" id="search-grid"></div>
                
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
            
            <div id="tab-popular" class="tab-content" style="display: none;">
                <div class="stats-filter-bar">
                    <div class="stats-filter-group">
                        <label data-i18n="Time Range:">Time Range:</label>
                        <select id="popular-days">
                            <option value="7" data-i18n="Last 7 days">Last 7 days</option>
                            <option value="30" selected data-i18n="Last 30 days">Last 30 days</option>
                            <option value="90" data-i18n="Last 90 days">Last 90 days</option>
                            <option value="365" data-i18n="Last year">Last year</option>
                        </select>
                    </div>
                    <div class="stats-filter-actions">
                        <button class="btn btn-primary" id="load-popular">
                            <i class="fas fa-sync-alt"></i> <span data-i18n="Refresh">Refresh</span>
                        </button>
                    </div>
                </div>
                <div class="stats-popular-list" id="popular-list">
                    <!-- Popular searches will be loaded here -->
                </div>
            </div>
        </div>
    `,e.translateIn(t),t.querySelectorAll(`.stats-tab`).forEach(e=>{e.addEventListener(`click`,()=>{m(e.getAttribute(`data-tab`))})}),document.getElementById(`back-to-dashboard`)?.addEventListener(`click`,()=>{window.history.pushState({},``,`${n}/admin/stats`),window.dispatchEvent(new PopStateEvent(`popstate`))}),document.getElementById(`apply-filters`)?.addEventListener(`click`,()=>{c=0,h()}),document.getElementById(`clear-filters`)?.addEventListener(`click`,()=>{document.getElementById(`filter-type`).value=``,document.getElementById(`filter-from`).value=``,document.getElementById(`filter-to`).value=``,document.getElementById(`filter-search`).value=``,c=0,h()}),document.getElementById(`filter-search`)?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(c=0,h())}),document.getElementById(`prev-page`)?.addEventListener(`click`,()=>{c>0&&(c--,h())}),document.getElementById(`next-page`)?.addEventListener(`click`,()=>{(c+1)*u<l&&(c++,h())}),document.getElementById(`load-popular`)?.addEventListener(`click`,g),document.getElementById(`popular-days`)?.addEventListener(`change`,g);let r=document.getElementById(`search-grid`);r&&(s=a(r,f)),await h(),await g()}function m(e){document.querySelectorAll(`.stats-tab`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)});let t=document.getElementById(`tab-recent`),n=document.getElementById(`tab-popular`);t&&(t.style.display=e===`recent`?`block`:`none`),n&&(n.style.display=e===`popular`?`block`:`none`),e===`recent`&&s?.sizeColumnsToFit()}async function h(){let e=document.getElementById(`filter-type`)?.value,t=document.getElementById(`filter-from`)?.value,r=document.getElementById(`filter-to`)?.value,i=document.getElementById(`filter-search`)?.value;try{let a=await(await fetch(`${n}/api/admin/stats/searches`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({type:e||null,fromDate:t||null,toDate:r||null,search:i||null,skip:c*u,take:u})})).json();a.success&&(l=a.total,s?.setGridOption(`rowData`,a.stats),y())}catch(e){console.error(`Error loading search data:`,e)}}async function g(){let t=parseInt(document.getElementById(`popular-days`)?.value||`30`),r=document.getElementById(`popular-list`);if(r){r.innerHTML=`<div class="stats-loading"><i class="fas fa-spinner fa-spin"></i> <span data-i18n="Loading...">Loading...</span></div>`,e.translateIn(r);try{let i=await(await fetch(`${n}/api/admin/stats/searches/popular?days=${t}`,{credentials:`include`})).json();i.success?_(i.popular,r):(r.innerHTML=`<div class="stats-error" data-i18n="Failed to load popular searches">Failed to load popular searches</div>`,e.translateIn(r))}catch(t){console.error(`Error loading popular searches:`,t),r.innerHTML=`<div class="stats-error" data-i18n="Failed to connect to server">Failed to connect to server</div>`,e.translateIn(r)}}}function _(t,n){t.length===0?(n.innerHTML=`<p style="text-align: center; color: #7f8c8d;" data-i18n="No searches found in this time period.">No searches found in this time period.</p>`,e.translateIn(n)):n.innerHTML=t.map((e,t)=>`
        <div class="stats-popular-item">
            <span class="stats-popular-rank">${t+1}.</span>
            <span class="stats-popular-term">${v(e.searchTerm||``)}</span>
            <span class="stats-popular-count">${e.count}</span>
        </div>
    `).join(``)}function v(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function y(){let e=document.getElementById(`pagination-info`),n=document.getElementById(`prev-page`),r=document.getElementById(`next-page`),i=l>0?c*u+1:0,a=Math.min((c+1)*u,l);e&&(e.textContent=t(`Showing {0} - {1} of {2} records`,[i,a,l.toLocaleString()])),n&&(n.disabled=c===0),r&&(r.disabled=(c+1)*u>=l)}function b(){s&&=(s.destroy(),null),c=0,l=0}export{b as cleanup,p as render};