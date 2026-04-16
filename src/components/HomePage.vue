<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const services = ref([])
const userRequests = ref([])
const search = ref('')
const loading = ref(true)
const loadingRequests = ref(true)
const loadingIds = ref(new Set())
const feedback = ref({}) // { [serviceId]: { type: 'success'|'error', msg: string } }

const createRequest = async (formData) => {
  const payload = {
    service_id: formData.service_id,
    description: formData.description,
    price: formData.price,
    address: formData.address,
    // request_date: formData.request_date
  };

  try {
    const response = await api.post('/service-requests', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating the request', error.response?.data);
    throw error;
  }
}

const fetchServices = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/services')
    console.log('API Response: ', data); // Testing
    services.value = Array.isArray(data) ? data : (data.data ?? data.services ?? []);
  } catch (err) {
    console.error('Fetch error: ', err.response?.status, err.response?.data);
  } finally {
    loading.value = false
  }
}

const fetchRequests = async () => {
  loadingRequests.value = true
  try {
    const { data } = await api.get('/service-requests')
    console.log('Requests API Response: ', data); // Testing

    if (data.service_requests) {
      userRequests.value = data.service_requests
    } else if (data.data && Array.isArray(data.data)) {
      userRequests.value = data.data
    } else if (Array.isArray(data)) {
      userRequests.value = data
    } else {
      userRequests.value = []
    }

    console.log('Processed requests: ', userRequests.value.length);
  } catch (err) {
    console.error('Fetch requests error: ', err.response?.status, err.response?.data);
    userRequests.value = []
  } finally {
    loadingRequests.value = false
  }
}

const fetchUserRequests = async () => {
  await fetchRequests()
}

const filteredServices = computed(() =>
  services.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.value.toLowerCase())
  )
)

const requestService = async (serviceId) => {
  if (loadingIds.value.has(serviceId)) return
  loadingIds.value = new Set([...loadingIds.value, serviceId])
  feedback.value = { ...feedback.value, [serviceId]: null }

  try {
    const service = services.value.find(s => s.id === serviceId)
    const response = await api.post('/service-requests', {
      service_id: serviceId,
      status: 'pending',
      request_date: new Date().toISOString().split('T')[0],
      address: '',
      description: '',
      price: service?.price || 0,
    })

    feedback.value = {
      ...feedback.value,
      [serviceId]: { type: 'success', msg: "Request sent successfully!" }
    }

    await fetchRequests()
    setTimeout(() => {
      const updated = { ...feedback.value }
      delete updated[serviceId]
      feedback.value = updated
    }, 4000);
  } catch (error) {
    const status = error.response?.status
    const message = status === 401
      ? 'Please login to request this service.'
      : status === 409
      ? 'You have already requested this service.'
      : error.response?.data?.message || 'Failed to request the service. Please try again.'
    feedback.value = { ...feedback.value, [serviceId]: { type: 'error', msg: message } }
  } finally {
    const ids = new Set(loadingIds.value)
    ids.delete(serviceId)
    loadingIds.value = ids
  }
}

const cancelRequest = async (requestId) => {
  try {
    const response = await api.patch(`/service-requests/${requestId}/cancel`)
    
    if (response.data.message) {
      await fetchRequests()
      console.log('Request has been cancelled successfully.');
    }
  } catch (err) {
    console.error('Error cancelling the request: ', err)
    const msg = err.response?.data?.messsage || 'Failed to cancel the request.'
    alert(msg)
  }
}

const getStatusBadgeClass = (status) => {
  const statusLower = (status || '').toLowerCase()
  if (statusLower === 'pending') return 'status-badge status-pending'
  if (statusLower === 'accepted' || statusLower === 'confirmed') return 'status-badge status-accepted'
  if (statusLower === 'completed') return 'status-badge status-completed'
  if (statusLower === 'cancelled') return 'status-badge status-cancelled'
  return 'status-badge'
}

const getStatusIcon = (status) => {
  const statusLower = (status || '').toLowerCase()
  if (statusLower === 'pending') return 'mdi-clock-outline'
  if (statusLower === 'accepted' || statusLower === 'confirmed') return 'mdi-check-circle-outline'
  if (statusLower === 'completed') return 'mdi-check-bold'
  if (statusLower === 'cancelled') return 'mdi-close-circle-outline'
  return 'mdi-help-circle-outline'
}

const authUser = ref(null)

const getCurrentUser = async () => {
  try {
    const { data } = await api.get('/users')
    authUser.value = data
  } catch (err) {
    console.error('Error fetching current user: ', err.response?.status, err.response?.data)
  }
}

onMounted(() => {
  fetchServices()
  fetchRequests()
  getCurrentUser()
})
</script>

<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap"
    rel="stylesheet" />

  <div class="home-page">

    <!-- Decorative lines (same as login) -->
    <div class="deco-lines">
      <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
    </div>

    <div class="sp-inner">

      <!-- Page header -->
      <div class="sp-header">
        <div>
          <div class="sp-eyebrow"></div>
          <h1 class="sp-title">FIND YOUR<br><em>SERVICE.</em></h1>
          <div class="sp-bar"></div>
        </div>
        <div class="brand">
          <span class="brand-icon">F</span>
          <span class="brand-name">Fundi<em>Link</em></span>
        </div>
      </div>

      <!-- Search + count -->
      <div class="sp-controls">
        <div class="search-wrap">
          <v-icon icon="mdi-magnify" class="search-icon"></v-icon>
          <input v-model="search" type="text" class="search-input" placeholder="Search services…" />
        </div>
        <span v-if="!loading" class="sp-count">
          {{ filteredServices.length }} service{{ filteredServices.length !== 1 ? 's' : '' }} available
        </span>
      </div>

      <!-- Skeleton loader -->
      <div v-if="loading" class="services-grid">
        <div v-for="n in 6" :key="n" class="service-card skeleton-card">
          <div class="skel skel-img"></div>
          <div class="skeleton-body">
            <div class="skel skel-line w-40"></div>
            <div class="skel skel-line w-80 h-20"></div>
            <div class="skel skel-line w-60"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredServices.length === 0" class="empty-state">
        <v-icon icon="mdi-magnify-remove-outline" class="empty-icon"></v-icon>
        <p class="empty-title">NO SERVICES FOUND</p>
        <p class="empty-sub">Try a different search term</p>
      </div>

      <!-- Services grid -->
      <div v-else class="services-grid">
        <div v-for="service in filteredServices" :key="service.id" class="service-card">
          <img v-if="service.image" :src="service.image" :alt="service.name" class="card-img" />
          <div v-else class="card-img-placeholder">
            <v-icon icon="mdi-image-outline" class="placeholder-icon"></v-icon>
          </div>

          <div class="card-body">
            <div v-if="service.category" class="card-category">{{ service.category }}</div>
            <h3 class="card-title">{{ service.name }}</h3>
            <p class="card-desc">{{ service.description }}</p>

            <div class="card-footer">
              <div class="card-price">
                <span class="price-label">Starting at</span>
                KES {{ service.price }}
              </div>
              <button class="request-btn" :class="{ 'request-btn--loading': loadingIds.has(service.id) }"
                :disabled="loadingIds.has(service.id)" @click="requestService(service.id)">
                <span v-if="!loadingIds.has(service.id)">Request <span class="btn-arrow">→</span></span>
                <span v-else class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              </button>
            </div>

            <!-- Inline feedback toast -->
            <div v-if="feedback[service.id]" class="feedback-toast"
              :class="`feedback-toast--${feedback[service.id].type}`">
              <v-icon
                :icon="feedback[service.id].type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'"
                class="toast-icon"></v-icon>
              {{ feedback[service.id].msg }}
            </div>
          </div>
        </div>
      </div>

      <!-- SERVICE REQUEST SECTION -->
      <div class="my-requests-section">
        <div class="section-header">
          <div class="section-header-left">
            <div class="section-eyebrow">MY ACTIVITY</div>
            <h2 class="section-title">MY REQUESTS</h2>
            <div class="section-bar"></div>
          </div>

          <div class="section-actions">
            <button v-if="!loadingRequests && userRequests.length > 0" class="refresh-btn" @click="fetchUserRequests"
              title="Refresh requests">
              <v-icon icon="mdi-refresh" class="refresh-icon"></v-icon>
            </button>

            <router-link to="/request-service" class="new-request-btn">
              <v-icon icon="mdi-plus"></v-icon>
              New Request
            </router-link>
          </div>
        </div>

        <!-- Loading state for requests -->
        <div v-if="loadingRequests" class="requests-loading">
          <div class="loading-spinner"></div>
          <span>Loading your requests...</span>
        </div>

        <!-- Empty state for requests -->
        <div v-else-if="userRequests.length === 0" class="empty-requests">
          <v-icon icon="mdi-clipboard-text-outline" class="empty-requests-icon"></v-icon>
          <p class="empty-requests-title">No service requests yet</p>
          <p class="empty-requests-sub">Browse services above and make your first request!</p>
        </div>

        <!-- Requests list -->
        <div v-else class="requests-list">
          <div
            v-for="request in userRequests"
            :key="request.id"
            class="request-item"
          >
            <div class="request-icon-wrap">
              <v-icon :icon="getStatusIcon(request.status)" class="request-icon"></v-icon>
            </div>
            
            <div class="request-content">
              <div class="request-header">
                <h4 class="request-title">{{ request.service?.name || request.service?.title || 'Service Request' }}</h4>
                <div :class="getStatusBadgeClass(request.status)">
                  <v-icon :icon="getStatusIcon(request.status)" class="badge-icon-small"></v-icon>
                  {{ request.status || 'Pending' }}
                </div>
              </div>
              
              <div class="request-details">
                <div class="request-detail-item" v-if="request.service?.price">
                  <v-icon icon="mdi-currency-kes" class="detail-icon"></v-icon>
                  <span>{{ request.service.price }}</span>
                </div>
                <div class="request-detail-item" v-if="request.request_date">
                  <v-icon icon="mdi-calendar-outline" class="detail-icon"></v-icon>
                  <span>{{ new Date(request.request_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                </div>
                <div class="request-detail-item" v-if="request.created_at">
                  <v-icon icon="mdi-clock-outline" class="detail-icon"></v-icon>
                  <span>Requested: {{ new Date(request.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}</span>
                </div>
                <div class="request-detail-item" v-if="request.address">
                  <v-icon icon="mdi-map-marker-outline" class="detail-icon"></v-icon>
                  <span>{{ request.address }}</span>
                </div>
              </div>
              
              <p v-if="request.description" class="request-notes">{{ request.description }}</p>
            </div>
            
            <div class="request-actions" v-if="request.status?.toLowerCase() === 'pending'">
              <button class="request-action-btn cancel-btn" @click="cancelRequest(request.id)">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.home-page {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: #060d1a;
  position: relative;
  overflow: hidden;
}

.sp-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

/* ── HEADER ── */
.sp-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.sp-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #4d8ef0;
  margin-bottom: 0.5rem;
}

.sp-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2.5rem, 4vw, 3.8rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  color: #f0ede6;
}

.sp-title em { font-style: italic; color: #4d8ef0; }

.sp-bar {
  width: 40px;
  height: 3px;
  background: #4d8ef0;
  margin-top: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
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

/* ── CONTROLS ── */
.sp-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  background: #0a1628;
  border: 1px solid rgba(77, 142, 240, 0.15);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-wrap:focus-within {
  border-color: #4d8ef0;
  box-shadow: 0 0 0 3px rgba(77, 142, 240, 0.12);
}

.search-icon {
  color: rgba(240, 237, 230, 0.25);
  font-size: 1.1rem !important;
  padding: 0 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.85rem 0.75rem 0.85rem 0;
  color: #f0ede6;
  font-family: 'Barlow', sans-serif;
  font-size: 0.95rem;
}

.search-input::placeholder { color: rgba(240, 237, 230, 0.2); }

.sp-count {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(240, 237, 230, 0.35);
  text-transform: uppercase;
}

/* ── GRID ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.5rem;
}

/* ── SERVICE CARD ── */
.service-card {
  background: #091222;
  border: 1px solid rgba(77, 142, 240, 0.15);
  transition: border-color 0.25s, transform 0.2s;
}

.service-card:hover {
  border-color: rgba(77, 142, 240, 0.4);
  transform: translateY(-3px);
}

.card-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-img-placeholder {
  width: 100%;
  height: 160px;
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(77, 142, 240, 0.1);
}

.placeholder-icon {
  font-size: 2rem !important;
  color: rgba(77, 142, 240, 0.2);
}

.card-body { padding: 1.25rem; }

.card-category {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #4d8ef0;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.card-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #f0ede6;
  line-height: 1.05;
  margin-bottom: 0.6rem;
}

.card-desc {
  font-size: 0.85rem;
  font-weight: 300;
  color: rgba(240, 237, 230, 0.5);
  line-height: 1.65;
  margin-bottom: 1.1rem;
  min-height: 3.3em;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(77, 142, 240, 0.1);
  padding-top: 1rem;
}

.card-price {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: #f0ede6;
}

.price-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(240, 237, 230, 0.35);
  display: block;
  margin-bottom: 0.1rem;
  text-transform: uppercase;
}

/* ── REQUEST BUTTON ── */
.request-btn {
  background: #4d8ef0;
  color: #fff;
  border: none;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.65rem 1.25rem;
  clip-path: polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  min-height: 40px;
}

.request-btn:hover { background: #6aa3f5; transform: translateY(-1px); }
.request-btn:disabled { opacity: 0.55; cursor: wait; }
.request-btn--loading { opacity: 0.7; cursor: wait; }
.btn-arrow { transition: transform 0.2s; }
.request-btn:hover .btn-arrow { transform: translateX(3px); }

/* ── FEEDBACK TOAST ── */
.feedback-toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.78rem;
  border-left: 2px solid;
  margin-top: 0.85rem;
}

.feedback-toast--success {
  background: rgba(30, 180, 100, 0.08);
  border-color: rgba(30, 180, 100, 0.5);
  color: #3ecf82;
}

.feedback-toast--error {
  background: rgba(255, 60, 60, 0.08);
  border-color: rgba(255, 60, 60, 0.3);
  color: #ff6060;
}

.toast-icon { font-size: 1rem !important; flex-shrink: 0; }

/* ── EMPTY STATE ── */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  border: 1px dashed rgba(77, 142, 240, 0.15);
}

.empty-icon { font-size: 3rem !important; color: rgba(77, 142, 240, 0.2); margin-bottom: 1rem; }

.empty-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: rgba(240, 237, 230, 0.3);
}

.empty-sub {
  font-size: 0.85rem;
  color: rgba(240, 237, 230, 0.2);
  margin-top: 0.5rem;
}

/* ── SKELETON ── */
.skeleton-card { background: #091222; border: 1px solid rgba(77, 142, 240, 0.1); }

.skel {
  background: linear-gradient(90deg,
    rgba(77, 142, 240, 0.06) 25%,
    rgba(77, 142, 240, 0.12) 50%,
    rgba(77, 142, 240, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

.skel-img { height: 160px; }
.skeleton-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
.skel-line { height: 10px; border-radius: 2px; }
.w-40 { width: 40%; }
.w-60 { width: 60%; }
.w-80 { width: 80%; }
.h-20 { height: 20px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── LOADING DOTS ── */
.loading-dots { display: flex; gap: 4px; align-items: center; }

.loading-dots span {
  width: 5px; height: 5px;
  background: #fff;
  border-radius: 50%;
  animation: dotBounce 0.9s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* ── DECO LINES ── */
.deco-lines {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.deco-line {
  position: absolute;
  width: 1px;
  bottom: -10%;
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
  0% { transform: translateY(0); opacity: 0.4; }
  100% { transform: translateY(-40px); opacity: 1; }
}

@media (max-width: 600px) {
  .sp-header { flex-direction: column; align-items: flex-start; }
  .brand { display: none; }
}

/* Request Section */
.my-requests-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(77, 142, 240, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header-left {
  flex: 1;
}

.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #4d8ef0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.section-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #f0ede6;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.section-bar {
  width: 40px;
  height: 3px;
  background: #4d8ef0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.new-request-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #4d8ef0;
  color: #fff;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  clip-path: polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%);
  transition: all 0.2s;
  padding: 0.65rem 1.25rem;
}

.new-request-btn:hover { background: #6aa3f5; transform: translateY(-1px); }
.new-request-btn .v-icon {
  font-size: 1rem !important;
}

.refresh-btn {
  background: rgba(77, 142, 240, 0.1);
  border: 1px solid rgba(77, 142, 240, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
  display: flex;
  justify-content: center;
}

.refresh-btn:hover {
  background: rgba(77, 142, 240, 0.2);
  border-color: rgba(77, 142, 240, 0.4);
  transform: rotate(180deg);
}

.refresh-icon { font-size: 1.2rem !important; color: #4d8ef0; }
.requests-loading {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  padding: 3rem;
  color: rgba(240, 237, 230, 0.5);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(77, 142, 240, 0.2);
  border-top-color: #4d8ef0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-requests {
  text-align: center;
  padding: 3rem 2rem;
  border: 1px dashed rgba(77, 142, 240, 0.2);
  background: rgba(9, 18, 34, 0.5);
}

.empty-requests-icon {
  font-size: 3rem !important;
  color: rgba(77, 142, 240, 0.2);
  margin-bottom: 1rem;
}

.empty-requests-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(240, 237, 230, 0.3);
  margin-bottom: 0.5rem;
}

.empty-requests-sub {
  font-size: 0.85rem;
  color: rgba(240, 237, 230, 0.2);
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-item {
  display: flex;
  gap: 1rem;
  padding: 1.2rem;
  background: #091222;
  border: 1px solid rgba(77, 142, 240, 0.1);
  transition: border-color 0.2s;
}

.request-item:hover {
  border-color: rgba(77, 142, 240, 0.25);
}

.request-icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(77, 142, 240, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
}

.request-icon {
  font-size: 1.2rem !important;
  color: #4d8ef0 !important;
}

.request-content {
  flex: 1;
}

.request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.request-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #f0ede6;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-icon-small {
  font-size: 0.7rem !important;
}

.status-pending {
  background: rgba(255, 170, 0, 0.1);
  border: 1px solid rgba(255, 170, 0, 0.3);
  color: #ffaa00;
}

.status-accepted {
  background: rgba(77, 142, 240, 0.1);
  border: 1px solid rgba(77, 142, 240, 0.3);
  color: #4d8ef0;
}

.status-completed {
  background: rgba(30, 180, 100, 0.1);
  border: 1px solid rgba(30, 180, 100, 0.3);
  color: #3ecf82;
}

.status-cancelled {
  background: rgba(255, 60, 60, 0.1);
  border: 1px solid rgba(255, 60, 60, 0.3);
  color: #ff6060;
}

.request-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.request-detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgba(240, 237, 230, 0.5);
}

.detail-icon {
  font-size: 0.75rem !important;
  color: rgba(77, 142, 240, 0.5);
}

.request-notes {
  font-size: 0.8rem;
  color: rgba(240, 237, 230, 0.4);
  margin-top: 0.3rem;
}

.request-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.request-action-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Barlow Condensed', sans-serif;
}

.cancel-btn {
  background: rgba(255, 60, 60, 0.1);
  border: 1px solid rgba(255, 60, 60, 0.3);
  color: #ff6060;
}

.cancel-btn:hover {
  background: rgba(255, 60, 60, 0.2);
  border-color: #ff6060;
}

@media (max-width: 600px) {
  .request-item {
    flex-direction: column;
  }
  
  .request-actions {
    justify-content: flex-end;
  }
  
  .request-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>