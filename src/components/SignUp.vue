<script setup>

import { ref, computed } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const errors = ref({});
const serverError = ref('');

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    password: '',
    confirmPassword: '',
});

const showPassword = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const agreed = ref(false);

const roles = ['Customer', 'Provider'];
const step = ref(1);
const totalSteps = 2;
const stepLabels = ['Personal Info', 'Security'];
const passwordStrength = computed(() => {
    const p = form.value.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
})

const strengthLabel = computed(() => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength.value];
})

const strengthColor = computed(() => {
    const colors = ['', '#ff4444', '#ffaa00', '#88cc00', '#4d8ef0']
    return colors[passwordStrength.value];
})

const passwordMatch = computed(() =>
    form.value.confirmPassword && form.value.password === form.value.confirmPassword
)

const handleSubmit = async () => {
    loading.value = true;
    errors.value = {};
    serverError.value = '';

    try {
      const payload = new FormData()
      payload.append('name', `${form.value.firstName} ${form.value.lastName}`)
      payload.append('email', form.value.email)
      payload.append('phone', form.value.phone)
      payload.append('password', form.value.password)
      payload.append('confirm_password', form.value.confirmPassword)
      payload.append('role', form.value.role)
      payload.append('address', form.value.address)

      const { data } = await api.post('/register', payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/login');
    } catch (err) {
      console.log(err.response.data)
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {};
      } else {
        serverError.value = err.response?.data?.message ?? 'Something went wrong. Please try again.';
      }
    } finally {
      loading.value = false;
    }
}

const nextStep = () => { if (step.value < totalSteps) step.value++ }
const prevStep = () => { if (step.value > 1) step.value-- }

</script>

<template>
    <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap"
        rel="stylesheet" />

    <div class="signup-page">
        <div class="left-panel">
            <div class="left-content">
                <div class="brand">
                    <span class="brand-icon">F</span>
                    <span class="brand-name">Fundi<em>Link</em></span>
                </div>
                <h1 class="panel-title">SEARCH.<br>FIND.<br><em>GET SERVICE.</em></h1>
                <p class="panel-sub">Your services journey continues here. Sign up and begin your journey.</p>

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

        <!-- Right Panel -->
        <div class="right-panel">
            <div class="form-card">

                <!--Header-->
                <div class="form-header">
                    <div class="form-eyebrow">MEMBER SIGNUP</div>
                    <h2 class="form-title">SIGN UP<br>FOR <em>FundiLink</em></h2>
                    <div class="form-bar"></div>
                </div>

                <!--Step Indicator-->
                <div class="step-indicator">
                    <div v-for="(label, i) in stepLabels" :key="i" class="step-item" :class="{
                        'step-item--active': step === i + 1,
                        'step-item--done': step > i + 1
                    }">
                        <div class="step-bubble">
                            <span v-if="step > i + 1">✓</span>
                            <span v-else>{{ i + 1 }}</span>
                        </div>
                        <span class="step-label">{{ label }}</span>
                        <div v-if="i < stepLabels.length - 1" class="step-connector"></div>
                    </div>
                </div>

                <div v-if="serverError" class="server-error">{{ serverError }}</div>
                <form @submit.prevent="handleSubmit">

                    <!--Step 1: Personal Information-->
                    <div v-show="step === 1" class="form-step">
                        <div class="field-row">
                            <div class="field-group">
                                <label class="field-label">First Name</label>
                                <div class="field-wrap">
                                    <v-icon icon="mdi-account-outline" class="field-icon"></v-icon>
                                    <input v-model="form.firstName" type="text" class="field-input"
                                        placeholder="First Name" />
                                </div>
                            </div>
                            <div class="field-group">
                                <label class="field-label">Last Name</label>
                                <div class="field-wrap">
                                    <v-icon icon="mdi-account-outline" class="field-icon"></v-icon>
                                    <input v-model="form.lastName" type="text" class="field-input"
                                        placeholder="Last Name" />
                                </div>
                            </div>
                            <div class="field-group">
                                <label class="field-label">Email Address</label>
                                <div class="field-wrap">
                                    <v-icon icon="mdi-email-outline" class="field-icon"></v-icon>
                                    <input v-model="form.email" type="email" class="field-input"
                                        placeholder="Email Address" />
                                </div>
                                <span v-if="errors.email" class="mismatch-text">{{ errors.email[0] }}</span>
                            </div>
                            <div class="field-group">
                                <label class="field-label">Phone Number</label>
                                <div class="field-wrap">
                                    <v-icon icon="mdi-phone-outline" class="field-icon"></v-icon>
                                    <input v-model="form.phone" type="text" class="field-input"
                                        placeholder="Phone Number" />
                                </div>
                                <span v-if="errors.phone" class="mismatch-text">{{ errors.phone[0] }}</span>
                            </div>
                            <div class="field-row">
                                <div class="field-group">
                                    <label class="field-label">Role</label>
                                    <div class="field-wrap field-wrap--select">
                                        <v-icon icon="mdi-account-outline" class="field-icon"></v-icon>
                                        <select v-model="form.role" class="field-input field-select">
                                            <option value="" disabled>Select Role</option>
                                            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                                        </select>
                                        <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
                                    </div>
                                </div>
                                <div class="field-group">
                                    <label class="field-label">Address</label>
                                    <div class="field-wrap">
                                        <v-icon icon="mdi-map-marker-outline" class="field-icon"></v-icon>
                                        <input v-model="form.address" type="text" class="field-input"
                                            placeholder="Address" />
                                        <span v-if="errors.address" class="mismatch-text">{{ errors.address[0] }}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="button" class="submit-btn" @click="nextStep">NEXT: SECURITY
                                <span class="submit-arrow">→</span>
                            </button>
                        </div>
                    </div>

                    <!--Step 2: Security-->
                    <div v-show="step === 2" class="form-step">
                        <div class="field-group">
                            <label class="field-label">Password</label>
                            <div class="field-wrap">
                                <v-icon icon="mdi-lock-outline" class="field-icon"></v-icon>
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    class="field-input" placeholder="Password" />
                                <button type="button" class="field-toggle" @click="showPassword = !showPassword">
                                    <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                                </button>
                            </div>
                            <!--Strength meter-->
                            <div v-if="form.password" class="strength-meter">
                                <div class="strength-bars">
                                    <div v-for="n in 4" :key="n" class="strength-bar" :style="{
                                        background: n <= passwordStrength ? strengthColor : 'rgba(255, 255, 255, 0.08)'
                                    }"></div>
                                </div>
                                <span class="strength-label" :style="{ color: strengthColor }">{{ strengthLabel
                                    }}</span>
                            </div>
                        </div>
                        <div class="field-group">
                            <label class="field-label">Confirm Password</label>
                            <div class="field-wrap">
                                <v-icon icon="mdi-lock-outline" class="field-icon"></v-icon>
                                <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'"
                                    class="field-input" placeholder="Confirm Password" />
                                <button type="button" class="field-toggle" @click="showConfirm = !showConfirm">
                                    <v-icon :icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                                </button>
                            </div>
                            <div v-if="form.confirmPassword" class="password-match" :class="{
                                'password-match--ok': passwordMatch,
                                'password-match--err': !passwordMatch
                            }">
                                <v-icon :icon="passwordMatch ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                                    class="match-icon"></v-icon>
                                <span class="match-text">{{ passwordMatch ? 'Passwords match' : 'Passwords do not match'
                                    }}</span>
                            </div>
                        </div>
                        <label class="terms-label">
                            <input type="checkbox" v-model="agreed" class="terms-check" />
                            <span>I agree to the terms and conditions</span>
                        </label>

                        <div class="step-nav">
                            <button type="button" class="back-btn" @click="prevStep">← BACK</button>
                            <button type="submit" class="submit-btn next-btn"
                                :class="{ 'submit-btn--loading': loading }" :disabled="!agreed">
                                <span v-if="!loading">CREATE ACCOUNT <span class="submit-arrow">→</span></span>
                                <span v-else class="loading-dots">
                                    <span></span><span></span><span></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </form>

                <div class="form-footer">
                    Already have an account?
                    <router-link to='/login' class="login-link">Login →</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.signup-page {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #091222;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  overflow-x: hidden;
}

@media (max-width: 900px) {
  .signup-page { grid-template-columns: 1fr; }
  .left-panel { display: none; }
}

/* ── LEFT PANEL ──────────────────────────────────────────── */
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
  margin-bottom: 3rem;
}

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
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #f0ede6;
  text-transform: uppercase;
}
.brand-name em { font-style: italic; color: #4d8ef0; }

.panel-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  color: #f0ede6;
  margin-bottom: 1.2rem;
}
.panel-title em { font-style: italic; color: #4d8ef0; }

.panel-sub {
  font-size: 0.9rem;
  font-weight: 300;
  color: rgba(240,237,230,0.5);
  line-height: 1.7;
  max-width: 320px;
  margin-bottom: 2rem;
}

.panel-perks {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 2.5rem;
}

.perk {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.88rem;
  color: rgba(240,237,230,0.65);
}

.perk-check {
  color: #4d8ef0 !important;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.panel-stats { display: flex; align-items: center; gap: 1.5rem; }

.pstat { display: flex; flex-direction: column; gap: 0.15rem; }

.pstat-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #4d8ef0;
  line-height: 1;
}

.pstat-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: rgba(240,237,230,0.35);
  text-transform: uppercase;
}

.pstat-divider {
  width: 1px; height: 36px;
  background: rgba(240,237,230,0.1);
}

.deco-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

.deco-line {
  position: absolute;
  bottom: -10%;
  width: 1px;
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

/* ── RIGHT PANEL ─────────────────────────────────────────── */
.right-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #0d1a2e;
  overflow-y: auto;
}

.server-error {
  background: rgba(255, 60, 60, 0.1);
  border: 1px solid rgba(255, 60, 60, 0.3);
  color: #ff6060;
  padding: 0.75rem 1rem;
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

.form-card {
  width: 100%;
  max-width: 480px;
  padding: 0.5rem 0;
}

.form-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #4d8ef0 !important;
  margin-bottom: 0.75rem;
}

.form-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  color: #f0ede6;
  margin-bottom: 1rem;
}
.form-title em { font-style: italic; color: #4d8ef0; }

.form-bar {
  width: 40px; height: 3px;
  background: #4d8ef0;
  margin-bottom: 2rem;
}

/* ── STEP INDICATOR ──────────────────────────────────────── */
.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.step-bubble {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: #111;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(240,237,230,0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.step-item--active .step-bubble {
  background: #4d8ef0;
  border-color: #4d8ef0;
  color: #060d1a;
}

.step-item--done .step-bubble {
  background: rgba(77, 142, 240, 0.15);
  border-color: rgba(77, 142, 240, 0.4);
  color: #4d8ef0;
}

.step-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(240,237,230,0.3);
  transition: color 0.25s;
  white-space: nowrap;
}

.step-item--active .step-label { color: #f0ede6; }
.step-item--done .step-label { color: rgba(77, 142, 240, 0.6); }

.step-connector {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 0 0.5rem;
}

/* ── FORM FIELDS ─────────────────────────────────────────── */
.form-step { display: flex; flex-direction: column; gap: 1.1rem; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }

.field-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(240,237,230,0.4);
  text-transform: uppercase;
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: #111;
  border: 1px solid rgba(255,255,255,0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-wrap:focus-within {
  border-color: #4d8ef0;
  box-shadow: 0 0 0 3px rgba(77, 142, 240, 0.07);
}

.field-wrap--match { border-color: rgba(77, 142, 240, 0.4); }
.field-wrap--mismatch { border-color: rgba(255,60,60,0.5); }

.field-icon {
  color: rgba(240,237,230,0.22) !important;
  font-size: 1.05rem !important;
  padding: 0 0.7rem;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.85rem 0.75rem 0.85rem 0;
  color: #f0ede6;
  font-family: 'Barlow', sans-serif;
  font-size: 0.92rem;
}

.field-input::placeholder { color: rgba(240,237,230,0.18); }

.field-select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.2rem;
}

.field-select option { background: #1a1a1a; color: #f0ede6; }

.select-caret {
  position: absolute;
  right: 0.6rem;
  color: rgba(240,237,230,0.25) !important;
  font-size: 1rem !important;
  pointer-events: none;
}

.field-date { color-scheme: dark; }

.field-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.7rem;
  color: rgba(240,237,230,0.28);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.field-toggle:hover { color: rgba(240,237,230,0.65); }

.match-icon {
  color: #4d8ef0 !important;
  font-size: 1rem !important;
  padding-right: 0.7rem;
}

.mismatch-text {
  font-size: 0.72rem;
  color: #ff6060;
  margin-top: -0.1rem;
}

/* ── PASSWORD STRENGTH ───────────────────────────────────── */
.password-match {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    margin-top: 0.3rem;
}

.password-match--ok { color: #3ecf82; }
.password-match--err { color: #ff6060; }
.match-text { font-size: 0.75rem; }
.match-icon { font-size: 1rem !important; }

.strength-meter {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.3rem;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 3px;
  flex: 1;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.strength-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  min-width: 40px;
  text-align: right;
  transition: color 0.3s;
}

/* ── TERMS ───────────────────────────────────────────────── */
.terms-label {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.82rem;
  color: rgba(240,237,230,0.45);
  cursor: pointer;
  line-height: 1.5;
}

.terms-check {
  accent-color: #4d8ef0;
  width: 15px; height: 15px;
  flex-shrink: 0;
  margin-top: 2px;
}

.terms-link {
  color: #4d8ef0;
  text-decoration: none;
  font-weight: 500;
}
.terms-link:hover { opacity: 0.75; }

/* ── BUTTONS ─────────────────────────────────────────────── */
.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #4d8ef0;
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
  gap: 0.4rem;
  min-height: 52px;
  margin-top: 0.4rem;
}

.submit-btn:hover:not(:disabled) { background: #4d8ef0; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-btn--loading { opacity: 0.8; cursor: wait; }

.submit-arrow { transition: transform 0.2s; }
.submit-btn:hover .submit-arrow { transform: translateX(4px); }

.step-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.2rem;
}

.back-btn {
  padding: 0 1.5rem;
  height: 52px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(240,237,230,0.5);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s, color 0.2s;
}

.back-btn:hover {
  border-color: rgba(255,255,255,0.25);
  color: #f0ede6;
}

.step-next-btn { flex: 1; margin-top: 0; }

.loading-dots { display: flex; gap: 5px; align-items: center; }

.loading-dots span {
  width: 6px; height: 6px;
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

/* ── FOOTER ──────────────────────────────────────────────── */
.form-footer {
  margin-top: 1.8rem;
  text-align: center;
  font-size: 0.88rem;
  color: rgba(240,237,230,0.4);
}

.login-link {
  color: #4d8ef0;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.3rem;
  transition: opacity 0.2s;
}
.login-link:hover { opacity: 0.75; }
</style>