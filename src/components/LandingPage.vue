<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 100)
})
</script>

<template>
  <div class="macfit-home">

    <!-- HERO CAROUSEL -->
    <div class="carousel-wrapper">
      <v-carousel
        height="92vh"
        hide-delimiter-background
        show-arrows="hover"
        cycle
        interval="5000"
        class="hero-carousel"
      >
        <v-carousel-item src="/carousel1.jpg" cover>
          <div class="carousel-overlay">
            <div class="hero-content" :class="{ 'hero-visible': visible }">
              <span class="hero-eyebrow">EST. 2010 · NAIROBI</span>
              <h1 class="hero-title">PUSH YOUR<br><em>LIMITS.</em></h1>
              <p class="hero-sub">Where champions are built — body, mind, and soul.</p>
              <div class="hero-actions">
                <v-btn class="btn-primary" size="x-large" rounded="0">JOIN NOW</v-btn>
                <v-btn class="btn-ghost" size="x-large" rounded="0" variant="outlined">VIEW PLANS</v-btn>
              </div>
            </div>
          </div>
        </v-carousel-item>
        <v-carousel-item src="/carousel2.jpg" cover>
          <div class="carousel-overlay">
            <div class="hero-content" :class="{ 'hero-visible': visible }">
              <span class="hero-eyebrow">WORLD-CLASS FACILITIES</span>
              <h1 class="hero-title">TRAIN<br><em>HARDER.</em></h1>
              <p class="hero-sub">State-of-the-art equipment, zero excuses.</p>
              <div class="hero-actions">
                <v-btn class="btn-primary" size="x-large" rounded="0">EXPLORE GYM</v-btn>
              </div>
            </div>
          </div>
        </v-carousel-item>
        <v-carousel-item src="/carousel3.jpg" cover>
          <div class="carousel-overlay">
            <div class="hero-content" :class="{ 'hero-visible': visible }">
              <span class="hero-eyebrow">EXPERT COACHES</span>
              <h1 class="hero-title">BECOME<br><em>UNSTOPPABLE.</em></h1>
              <p class="hero-sub">Personalized programs crafted for your success.</p>
              <div class="hero-actions">
                <v-btn class="btn-primary" size="x-large" rounded="0">MEET COACHES</v-btn>
              </div>
            </div>
          </div>
        </v-carousel-item>
      </v-carousel>

      <!-- Scroll indicator -->
      <div class="scroll-indicator">
        <div class="scroll-line"></div>
        <span>SCROLL</span>
      </div>
    </div>

    <!-- STATS STRIP -->
    <div class="stats-strip">
      <div class="stat-item" v-for="stat in stats" :key="stat.label">
        <span class="stat-number">{{ stat.number }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <!-- ABOUT US -->
    <section class="about-section">
      <div class="about-grid">
        <div class="about-image-side">
          <div class="image-frame">
            <v-img src="/fitness4.jpg" cover height="100%" class="about-img"></v-img>
            <div class="image-accent-bar"></div>
          </div>
          <div class="floating-badge">
            <span class="badge-number">14+</span>
            <span class="badge-text">YEARS OF<br>EXCELLENCE</span>
          </div>
        </div>

        <div class="about-text-side">
          <div class="section-tag">WHO WE ARE</div>
          <h2 class="about-title">ABOUT<br><em>MACFIT</em></h2>
          <div class="title-underline"></div>

          <p class="about-body">
            At MacFit, we are dedicated to helping you achieve your fitness goals.
            Our mission is to provide a welcoming and inclusive environment where
            individuals of all fitness levels can <strong>thrive and reach their full potential.</strong>
          </p>
          <p class="about-body">
            Our state-of-the-art facilities, expert trainers, and supportive community
            create an environment where you can grow. Whether you're a beginner or a
            seasoned athlete, we have everything you need to succeed.
          </p>
          <p class="about-body">
            We offer a wide range of classes, personalized training sessions, and
            cutting-edge equipment to cater to all fitness levels and preferences.
          </p>

          <div class="about-features">
            <div class="feature-pill" v-for="f in features" :key="f">
              <span class="pill-dot"></span>{{ f }}
            </div>
          </div>

          <v-btn class="btn-dark" size="large" rounded="0">LEARN MORE →</v-btn>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: [
        { number: '5K+', label: 'ACTIVE MEMBERS' },
        { number: '80+', label: 'WEEKLY CLASSES' },
        { number: '30+', label: 'EXPERT TRAINERS' },
        { number: '99%', label: 'SATISFACTION RATE' },
      ],
      features: ['Expert Trainers', 'Modern Equipment', 'Flexible Plans', 'Group Classes'],
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.macfit-home {
  font-family: 'Barlow', sans-serif;
  background: #0a0a0a;
  color: #f0ede6;
  overflow-x: hidden;
}

/* ─── CAROUSEL ─────────────────────────────────────────── */
.carousel-wrapper {
  position: relative;
}

.hero-carousel :deep(.v-window__controls .v-btn) {
  color: #fff;
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(10,10,10,0.82) 0%,
    rgba(10,10,10,0.45) 55%,
    rgba(10,10,10,0.10) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 0 7vw 10vh;
}

.hero-content {
  max-width: 680px;
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.hero-content.hero-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-eyebrow {
  display: block;
  font-family: 'Barlow', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: #c8ff00;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.hero-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(4rem, 10vw, 8.5rem);
  font-weight: 900;
  line-height: 0.92;
  text-transform: uppercase;
  color: #f0ede6;
  margin: 0 0 1.2rem;
}

.hero-title em {
  font-style: italic;
  color: #c8ff00;
}

.hero-sub {
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(240,237,230,0.75);
  margin-bottom: 2.2rem;
  line-height: 1.6;
  max-width: 420px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: #c8ff00 !important;
  color: #0a0a0a !important;
  font-family: 'Barlow Condensed', sans-serif !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  letter-spacing: 0.1em !important;
  padding: 0 2rem !important;
}

.btn-ghost {
  border-color: rgba(240,237,230,0.6) !important;
  color: #f0ede6 !important;
  font-family: 'Barlow Condensed', sans-serif !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  letter-spacing: 0.1em !important;
  padding: 0 2rem !important;
}

.scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  right: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(240,237,230,0.5);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  z-index: 10;
}

.scroll-line {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, transparent, rgba(200,255,0,0.8));
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.2); }
}

/* ─── STATS STRIP ───────────────────────────────────────── */
.stats-strip {
  background: #c8ff00;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 2rem 4vw;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: #0a0a0a;
  line-height: 1;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(10,10,10,0.65);
  text-transform: uppercase;
  margin-top: 0.25rem;
}

/* ─── ABOUT SECTION ─────────────────────────────────────── */
.about-section {
  padding: 7rem 5vw;
  background: #0d0d0d;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .about-image-side {
    order: 2;
  }
}

/* Image side */
.about-image-side {
  position: relative;
}

.image-frame {
  position: relative;
  height: 580px;
  overflow: hidden;
}

.about-img {
  transition: transform 0.6s ease;
}

.about-img:hover {
  transform: scale(1.03);
}

.image-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: #c8ff00;
}

.floating-badge {
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  background: #c8ff00;
  color: #0a0a0a;
  padding: 1.2rem 1.5rem;
  text-align: center;
  z-index: 2;
}

.badge-number {
  display: block;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
}

.badge-text {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-top: 0.2rem;
  line-height: 1.4;
}

/* Text side */
.about-text-side {
  padding-left: 1rem;
}

.section-tag {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: #c8ff00;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.about-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(3.5rem, 6vw, 5.5rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  color: #f0ede6;
  margin: 0 0 1.2rem;
}

.about-title em {
  font-style: italic;
  color: #c8ff00;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: #c8ff00;
  margin-bottom: 2rem;
}

.about-body {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(240,237,230,0.7);
  margin-bottom: 1.2rem;
}

.about-body strong {
  color: #f0ede6;
  font-weight: 600;
}

.about-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1.8rem 0 2.5rem;
}

.feature-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(200,255,0,0.35);
  color: rgba(240,237,230,0.8);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.4rem 1rem;
  text-transform: uppercase;
}

.pill-dot {
  width: 6px;
  height: 6px;
  background: #c8ff00;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-dark {
  background: #c8ff00 !important;
  color: #0a0a0a !important;
  font-family: 'Barlow Condensed', sans-serif !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  letter-spacing: 0.12em !important;
  padding: 0 2.5rem !important;
  height: 52px !important;
}
</style>