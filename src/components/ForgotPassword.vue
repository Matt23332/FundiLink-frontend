<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const handleSubmit = async () => {
    if (!email.value) {
        errorMessage.value = 'Please enter your email address.';
        return;
    }

    loading.value = true;
    errorMessage.value = '';
    try {
        await api.post('/forgot-password', { email: email.value });
        submitted.value = true;
    } catch (error) {
        if (error.response?.status === 404) {
            errorMessage.value = 'Account with that email address cannot be found.';
        } else {
            errorMessage.value = error.response?.data?.message || 'An error occurred. Please try again.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <div class="login-page">
 
        <!-- Left Panel -->
        <div class="left-panel">
            <div class="left-content">
                <div class="brand">
                    <span class="brand-icon">F</span>
                    <span class="brand-name">Fundi<em>Link</em></span>
                </div>
                <h1 class="panel-title">LOCKED.<br>OUT?<br><em>NO SWEAT.</em></h1>
                <p class="panel-sub">It happens to the best of us. Enter your email and we'll send you a reset link to get back on track.</p>
                <div class="panel-steps">
                    <div class="step">
                        <span class="step-num">01</span>
                        <span class="step-label">Enter your email</span>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step">
                        <span class="step-num">02</span>
                        <span class="step-label">Check your inbox</span>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step">
                        <span class="step-num">03</span>
                        <span class="step-label">Reset & get back</span>
                    </div>
                </div>
            </div>
            <div class="deco-lines">
                <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
            </div>
        </div>
 
        <!-- Right Panel -->
        <div class="right-panel">
            <div class="form-card">
 
                <!-- Step 1: Email form -->
                <template v-if="!submitted">
                    <div class="form-header">
                        <div class="form-eyebrow">ACCOUNT RECOVERY</div>
                        <h2 class="form-title">FORGOT<br><em>PASSWORD?</em></h2>
                        <div class="form-bar"></div>
                        <p class="form-desc">
                            Enter the email address linked to your FundiLink account and we'll send you a password reset link.
                        </p>
                    </div>
 
                    <form class="form-body" @submit.prevent="handleSubmit">
                        <div class="field-group">
                            <label class="field-label">Email Address</label>
                            <div class="field-wrap">
                                <v-icon icon="mdi-email-outline" class="field-icon"></v-icon>
                                <input
                                    v-model="email"
                                    type="email"
                                    class="field-input"
                                    placeholder="username@example.com"
                                    autocomplete="email"
                                />
                            </div>
                        </div>
 
                        <div v-if="errorMessage" class="error-banner">
                            <v-icon icon="mdi-alert-circle-outline" class="error-icon"></v-icon>
                            {{ errorMessage }}
                        </div>
 
                        <button type="submit" class="submit-btn" :class="{ 'submit-btn--loading': loading }">
                            <span v-if="!loading">SEND RESET LINK<span class="submit-arrow"> →</span></span>
                            <span v-else class="loading-dots">
                                <span></span><span></span><span></span>
                            </span>
                        </button>
                    </form>
                </template>
 
                <!-- Step 2: Success state -->
                <template v-else>
                    <div class="success-state">
                        <div class="success-icon">
                            <v-icon icon="mdi-email-check-outline" class="success-icon-glyph"></v-icon>
                        </div>
                        <div class="form-eyebrow">EMAIL SENT</div>
                        <h2 class="form-title">CHECK YOUR<br><em>INBOX</em></h2>
                        <div class="form-bar"></div>
                        <p class="form-desc">
                            We've sent a password reset link to <strong>{{ email }}</strong>.
                            The link will expire in 30 minutes.
                        </p>
                        <div class="success-note">
                            <v-icon icon="mdi-information-outline" class="note-icon"></v-icon>
                            <span>Didn't receive it? Check your spam folder or
                                <button type="button" class="resend-btn" @click="submitted = false">try again</button>.
                            </span>
                        </div>
                    </div>
                </template>
 
                <!-- Back to login -->
                <div class="form-footer">
                    <router-link to="/login" class="back-link">
                        <v-icon icon="mdi-arrow-left" class="back-arrow"></v-icon>
                        Back to Login
                    </router-link>
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
    position: relative;
    background: #060d1a;
}

@media (max-width: 900px) {
    .login-page {
        grid-template-columns: 1fr;
    }
    
    .left-panel {
        display: none;
    }
}

.left-panel {
    position: relative;
    background: #091222;
    border-right: 1px solid rgba(77, 142, 240, 0.15);
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 4rem;
}

left-content { position: relative; z-index: 2; }
 
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
    font-size: clamp(3rem, 5vw, 5rem);
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
 
/* Steps */
.panel-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
}
 
.step {
    display: flex;
    align-items: center;
    gap: 1rem;
}
 
.step-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    color: #4d8ef0;
    line-height: 1;
    min-width: 32px;
}
 
.step-label {
    font-size: 0.82rem;
    font-weight: 500;
    color: rgba(240, 237, 230, 0.6);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
 
.step-connector {
    width: 1px;
    height: 20px;
    background: rgba(77, 142, 240, 0.3);
    margin-left: 15px;
}
 
/* Deco lines */
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
    margin-bottom: 1.5rem;
}
 
.form-desc {
    font-size: 0.88rem;
    font-weight: 300;
    color: rgba(240, 237, 230, 0.5);
    line-height: 1.7;
    margin-bottom: 2rem;
}
 
.form-desc strong { color: rgba(240, 237, 230, 0.85); font-weight: 600; }
 
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
 
/* ── SUCCESS STATE ── */
.success-state {
    display: flex;
    flex-direction: column;
}
 
.success-icon {
    width: 56px;
    height: 56px;
    background: rgba(77, 142, 240, 0.12);
    border: 1px solid rgba(77, 142, 240, 0.3);
    display: grid;
    place-items: center;
    margin-bottom: 1.5rem;
}
 
.success-icon-glyph {
    color: #4d8ef0 !important;
    font-size: 1.6rem !important;
}
 
.success-note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: rgba(77, 142, 240, 0.06);
    border: 1px solid rgba(77, 142, 240, 0.15);
    padding: 0.85rem 1rem;
    font-size: 0.82rem;
    color: rgba(240, 237, 230, 0.55);
    line-height: 1.6;
}
 
.note-icon {
    color: #4d8ef0 !important;
    font-size: 1rem !important;
    flex-shrink: 0;
    margin-top: 1px;
}
 
.resend-btn {
    background: none;
    border: none;
    color: #4d8ef0;
    font-family: 'Barlow', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    transition: opacity 0.2s;
}
 
.resend-btn:hover { opacity: 0.75; }

.form-footer {
    margin-top: 2rem;
    text-align: center;
}
 
.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(240, 237, 230, 0.45);
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
}
 
.back-link:hover { color: #4d8ef0; }
 
.back-arrow {
    font-size: 1rem !important;
    transition: transform 0.2s;
}
 
.back-link:hover .back-arrow { transform: translateX(-3px); }
</style>