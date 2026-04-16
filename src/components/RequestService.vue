<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const services = ref([]);
const submitting = ref(false);
const minDate = ref(new Date().toISOString().split('T')[0]);

const formData = ref({
    service_id: '',
    address: '',
    request_date: '',
    description: '',
    price: null,
})

const fetchServices = async () => {
    try {
        const { data } = await api.get('/services');
        services.value = Array.isArray(data) ? data : (data.data ?? data.services ?? []);
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}

const submitRequest = async () => {
    if (!formData.value.service_id) {
        alert('Please select a service.');
        return;
    }

    submitting.value = true;

    try {
        const payload = {
            service_id: formData.value.service_id,
            address: formData.value.address,
            description: formData.value.description,
            price: formData.value.price,
            status: 'pending',
            request_date: formData.value.request_date || new Date().toISOString().split('T')[0],
        }

        const response = await api.post('/service-requests', payload);

        if (response.data) {
            router.push('/homePage');
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        const errorMessage = error.response?.data?.message || 'Failed to submit request. Please try again.';
        alert(errorMessage);
    } finally {
        submitting.value = false;
    }
}

onMounted(() => {
    fetchServices();
})
</script>

<template>
    <div class="request-page">
        <div class="deco-lines">
            <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
        </div>

        <div class="request-inner">
            <div class="request-header">
                <router-link to="/homePage" class="back-link">
                    <v-icon icon="mdi-arrow-left"></v-icon>
                    Back to Home
                </router-link>
                <div class="brand">
                    <span class="brand-icon">F</span>
                    <span class="brand-name">Fundi<em>Link</em></span>
                </div>
            </div>

            <div class="request-container">
                <div class="request-form-container">
                    <div class="form-header">
                        <div class="form-eyebrow">NEW SERVICE REQUEST</div>
                        <h1 class="form-title">REQUEST A <br><em>SERVICE.</em></h1>
                        <div class="form-bar"></div>
                    </div>

                    <form @submit.prevent="submitRequest" class="request-form">
                        <div class="form-group">
                            <label class="form-label">Select Service</label>
                            <select v-model="formData.service_id" class="form-select" required>
                                <option value="">Choose a service...</option>
                                <option v-for="service in services" :key="service.id" :value="service.id">
                                    {{ service.name }} - KES {{ service.price }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input v-model="formData.address" type="text" required placeholder="Enter your address"
                                class="form-input">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Request Date</label>
                                <input v-model="formData.request_date" type="date" :min="minDate" required
                                    class="form-input">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Your Budget (KES)</label>
                                <input v-model="formData.price" type="number" min="0" required
                                    placeholder="Enter your budget" class="form-input">
                                <small class="form-hint">This helps fundis understand your expectations.</small>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea v-model="formData.description" placeholder="Kindly describe your issue..."
                                rows="5" class="form-textarea"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary"
                                @click="$router.push('/homePage')">Cancel</button>
                            <button type="submit" class="btn-primary" :disabled="submitting">
                                <span v-if="!submitting">Submit Request</span>
                                <span v-else class="loading-dots">
                                    <span></span><span></span><span></span>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                <div class="request-info">
                    <div class="info-card">
                        <v-icon icon="mdi-information-outline" class="info-icon"></v-icon>
                        <h3>How it works</h3>
                        <ul>
                            <li>Submit your request with the necessary details.</li>
                            <li>Providers will review and respond to your request.</li>
                            <li>Choose the best that suits your need.</li>
                            <li>Get the service done!</li>
                        </ul>
                    </div>

                    <div class="info-card">
                        <v-icon icon="mdi-clock-outline" class="info-icon"></v-icon>
                        <h3>What happens next?</h3>
                        <p>Once you submit your request, our providers will review it and you can track the progress of the request in your dashboard.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.request-page {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: #060d1a;
  position: relative;
  overflow: hidden;
}

.request-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.request-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(240, 237, 230, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #4d8ef0;
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

/* Main Container */
.request-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}

/* Form Styles */
.request-form-container {
  background: #091222;
  border: 1px solid rgba(77, 142, 240, 0.15);
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #4d8ef0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.form-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  color: #f0ede6;
}

.form-title em { font-style: italic; color: #4d8ef0; }

.form-bar {
  width: 40px;
  height: 3px;
  background: #4d8ef0;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(240, 237, 230, 0.6);
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: #0a1628;
  border: 1px solid rgba(77, 142, 240, 0.2);
  padding: 0.75rem;
  color: #f0ede6;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4d8ef0;
  box-shadow: 0 0 0 3px rgba(77, 142, 240, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  display: block;
  font-size: 0.7rem;
  color: rgba(240, 237, 230, 0.3);
  margin-top: 0.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #4d8ef0;
  color: #fff;
  clip-path: polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%);
}

.btn-primary:hover:not(:disabled) {
  background: #6aa3f5;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(77, 142, 240, 0.3);
  color: rgba(240, 237, 230, 0.6);
  clip-path: polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%);
}

.btn-secondary:hover {
  border-color: rgba(77, 142, 240, 0.6);
  color: #f0ede6;
}

/* Info Cards */
.request-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: #091222;
  border: 1px solid rgba(77, 142, 240, 0.15);
  padding: 1.5rem;
}

.info-icon {
  font-size: 2rem !important;
  color: #4d8ef0;
  margin-bottom: 1rem;
}

.info-card h3 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #f0ede6;
  margin-bottom: 1rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  color: rgba(240, 237, 230, 0.5);
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.info-card li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #4d8ef0;
}

.info-card p {
  color: rgba(240, 237, 230, 0.5);
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Loading Dots */
.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.loading-dots span {
  width: 5px;
  height: 5px;
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

/* Decorative Lines */
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

/* Responsive */
@media (max-width: 768px) {
  .request-container {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .request-inner {
    padding: 1rem;
  }
  
  .request-form-container {
    padding: 1.5rem;
  }
}
</style>