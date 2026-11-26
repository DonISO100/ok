import{i as e,l as t,p as n}from"./i18n-fj3F4Jw9.js";import{n as r,t as i}from"./main.esm-vKLlLbDv.js";/* empty css               */r.registerModules([i]);var a=null;async function o(t){t.innerHTML=`
        <div class="stats-dashboard">
            <div class="stats-header">
                <h2 data-i18n="Statistics Dashboard">Statistics Dashboard</h2>
                <div class="stats-actions">
                    <button class="btn btn-secondary" id="refresh-stats">
                        <i class="fas fa-sync-alt"></i> <span data-i18n="Refresh">Refresh</span>
                    </button>
                </div>
            </div>
            <div class="stats-loading" id="stats-loading">
                <i class="fas fa-spinner fa-spin"></i> <span data-i18n="Loading statistics...">Loading statistics...</span>
            </div>
            <div class="stats-grid" id="stats-grid" style="display: none;">
                <!-- Dashboard cards will be rendered here -->
            </div>
        </div>
    `,e.translateIn(t),document.getElementById(`refresh-stats`)?.addEventListener(`click`,()=>s(t)),await s(t)}async function s(e){let r=document.getElementById(`stats-loading`),i=document.getElementById(`stats-grid`);r&&(r.style.display=`flex`),i&&(i.style.display=`none`);try{let e=await fetch(`${n}/api/admin/stats/dashboard`,{credentials:`include`});if(!e.ok){console.error(`Stats API error:`,e.status,e.statusText),c(i,t(`API error: {0} {1}`,[e.status,e.statusText]));return}let r=await e.json();r.success?(a=r.dashboard,l(i)):c(i,r.message||t(`Failed to load dashboard`))}catch(e){console.error(`Error loading dashboard:`,e),c(i,t(`Failed to connect to server`))}finally{r&&(r.style.display=`none`),i&&(i.style.display=`grid`)}}function c(e,t){e&&(e.innerHTML=`
            <div class="stats-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${t}</p>
            </div>
        `)}function l(t){t&&a&&(t.innerHTML=`
        <!-- Public Usage Card -->
        <div class="stats-card stats-card-primary clickable" data-page="public-usage">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-globe"></i>
                </div>
                <h3 data-i18n="Public Usage">Public Usage</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric">
                    <span class="stats-value">${u(a.publicUsage.totalReads)}</span>
                    <span class="stats-label" data-i18n="Total Activity">Total Activity</span>
                </div>
                <div class="stats-metric-grid">
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.publicUsage.readsToday)}</span>
                        <span class="stats-label-small" data-i18n="Today">Today</span>
                    </div>
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.publicUsage.readsLast7Days)}</span>
                        <span class="stats-label-small" data-i18n="Last 7 Days">Last 7 Days</span>
                    </div>
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.publicUsage.readsLast30Days)}</span>
                        <span class="stats-label-small" data-i18n="Last 30 Days">Last 30 Days</span>
                    </div>
                </div>
            </div>
            <div class="stats-card-footer">
                <span><span data-i18n="Click to view details">Click to view details</span> <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>

        <!-- User Usage Card -->
        <div class="stats-card stats-card-success clickable" data-page="user-usage">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 data-i18n="User Activity">User Activity</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric-row">
                    <div class="stats-metric">
                        <span class="stats-value">${u(a.users.total)}</span>
                        <span class="stats-label" data-i18n="Total Users">Total Users</span>
                    </div>
                    <div class="stats-metric">
                        <span class="stats-value">${u(a.users.activeLast7Days)}</span>
                        <span class="stats-label" data-i18n="Active (7d)">Active (7d)</span>
                    </div>
                </div>
                <div class="stats-metric-grid">
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.userUsage.readsLast7Days)}</span>
                        <span class="stats-label-small" data-i18n="Reads (7d)">Reads (7d)</span>
                    </div>
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.userUsage.editsLast7Days)}</span>
                        <span class="stats-label-small" data-i18n="Edits (7d)">Edits (7d)</span>
                    </div>
                </div>
            </div>
            <div class="stats-card-footer">
                <span><span data-i18n="Click to view details">Click to view details</span> <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>

        <!-- Searches Card -->
        <div class="stats-card stats-card-info clickable" data-page="searches">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3 data-i18n="Searches">Searches</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric">
                    <span class="stats-value">${u(a.searches.total)}</span>
                    <span class="stats-label" data-i18n="Total Searches">Total Searches</span>
                </div>
                <div class="stats-metric-grid">
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.searches.today)}</span>
                        <span class="stats-label-small" data-i18n="Today">Today</span>
                    </div>
                    <div class="stats-metric-small">
                        <span class="stats-value-small">${u(a.searches.last7Days)}</span>
                        <span class="stats-label-small" data-i18n="Last 7 Days">Last 7 Days</span>
                    </div>
                </div>
            </div>
            <div class="stats-card-footer">
                <span><span data-i18n="Click to view details">Click to view details</span> <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>

        <!-- Active Sessions Card -->
        <div class="stats-card stats-card-warning clickable" data-page="sessions">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-desktop"></i>
                </div>
                <h3 data-i18n="Active Sessions">Active Sessions</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric">
                    <span class="stats-value stats-value-large">${u(a.sessions.active)}</span>
                    <span class="stats-label" data-i18n="Currently Active">Currently Active</span>
                </div>
                <p class="stats-hint" data-i18n="Users active in the last 30 minutes">Users active in the last 30 minutes</p>
            </div>
            <div class="stats-card-footer">
                <span><span data-i18n="Click to view details">Click to view details</span> <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>

        <!-- Guest Edits Card -->
        <div class="stats-card stats-card-danger clickable" data-page="guest-edits">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-edit"></i>
                </div>
                <h3 data-i18n="Guest Edits">Guest Edits</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric-row">
                    <div class="stats-metric">
                        <span class="stats-value ${a.guestEdits.pending>0?`stats-value-alert`:``}">${u(a.guestEdits.pending)}</span>
                        <span class="stats-label" data-i18n="Pending Review">Pending Review</span>
                    </div>
                    <div class="stats-metric">
                        <span class="stats-value">${u(a.guestEdits.total)}</span>
                        <span class="stats-label" data-i18n="Total">Total</span>
                    </div>
                </div>
            </div>
            <div class="stats-card-footer">
                <span><span data-i18n="Click to view details">Click to view details</span> <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>

        <!-- Content Card -->
        <div class="stats-card stats-card-secondary">
            <div class="stats-card-header">
                <div class="stats-card-icon">
                    <i class="fas fa-book"></i>
                </div>
                <h3 data-i18n="Content">Content</h3>
            </div>
            <div class="stats-card-body">
                <div class="stats-metric-row">
                    <div class="stats-metric">
                        <span class="stats-value">${u(a.content.works)}</span>
                        <span class="stats-label" data-i18n="Works">Works</span>
                    </div>
                    <div class="stats-metric">
                        <span class="stats-value">${u(a.content.series)}</span>
                        <span class="stats-label" data-i18n="Series">Series</span>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),t.querySelectorAll(`.stats-card.clickable`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-page`);t&&(window.history.pushState({},``,`${n}/admin/stats/${t}`),window.dispatchEvent(new PopStateEvent(`popstate`)))})}))}function u(e){return e>=1e6?(e/1e6).toFixed(1)+`M`:e>=1e3?(e/1e3).toFixed(1)+`K`:e.toLocaleString()}function d(){a=null}export{d as cleanup,o as render};