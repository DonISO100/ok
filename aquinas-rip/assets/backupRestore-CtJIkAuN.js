import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{t as r}from"./maintenanceProgress-BnSSLFBU.js";import{a as i,i as a,n as o}from"./admin-CoCrMR08.js";async function s(e){try{let t=new FormData;t.append(`file`,e);let r=await fetch(`${n}/api/admin/backup/inspect`,{method:`POST`,credentials:`include`,body:t});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json()}catch(e){return console.error(`Backup inspect failed:`,e),{success:!1,message:`Could not read the backup file.`}}}async function c(e){try{let t=new FormData;t.append(`file`,e);let r=await fetch(`${n}/api/admin/backup/upload`,{method:`POST`,credentials:`include`,body:t});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json()}catch(e){return console.error(`Backup upload failed:`,e),{success:!1,message:`Could not upload the backup file.`}}}var l=[{key:`TextData`,label:`Text data`,description:`Works, columns, rows, cells, guest edits`,defaultOn:!0},{key:`ExportData`,label:`Export data`,description:`Series, books, and export/layout settings`,defaultOn:!0},{key:`UserData`,label:`User data & permissions`,description:`Per-user app data and column permissions`,defaultOn:!0},{key:`ResourcesTools`,label:`Resources & tools`,description:`Localization resources and regex/cleanup tools`,defaultOn:!0},{key:`Snapshots`,label:`Snapshots`,description:`Point-in-time work backups`,defaultOn:!1},{key:`Logs`,label:`Activity logs`,description:`Usage stats and sessions`,defaultOn:!1},{key:`Identity`,label:`Identity (users & authentication)`,description:`Accounts, roles, and OAuth data — contains credentials`,defaultOn:!1,sensitive:!0}];function u(e){return l.find(t=>t.key===e)?.label??e}var d={file:null,manifest:null};function f(){return l.filter(e=>a(e.key))}function p(){let e=o();return e===`general`?`<p class="br-intro" data-i18n="This is the backup of the user database, which all author sites share. Back up an author's works, books and logs in that site's admin.">This is the backup of the user database, which all author sites share. Back up an author's works, books and logs in that site's admin.</p>`:e===`author`?`<p class="br-intro"><span data-i18n="This is the backup of this author site's own data. The user database, which all sites share, is backed up in the">This is the backup of this author site's own data. The user database, which all sites share, is backed up in the</span>
            <a href="${i(`backup-restore`)}" data-i18n="Editio admin">Editio admin</a>.</p>`:``}function m(e){return document.getElementById(e)}function h(e,t,n=`info`){let r=m(e);r&&(r.textContent=t,r.className=`br-status br-status-${n}`)}function g(e){let t=new Date(e);return isNaN(t.getTime())?e:t.toLocaleString()}function _(e,t,n,r,i){return`
        <label class="br-check ${i.sensitive?`br-check-sensitive`:``}">
            <input type="checkbox" id="${e}-${t}" data-cat="${t}" ${n?`checked`:``} ${r?`disabled`:``}>
            <span class="br-check-text">
                <span class="br-check-label">${i.label}</span>
                <span class="br-check-desc">${i.description}</span>
            </span>
        </label>
    `}function v(e){return l.map(e=>e.key).filter(t=>m(`${e}-${t}`)?.checked??!1)}function y(){let e=m(`br-download`);e&&(e.disabled=v(`br-backup`).length===0)}async function b(){let e=v(`br-backup`);if(e.length===0)return;let n=m(`br-backup-progress`);if(!n)return;let i=m(`br-download`);i&&(i.disabled=!0),h(`br-backup-status`,t(`Creating backup…`),`info`);try{let i=await r(n,t(`Creating backup…`),t=>t.startBackup(e.join(`,`)));if(i.success&&i.result?.downloadUrl){let e=document.createElement(`a`);e.href=i.result.downloadUrl,e.download=i.result.filename||`textengine-backup.zip`,document.body.appendChild(e),e.click(),document.body.removeChild(e),h(`br-backup-status`,t(`Backup ready — downloading.`),`success`)}else h(`br-backup-status`,t(`Backup failed. See the log.`),`error`)}finally{i&&(i.disabled=!1)}}async function x(e){let n=e.target,r=n.files?.[0]??null;if(d.file=r,d.manifest=null,S(null),C(),!r)return;h(`br-restore-status`,t(`Reading backup…`),`info`);let i=await s(r);!i.success||!i.manifest?(h(`br-restore-status`,i.message||t(`Could not read the backup.`),`error`),d.file=null,n.value=``):(d.manifest=i.manifest,h(`br-restore-status`,``,`info`),S(i.manifest),C())}function S(n){let r=m(`br-manifest`);if(!r)return;if(!n){r.innerHTML=``;return}let i=new Set(n.categories),a=n.tables.reduce((e,t)=>e+t.rowCount,0),s=f(),c=l.filter(e=>i.has(e.key)&&!s.includes(e)),d=s.filter(e=>i.has(e.key)).map(e=>{let r=n.tables.filter(t=>t.category===e.key).reduce((e,t)=>e+t.rowCount,0);return _(`br-restore`,e.key,!0,!1,{label:`${e.label} (${t(`{0} rows`,[r.toLocaleString()])})`,description:e.description,sensitive:e.sensitive})}).join(``),p=n.tables.map(e=>`<tr><td>${e.name}</td><td>${u(e.category)}</td><td>${e.database}</td><td class="br-num">${e.rowCount.toLocaleString()}</td></tr>`).join(``);r.innerHTML=`
        <div class="br-manifest-summary">
            <div><span class="br-label" data-i18n="Created">Created</span> ${g(n.createdUtc)}</div>
            <div><span class="br-label" data-i18n="Source">Source</span> ${n.source}</div>
            <div><span class="br-label" data-i18n="Format version">Format version</span> ${n.version}</div>
            <div><span class="br-label" data-i18n="Total rows">Total rows</span> ${a.toLocaleString()}</div>
        </div>

        <p class="br-subhead" data-i18n="Categories to restore">Categories to restore</p>
        <div class="br-category-list">${d}</div>
        ${c.length>0?`<p class="br-intro">${t(`This backup also holds: {0}.`,[c.map(e=>t(e.label)).join(`, `)])} ${o()===`general`?t(`Restore those in the admin of the author site they belong to.`):t(`Restore those in the Editio admin.`)}</p>`:``}

        <details class="br-table-details">
            <summary>${t(`Show table detail ({0} tables)`,[n.tables.length])}</summary>
            <table class="br-table">
                <thead><tr><th data-i18n="Table">Table</th><th data-i18n="Category">Category</th><th data-i18n="Database">Database</th><th class="br-num" data-i18n="Rows">Rows</th></tr></thead>
                <tbody>${p}</tbody>
            </table>
        </details>
    `,e.translateIn(r),r.querySelectorAll(`input[type="checkbox"]`).forEach(e=>e.addEventListener(`change`,C))}function C(){let e=m(`br-confirm`)?.checked??!1,t=d.manifest!==null&&v(`br-restore`).length>0,n=m(`br-restore`);n&&(n.disabled=!(d.file&&d.manifest&&e&&t))}async function w(){if(!d.file||!d.manifest)return;let e=v(`br-restore`);if(e.length===0)return;let n=e.map(u).join(`, `);if(!confirm(t(`Restore will WIPE and replace the following with the backup's contents:

{0}

This cannot be undone (a safety backup of the current state is saved on the server first).

Proceed?`,[n])))return;let i=m(`br-restore`);i&&(i.disabled=!0);let a=m(`br-restore-result`);if(!a)return;h(`br-restore-status`,t(`Uploading backup…`),`info`);let o=await c(d.file);if(!o.success||!o.uploadId){h(`br-restore-status`,o.message||t(`Upload failed.`),`error`),i&&(i.disabled=!1);return}h(`br-restore-status`,t(`Restoring… do not close this page.`),`info`);let s=await r(a,t(`Restoring from backup…`),t=>t.startRestore(o.uploadId,e.join(`,`)));s.result?T(s.result):h(`br-restore-status`,t(`Restore failed. See the log above.`),`error`),C()}function T(n){let r=m(`br-restore-result`);if(!r)return;if(!n){h(`br-restore-status`,t(`Restore failed. See console for details.`),`error`),r.innerHTML=``;return}h(`br-restore-status`,n.message||(n.success?t(`Restore complete.`):t(`Restore failed.`)),n.success?`success`:`error`);let i=Object.entries(n.tablesRestored||{}).map(([e,t])=>`<tr><td>${e}</td><td class="br-num">${t.toLocaleString()}</td></tr>`).join(``),a=(n.warnings||[]).length?`<div class="br-warnings"><strong data-i18n="Notes:">Notes:</strong><ul>${n.warnings.map(e=>`<li>${e}</li>`).join(``)}</ul></div>`:``;r.innerHTML=`
        ${n.safetyBackupPath?`<div class="br-safety"><span data-i18n="Safety backup saved to:">Safety backup saved to:</span> <code>${n.safetyBackupPath}</code></div>`:``}
        ${a}
        ${i?`<table class="br-table"><thead><tr><th data-i18n="Table">Table</th><th class="br-num" data-i18n="Rows restored">Rows restored</th></tr></thead><tbody>${i}</tbody></table>`:``}
    `,e.translateIn(r)}async function E(t){let n=f().map(e=>_(`br-backup`,e.key,e.defaultOn||o()===`general`,!1,e)).join(``);t.innerHTML=`
        <div class="br-page">
            <h2 data-i18n="Backup &amp; Restore">Backup &amp; Restore</h2>
            <p class="br-intro" data-i18n="Download a portable backup of the whole system, or restore from one. Choose exactly which categories to include — the same choices apply on both backup and restore. This area is limited to Aquinas Institute administrators.">
                Download a portable backup of the whole system, or restore from one. Choose exactly
                which categories to include — the same choices apply on both backup and restore.
                This area is limited to Aquinas Institute administrators.
            </p>
            ${p()}

            <div class="card br-card">
                <div class="card-header"><span class="card-title" data-i18n="Download backup">Download backup</span></div>
                <div class="card-body">
                    <p class="br-subhead" data-i18n="Categories to back up">Categories to back up</p>
                    <div class="br-category-list">${n}</div>
                    <div class="br-actions">
                        <button class="btn-primary" id="br-download" data-i18n="Download backup">Download backup</button>
                        <span class="br-status br-status-info" id="br-backup-status"></span>
                    </div>
                    <div id="br-backup-progress" style="display:none;margin-top:0.75rem"></div>
                </div>
            </div>

            <div class="card br-card">
                <div class="card-header"><span class="card-title" data-i18n="Restore from backup">Restore from backup</span></div>
                <div class="card-body">
                    <p class="br-warning-banner">
                        <span data-i18n="Restoring">Restoring</span> <strong data-i18n="replaces">replaces</strong> <span data-i18n="the selected categories with the backup's contents. Download a current backup first if you might need it.">the selected categories with the backup's contents.
                        Download a current backup first if you might need it.</span>
                    </p>
                    <input type="file" id="br-file" accept=".zip,application/zip">
                    <div id="br-manifest" class="br-manifest"></div>

                    <label class="br-check br-confirm">
                        <input type="checkbox" id="br-confirm">
                        <span class="br-check-text"><span class="br-check-label" data-i18n="I understand this will wipe and replace the selected categories.">I understand this will wipe and replace the selected categories.</span></span>
                    </label>

                    <div class="br-actions">
                        <button class="btn-danger" id="br-restore" disabled data-i18n="Restore">Restore</button>
                        <span class="br-status br-status-info" id="br-restore-status"></span>
                    </div>
                    <div id="br-restore-result" class="br-restore-result"></div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),m(`br-download`)?.addEventListener(`click`,b),m(`br-file`)?.addEventListener(`change`,x),m(`br-confirm`)?.addEventListener(`change`,C),m(`br-restore`)?.addEventListener(`click`,w),l.forEach(e=>m(`br-backup-${e.key}`)?.addEventListener(`change`,y)),y()}function D(){d={file:null,manifest:null}}export{D as cleanup,E as render};