<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
        const { data } = await api.post('/login', {
            email: email.value,
            password: password.value,
        });

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        router.push('/homePage');
    } catch (err) {
        console.log(err.response?.data);
        if (err.response?.status === 401) {
            errorMessage.value =  'Invalid email or password.';
        } else if (err.response?.status === 403) {
            errorMessage.value = 'Please verify your email before logging in.';
        } else {
            errorMessage.value = err.response?.data?.message || 'Something went wrong.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

    <div class="login-page">
        <div class="left-panel">
            <div class="left-content">
                <div class="brand">
                    <span class="brand-icon">F</span>
                    <span class="brand-name">Fundi<em>Link</em></span>
                </div>
                <h1 class="panel-title">SEARCH.<br>FIND.<br><em>GET SERVICE.</em></h1>
                <p class="panel-sub">Your services journey continues here. Login and get back to work.</p>

                <div class="panel-stats">
                    <div class="pstat">
                        <span class="pstat-num">1K</span>
                        <span class="pstat-label">Users</span>
                    </div>
                    <div class="pstat-divider"></div>
                    <div class="pstat">
                        <span class="pstat-num">20</span>
                        <span class="pstat-label">Services</span>
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
                    <div class="form-eyebrow">LOGIN FORM</div>
                    <h2 class="form-title">SIGN INTO<br><em>FundiLink</em></h2>
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

                    <div v-if="errorMessage" class="error-banner">
                        <v-icon icon="mdi-alert-cirlce-outline" class="error-icon"></v-icon>
                        {{ errorMessage }}
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
 
/* ── Navy blue palette ── */
/* --navy-darkest : #060d1a  (page background)          */
/* --navy-dark    : #091222  (left panel background)    */
/* --navy-mid     : #0d1a2e  (right panel background)   */
/* --navy-input   : #0a1628  (input background)         */
/* --accent       : #4d8ef0  (primary accent — sky blue)*/
/* --accent-hover : #6aa3f5                             */
 
.login-page {
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #060d1a;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    overflow-x: hidden;
}
 
@media (max-width: 860px) {
    .login-page { grid-template-columns: 1fr; }
    .left-panel { display: none; }
}
 
/* ── LEFT PANEL ── */
.left-panel {
    position: relative;
    background: #091222;
    border-right: 1px solid rgba(77, 142, 240, 0.15);
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
    background: #4d8ef0;
    color: #060d1a;
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
 
.brand-name em { color: #4d8ef0; font-style: italic; }
 
.panel-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(3.5rem, 5.5vw, 5.5rem);
    font-weight: 900;
    text-transform: uppercase;
    line-height: 0.92;
    color: #f0ede6;
    margin-bottom: 1.5rem;
}
 
.panel-title em { font-style: italic; color: #4d8ef0; }
 
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
    color: #4d8ef0;
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
 
/* Decorative lines */
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
    background: linear-gradient(to top, rgba(77, 142, 240, 0.2), transparent);
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
 
/* ── RIGHT PANEL ── */
.right-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: #0d1a2e;
}
 
.form-card {
    width: 100%;
    max-width: 440px;
}
 
.form-eyebrow {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #4d8ef0;
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
 
.form-title em { font-style: italic; color: #4d8ef0; }
 
.form-bar {
    width: 40px;
    height: 3px;
    background: #4d8ef0;
    margin-bottom: 2.5rem;
}
 
/* ── FIELDS ── */
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
    background: #0a1628;
    border: 1px solid rgba(77, 142, 240, 0.15);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
 
.field-wrap:focus-within {
    border-color: #4d8ef0;
    box-shadow: 0 0 0 3px rgba(77, 142, 240, 0.12);
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
 
/* ── META ROW ── */
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
    accent-color: #4d8ef0;
    width: 16px;
    height: 16px;
}
 
.forgot-link {
    font-size: 0.82rem;
    color: #4d8ef0;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
}
 
.forgot-link:hover { opacity: 0.75; }
 
/* ── ERROR ── */
.error-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 60, 60, 0.1);
    border: 1px solid rgba(255, 60, 60, 0.3);
    color: #ff6060;
    padding: 0.75rem 1rem;
    font-size: 0.82rem;
}
 
.error-icon {
    color: #ff6060 !important;
    font-size: 1.1rem !important;
    flex-shrink: 0;
}
 
/* ── SUBMIT ── */
.submit-btn {
    width: 100%;
    padding: 1rem;
    background: #4d8ef0;
    border: none;
    color: #ffffff;
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
 
.submit-btn:hover { background: #6aa3f5; transform: translateY(-1px); }
.submit-btn--loading { opacity: 0.8; cursor: wait; }
.submit-arrow { transition: transform 0.2s; }
.submit-btn:hover .submit-arrow { transform: translateX(4px); }
 
/* ── LOADING DOTS ── */
.loading-dots {
    display: flex;
    gap: 5px;
    align-items: center;
}
 
.loading-dots span {
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 50%;
    animation: dotBounce 0.9s ease-in-out infinite;
}
 
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
 
@keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1.2); opacity: 1; }
}
 
/* ── DIVIDER ── */
.form-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
 
.divider-line {
    flex: 1;
    height: 1px;
    background: rgba(77, 142, 240, 0.1);
}
 
.divider-text {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(240, 237, 230, 0.3);
}
 
/* ── GOOGLE BTN ── */
.google-btn {
    width: 100%;
    padding: 0.85rem 1rem;
    background: transparent;
    border: 1px solid rgba(77, 142, 240, 0.2);
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
    border-color: rgba(77, 142, 240, 0.45);
    background: rgba(77, 142, 240, 0.05);
}
 
/* ── FOOTER ── */
.form-footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.88rem;
    color: rgba(240, 237, 230, 0.4);
}
 
.signup-link {
    color: #4d8ef0;
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.3rem;
    transition: opacity 0.2s;
}
 
.signup-link:hover { opacity: 0.75; }
</style>