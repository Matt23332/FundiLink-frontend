<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const token = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const errorMessage = ref('');
const loading = ref(false);
const success = ref(false);

onMounted(() => {
    token.value = route.query.token || '';
    email.value = route.query.email || '';
    if (!token.value || !email.value) {
        errorMessage.value = 'Invalid or missing reset link. Please request a new password reset.';
    }
});

const strength = computed(() => {
    const p = password.value;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Z]a-z0-9]/.test(p)) score++;
    if (/[@$!%*?&]/.test(p)) score++;
    return score;
});

const strengthWidth = computed(() => {
    return ['0%', '20%', '40%', '60%', '80%', '100%'][strength.value];
})

const strengthClass = computed(() => {
    if (strength.value <= 1) return 'weak';
    if (strength.value <= 3) return 'fair';
    if (strength.value <= 5) return 'good';
    return 'strong';
});

const strengthText = computed(() => {
    if (strength.value <= 1) return 'Weak';
    if (strength.value <= 3) return 'Fair';
    if (strength.value <= 5) return 'Good';
    return 'Strong';
})

const handleReset = async () => {
    errorMessage.value = '';
    if (password.value.length < 8) {
        errorMessage.value = 'Password must be at least 8 characters long.';
        return;
    }
    
    if (password.value !== passwordConfirm.value) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }

    loading.value = true;
    try {
        await api.post('/reset-password', {
            token: token.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirm.value,
        });
        success.value = true;
        setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
        const status = err.response?.status;
        if (status === 422) {
            const errors = err.response?.data?.errors;
            if (errors?.token) {
                errorMessage.value = 'Invalid or expired reset link. Kindly request for a new reset link.';
            } else if (errors?.password) {
                errorMessage.value = errors.password[0];
            } else {
                errorMessage.value = err.response?.data?.message || 'Invalid request.';
            }
        } else {
            errorMessage.value = err.response?.data?.message || 'Something went wrong. Please try again.';
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
                <h1 class="panel-title">NEW<br>PASS.<br><em>NEW START.</em></h1>
                <p class="panel-sub">Choose a strong password to keep your FundiLink account secure. You're almost back in.</p>
                <div class="panel-tips">
                    <div class="tip-title">STRONG PASSWORD TIPS</div>
                    <ul class="tip-list">
                        <li>At least 8 characters long</li>
                        <li>Mix of uppercase &amp; lowercase</li>
                        <li>Include numbers or symbols</li>
                        <li>Avoid using your name or email</li>
                    </ul>
                </div>
            </div>
            <div class="deco-lines">
                <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
            </div>
        </div>
 
        <!-- Right Panel -->
        <div class="right-panel">
            <div class="form-card">
 
                <!-- ── Success state ── -->
                <template v-if="success">
                    <div class="success-state">
                        <div class="success-icon">
                            <v-icon icon="mdi-shield-check-outline" class="success-icon-glyph"></v-icon>
                        </div>
                        <div class="form-eyebrow">ALL DONE</div>
                        <h2 class="form-title">PASSWORD<br><em>UPDATED!</em></h2>
                        <div class="form-bar"></div>
                        <p class="form-desc">Your password has been reset successfully. Redirecting you to login…</p>
                        <div class="redirect-note">
                            <div class="redirect-bar"><div class="redirect-progress"></div></div>
                            <span>Redirecting to login…</span>
                        </div>
                        <router-link to="/login" class="submit-btn" style="margin-top:1.5rem; text-decoration:none; justify-content:center;">
                            GO TO LOGIN <span class="submit-arrow"> →</span>
                        </router-link>
                    </div>
                </template>
 
                <!-- ── Reset form ── -->
                <template v-else>
                    <div class="form-header">
                        <div class="form-eyebrow">PASSWORD RESET</div>
                        <h2 class="form-title">SET NEW<br><em>PASSWORD</em></h2>
                        <div class="form-bar"></div>
                        <p class="form-desc">
                            Resetting password for <strong>{{ email }}</strong>
                        </p>
                    </div>
 
                    <form class="form-body" @submit.prevent="handleReset">
 
                        <!-- New Password -->
                        <div class="field-group">
                            <label class="field-label">New Password</label>
                            <div class="field-wrap">
                                <v-icon icon="mdi-lock-outline" class="field-icon"></v-icon>
                                <input
                                    v-model="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    class="field-input"
                                    placeholder="Min. 8 characters"
                                    autocomplete="new-password"
                                />
                                <button type="button" class="field-toggle" @click="showPassword = !showPassword" tabindex="-1">
                                    <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                                </button>
                            </div>
                            <div class="strength-bar">
                                <div class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></div>
                            </div>
                            <div class="strength-label" :class="strengthClass" v-if="password.length">
                                {{ strengthText }}
                            </div>
                        </div>
 
                        <!-- Confirm Password -->
                        <div class="field-group">
                            <label class="field-label">Confirm New Password</label>
                            <div class="field-wrap" :class="{ 'field-wrap--mismatch': passwordConfirm && password !== passwordConfirm }">
                                <v-icon icon="mdi-lock-check-outline" class="field-icon"></v-icon>
                                <input
                                    v-model="passwordConfirm"
                                    :type="showPasswordConfirm ? 'text' : 'password'"
                                    class="field-input"
                                    placeholder="Re-enter your password"
                                    autocomplete="new-password"
                                />
                                <button type="button" class="field-toggle" @click="showPasswordConfirm = !showPasswordConfirm" tabindex="-1">
                                    <v-icon :icon="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                                </button>
                            </div>
                            <div class="match-label match-ok" v-if="passwordConfirm && password === passwordConfirm">
                                <v-icon icon="mdi-check-circle-outline" style="font-size:0.85rem !important;"></v-icon>
                                Passwords match
                            </div>
                            <div class="match-label match-err" v-else-if="passwordConfirm && password !== passwordConfirm">
                                <v-icon icon="mdi-close-circle-outline" style="font-size:0.85rem !important;"></v-icon>
                                Passwords do not match
                            </div>
                        </div>
 
                        <!-- Error banner -->
                        <div v-if="errorMessage" class="error-banner">
                            <v-icon icon="mdi-alert-circle-outline" class="error-icon"></v-icon>
                            <span>{{ errorMessage }}</span>
                            <router-link v-if="errorMessage.includes('expired')" to="/forgot-password" class="error-link">
                                Request new link →
                            </router-link>
                        </div>
 
                        <button
                            type="submit"
                            class="submit-btn"
                            :class="{ 'submit-btn--loading': loading }"
                            :disabled="loading || errorMessage.includes('expired')"
                        >
                            <span v-if="!loading">RESET PASSWORD <span class="submit-arrow">→</span></span>
                            <span v-else class="loading-dots">
                                <span></span><span></span><span></span>
                            </span>
                        </button>
                    </form>
                </template>
 
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
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.login-page {
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
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
 
.left-content { position: relative; z-index: 2; }
 
.brand { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 4rem; }
 
.brand-icon {
    display: grid;
    place-items: center;
    width: 36px; height: 36px;
    background: #4d8ef0;
    color: #060d1a;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
}
 
.brand-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem; font-weight: 900;
    letter-spacing: 0.08em; color: #f0ede6; text-transform: uppercase;
}
 
.brand-name em { color: #4d8ef0; font-style: italic; }
 
.panel-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 900; text-transform: uppercase;
    line-height: 0.92; color: #f0ede6; margin-bottom: 1.5rem;
}
 
.panel-title em { font-style: italic; color: #4d8ef0; }
 
.panel-sub {
    font-size: 0.95rem; font-weight: 300;
    color: rgba(240, 237, 230, 0.5);
    line-height: 1.7; max-width: 320px; margin-bottom: 2.5rem;
}
 
.panel-tips { max-width: 300px; }
 
.tip-title {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.2em; color: rgba(240, 237, 230, 0.35);
    text-transform: uppercase; margin-bottom: 0.75rem;
}
 
.tip-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
 
.tip-list li {
    font-size: 0.82rem; color: rgba(240, 237, 230, 0.5);
    padding-left: 1rem; position: relative;
}
 
.tip-list li::before { content: '–'; position: absolute; left: 0; color: #4d8ef0; }
 
.deco-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
 
.deco-line {
    position: absolute; width: 1px; bottom: -10%; height: 55%;
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

.right-panel {
    display: flex; align-items: center; justify-content: center;
    padding: 3rem 2rem; background: #0d1a2e;
}
 
.form-card { width: 100%; max-width: 440px; }
 
.form-eyebrow {
    font-size: 0.85rem; font-weight: 700;
    letter-spacing: 0.3em; color: #4d8ef0; margin-bottom: 0.75rem;
}
 
.form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 3.2rem; font-weight: 900;
    text-transform: uppercase; line-height: 0.92;
    color: #f0ede6; margin-bottom: 1rem;
}
 
.form-title em { font-style: italic; color: #4d8ef0; }
 
.form-bar { width: 40px; height: 3px; background: #4d8ef0; margin-bottom: 1.5rem; }
 
.form-desc {
    font-size: 0.88rem; font-weight: 300;
    color: rgba(240, 237, 230, 0.5); line-height: 1.7; margin-bottom: 2rem;
}
 
.form-desc strong { color: rgba(240, 237, 230, 0.85); font-weight: 600; }
 
.form-body { display: flex; flex-direction: column; gap: 1.2rem; }
.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
 
.field-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.2em; color: rgba(240, 237, 230, 0.45); text-transform: uppercase;
}
 
.field-wrap {
    position: relative; display: flex; align-items: center;
    background: #0a1628; border: 1px solid rgba(77, 142, 240, 0.15);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
 
.field-wrap:focus-within {
    border-color: #4d8ef0;
    box-shadow: 0 0 0 3px rgba(77, 142, 240, 0.12);
}
 
.field-wrap--mismatch {
    border-color: rgba(255, 96, 96, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(255, 96, 96, 0.08) !important;
}
 
.field-icon {
    color: rgba(240, 237, 230, 0.25);
    font-size: 1.1rem !important; padding: 0 0.75rem; flex-shrink: 0;
}
 
.field-input {
    flex: 1; background: transparent; border: none; outline: none;
    padding: 0.9rem 0.75rem 0.9rem 0; color: #f0ede6;
    font-family: 'Barlow', sans-serif; font-size: 0.95rem;
}
 
.field-input::placeholder { color: rgba(240, 237, 230, 0.2); }
 
.field-toggle {
    background: none; border: none; cursor: pointer;
    padding: 0 0.75rem; color: rgba(240, 237, 230, 0.3);
    display: flex; align-items: center; transition: color 0.2s;
}
 
.field-toggle:hover { color: rgba(240, 237, 230, 0.7); }
.strength-bar { height: 3px; background: rgba(255,255,255,0.07); margin-top: 2px; }
 
.strength-fill { height: 100%; transition: width 0.3s ease, background 0.3s ease; }
.strength-fill.weak   { background: #ff6060; }
.strength-fill.fair   { background: #f0a500; }
.strength-fill.good   { background: #4d8ef0; }
.strength-fill.strong { background: #3ecf6e; }
 
.strength-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
}
.strength-label.weak   { color: #ff6060; }
.strength-label.fair   { color: #f0a500; }
.strength-label.good   { color: #4d8ef0; }
.strength-label.strong { color: #3ecf6e; }
.match-label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 600; }
.match-ok  { color: #3ecf6e; }
.match-err { color: #ff6060; }
 
/* ── ERROR ── */
.error-banner {
    display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    background: rgba(255, 60, 60, 0.1); border: 1px solid rgba(255, 60, 60, 0.3);
    color: #ff6060; padding: 0.75rem 1rem; font-size: 0.82rem;
}
 
.error-icon { color: #ff6060 !important; font-size: 1.1rem !important; flex-shrink: 0; }
 
.error-link {
    color: #4d8ef0; text-decoration: none; font-weight: 600;
    margin-left: auto; white-space: nowrap; transition: opacity 0.2s;
}
.error-link:hover { opacity: 0.75; }
 
/* ── SUBMIT ── */
.submit-btn {
    width: 100%; padding: 1rem; background: #4d8ef0; border: none;
    color: #ffffff; font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; cursor: pointer;
    clip-path: polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%);
    transition: background 0.2s ease, transform 0.15s ease;
    display: flex; align-items: center; justify-content: center;
    min-height: 52px; margin-top: 0.4rem;
}
 
.submit-btn:hover:not(:disabled) { background: #6aa3f5; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-btn--loading { opacity: 0.8; cursor: wait; }
.submit-arrow { transition: transform 0.2s; }
.submit-btn:hover .submit-arrow { transform: translateX(4px); }

.loading-dots { display: flex; gap: 5px; align-items: center; }
 
.loading-dots span {
    width: 6px; height: 6px; background: #ffffff;
    border-radius: 50%; animation: dotBounce 0.9s ease-in-out infinite;
}
 
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
 
@keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40%           { transform: scale(1.2); opacity: 1; }
}
 
/* ── SUCCESS STATE ── */
.success-state { display: flex; flex-direction: column; }
 
.success-icon {
    width: 56px; height: 56px;
    background: rgba(62, 207, 110, 0.1);
    border: 1px solid rgba(62, 207, 110, 0.3);
    display: grid; place-items: center; margin-bottom: 1.5rem;
}
 
.success-icon-glyph { color: #3ecf6e !important; font-size: 1.6rem !important; }
 
.redirect-note { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
 
.redirect-note span { font-size: 0.78rem; color: rgba(240, 237, 230, 0.4); letter-spacing: 0.05em; }
 
.redirect-bar { height: 3px; background: rgba(255,255,255,0.07); }
 
.redirect-progress {
    height: 100%; background: #4d8ef0;
    animation: progressFill 3s linear forwards;
}
 
@keyframes progressFill {
    from { width: 0%; }
    to   { width: 100%; }
}
 
/* ── FOOTER ── */
.form-footer { margin-top: 2rem; text-align: center; }
 
.back-link {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.85rem; font-weight: 600;
    color: rgba(240, 237, 230, 0.45); text-decoration: none;
    letter-spacing: 0.05em; transition: color 0.2s;
}
 
.back-link:hover { color: #4d8ef0; }
.back-arrow { font-size: 1rem !important; transition: transform 0.2s; }
.back-link:hover .back-arrow { transform: translateX(-3px); }
</style>