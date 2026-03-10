<script setup>
import { ref } from 'vue'

const selected = ref(null)

const bundles = [
  { id: 'daily',   icon: 'mdi-clock-outline',           label: 'Daily Pass', price: 500,   period: '/day',  tag: 'Try Us Out',   savings: null },
  { id: 'month1',  icon: 'mdi-calendar-blank',          label: '1 Month',   price: 5500,  period: '/mo',   tag: 'Most Flexible', savings: null },
  { id: 'month3',  icon: 'mdi-numeric-3-circle-outline', label: '3 Months',  price: 15000, period: '/3mo',  tag: 'Save 9%',      savings: '500 Ksh saved' },
  { id: 'month6',  icon: 'mdi-numeric-6-circle-outline', label: '6 Months',  price: 25000, period: '/6mo',  tag: 'Best Value',   savings: '8,000 Ksh saved', highlight: true },
  { id: 'month12', icon: 'mdi-timer-sand-full',          label: '12 Months', price: 45000, period: '/yr',   tag: 'Champion',     savings: '21,000 Ksh saved' },
]

const included = [
  { icon: 'mdi-arm-flex-outline',    title: 'Skilled Trainers',       desc: 'Certified coaches dedicated to your progress.' },
  { icon: 'mdi-dumbbell',            title: 'Premium Equipment',      desc: '200+ machines and free weights, always maintained.' },
  { icon: 'mdi-heart-outline',       title: 'Personal Training Plans', desc: 'Programs built around your body and goals.' },
  { icon: 'mdi-food-outline',        title: 'Nutrition Guidance',     desc: 'Meal planning tailored to your fitness journey.' },
  { icon: 'mdi-medication-outline',  title: 'Recovery Support',       desc: 'Sauna, stretching zones, and recovery coaching.' },
  { icon: 'mdi-clock-outline',       title: '24/7 Access',            desc: 'Train on your schedule — any time, any day.' },
]

const steps = [
  { num: '01', title: 'Pick Your Bundle',     desc: 'Choose the plan that matches your commitment and budget.' },
  { num: '02', title: 'Fill Your Details',   desc: 'Quick form — takes less than 2 minutes to complete.' },
  { num: '03', title: 'Make Payment',        desc: 'Secure M-Pesa or card payment. Instant confirmation.' },
  { num: '04', title: 'Start Training',      desc: 'Walk in, scan your pass, and own the floor.' },
]
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="page">

    <!-- ── HERO ─────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-eyebrow">MEMBERSHIP PLANS</div>
      <h1 class="hero-title">BUNDLES &<br><em>PRICING.</em></h1>
      <p class="hero-sub">Pick your plan. Show up. Get results.</p>
    </section>

    <!-- ── PRICING ───────────────────────────────────────── -->
    <section class="section pricing-section">
      <div class="section-label">CHOOSE YOUR PLAN</div>

      <!-- top 4 -->
      <div class="pricing-grid-top">
        <div
          v-for="b in bundles.slice(0,4)"
          :key="b.id"
          class="price-card"
          :class="{ 'price-card--hl': b.highlight, 'price-card--sel': selected === b.id }"
          @click="selected = b.id"
        >
          <div v-if="b.highlight" class="card-badge">★ BEST VALUE</div>
          <div class="card-tag">{{ b.tag }}</div>
          <v-icon :icon="b.icon" class="card-icon" :class="{ 'card-icon--hl': b.highlight }"></v-icon>
          <div class="card-label">{{ b.label }}</div>
          <div class="card-price">
            <span class="price-ksh">KSh</span>
            <span class="price-num">{{ b.price.toLocaleString() }}</span>
            <span class="price-per">{{ b.period }}</span>
          </div>
          <div v-if="b.savings" class="card-savings">{{ b.savings }}</div>
          <div v-else class="card-savings card-savings--empty">&nbsp;</div>
          <button class="card-btn" :class="{ 'card-btn--hl': b.highlight }">
            SELECT <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- annual — full width -->
      <div
        class="price-card price-card--annual"
        :class="{ 'price-card--sel': selected === 'month12' }"
        @click="selected = 'month12'"
      >
        <div class="annual-left">
          <div class="card-tag">Champion</div>
          <div class="annual-label">12 MONTHS</div>
          <div class="annual-sub">Our longest commitment. Our biggest reward.</div>
        </div>
        <div class="annual-center">
          <v-icon icon="mdi-timer-sand-full" class="card-icon annual-icon"></v-icon>
        </div>
        <div class="annual-right">
          <div class="annual-savings">21,000 Ksh saved vs monthly</div>
          <div class="card-price">
            <span class="price-ksh">KSh</span>
            <span class="price-num">45,000</span>
            <span class="price-per">/yr</span>
          </div>
          <button class="card-btn">SELECT <span class="btn-arrow">→</span></button>
        </div>
      </div>
    </section>

    <!-- ── WHAT'S INCLUDED ───────────────────────────────── -->
    <section class="section included-section">
      <div class="section-label">EVERY PLAN INCLUDES</div>
      <h2 class="section-title">WHAT'S IN YOUR<br><em>BUNDLE.</em></h2>
      <div class="title-bar"></div>

      <div class="included-grid">
        <div v-for="feat in included" :key="feat.title" class="inc-card">
          <v-icon :icon="feat.icon" class="inc-icon"></v-icon>
          <div class="inc-title">{{ feat.title }}</div>
          <div class="inc-desc">{{ feat.desc }}</div>
        </div>
      </div>
    </section>

    <!-- ── HOW TO JOIN ────────────────────────────────────── -->
    <section class="section join-section">
      <div class="section-label">GET STARTED</div>
      <h2 class="section-title">HOW TO<br><em>JOIN.</em></h2>
      <div class="title-bar"></div>

      <div class="steps-grid">
        <div v-for="(step, i) in steps" :key="step.num" class="step-card">
          <div class="step-num">{{ step.num }}</div>
          <div class="step-connector" v-if="i < steps.length - 1"></div>
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.desc }}</div>
        </div>
      </div>

      <div class="join-cta">
        <button class="join-btn">START YOUR JOURNEY →</button>
      </div>
    </section>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  font-family: 'Barlow', sans-serif;
  background: #0a0a0a;
  color: #f0ede6;
  min-height: 100vh;
}

/* ── HERO ──────────────────────────────────────────────── */
.hero {
  text-align: center;
  padding: 9rem 2rem 5rem;
  background: radial-gradient(ellipse 60% 45% at 50% 0%, rgba(200,255,0,0.08) 0%, transparent 70%);
  border-bottom: 1px solid rgba(200,255,0,0.08);
}

.hero-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.32em;
  color: #c8ff00;
  margin-bottom: 1rem;
}

.hero-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(3.8rem, 9vw, 7.5rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  margin-bottom: 1.2rem;
}

.hero-title em { font-style: italic; color: #c8ff00; }

.hero-sub {
  font-size: 1rem;
  font-weight: 300;
  color: rgba(240,237,230,0.5);
}

/* ── SECTIONS ──────────────────────────────────────────── */
.section {
  padding: 6rem 5vw;
  max-width: 1240px;
  margin: 0 auto;
}

.section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #c8ff00;
  margin-bottom: 1rem;
}

.section-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2.8rem, 5.5vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  margin-bottom: 1rem;
}

.section-title em { font-style: italic; color: #c8ff00; }

.title-bar {
  width: 48px;
  height: 3px;
  background: #c8ff00;
  margin-bottom: 3.5rem;
}

/* ── PRICING GRID ──────────────────────────────────────── */
.pricing-section { border-bottom: 1px solid rgba(200,255,0,0.07); }

.pricing-grid-top {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.05);
  margin-bottom: 1px;
}

@media (max-width: 860px) {
  .pricing-grid-top { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .pricing-grid-top { grid-template-columns: 1fr; }
}

.price-card {
  position: relative;
  background: #0f0f0f;
  padding: 2rem 1.6rem 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.price-card:hover { background: #141414; }
.price-card--hl { background: #121a00; }
.price-card--hl:hover { background: #172000; }
.price-card--sel { outline: 2px solid #c8ff00; outline-offset: -2px; }

.card-badge {
  position: absolute;
  top: 0; right: 0;
  background: #c8ff00;
  color: #0a0a0a;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 0.28rem 0.7rem;
}

.card-tag {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #c8ff00;
  text-transform: uppercase;
}

.card-icon {
  font-size: 2rem !important;
  color: rgba(240,237,230,0.25) !important;
  margin: 0.4rem 0;
}
.card-icon--hl { color: rgba(200,255,0,0.5) !important; }

.card-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #f0ede6;
  line-height: 1;
}

.card-price {
  display: flex;
  align-items: flex-end;
  gap: 0.2rem;
  margin-top: 0.3rem;
}

.price-ksh {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(240,237,230,0.4);
  padding-bottom: 0.25rem;
}

.price-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
  color: #f0ede6;
}

.price-per {
  font-size: 0.8rem;
  color: rgba(240,237,230,0.35);
  padding-bottom: 0.3rem;
}

.card-savings {
  font-size: 0.7rem;
  font-weight: 600;
  color: #c8ff00;
  letter-spacing: 0.05em;
  min-height: 1rem;
}

.card-savings--empty { opacity: 0; }

.card-btn {
  margin-top: 0.8rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1px solid rgba(240,237,230,0.15);
  color: rgba(240,237,230,0.7);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
  transition: all 0.2s ease;
}

.card-btn:hover,
.price-card--sel .card-btn {
  background: rgba(200,255,0,0.1);
  border-color: #c8ff00;
  color: #c8ff00;
}

.card-btn--hl {
  background: #c8ff00;
  border-color: #c8ff00;
  color: #0a0a0a;
}

.card-btn--hl:hover { background: #d9ff33; }

.btn-arrow { transition: transform 0.2s; }
.card-btn:hover .btn-arrow { transform: translateX(3px); }

/* Annual card */
.price-card--annual {
  flex-direction: row;
  align-items: center;
  gap: 2rem;
  background: #0f0f0f;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 2rem 2.5rem;
}

.annual-left { flex: 1; }

.annual-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.6rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 1;
  color: #f0ede6;
  margin: 0.3rem 0 0.5rem;
}

.annual-sub {
  font-size: 0.85rem;
  color: rgba(240,237,230,0.45);
}

.annual-center { flex-shrink: 0; }

.annual-icon {
  font-size: 3rem !important;
  color: rgba(240,237,230,0.15) !important;
}

.annual-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.annual-savings {
  font-size: 0.7rem;
  font-weight: 600;
  color: #c8ff00;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .price-card--annual {
    flex-direction: column;
    align-items: flex-start;
  }
  .annual-right { align-items: flex-start; width: 100%; }
  .annual-center { display: none; }
}

/* ── INCLUDED ──────────────────────────────────────────── */
.included-section {
  background: #0d0d0d;
  max-width: 100%;
  border-top: 1px solid rgba(200,255,0,0.07);
  border-bottom: 1px solid rgba(200,255,0,0.07);
}

.included-section > * {
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
}

.included-section .section-label,
.included-section .section-title,
.included-section .title-bar {
  padding: 0 5vw;
}

.included-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.05);
  max-width: 1240px;
  margin: 0 auto;
}

@media (max-width: 860px) { .included-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 500px) { .included-grid { grid-template-columns: 1fr; } }

.inc-card {
  background: #0d0d0d;
  padding: 2.2rem 2rem;
  transition: background 0.2s ease;
}

.inc-card:hover { background: #131313; }

.inc-icon {
  font-size: 1.8rem !important;
  color: #c8ff00 !important;
  margin-bottom: 1rem;
  display: block;
}

.inc-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #f0ede6;
  margin-bottom: 0.5rem;
}

.inc-desc {
  font-size: 0.85rem;
  color: rgba(240,237,230,0.48);
  line-height: 1.65;
}

/* ── HOW TO JOIN ───────────────────────────────────────── */
.join-section { border-bottom: 1px solid rgba(200,255,0,0.07); }

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  position: relative;
  margin-bottom: 4rem;
}

@media (max-width: 760px) {
  .steps-grid { grid-template-columns: 1fr 1fr; gap: 2rem 1rem; }
}
@media (max-width: 440px) {
  .steps-grid { grid-template-columns: 1fr; }
}

.step-card {
  position: relative;
  padding: 0 2rem 0 0;
}

.step-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 4rem;
  font-weight: 900;
  color: rgba(200,255,0,0.12);
  line-height: 1;
  margin-bottom: 0.6rem;
}

.step-connector {
  position: absolute;
  top: 2rem;
  right: 0;
  width: 1.5rem;
  height: 1px;
  background: rgba(200,255,0,0.25);
}

.step-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #f0ede6;
  margin-bottom: 0.5rem;
}

.step-desc {
  font-size: 0.85rem;
  color: rgba(240,237,230,0.48);
  line-height: 1.65;
  max-width: 200px;
}

.join-cta { text-align: center; }

.join-btn {
  background: #c8ff00;
  color: #0a0a0a;
  border: none;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 1rem 3rem;
  cursor: pointer;
  clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
  transition: background 0.2s ease, transform 0.2s ease;
}

.join-btn:hover {
  background: #d9ff33;
  transform: translateY(-2px);
}
</style>