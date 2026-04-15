<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem('user')) || null);

if (!user.value) router.push('/login');

const editing = ref(false);
const loading = ref(false);
const feedback = ref(null);
const form = ref({
    name: user.value?.name ?? '',
    email: user.value?.email ?? '',
    phone: user.value?.phone ?? '',
    address: user.value?.address ?? '',
})

const initials = computed(() =>
    user.value?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '?'
)

const saveProfile = async () => {
    loading.value = true;
    feedback.value = null;
    try {
        const { data } = await api.put(`/users/${user.value.id}`, form.value);
        const updated = { ...user.value, ...form.value }
        localStorage.setItem('user', JSON.stringify(data));
        user.value = updated;
        editing.value = false;
        feedback.value = { type: 'success', message: 'Profile updated successfully' };
    } catch (error) {
        const errors = error.response?.data?.errors
        const first = errors ? Object.values(errors)[0][0] : null
        feedback.value = { type: 'error', message: first ?? error.response?.data?.message ?? 'Failed to update profile' };
    } finally {
        loading.value = false;
    }
}

const cancelEdit = () => {
    form.value = {
        name: user.value?.name ?? '',
        email: user.value?.email ?? '',
        phone: user.value?.phone ?? '',
        address: user.value?.address ?? '',
    }

    editing.value = false;
    feedback.value = null;
}
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="pp">
    <div class="deco-lines">
      <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
    </div>

    <div class="pp-inner">

      <!-- Header -->
      <div class="pp-header">
        <div class="pp-eyebrow">ACCOUNT</div>
        <h1 class="pp-title">MY<br><em>PROFILE.</em></h1>
        <div class="pp-bar"></div>
      </div>

      <div class="pp-layout">

        <!-- Left — Avatar card -->
        <div class="pp-sidebar">
          <div class="avatar-card">
            <div class="avatar-circle">{{ initials }}</div>
            <div class="avatar-name">{{ user?.name }}</div>
            <div class="avatar-email">{{ user?.email }}</div>
            <div class="avatar-divider"></div>
            <div class="avatar-stat">
              <div class="avatar-stat-item">
                <span class="avatar-stat-num">0</span>
                <span class="avatar-stat-label">Requests</span>
              </div>
              <div class="avatar-stat-divider"></div>
              <div class="avatar-stat-item">
                <span class="avatar-stat-num">0</span>
                <span class="avatar-stat-label">Completed</span>
              </div>
            </div>
            <button
              class="edit-btn"
              :class="{ 'edit-btn--active': editing }"
              @click="editing ? cancelEdit() : editing = true"
            >
              {{ editing ? '✕ CANCEL' : '✎ EDIT PROFILE' }}
            </button>
          </div>
        </div>

        <!-- Right — Details / Edit form -->
        <div class="pp-main">

          <!-- Feedback toast -->
          <div
            v-if="feedback"
            class="feedback-toast"
            :class="`feedback-toast--${feedback.type}`"
          >
            <v-icon
              :icon="feedback.type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'"
              class="toast-icon"
            ></v-icon>
            {{ feedback.message }}
          </div>

          <!-- View mode -->
          <div v-if="!editing" class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-eyebrow">PERSONAL INFORMATION</div>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">{{ user?.name ?? '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email Address</div>
                <div class="detail-value">{{ user?.email ?? '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Phone Number</div>
                <div class="detail-value">{{ user?.phone ?? '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">{{ user?.address ?? '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Member Since</div>
                <div class="detail-value">
                  {{ user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-eyebrow">EDIT INFORMATION</div>
            </div>
            <div class="edit-grid">

              <div class="field-group">
                <label class="field-label">Full Name</label>
                <div class="field-wrap">
                  <v-icon icon="mdi-account-outline" class="field-icon"></v-icon>
                  <input v-model="form.name" type="text" class="field-input" placeholder="Full name" />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Email Address</label>
                <div class="field-wrap">
                  <v-icon icon="mdi-email-outline" class="field-icon"></v-icon>
                  <input v-model="form.email" type="email" class="field-input" placeholder="Email address" />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Phone Number</label>
                <div class="field-wrap">
                  <v-icon icon="mdi-phone-outline" class="field-icon"></v-icon>
                  <input v-model="form.phone" type="text" class="field-input" placeholder="Phone number" />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Address</label>
                <div class="field-wrap">
                  <v-icon icon="mdi-home-outline" class="field-icon"></v-icon>
                  <input v-model="form.address" type="text" class="field-input" placeholder="Address" />
                </div>
              </div>

            </div>

            <div class="edit-actions">
              <button class="cancel-btn" @click="cancelEdit">← CANCEL</button>
              <button
                class="save-btn"
                :class="{ 'save-btn--loading': loading }"
                :disabled="loading"
                @click="saveProfile"
              >
                <span v-if="!loading">SAVE CHANGES <span class="btn-arrow">→</span></span>
                <span v-else class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              </button>
            </div>
          </div>

          <!-- Security card -->
          <div class="detail-card" style="margin-top: 1.5rem">
            <div class="detail-card-header">
              <div class="detail-card-eyebrow">SECURITY</div>
            </div>
            <div class="security-row">
              <div>
                <div class="detail-label">Password</div>
                <div class="detail-value">••••••••••••</div>
              </div>
              <button class="change-pw-btn">Change Password →</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pp {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: #060d1a;
  color: #f0ede6;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.pp-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

/* ── HEADER ── */
.pp-eyebrow { font-size: .75rem; font-weight: 700; letter-spacing: .3em; color: #4d8ef0; margin-bottom: .5rem; }
.pp-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 900; text-transform: uppercase; line-height: .92; color: #f0ede6; }
.pp-title em { font-style: italic; color: #4d8ef0; }
.pp-bar { width: 40px; height: 3px; background: #4d8ef0; margin-top: 1rem; margin-bottom: 2rem; }

/* ── LAYOUT ── */
.pp-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start; }

@media (max-width: 768px) {
  .pp-layout { grid-template-columns: 1fr; }
}

/* ── SIDEBAR ── */
.avatar-card {
  background: #091222;
  border: 1px solid rgba(77,142,240,.15);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: rgba(77,142,240,.12);
  border: 2px solid rgba(77,142,240,.3);
  color: #4d8ef0;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 900;
  display: grid;
  place-items: center;
  clip-path: polygon(10% 0%,100% 0%,90% 100%,0% 100%);
  margin-bottom: 0.5rem;
}

.avatar-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; }
.avatar-email { font-size: .8rem; color: rgba(240,237,230,.4); }

.avatar-divider { width: 100%; height: 1px; background: rgba(77,142,240,.1); margin: .5rem 0; }

.avatar-stat { display: flex; align-items: center; gap: 1.5rem; }
.avatar-stat-item { display: flex; flex-direction: column; gap: .15rem; }
.avatar-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 900; color: #4d8ef0; line-height: 1; }
.avatar-stat-label { font-size: .6rem; font-weight: 700; letter-spacing: .15em; color: rgba(240,237,230,.3); text-transform: uppercase; }
.avatar-stat-divider { width: 1px; height: 32px; background: rgba(240,237,230,.08); }

.edit-btn {
  width: 100%;
  margin-top: .75rem;
  background: transparent;
  border: 1px solid rgba(77,142,240,.2);
  color: rgba(240,237,230,.6);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .82rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: .6rem 1rem;
  cursor: pointer;
  clip-path: polygon(3% 0%,100% 0%,97% 100%,0% 100%);
  transition: all .2s;
}
.edit-btn:hover { border-color: rgba(77,142,240,.45); color: #f0ede6; background: rgba(77,142,240,.06); }
.edit-btn--active { border-color: rgba(255,96,96,.3); color: #ff6060; }
.edit-btn--active:hover { border-color: rgba(255,96,96,.6); background: rgba(255,96,96,.06); }

/* ── DETAIL CARD ── */
.detail-card { background: #091222; border: 1px solid rgba(77,142,240,.15); }
.detail-card-header { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(77,142,240,.1); }
.detail-card-eyebrow { font-size: .65rem; font-weight: 700; letter-spacing: .25em; color: #4d8ef0; text-transform: uppercase; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.detail-item { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(77,142,240,.07); border-right: 1px solid rgba(77,142,240,.07); }
.detail-item:nth-child(even) { border-right: none; }
.detail-label { font-size: .6rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.3); text-transform: uppercase; margin-bottom: .35rem; }
.detail-value { font-size: .92rem; color: #f0ede6; font-weight: 400; }

/* ── EDIT FORM ── */
.edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; padding: 1.5rem; }

@media (max-width: 560px) { .edit-grid { grid-template-columns: 1fr; } }

.field-group { display: flex; flex-direction: column; gap: .4rem; }
.field-label { font-size: .6rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.4); text-transform: uppercase; }
.field-wrap { position: relative; display: flex; align-items: center; background: #0a1628; border: 1px solid rgba(77,142,240,.15); transition: border-color .2s, box-shadow .2s; }
.field-wrap:focus-within { border-color: #4d8ef0; box-shadow: 0 0 0 3px rgba(77,142,240,.1); }
.field-wrap--select { position: relative; }
.field-icon { color: rgba(240,237,230,.25) !important; font-size: 1.05rem !important; padding: 0 .7rem; flex-shrink: 0; }
.field-input { flex: 1; background: transparent; border: none; outline: none; padding: .85rem .75rem .85rem 0; color: #f0ede6; font-family: 'Barlow', sans-serif; font-size: .9rem; }
.field-input::placeholder { color: rgba(240,237,230,.2); }
.field-select { appearance: none; cursor: pointer; padding-right: 2.2rem; }
.field-select option { background: #0d1a2e; color: #f0ede6; }
.select-caret { position: absolute; right: .6rem; color: rgba(240,237,230,.25) !important; font-size: 1rem !important; pointer-events: none; }
.field-date { color-scheme: dark; }

.edit-actions { display: flex; gap: .75rem; padding: 1rem 1.5rem; border-top: 1px solid rgba(77,142,240,.1); justify-content: flex-end; }

.cancel-btn { background: transparent; border: 1px solid rgba(255,255,255,.1); color: rgba(240,237,230,.5); font-family: 'Barlow Condensed', sans-serif; font-size: .85rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .65rem 1.25rem; cursor: pointer; transition: all .2s; }
.cancel-btn:hover { border-color: rgba(255,255,255,.25); color: #f0ede6; }

.save-btn { background: #4d8ef0; border: none; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: .9rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .65rem 1.5rem; cursor: pointer; clip-path: polygon(3% 0%,100% 0%,97% 100%,0% 100%); transition: background .2s, transform .15s; display: flex; align-items: center; gap: .4rem; min-width: 160px; justify-content: center; min-height: 44px; }
.save-btn:hover { background: #6aa3f5; transform: translateY(-1px); }
.save-btn:disabled { opacity: .55; cursor: wait; }
.btn-arrow { transition: transform .2s; }
.save-btn:hover .btn-arrow { transform: translateX(3px); }

/* ── SECURITY ── */
.security-row { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; flex-wrap: wrap; gap: 1rem; }
.change-pw-btn { background: transparent; border: 1px solid rgba(77,142,240,.2); color: #4d8ef0; font-family: 'Barlow Condensed', sans-serif; font-size: .82rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .5rem 1rem; cursor: pointer; clip-path: polygon(4% 0%,100% 0%,96% 100%,0% 100%); transition: all .2s; }
.change-pw-btn:hover { border-color: #4d8ef0; background: rgba(77,142,240,.08); }

/* ── FEEDBACK ── */
.feedback-toast { display: flex; align-items: center; gap: .5rem; padding: .75rem 1rem; font-size: .82rem; border-left: 2px solid; margin-bottom: 1rem; }
.feedback-toast--success { background: rgba(62,207,130,.08); border-color: rgba(62,207,130,.5); color: #3ecf82; }
.feedback-toast--error { background: rgba(255,96,96,.08); border-color: rgba(255,96,96,.3); color: #ff6060; }
.toast-icon { font-size: 1rem !important; flex-shrink: 0; }

/* ── LOADING DOTS ── */
.loading-dots { display: flex; gap: 4px; align-items: center; }
.loading-dots span { width: 5px; height: 5px; background: #fff; border-radius: 50%; animation: dotBounce .9s ease-in-out infinite; }
.loading-dots span:nth-child(2) { animation-delay: .15s; }
.loading-dots span:nth-child(3) { animation-delay: .3s; }
@keyframes dotBounce { 0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.2);opacity:1} }

/* ── DECO LINES ── */
.deco-lines { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.deco-line { position: absolute; width: 1px; bottom: -10%; background: linear-gradient(to top, rgba(77,142,240,.2), transparent); animation: riseLine 4s ease-in-out infinite alternate; }
.deco-line:nth-child(1){left:12%;height:40%} .deco-line:nth-child(2){left:28%;height:60%}
.deco-line:nth-child(3){left:45%;height:35%} .deco-line:nth-child(4){left:62%;height:55%}
.deco-line:nth-child(5){left:78%;height:45%} .deco-line:nth-child(6){left:92%;height:65%}
@keyframes riseLine{0%{transform:translateY(0);opacity:.4}100%{transform:translateY(-40px);opacity:1}}
</style>