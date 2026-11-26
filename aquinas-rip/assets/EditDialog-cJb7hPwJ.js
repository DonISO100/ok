import{i as e,l as t}from"./i18n-fj3F4Jw9.js";function n(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function r(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function i(e,t){let i=`edit-field-${e.key}`,a=e.readOnly?`disabled`:``,o=``;switch(e.type){case`textarea`:o=`<textarea id="${i}" class="form-control" data-key="${e.key}" rows="${e.rows??3}" ${a} placeholder="${n(e.placeholder??``)}">${r(t)}</textarea>`;break;case`number`:o=`<input type="number" id="${i}" class="form-control" data-key="${e.key}" value="${n(t)}" ${a} placeholder="${n(e.placeholder??``)}" />`;break;case`select`:{let s=(e.options??[]).map(e=>`<option value="${n(e.value)}" ${String(e.value)===String(t??``)?`selected`:``}>${r(e.label)}</option>`).join(``);o=`<select id="${i}" class="form-control" data-key="${e.key}" ${a}>${s}</select>`;break}case`checkbox`:return o=`<label class="edit-checkbox"><input type="checkbox" id="${i}" data-key="${e.key}" ${t?`checked`:``} ${a} /> ${r(e.label)}</label>`,`<div class="form-group form-group-checkbox">${o}</div>`;default:o=`<input type="text" id="${i}" class="form-control" data-key="${e.key}" value="${n(t)}" ${a} placeholder="${n(e.placeholder??``)}" />`}let s=e.hint?`<div class="form-hint">${r(e.hint)}</div>`:``;return`
        <div class="form-group">
            <label for="${i}">${r(e.label)}</label>
            ${o}
            ${s}
        </div>
    `}function a(n){return new Promise(a=>{let o=document.createElement(`div`);o.className=`edit-dialog-backdrop`,o.innerHTML=`
            <div class="edit-dialog" role="dialog" aria-modal="true">
                <div class="edit-dialog-header">
                    <h3>${r(n.title)}</h3>
                    <button type="button" class="edit-dialog-close" aria-label="Close">&times;</button>
                </div>
                <div class="edit-dialog-body">
                    <form class="edit-dialog-form">
                        ${n.fields.map(e=>i(e,n.values[e.key])).join(``)}
                    </form>
                </div>
                <div class="edit-dialog-footer">
                    <button type="button" class="btn btn-secondary edit-dialog-cancel" data-i18n="Cancel">Cancel</button>
                    <button type="button" class="btn btn-primary edit-dialog-save">${r(n.saveLabel??t(`Save`))}</button>
                </div>
            </div>
        `,e.translateIn(o),document.body.appendChild(o);let s=!1,c=e=>{s||(s=!0,document.removeEventListener(`keydown`,u),o.remove(),a(e))},l=()=>{let e={};for(let t of n.fields){let r=o.querySelector(`[data-key="${t.key}"]`);if(!r)e[t.key]=n.values[t.key];else if(t.type===`checkbox`)e[t.key]=r.checked;else if(t.type===`number`){let n=r.value;e[t.key]=n===``?null:Number(n)}else e[t.key]=r.value}return e},u=e=>{e.key===`Escape`&&(e.preventDefault(),c(null))};document.addEventListener(`keydown`,u),o.querySelector(`.edit-dialog-close`)?.addEventListener(`click`,()=>c(null)),o.querySelector(`.edit-dialog-cancel`)?.addEventListener(`click`,()=>c(null)),o.querySelector(`.edit-dialog-save`)?.addEventListener(`click`,()=>c(l())),o.addEventListener(`click`,e=>{e.target===o&&c(null)}),o.querySelector(`.edit-dialog-form [data-key]:not([disabled])`)?.focus()})}export{a as t};