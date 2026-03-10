<script setup>

import { ref } from 'vue';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

const handleLogin = () => {
    loading.value = true;
    setTimeout(() => { loading.value = false; }, 1800);
}
</script>

<template>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

    <div class="login-page">
        <div class="left-panel">
            <div class="left-content">
                <div class="brand">
                    <span class="brand-icon">M</span>
                    <span class="brand-name">Mac<em>Fit</em></span>
                </div>
                <h1 class="panel-title">TRAIN.<br>PUSH.<br><em>CONQUER.</em></h1>
                <p class="panel-sub">Your fitness journey continues here. Login and get back to work.</p>

                <div class="panel-stats">
                    <div class="pstat">
                        <span class="pstat-num">5K</span>
                        <span class="pstat-label">Members</span>
                    </div>
                    <div class="pstat-divider"></div>
                    <div class="pstat">
                        <span class="pstat-num">20</span>
                        <span class="pstat-label">Classes/Week</span>
                    </div>
                    <div class="pstat-divider"></div>
                    <div class="pstat">
                        <span class="pstat-num">24/7</span>
                        <span class="pstat-label">Access</span>
                    </div>
                </div>
            </div>
            <!--Decorative lines-->
            <div class="deco-lines">
                <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
            </div>
        </div>

        <div class="right-panel">
            <div class="form-card">
                <div class="form-header">
                    <div class="form-eyebrow">MEMBER LOGIN</div>
                    <h2 class="form-title">SIGN INTO<br><em>MacFit</em></h2>
                    <div class="form-bar"></div>
                </div>

                <form class="form-body" @submit.prevent="handleLogin">
                    <div class="field-group">
                        <label class="field-label">Email or Username</label>
                        <div class="field-wrap">
                            <v-icon icon="mdi-account-outline" class="field-icon"></v-icon>
                            <input 
                            v-model="email"
                            type="text"
                            class="field-input"
                            placeholder="username@example.com"
                            autocomplete="username"
                            />
                        </div>
                    </div>
                    <div class="field-group">
                        <label class="field-label">Password</label>
                        <div class="field-wrap">
                            <v-icon icon="mdi-lock-outline" class="field-icon"></v-icon>
                            <input 
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="field-input"
                            placeholder="Enter your password"
                            autocomplete="current-password"
                            />
                            <button type="button" class="field-toggle" @click="showPassword = !showPassword" tabindex="-1">
                                <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                            </button>
                        </div>
                    </div>
                    <div class="form-meta">
                        <label class="remember-label">
                            <input type="checkbox" class="remember-check" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" class="forgot-link">Forgot Password</a>
                    </div>

                    <button type="submit" class="submit-btn" :class="{ 'submit-btn--loading': loading }">
                        <span v-if="!loading">LOGIN<span class="submit-arrow"> →</span></span>
                        <span v-else class="loading-dots">
                            <span></span><span></span><span></span>
                        </span>
                    </button>

                    <div class="form-divider">
                        <span class="divider-line"></span>
                        <span class="divider-text">OR</span>
                        <span class="divider-line"></span>
                    </div>

                    <button type="button" class="google-btn">
                        <v-icon icon="mdi-google" class="google-icon"></v-icon>
                        Sign in with Google
                    </button>
                </form>

                <div class="form-footer">
                    Don't have an account?
                    <router-link to='/signUp' class="signup-link">Sign up free →</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #0a0a0a;
}

@media (max-width: 860px) {
    .login-page { grid-template-columns: 1fr; }
    .left-panel { display: none; }
}

.left-panel {
    position: relative;
    background: #0d0d0d;
    border-right: 1px solid rgba(200, 255, 0, 0.1);
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 4rem;
}

.left-content { position: relative; z-index: 2; }

.brand {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 4rem;
}

.brand-icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    background: #c8ff00;
    color: #0a0a0a;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
}

.brand-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #f0ede6;
    text-transform: uppercase;
}

.brand-name em { color: #c8ff00; font-style: italic; }

.panel-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(3.5rem, 5.5vw, 5.5rem);
    font-weight: 900;
    text-transform: uppercase;
    line-height: 0.92;
    color: #f0ede6;
    margin-bottom: 1.5rem;
}

.panel-title em { font-style: italic; color: #c8ff00; }

.panel-sub {
    font-size: 0.95rem;
    font-weight: 300;
    color: rgba(240, 237, 230, 0.5);
    line-height: 1.7;
    max-width: 320px;
    margin-bottom: 3rem;
}

.panel-stats {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.pstat { display: flex; flex-direction: column; gap: 0.15rem; }

.pstat-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #c8ff00;
    line-height: 1;
}

.pstat-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: rgba(240, 237, 230, 0.5);
    text-transform: uppercase;
}

.pstat-divider {
    width: 1px;
    height: 36px;
    background: rgba(240, 237, 230, 0.1);
}

.deco-lines {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}

.deco-line {
    position: absolute;
    width: 1px;
    bottom: -10%;
    height: 55%;
    background: linear-gradient(to top, rgba(200, 255, 0, 0.12), transparent);
    animation: riseLine 4s ease-in-out infinite alternate;
}

.deco-line:nth-child(1) { left: 12%; height: 40%; }
.deco-line:nth-child(2) { left: 28%; height: 60%; }
.deco-line:nth-child(3) { left: 45%; height: 35%; }
.deco-line:nth-child(4) { left: 62%; height: 55%; }
.deco-line:nth-child(5) { left: 78%; height: 45%; }
.deco-line:nth-child(6) { left: 92%; height: 65%; }

@keyframes riseLine {
  0%   { transform: translateY(0); opacity: 0.4; }
  100% { transform: translateY(-40px); opacity: 1; }
}

/* Right Panel */
.right-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: #0a0a0a;
}

.form-card {
    width: 100%;
    max-width: 440px;
}

.form-eyebrow {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #c8ff00;
    margin-bottom: 0.75rem;
}

.form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 3.2rem;
    font-weight: 900;
    text-transform: uppercase;
    line-height: 0.92;
    color: #f0ede6;
    margin-bottom: 1rem;
}

.form-title em { font-style: italic; color: #c8ff00; }

.form-bar {
    width: 40px;
    height: 3px;
    background: #c8ff00;
    margin-bottom: 2.5rem;
}

/* Fields */
.form-body { display: flex; flex-direction: column; gap: 1.2rem; }
.field-group { display: flex; flex-direction: column; gap: 0.4rem; }

.field-label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(240, 237, 230, 0.45);
    text-transform: uppercase;
}

.field-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-wrap:focus-within {
    border-color: #c8ff00;
    box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.08);
}

.field-icon {
    color: rgba(240, 237, 230, 0.25);
    font-size: 1.1rem !important;
    padding: 0 0.75rem;
    flex-shrink: 0;
}

.field-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.9rem 0.75rem 0.9rem 0;
    color: #f0ede6;
    font-family: 'Barlow', sans-serif;
    font-size: 0.95rem;
}

.field-input::placeholder { color: rgba(240, 237, 230, 0.2); }

.field-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0.75rem;
    color: rgba(240, 237, 230, 0.3);
    display: flex;
    align-items: center;
    transition: color 0.2s;
}

.field-toggle:hover { color: rgba(240, 237, 230, 0.7); }

.form-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -0.2rem;
}

.remember-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: rgba(240, 237, 230, 0.45);
    cursor: pointer;
}

.remember-check {
    accent-color: #c8ff00;
    width: 16px;
    height: 16px;
}

.forgot-link {
    font-size: 0.82rem;
    color: #c8ff00;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
}

.forgot-link:hover { opacity: 0.75; }

.submit-btn {
    width: 100%;
    padding: 1rem;
    background: #c8ff00;
    border: none;
    color: #0a0a0a;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%);
    transition: background 0.2s ease, transform 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    margin-top: 0.4rem;
}

.submit-btn:hover { background: #d9ff33; transform: translateY(-1px); }
.submit-btn--loading { opacity: 0.8; cursor: wait; }
.submit-arrow { transition: transform 0.2s; }
.submit-btn:hover .submit-arrow { transform: translateX(4px); }

.loading-dots {
    display: flex;
    gap: 5px;
    align-items: center;
}

.loading-dots span {
    width: 6px;
    height: 6px;
    background: #0a0a0a;
    border-radius: 50%;
    animation: dotBounce 0.9s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1.2); opacity: 1; }
}

/* Divider */
.form-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
}

.divider-text {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(240, 237, 230, 0.3);
}

.google-btn {
    width: 100%;
    padding: 0.85rem 1rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(240, 237, 230, 0.75);
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: border-color 0.2s ease, background 0.2s ease;
}

.google-btn:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.03);
}

.form-footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.88rem;
    color: rgba(240, 237, 230, 0.4);
}

.signup-link {
    color: #c8ff00;
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.3rem;
    transition: opacity 0.2s;
}

.signup-link:hover { opacity: 0.75; }
</style>