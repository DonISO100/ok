import{i as e,l as t,n,p as r}from"./i18n-fj3F4Jw9.js";var i=`${r}/api/user`;async function a(e,t=`GET`,n){let r={method:t,headers:{"Content-Type":`application/json`},credentials:`include`};n&&(r.body=JSON.stringify(n));let a=await fetch(`${i}${e}`,r);if(!a.ok)throw Error(`API request failed: ${a.statusText}`);return a.json()}async function o(e){return a(`/login`,`POST`,e)}async function s(){return a(`/logout`,`POST`)}async function c(e){return a(`/register`,`POST`,e)}async function l(e){return a(`/forgot-password`,`POST`,e)}async function u(e){return a(`/reset-password`,`POST`,e)}async function d(){return a(`/session`,`GET`)}async function f(e){return a(`/change-password`,`POST`,e)}async function p(e){return a(`/preferences`,`POST`,e)}function m(e){window.history.pushState({},``,e),window.dispatchEvent(new PopStateEvent(`popstate`))}function h(){return new URLSearchParams(window.location.search)}function g(e){return/^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(e)}function _(e){return!e||e.length<6?{valid:!1,message:`Password must be at least 6 characters long.`}:{valid:!0}}function v(t){t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Login">Login</h1>
                        <p class="text-muted" data-i18n="Sign in to your account">Sign in to your account</p>
                    </div>

                    <form id="loginForm" class="user-auth-form">
                        <div class="form-group">
                            <label for="email" data-i18n="Email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                class="form-control"
                                placeholder="Enter your email"
                                data-i18n-placeholder="Enter your email"
                                autocomplete="email"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="password" data-i18n="Password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                class="form-control"
                                placeholder="Enter your password"
                                data-i18n-placeholder="Enter your password"
                                autocomplete="current-password"
                                required
                            />
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="rememberMe" checked />
                                <span data-i18n="Remember me">Remember me</span>
                            </label>
                        </div>

                        <div id="loginError" class="error-message" style="display: none;"></div>

                        <button type="submit" id="loginButton" class="btn btn-primary btn-block" data-i18n="Login">
                            Login
                        </button>
                    </form>

                    <div class="user-auth-links">
                        <a href="${r}/user/forgot-password" data-user-link data-i18n="Forgot password?">Forgot password?</a>
                        <span class="separator">|</span>
                        <a href="${r}/user/register" data-user-link data-i18n="Create an account">Create an account</a>
                    </div>

                    <div class="user-auth-footer">
                        <a href="${r}/" class="back-link" data-i18n="← Back to Editor">← Back to Editor</a>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),y()}function y(){let e=document.getElementById(`loginForm`),n=document.getElementById(`email`),i=document.getElementById(`password`),a=document.getElementById(`rememberMe`),s=document.getElementById(`loginButton`),c=document.getElementById(`loginError`),l=localStorage.getItem(`userEmail`);l?(n.value=l,i.focus()):n.focus(),e.addEventListener(`submit`,async e=>{e.preventDefault();let c=n.value.trim(),l=i.value,f=a.checked;if(!c||!l)u(t(`Please enter both email and password.`));else{s.disabled=!0,s.textContent=t(`Logging in...`),d();try{let e=await o({email:c,password:l,rememberMe:f});if(e.success){f?localStorage.setItem(`userEmail`,c):localStorage.removeItem(`userEmail`);let e=new URLSearchParams(window.location.search).get(`returnUrl`);e&&e.startsWith(`/`)&&!e.startsWith(`//`)?window.location.href=e:window.location.href=`${r}/`}else u(e.message?t(e.message):t(`Invalid email or password.`)),s.disabled=!1,s.textContent=t(`Login`)}catch(e){console.error(`Login error:`,e),u(t(`An error occurred. Please try again.`)),s.disabled=!1,s.textContent=t(`Login`)}}}),document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})});function u(e){c.textContent=e,c.style.display=`block`}function d(){c.style.display=`none`}}function b(t){t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Register">Register</h1>
                        <p class="text-muted" data-i18n="Create a new account">Create a new account</p>
                    </div>

                    <form id="registerForm" class="user-auth-form">
                        <div class="form-group">
                            <label for="fullName" data-i18n="Full Name">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                class="form-control"
                                placeholder="Enter your full name"
                                data-i18n-placeholder="Enter your full name"
                                autocomplete="name"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="email" data-i18n="Email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                class="form-control"
                                placeholder="Enter your email"
                                data-i18n-placeholder="Enter your email"
                                autocomplete="email"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="password" data-i18n="Password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                class="form-control"
                                placeholder="Enter your password (min 6 characters)"
                                data-i18n-placeholder="Enter your password (min 6 characters)"
                                autocomplete="new-password"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword" data-i18n="Confirm Password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                class="form-control"
                                placeholder="Confirm your password"
                                data-i18n-placeholder="Confirm your password"
                                autocomplete="new-password"
                                required
                            />
                        </div>

                        <div id="registerError" class="error-message" style="display: none;"></div>
                        <div id="registerSuccess" class="success-message" style="display: none;"></div>

                        <button type="submit" id="registerButton" class="btn btn-success btn-block" data-i18n="Create Account">
                            Create Account
                        </button>
                    </form>

                    <div class="user-auth-links">
                        <span data-i18n="Already have an account?">Already have an account?</span>
                        <a href="${r}/user/login" data-user-link data-i18n="Login here">Login here</a>
                    </div>

                    <div class="user-auth-footer">
                        <a href="${r}/" class="back-link" data-i18n="← Back to Editor">← Back to Editor</a>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),x()}function x(){let e=document.getElementById(`registerForm`),n=document.getElementById(`fullName`),i=document.getElementById(`email`),a=document.getElementById(`password`),o=document.getElementById(`confirmPassword`),s=document.getElementById(`registerButton`),l=document.getElementById(`registerError`),u=document.getElementById(`registerSuccess`);n.focus(),e.addEventListener(`submit`,async e=>{e.preventDefault();let l=n.value.trim(),u=i.value.trim(),m=a.value,v=o.value;if(!l||l.length<2){d(t(`Please enter your full name (at least 2 characters).`));return}if(!g(u)){d(t(`Please enter a valid email address.`));return}let y=_(m);if(!y.valid)d(y.message||t(`Invalid password.`));else if(m!==v)d(t(`Passwords do not match.`));else{s.disabled=!0,s.textContent=t(`Creating account...`),f(),h();try{let e=await c({email:u,password:m,confirmPassword:v,fullName:l});e.success?(p(e.message||t(`Registration successful! Redirecting...`)),setTimeout(()=>{window.location.href=`${r}/`},2e3)):(d(e.message||t(`Registration failed. Please try again.`)),s.disabled=!1,s.textContent=t(`Create Account`))}catch(e){console.error(`Registration error:`,e),d(t(`An error occurred. Please try again.`)),s.disabled=!1,s.textContent=t(`Create Account`)}}}),document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})});function d(e){l.textContent=e,l.style.display=`block`,u.style.display=`none`}function f(){l.style.display=`none`}function p(e){u.textContent=e,u.style.display=`block`,l.style.display=`none`}function h(){u.style.display=`none`}}function S(t){t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Forgot Password">Forgot Password</h1>
                        <p class="text-muted" data-i18n="Enter your email to receive a password reset link">Enter your email to receive a password reset link</p>
                    </div>

                    <form id="forgotPasswordForm" class="user-auth-form">
                        <div class="form-group">
                            <label for="email" data-i18n="Email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                class="form-control"
                                placeholder="Enter your email"
                                data-i18n-placeholder="Enter your email"
                                autocomplete="email"
                                required
                            />
                        </div>

                        <div id="forgotPasswordError" class="error-message" style="display: none;"></div>
                        <div id="forgotPasswordSuccess" class="success-message" style="display: none;"></div>

                        <button type="submit" id="forgotPasswordButton" class="btn btn-primary btn-block" data-i18n="Send Reset Link">
                            Send Reset Link
                        </button>
                    </form>

                    <div class="user-auth-links">
                        <a href="${r}/user/login" data-user-link data-i18n="← Back to Login">← Back to Login</a>
                    </div>

                    <div class="user-auth-footer">
                        <a href="${r}/" class="back-link" data-i18n="← Back to Editor">← Back to Editor</a>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),C()}function C(){let e=document.getElementById(`forgotPasswordForm`),n=document.getElementById(`email`),r=document.getElementById(`forgotPasswordButton`),i=document.getElementById(`forgotPasswordError`),a=document.getElementById(`forgotPasswordSuccess`);n.focus(),e.addEventListener(`submit`,async e=>{e.preventDefault();let i=n.value.trim();if(!g(i))o(t(`Please enter a valid email address.`));else{r.disabled=!0,r.textContent=t(`Sending...`),s(),u();try{let e=await l({email:i});e.success?(c(e.message||t(`If an account with that email exists, a password reset link has been sent.`)),r.textContent=t(`Email Sent`)):(o(e.message||t(`An error occurred. Please try again.`)),r.disabled=!1,r.textContent=t(`Send Reset Link`))}catch(e){console.error(`Forgot password error:`,e),o(t(`An error occurred. Please try again.`)),r.disabled=!1,r.textContent=t(`Send Reset Link`)}}}),document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})});function o(e){i.textContent=e,i.style.display=`block`,a.style.display=`none`}function s(){i.style.display=`none`}function c(e){a.textContent=e,a.style.display=`block`,i.style.display=`none`}function u(){a.style.display=`none`}}function w(t){let n=h(),i=n.get(`code`)||``,a=n.get(`email`)||``;i?(t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Reset Password">Reset Password</h1>
                        <p class="text-muted" data-i18n="Enter your new password">Enter your new password</p>
                    </div>
                    
                    <form id="resetPasswordForm" class="user-auth-form">
                        <input type="hidden" id="code" value="${T(i)}" />
                        
                        <div class="form-group">
                            <label for="email" data-i18n="Email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                class="form-control"
                                placeholder="Enter your email"
                                data-i18n-placeholder="Enter your email"
                                autocomplete="email"
                                value="${T(a)}"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="password" data-i18n="New Password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                class="form-control"
                                placeholder="Enter new password (min 6 characters)"
                                data-i18n-placeholder="Enter new password (min 6 characters)"
                                autocomplete="new-password"
                                required 
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword" data-i18n="Confirm Password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                class="form-control"
                                placeholder="Confirm your new password"
                                data-i18n-placeholder="Confirm your new password"
                                autocomplete="new-password"
                                required 
                            />
                        </div>
                        
                        <div id="resetPasswordError" class="error-message" style="display: none;"></div>
                        <div id="resetPasswordSuccess" class="success-message" style="display: none;"></div>
                        
                        <button type="submit" id="resetPasswordButton" class="btn btn-primary btn-block" data-i18n="Reset Password">
                            Reset Password
                        </button>
                    </form>

                    <div class="user-auth-links">
                        <a href="${r}/user/login" data-user-link data-i18n="← Back to Login">← Back to Login</a>
                    </div>

                    <div class="user-auth-footer">
                        <a href="${r}/" class="back-link" data-i18n="← Back to Editor">← Back to Editor</a>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),D()):(t.innerHTML=`
            <div class="user-container">
                <div class="user-auth-page">
                    <div class="user-auth-card">
                        <div class="user-auth-header">
                            <h1 data-i18n="Invalid Reset Link">Invalid Reset Link</h1>
                            <p class="text-muted" data-i18n="The password reset link is invalid or has expired.">The password reset link is invalid or has expired.</p>
                        </div>

                        <div class="user-auth-links">
                            <a href="${r}/user/forgot-password" data-user-link data-i18n="Request a new reset link">Request a new reset link</a>
                        </div>

                        <div class="user-auth-footer">
                            <a href="${r}/" class="back-link" data-i18n="← Back to Editor">← Back to Editor</a>
                        </div>
                    </div>
                </div>
            </div>
        `,e.translateIn(t),E())}function T(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function E(){document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})})}function D(){let e=document.getElementById(`resetPasswordForm`),n=document.getElementById(`code`),i=document.getElementById(`email`),a=document.getElementById(`password`),o=document.getElementById(`confirmPassword`),s=document.getElementById(`resetPasswordButton`),c=document.getElementById(`resetPasswordError`),l=document.getElementById(`resetPasswordSuccess`);i.value?a.focus():i.focus(),e.addEventListener(`submit`,async e=>{e.preventDefault();let c=n.value,l=i.value.trim(),v=a.value,y=o.value;if(!g(l)){d(t(`Please enter a valid email address.`));return}let b=_(v);if(!b.valid)d(b.message||t(`Invalid password.`));else if(v!==y)d(t(`Passwords do not match.`));else{s.disabled=!0,s.textContent=t(`Resetting...`),f(),h();try{let e=await u({email:l,password:v,confirmPassword:y,code:c});e.success?(p(e.message||t(`Password has been reset successfully. Redirecting to login...`)),setTimeout(()=>{m(`${r}/user/login`)},2e3)):(d(e.message||t(`Password reset failed. Please try again.`)),s.disabled=!1,s.textContent=t(`Reset Password`))}catch(e){console.error(`Reset password error:`,e),d(t(`An error occurred. Please try again.`)),s.disabled=!1,s.textContent=t(`Reset Password`)}}}),E();function d(e){c.textContent=e,c.style.display=`block`,l.style.display=`none`}function f(){c.style.display=`none`}function p(e){l.textContent=e,l.style.display=`block`,c.style.display=`none`}function h(){l.style.display=`none`}}function O(t){t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Logging out...">Logging out...</h1>
                        <p class="text-muted" data-i18n="Please wait while we log you out.">Please wait while we log you out.</p>
                    </div>
                    
                    <div class="logout-spinner">
                        <div class="spinner"></div>
                    </div>
                    
                    <div id="logoutError" class="error-message" style="display: none;"></div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),k()}async function k(){let e=document.getElementById(`logoutError`),n=document.querySelector(`.user-auth-header h1`),i=document.querySelector(`.user-auth-header .text-muted`),a=document.querySelector(`.logout-spinner`);try{let o=await s();o.success?(n&&(n.textContent=t(`Logged out`)),i&&(i.textContent=t(`You have been logged out successfully. Redirecting...`)),a&&(a.style.display=`none`),localStorage.removeItem(`userSession`),setTimeout(()=>{window.location.href=`${r}/user/login`},1500)):(n&&(n.textContent=t(`Logout Failed`)),i&&(i.textContent=t(`An error occurred while logging out.`)),a&&(a.style.display=`none`),e&&(e.textContent=o.message||t(`Please try again.`),e.style.display=`block`))}catch(r){console.error(`Logout error:`,r),n&&(n.textContent=t(`Logout Failed`)),i&&(i.textContent=t(`An error occurred while logging out.`)),a&&(a.style.display=`none`),e&&(e.textContent=t(`An error occurred. Please try again.`),e.style.display=`block`)}}function A(t){t.innerHTML=`
        <div class="user-container">
            <header class="user-header">
                <h1 data-i18n="User Profile">User Profile</h1>
                <nav class="user-nav">
                    <a href="${r}/" data-i18n="← Back to Editor">← Back to Editor</a>
                </nav>
            </header>
            <main class="user-content">
                <div id="profileContent" class="profile-loading">
                    <div class="spinner"></div>
                    <p data-i18n="Loading profile...">Loading profile...</p>
                </div>
            </main>
        </div>
    `,e.translateIn(t),j()}async function j(){let e=document.getElementById(`profileContent`);try{let t=await d();t.success&&t.user?ee(e,t.user):M(e)}catch(t){console.error(`Profile load error:`,t),M(e)}}function ee(t,n){t.className=`profile-content`,t.innerHTML=`
        <div class="profile-card">
            <div class="profile-avatar">
                <span class="avatar-initials">${P(n.fullName)}</span>
            </div>
            <div class="profile-info">
                <h2>${F(n.fullName)}</h2>
                <p class="profile-email">${F(n.email)}</p>
            </div>
        </div>
        
        <div class="profile-sections">
            <section class="profile-section">
                <h3 data-i18n="Account Settings">Account Settings</h3>
                <ul class="profile-menu">
                    <li>
                        <a href="${r}/user/change-password" data-user-link>
                            <span class="menu-icon">🔒</span>
                            <span class="menu-text" data-i18n="Change Password">Change Password</span>
                        </a>
                    </li>
                    <li>
                        <a href="${r}/user/preferences" data-user-link>
                            <span class="menu-icon">⚙️</span>
                            <span class="menu-text" data-i18n="Preferences">Preferences</span>
                        </a>
                    </li>
                </ul>
            </section>

            <section class="profile-section">
                <h3 data-i18n="Session">Session</h3>
                <ul class="profile-menu">
                    <li>
                        <a href="${r}/user/logout" data-user-link class="logout-link">
                            <span class="menu-icon">🚪</span>
                            <span class="menu-text" data-i18n="Logout">Logout</span>
                        </a>
                    </li>
                </ul>
            </section>
        </div>
    `,e.translateIn(t),N()}function M(t){t.className=`profile-content`,t.innerHTML=`
        <div class="user-placeholder">
            <h2 data-i18n="Welcome">Welcome</h2>
            <p data-i18n="Please log in to access your profile and settings.">Please log in to access your profile and settings.</p>

            <div class="auth-buttons">
                <a href="${r}/user/login" data-user-link class="btn btn-primary" data-i18n="Login">Login</a>
                <a href="${r}/user/register" data-user-link class="btn btn-secondary" data-i18n="Create Account">Create Account</a>
            </div>
        </div>
    `,e.translateIn(t),N()}function N(){document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})})}function P(e){if(!e)return`?`;let t=e.trim().split(` `);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.substring(0,2).toUpperCase()}function F(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function I(t){t.innerHTML=`
        <div class="user-container">
            <div class="user-auth-page">
                <div class="user-auth-card">
                    <div class="user-auth-header">
                        <h1 data-i18n="Change Password">Change Password</h1>
                        <p class="text-muted" data-i18n="Update your account password">Update your account password</p>
                    </div>

                    <div id="pageContent" class="profile-loading">
                        <div class="spinner"></div>
                        <p data-i18n="Loading...">Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    `,e.translateIn(t),L()}async function L(){let e=document.getElementById(`pageContent`);try{let t=await d();t.success&&t.user?R(e):z(e)}catch(t){console.error(`Session check error:`,t),z(e)}}function R(t){t.className=``,t.innerHTML=`
        <form id="changePasswordForm" class="user-auth-form">
            <div class="form-group">
                <label for="currentPassword" data-i18n="Current Password">Current Password</label>
                <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    class="form-control"
                    placeholder="Enter your current password"
                    data-i18n-placeholder="Enter your current password"
                    autocomplete="current-password"
                    required
                />
            </div>

            <div class="form-group">
                <label for="newPassword" data-i18n="New Password">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    class="form-control"
                    placeholder="Enter new password (min 6 characters)"
                    data-i18n-placeholder="Enter new password (min 6 characters)"
                    autocomplete="new-password"
                    required
                />
            </div>

            <div class="form-group">
                <label for="confirmPassword" data-i18n="Confirm New Password">Confirm New Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    class="form-control"
                    placeholder="Confirm your new password"
                    data-i18n-placeholder="Confirm your new password"
                    autocomplete="new-password"
                    required
                />
            </div>

            <div id="changePasswordError" class="error-message" style="display: none;"></div>
            <div id="changePasswordSuccess" class="success-message" style="display: none;"></div>

            <button type="submit" id="changePasswordButton" class="btn btn-primary btn-block" data-i18n="Change Password">
                Change Password
            </button>
        </form>

        <div class="user-auth-links">
            <a href="${r}/user/profile" data-user-link data-i18n="← Back to Profile">← Back to Profile</a>
        </div>
    `,e.translateIn(t),B()}function z(t){t.className=``,t.innerHTML=`
        <div class="user-placeholder">
            <p data-i18n="You must be logged in to change your password.">You must be logged in to change your password.</p>
            <div class="auth-buttons">
                <a href="${r}/user/login" data-user-link class="btn btn-primary" data-i18n="Login">Login</a>
            </div>
        </div>
    `,e.translateIn(t),V()}function B(){let e=document.getElementById(`changePasswordForm`),n=document.getElementById(`currentPassword`),i=document.getElementById(`newPassword`),a=document.getElementById(`confirmPassword`),o=document.getElementById(`changePasswordError`),s=document.getElementById(`changePasswordSuccess`),c=document.getElementById(`changePasswordButton`);V(),e.addEventListener(`submit`,async l=>{l.preventDefault(),o.style.display=`none`,s.style.display=`none`;let u=n.value.trim(),d=i.value,p=a.value;if(!u){H(o,t(`Please enter your current password.`)),n.focus();return}let h=_(d);if(!h.valid)H(o,h.message||t(`Invalid password.`)),i.focus();else if(d!==p)H(o,t(`New passwords do not match.`)),a.focus();else if(u===d)H(o,t(`New password must be different from current password.`)),i.focus();else{c.disabled=!0,c.textContent=t(`Changing Password...`);try{let n=await f({currentPassword:u,newPassword:d,confirmPassword:p});n.success?(s.textContent=t(`Password changed successfully!`),s.style.display=`block`,e.reset(),setTimeout(()=>{m(`${r}/user/profile`)},2e3)):H(o,n.message||t(`Failed to change password. Please try again.`))}catch(e){console.error(`Change password error:`,e),H(o,t(`An error occurred. Please try again.`))}finally{c.disabled=!1,c.textContent=t(`Change Password`)}}})}function V(){document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})})}function H(e,t){e.textContent=t,e.style.display=`block`}function U(t){t.innerHTML=`
        <div class="user-container">
            <header class="user-header">
                <h1 data-i18n="Preferences">Preferences</h1>
                <nav class="user-nav">
                    <a href="${r}/user/profile" data-user-link data-i18n="← Back to Profile">← Back to Profile</a>
                </nav>
            </header>
            <main class="user-content">
                <div id="preferencesContent" class="profile-loading">
                    <div class="spinner"></div>
                    <p data-i18n="Loading preferences...">Loading preferences...</p>
                </div>
            </main>
        </div>
    `,e.translateIn(t),Y(),W()}async function W(){let e=document.getElementById(`preferencesContent`);try{let t=await d();if(!t.success||!t.user){K(e);return}let n=t.user;G(e,{fullName:n.fullName})}catch(t){console.error(`Preferences load error:`,t),q(e)}}function G(t,n){t.className=`preferences-content`,t.innerHTML=`
        <form id="preferencesForm" class="preferences-form">
            <section class="preferences-section">
                <h3 data-i18n="Profile">Profile</h3>

                <div class="form-group">
                    <label for="fullName" data-i18n="Full Name">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        class="form-control"
                        placeholder="Enter your full name"
                        data-i18n-placeholder="Enter your full name"
                        value="${Z(n.fullName||``)}"
                        required
                    />
                </div>
            </section>

            <div id="preferencesError" class="error-message" style="display: none;"></div>
            <div id="preferencesSuccess" class="success-message" style="display: none;"></div>

            <div class="form-actions">
                <button type="submit" id="savePreferencesButton" class="btn btn-primary" data-i18n="Save">
                    Save
                </button>
            </div>
        </form>
    `,e.translateIn(t),J()}function K(t){t.className=``,t.innerHTML=`
        <div class="user-placeholder">
            <p data-i18n="You must be logged in to view preferences.">You must be logged in to view preferences.</p>
            <div class="auth-buttons">
                <a href="${r}/user/login" data-user-link class="btn btn-primary" data-i18n="Login">Login</a>
            </div>
        </div>
    `,e.translateIn(t),Y()}function q(t){t.className=``,t.innerHTML=`
        <div class="user-placeholder">
            <p data-i18n="Failed to load preferences. Please try again.">Failed to load preferences. Please try again.</p>
            <div class="auth-buttons">
                <button onclick="location.reload()" class="btn btn-primary" data-i18n="Retry">Retry</button>
            </div>
        </div>
    `,e.translateIn(t)}function J(){let e=document.getElementById(`preferencesForm`),n=document.getElementById(`preferencesError`),r=document.getElementById(`preferencesSuccess`),i=document.getElementById(`savePreferencesButton`);e.addEventListener(`submit`,async e=>{e.preventDefault(),n.style.display=`none`,r.style.display=`none`;let a=document.getElementById(`fullName`).value.trim();if(!a){X(n,t(`Full name is required.`));return}let o={fullName:a};i.disabled=!0,i.textContent=t(`Saving...`);try{let e=await p(o);e.success?(r.textContent=t(`Name updated successfully!`),r.style.display=`block`):X(n,e.message||t(`Failed to update name.`))}catch(e){console.error(`Save preferences error:`,e),X(n,t(`An error occurred. Please try again.`))}finally{i.disabled=!1,i.textContent=t(`Save`)}})}function Y(){document.querySelectorAll(`[data-user-link]`).forEach(e=>{e.addEventListener(`click`,e=>{e.preventDefault();let t=e.currentTarget.getAttribute(`href`);t&&m(t)})})}function X(e,t){e.textContent=t,e.style.display=`block`}function Z(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function Q(){return window.location.pathname.replace(/^\/user\/?/,``)||`profile`}function $(){let t=Q(),r=document.getElementById(`app`);if(!r)return;switch(t){case`login`:v(r);break;case`register`:b(r);break;case`forgot-password`:S(r);break;case`reset-password`:w(r);break;case`logout`:O(r);break;case`change-password`:I(r);break;case`preferences`:U(r);break;default:A(r)}let i=r.querySelector(`.user-container`);if(i&&!i.querySelector(`.user-lang-bar`)){let e=document.createElement(`div`);e.className=`user-lang-bar`,e.appendChild(n(`lang-select`)),i.prepend(e)}e.translateIn(r)}async function te(){console.log(`User module loading...`),$();let e=()=>{window.location.pathname.startsWith(`${r}/user`)&&$()};return window.addEventListener(`popstate`,e),console.log(`User module initialized`),()=>{console.log(`User module cleanup`),window.removeEventListener(`popstate`,e)}}export{te as init};