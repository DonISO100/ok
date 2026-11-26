import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{n as r}from"./authors-BZkOCpi_.js";import{i,n as a,r as o,t as s}from"./main.esm-vKLlLbDv.js";import{a as c,n as l,r as u}from"./admin-CoCrMR08.js";a.registerModules([s]);var d=``,f=null,p=[],m=[{field:`workName`,headerName:t(`Work`),flex:1,minWidth:150,filter:`agTextColumnFilter`},{field:`dataName`,headerName:t(`Column`),flex:1,minWidth:120,filter:`agTextColumnFilter`},{field:`readPermission`,headerName:t(`Read`),width:90,cellRenderer:_(`readPermission`,1)},{field:`writePermission`,headerName:t(`Write`),width:90,cellRenderer:_(`writePermission`,2)},{field:`exportPermission`,headerName:t(`Export`),width:90,cellRenderer:_(`exportPermission`,4)},{field:`denyEditPermission`,headerName:t(`Deny edit`),width:110,cellRenderer:_(`denyEditPermission`,8)},{headerName:t(`Actions`),width:100,cellRenderer:e=>`<button class="btn-small btn-delete-perm" data-id="${e.data.dataId}">${t(`Delete`)}</button>`}];function h(e){return e<0}function g(e){return h(e)?3:1}function _(e,t){return n=>t===4&&h(n.data.dataId)?``:`<input type="checkbox" ${n.data[e]?`checked`:``} class="perm-checkbox" data-dataid="${n.data.dataId}" data-field="${e}" data-flag="${t}" />`}var v={theme:i,columnDefs:m,defaultColDef:{sortable:!0,resizable:!0},rowData:void 0,animateRows:!1,rowSelection:{mode:`singleRow`},getRowId:e=>String(e.data.dataId)};async function y(e){try{let t=await fetch(`${n}/api/admin/users/${e}`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let r=await t.json();return r.success&&r.user?r.user:(console.error(`Failed to fetch user:`,r.message||`Unknown error`),null)}catch(e){return console.error(`Failed to fetch user:`,e),null}}async function b(e){try{let t=await fetch(`${n}/api/admin/users/${e}/permissions`,{credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);let r=await t.json();return r.success&&Array.isArray(r.permissions)?r.permissions.map(e=>({...e,readPermission:(e.permission&1)==1,writePermission:(e.permission&2)==2,exportPermission:(e.permission&4)==4,denyEditPermission:(e.permission&8)==8})):(console.error(`Failed to fetch permissions:`,r.message||`Unknown error`),[])}catch(e){return console.error(`Failed to fetch permissions:`,e),[]}}async function x(){try{let e=await fetch(`${n}/api/admin/workdata`,{credentials:`include`});if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);let t=await e.json();return t.success&&Array.isArray(t.workData)?t.workData.map(e=>({dataId:e.id,workId:e.workId,workName:e.workName,dataName:e.name})):(console.error(`Failed to fetch work data options:`,t.message||`Unknown error`),[])}catch(e){return console.error(`Failed to fetch work data options:`,e),[]}}async function S(e,t,n,r){let i=f?.getRowNode(String(e));if(!i||!i.data)return;let a=i.data,o=a.permission;r?o|=n:o&=~n,a.permission=o,a[t]=r,await C(a),i.setData(a)}async function C(e){try{let t=await fetch(`${n}/api/admin/users/${d}/permissions/${e.dataId}`,{method:`PUT`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({permission:e.permission})});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return!0}catch(e){return console.error(`Failed to save permission:`,e),!1}}async function w(e){try{let t=await fetch(`${n}/api/admin/users/${d}/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({dataId:e,permission:g(e)})});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return(await t.json()).success===!0}catch(e){return console.error(`Failed to add permission:`,e),!1}}async function T(e){try{let t=await fetch(`${n}/api/admin/users/${d}/permissions/${e}`,{method:`DELETE`,credentials:`include`});if(!t.ok)throw Error(`HTTP error! status: ${t.status}`);return!0}catch(e){return console.error(`Failed to delete permission:`,e),!1}}function E(e){return`
        <div class="card user-sites-card">
            <div class="card-header">
                <span class="card-title" data-i18n="Permissions on each author site">Permissions on each author site</span>
            </div>
            <div class="card-body">
                <p data-i18n="A person's permissions on columns belong to one author site. Open that site to see or change them.">A person's permissions on columns belong to one author site. Open that site to see or change them.</p>
                <ul class="user-sites-list">${r.map(n=>`<li><a href="${u(n.slug,`user/`+encodeURIComponent(e))}">${t(n.name)}</a></li>`).join(``)}</ul>
            </div>
        </div>
    `}async function D(r,i){d=i;let a=l();r.innerHTML=`
        <div class="user-detail-page">
            <div class="user-detail-header">
<a href="${n}/admin/users" class="back-link" data-i18n="${a===`author`?`← Back to Permissions`:`← Back to Users`}">${a===`author`?`← Back to Permissions`:`← Back to Users`}</a>
                <h2 id="userTitle">${t(`Loading...`)}</h2>
            </div>

            <div class="card user-info-card">
                <div class="card-header">
                    <span class="card-title" data-i18n="User Information">User Information</span>
                </div>
                <div class="card-body">
                    <div class="user-info">
                        <div class="user-info-row">
                            <span class="user-info-label" data-i18n="Name:">Name:</span>
                            <span id="userName" class="user-info-value">${t(`Loading...`)}</span>
                        </div>
                        <div class="user-info-row">
                            <span class="user-info-label" data-i18n="Email:">Email:</span>
                            <span id="userEmail" class="user-info-value">${t(`Loading...`)}</span>
                        </div>
                        <div class="user-info-row">
                            <span class="user-info-label" data-i18n="Role:">Role:</span>
                            <span id="userRole" class="user-info-value">${t(`Loading...`)}</span>
                        </div>
                        <div class="user-info-row">
                            <span class="user-info-label" data-i18n="Status:">Status:</span>
                            <span id="userStatus" class="user-info-value">${t(`Loading...`)}</span>
                        </div>
                        <div class="user-info-row" id="userActivityRow">
                            <span class="user-info-label" data-i18n="Activity:">Activity:</span>
                            <span id="userActivity" class="user-info-value">${t(`Loading...`)}</span>
                        </div>
                    </div>
                    ${a===`author`?`<p class="user-account-note"><span data-i18n="The account, the role and the AI permission apply to every author site. Change them in the">The account, the role and the AI permission apply to every author site. Change them in the</span>
                        <a href="${c(`users`)}" data-i18n="Editio admin">Editio admin</a>.</p>`:``}
                </div>
            </div>

            ${a===`general`?E(i):``}

            <div class="card" id="userPermissionsCard">
                <div class="card-header">
                    <span class="card-title"><span data-i18n="Permissions">Permissions</span> <span class="permissions-count">${t(`(loading...)`)}</span></span>
                    <div class="card-actions">
                        <div class="work-data-picker">
                            <input type="search" id="workDataFilter" class="work-data-filter" placeholder="Filter works..." data-i18n-placeholder="Filter works..." />
                            <select id="workDataSelect" class="work-data-select" multiple size="6"></select>
                        </div>
                        <button class="btn-add" id="addPermission" data-i18n="Add Permission">Add Permission</button>
                        <button class="btn-refresh" id="refreshPermissions" data-i18n="Refresh">Refresh</button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="permissionsGrid" class="permissions-grid"></div>
                </div>
            </div>
        </div>
    `,a===`general`&&(document.getElementById(`userPermissionsCard`)?.remove(),document.getElementById(`userActivityRow`)?.remove()),e.translateIn(r);let s=document.getElementById(`permissionsGrid`);s&&(f=o(s,v)),O(await y(i)),a!==`general`&&(await k(),await A()),M(r)}function O(n){let r=document.getElementById(`userTitle`),i=document.getElementById(`userName`),a=document.getElementById(`userEmail`),o=document.getElementById(`userRole`),s=document.getElementById(`userStatus`),c=document.getElementById(`userActivity`);if(n){if(r&&(r.textContent=t(`User: {0}`,[n.name])),i&&(i.textContent=n.name),a&&(a.textContent=n.email),o&&(o.innerHTML=`<span style="color: ${n.role===`Admin`?`red`:n.role===`Editor`?`blue`:`black`};">${n.role||t(`None`)}</span>`),s&&(s.innerHTML=n.lockoutEnabled?`<span class="badge badge-danger" data-i18n="Locked">Locked</span>`:n.emailConfirmed?`<span class="badge badge-success" data-i18n="Active">Active</span>`:`<span class="badge badge-warning" data-i18n="Unconfirmed">Unconfirmed</span>`,e.translateIn(s)),c){let e=[];n.reads>0&&e.push(`<span style="color: blue;" title="${t(`Reads`)}">${t(`{0} reads`,[n.reads])}</span>`),n.edits>0&&e.push(`<span style="color: red;" title="${t(`Edits`)}">${t(`{0} edits`,[n.edits])}</span>`),n.guestEdits>0&&e.push(`<span style="color: green;" title="${t(`Guest Edits`)}">${t(`{0} guest edits`,[n.guestEdits])}</span>`),c.innerHTML=e.length>0?e.join(` | `):t(`No activity`)}}else r&&(r.textContent=t(`User not found`))}async function k(){let e=await b(d);f?.setGridOption(`rowData`,e);let t=document.querySelector(`.permissions-count`);t&&(t.textContent=`(${e.length})`)}async function A(){p=await x(),p.sort((e,t)=>e.workName.localeCompare(t.workName)||e.dataName.localeCompare(t.dataName)),j()}function j(){let e=document.getElementById(`workDataSelect`);if(!e)return;let t=(document.getElementById(`workDataFilter`)?.value||``).toLowerCase(),n=new Set(Array.from(e.selectedOptions).map(e=>e.value));e.innerHTML=``,p.forEach(r=>{let i=`${r.workName} - ${r.dataName}`;if(t&&!i.toLowerCase().includes(t))return;let a=document.createElement(`option`);a.value=String(r.dataId),a.textContent=i,a.selected=n.has(a.value),e.appendChild(a)})}function M(e){e.querySelector(`.back-link`)?.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&(history.pushState(null,``,t),window.dispatchEvent(new PopStateEvent(`popstate`)))}),document.getElementById(`refreshPermissions`)?.addEventListener(`click`,k),document.getElementById(`workDataFilter`)?.addEventListener(`input`,j),document.getElementById(`addPermission`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`workDataSelect`),n=Array.from(e.selectedOptions);if(n.length===0){alert(t(`Please select one or more works/languages first`));return}let r=[];for(let e of n)await w(parseInt(e.value,10))?e.selected=!1:r.push(e.textContent||e.value);await k(),r.length>0&&alert(t(`Failed to add permission for:
{0}`,[r.join(`
`)]))}),e.addEventListener(`change`,async e=>{let t=e.target;t.classList.contains(`perm-checkbox`)&&await S(parseInt(t.dataset.dataid||`0`,10),t.dataset.field||``,parseInt(t.dataset.flag||`0`,10),t.checked)}),e.addEventListener(`click`,async e=>{let n=e.target;if(n.classList.contains(`btn-delete-perm`)){let e=parseInt(n.dataset.id||`0`,10);confirm(t(`Are you sure you want to delete this permission?`))&&(await T(e)?await k():alert(t(`Failed to delete permission`)))}})}function N(){f&&=(f.destroy(),null)}export{N as cleanup,D as render};