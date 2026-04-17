<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const services = ref([])
const requests = ref([])
const loading = ref(true)
const serviceModal = ref(false)
const deleteModal = ref(false)
const selectedService = ref(null)
const actionLoadingId = ref(null)
const formLoading = ref(false)
const feedback = ref(null)
const activeTab = ref('services')

const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Pest Control', 'Carpentry', 'Construction', 'Other']

const emptyForm = () => ({
  name: '', description: '', price: '', category: '', image: null
})

const form = ref(emptyForm())
const isEditing = computed(() => !!selectedService.value)
const imagePreview = ref(null)

const stats = computed(() => ({
  totalServices: services.value.length,
  totalRequests: requests.value.length,
  pending: requests.value.filter(r => r.status === 'pending').length,
  completed: requests.value.filter(r => r.status === 'completed').length,
}))

const STATUS_LABELS = { pending: 'Pending', active: 'Active', completed: 'Completed', cancelled: 'Cancelled' }
const STATUS_TO_STEP = { pending: 0, reviewing: 1, active: 2, in_progress: 2, completed: 3, cancelled: 0 }

const fetchData = async () => {
  loading.value = true
  try {
    const [svcRes, reqRes] = await Promise.all([
      api.get('/services'),
      api.get('/service-requests'),
    ])
    services.value = svcRes.data.services ?? svcRes.data.data ?? svcRes.data ?? []
    requests.value = reqRes.data.service_requests ?? reqRes.data ?? []
  } catch (err) {
    console.error(err.response?.status, err.response?.data)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedService.value = null
  form.value = emptyForm()
  imagePreview.value = null
  feedback.value = null
  serviceModal.value = true
}

const openEdit = (service) => {
  selectedService.value = service
  form.value = {
    name: service.name ?? '',
    description: service.description ?? '',
    price: service.price ?? '',
    category: service.category ?? '',
    image: null,
    location: service.location ?? '',
    contact_info: service.contact_info ?? '',
  }
  imagePreview.value = service.image ?? null
  feedback.value = null
  serviceModal.value = true
}

const openDelete = (service) => {
  selectedService.value = service
  deleteModal.value = true
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  form.value.image = file
  imagePreview.value = URL.createObjectURL(file)
}

const saveService = async () => {
  formLoading.value = true
  feedback.value = null
  try {
    const payload = new FormData()
    payload.append('name', form.value.name)
    payload.append('description', form.value.description)
    payload.append('price', form.value.price)
    payload.append('category', form.value.category)
    payload.append('location', form.value.location)
    payload.append('contact_info', form.value.contact_info)
    if (form.value.image) payload.append('image', form.value.image)

    if (isEditing.value) {
      payload.append('_method', 'PUT')
      const { data } = await api.post(`/services/${selectedService.value.id}`, payload)
      services.value = services.value.map(s =>
        s.id === selectedService.value.id ? (data.service ?? data) : s
      )
    } else {
      const { data } = await api.post('/services', payload)
      services.value.unshift(data.service ?? data)
    }
    serviceModal.value = false
  } catch (err) {
    const errors = err.response?.data?.errors
    const first = errors ? Object.values(errors)[0][0] : null
    feedback.value = first ?? err.response?.data?.message ?? 'Something went wrong.'
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = async () => {
  actionLoadingId.value = selectedService.value.id
  try {
    await api.delete(`/services/${selectedService.value.id}`)
    services.value = services.value.filter(s => s.id !== selectedService.value.id)
    deleteModal.value = false
  } catch (err) {
    console.error(err.response?.data)
  } finally {
    actionLoadingId.value = null
  }
}

const updateRequestStatus = async (req, status) => {
  actionLoadingId.value = req.id
  try {
    await api.patch(`/service-requests/${req.id}`, { status })
    requests.value = requests.value.map(r =>
      r.id === req.id ? { ...r, status } : r
    )
  } catch (err) {
    console.error(err.response?.data)
  } finally {
    actionLoadingId.value = null
  }
}

onMounted(fetchData)
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="pd">
    <div class="deco-lines">
      <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
    </div>

    <div class="pd-inner">

      <div class="pd-header">
        <div>
          <div class="pd-eyebrow">PROVIDER DASHBOARD</div>
          <h1 class="pd-title">MANAGE YOUR<br><em>SERVICES.</em></h1>
          <div class="pd-bar"></div>
        </div>
        <button class="create-btn" @click="openCreate">
          + NEW SERVICE
        </button>
      </div>

      <!-- Stats -->
      <div class="pd-stats">
        <div class="stat-card">
          <div class="stat-label">Total Services</div>
          <div class="stat-num blue">{{ stats.totalServices }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Requests</div>
          <div class="stat-num blue">{{ stats.totalRequests }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending</div>
          <div class="stat-num amber">{{ stats.pending }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Completed</div>
          <div class="stat-num green">{{ stats.completed }}</div>
        </div>
      </div>

      <div class="pd-tabs">
        <button class="pd-tab" :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
          My Services <span class="tab-count">{{ services.length }}</span>
        </button>
        <button class="pd-tab" :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
          Requests <span class="tab-count">{{ requests.length }}</span>
        </button>
      </div>

      <!-- Services Tab -->
      <div v-if="activeTab === 'services'">

        <div v-if="loading" class="services-grid">
          <div v-for="n in 4" :key="n" class="service-card skeleton-card">
            <div class="skel skel-img"></div>
            <div class="skel-body">
              <div class="skel w-40"></div>
              <div class="skel w-70 h-20"></div>
              <div class="skel w-50"></div>
            </div>
          </div>
        </div>

        <!-- If the services list is empty -->
        <div v-else-if="services.length === 0" class="empty-state">
          <v-icon icon="mdi-toolbox-outline" class="empty-icon"></v-icon>
          <p class="empty-title">NO SERVICES YET</p>
          <p class="empty-sub">Click "+ New Service" to add your first service</p>
        </div>

        <!-- Grid -->
        <div v-else class="services-grid">
          <div v-for="service in services" :key="service.id" class="service-card">
            <div class="service-card-img">
              <img v-if="service.image" :src="service.image" :alt="service.name" />
              <div v-else class="img-placeholder">
                <v-icon icon="mdi-image-outline" class="placeholder-icon"></v-icon>
              </div>
            </div>
            <div class="service-card-body">
              <div v-if="service.category" class="service-category">{{ service.category }}</div>
              <div class="service-name">{{ service.name }}</div>
              <div class="service-desc">{{ service.description }}</div>
              <div class="service-footer">
                <div class="service-price">KES {{ Number(service.price).toLocaleString() }}</div>
                <div class="service-actions">
                  <button class="svc-btn" @click="openEdit(service)">Edit</button>
                  <button class="svc-btn svc-btn--danger" @click="openDelete(service)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests Tab -->
      <div v-if="activeTab === 'requests'">

        <div v-if="loading" class="requests-list">
          <div v-for="n in 3" :key="n" class="req-card skeleton-card">
            <div class="skel-body" style="padding:1.25rem">
              <div class="skel w-20"></div>
              <div class="skel w-60 h-20"></div>
              <div class="skel w-40"></div>
            </div>
          </div>
        </div>

        <div v-else-if="requests.length === 0" class="empty-state">
          <v-icon icon="mdi-clipboard-text-off-outline" class="empty-icon"></v-icon>
          <p class="empty-title">NO REQUESTS YET</p>
          <p class="empty-sub">Requests from customers will appear here</p>
        </div>

        <div v-else class="requests-list">
          <div v-for="req in requests" :key="req.id" class="req-card">
            <div class="req-main">
              <div class="req-left">
                <div class="req-meta">
                  <span class="req-id">REQ-{{ String(req.id).padStart(3,'0') }}</span>
                  <span class="req-badge" :class="`badge-${req.status}`">
                    {{ STATUS_LABELS[req.status] ?? req.status }}
                  </span>
                </div>
                <div class="req-title">{{ req.service?.name ?? 'Service #' + req.service_id }}</div>
                <div class="req-desc">{{ req.description }}</div>
                <div class="req-info">
                  <div class="req-info-item">
                    <div class="req-info-label">Customer</div>
                    <div class="req-info-val">{{ req.user?.name ?? 'Unknown' }}</div>
                  </div>
                  <div class="req-info-item">
                    <div class="req-info-label">Date</div>
                    <div class="req-info-val">
                      {{ req.request_date
                          ? new Date(req.request_date).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' })
                          : new Date(req.created_at).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' })
                      }}
                    </div>
                  </div>
                  <div v-if="req.address" class="req-info-item">
                    <div class="req-info-label">Address</div>
                    <div class="req-info-val">{{ req.address }}</div>
                  </div>
                </div>
              </div>
              <div class="req-right">
                <div class="req-price">KES {{ Number(req.service?.price ?? req.price ?? 0).toLocaleString() }}</div>
                <div class="req-actions">
                  <template v-if="req.status === 'pending'">
                    <button
                      class="svc-btn svc-btn--primary"
                      :disabled="actionLoadingId === req.id"
                      @click="updateRequestStatus(req, 'active')"
                    >Accept</button>
                    <button
                      class="svc-btn svc-btn--danger"
                      :disabled="actionLoadingId === req.id"
                      @click="updateRequestStatus(req, 'cancelled')"
                    >Decline</button>
                  </template>
                  <template v-else-if="req.status === 'active'">
                    <button
                      class="svc-btn svc-btn--primary"
                      :disabled="actionLoadingId === req.id"
                      @click="updateRequestStatus(req, 'completed')"
                    >Mark Complete</button>
                  </template>
                  <span v-else class="req-status-final">{{ STATUS_LABELS[req.status] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Service Modal (Create / Edit) -->
  <Teleport to="body">
    <div v-if="serviceModal" class="modal-overlay" @click.self="serviceModal = false">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-eyebrow">{{ isEditing ? 'EDIT SERVICE' : 'NEW SERVICE' }}</div>
            <div class="modal-title">{{ isEditing ? 'UPDATE SERVICE' : 'CREATE SERVICE' }}</div>
          </div>
          <button class="modal-close" @click="serviceModal = false">
            <v-icon icon="mdi-close"></v-icon>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="feedback" class="modal-error">
            <v-icon icon="mdi-alert-circle-outline" class="error-icon"></v-icon>
            {{ feedback }}
          </div>

          <div class="modal-fields">

            <!-- Image upload -->
            <div class="field-group modal-full">
              <label class="field-label">Service Image</label>
              <div class="image-upload" @click="$refs.imageInput.click()">
                <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
                <div v-else class="image-placeholder">
                  <v-icon icon="mdi-image-plus-outline" class="upload-icon"></v-icon>
                  <span>Click to upload image</span>
                </div>
              </div>
              <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageChange" />
            </div>

            <div class="field-group">
              <label class="field-label">Service Name</label>
              <div class="field-wrap">
                <v-icon icon="mdi-briefcase-outline" class="field-icon"></v-icon>
                <input v-model="form.name" type="text" class="field-input" placeholder="e.g. Plumbing Repair" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Price (KES)</label>
              <div class="field-wrap">
                <v-icon icon="mdi-currency-usd" class="field-icon"></v-icon>
                <input v-model="form.price" type="number" class="field-input" placeholder="e.g. 5000" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Location</label>
              <div class="field-wrap">
                <v-icon icon="mdi-map-marker-outline" class="field-icon"></v-icon>
                <input v-model="form.location" type="text" class="field-input" placeholder="e.g. Nairobi" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Contact Info</label>
              <div class="field-wrap">
                <v-icon icon="mdi-phone-outline" class="field-icon"></v-icon>
                <input v-model="form.contact_info" type="text" class="field-input" placeholder="e.g. +254 700 000 000" />
              </div>
            </div>

            <div class="field-group modal-full">
              <label class="field-label">Category</label>
              <div class="field-wrap field-wrap--select">
                <v-icon icon="mdi-tag-outline" class="field-icon"></v-icon>
                <select v-model="form.category" class="field-input field-select">
                  <option value="" disabled>Select category</option>
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
                <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
              </div>
            </div>

            <div class="field-group modal-full">
              <label class="field-label">Description</label>
              <div class="field-wrap field-wrap--textarea">
                <textarea
                  v-model="form.description"
                  class="field-input field-textarea"
                  placeholder="Describe what this service includes…"
                  rows="3"
                ></textarea>
              </div>
            </div>

          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn" @click="serviceModal = false">Cancel</button>
          <button
            class="modal-btn modal-btn--primary"
            :class="{ 'modal-btn--loading': formLoading }"
            :disabled="formLoading"
            @click="saveService"
          >
            <span v-if="!formLoading">{{ isEditing ? 'SAVE CHANGES →' : 'CREATE SERVICE →' }}</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Delete Modal -->
  <Teleport to="body">
    <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = false">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-eyebrow" style="color:#ff6060">CONFIRM DELETE</div>
            <div class="modal-title">DELETE SERVICE?</div>
          </div>
          <button class="modal-close" @click="deleteModal = false">
            <v-icon icon="mdi-close"></v-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-warn-text">
            This will permanently delete
            <strong style="color:#f0ede6">{{ selectedService?.name }}</strong>
            and all associated data. This cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="deleteModal = false">Go Back</button>
          <button
            class="modal-btn modal-btn--danger"
            :disabled="actionLoadingId === selectedService?.id"
            @click="confirmDelete"
          >
            <span v-if="actionLoadingId !== selectedService?.id">Yes, Delete It</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pd {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: #060d1a;
  color: #f0ede6;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.pd-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

/* ── HEADER ── */
.pd-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
.pd-eyebrow { font-size: .75rem; font-weight: 700; letter-spacing: .3em; color: #4d8ef0; margin-bottom: .5rem; }
.pd-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 900; text-transform: uppercase; line-height: .92; color: #f0ede6; }
.pd-title em { font-style: italic; color: #4d8ef0; }
.pd-bar { width: 40px; height: 3px; background: #4d8ef0; margin-top: 1rem; }

.create-btn {
  background: #4d8ef0;
  border: none;
  color: #fff;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .95rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: .75rem 1.5rem;
  cursor: pointer;
  clip-path: polygon(3% 0%,100% 0%,97% 100%,0% 100%);
  transition: background .2s, transform .15s;
  white-space: nowrap;
}
.create-btn:hover { background: #6aa3f5; transform: translateY(-1px); }

/* ── STATS ── */
.pd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: #091222; border: 1px solid rgba(77,142,240,.15); padding: 1.1rem 1.25rem; }
.stat-label { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.35); text-transform: uppercase; margin-bottom: .4rem; }
.stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; }
.stat-num.blue { color: #4d8ef0; }
.stat-num.amber { color: #f0a040; }
.stat-num.green { color: #3ecf82; }

/* ── TABS ── */
.pd-tabs { display: flex; gap: .35rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(77,142,240,.1); padding-bottom: 0; }
.pd-tab { background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(240,237,230,.4); font-family: 'Barlow Condensed', sans-serif; font-size: .85rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: .65rem 1.25rem .75rem; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: .5rem; margin-bottom: -1px; }
.pd-tab:hover { color: #f0ede6; }
.pd-tab.active { color: #4d8ef0; border-bottom-color: #4d8ef0; }
.tab-count { background: rgba(77,142,240,.12); border: 1px solid rgba(77,142,240,.2); color: #4d8ef0; font-size: .6rem; padding: .15rem .5rem; }

/* ── SERVICES GRID ── */
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px,1fr)); gap: 1.5rem; }
.service-card { background: #091222; border: 1px solid rgba(77,142,240,.15); transition: border-color .25s, transform .2s; }
.service-card:hover { border-color: rgba(77,142,240,.4); transform: translateY(-3px); }
.service-card-img { width: 100%; height: 160px; overflow: hidden; }
.service-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-placeholder { width: 100%; height: 100%; background: #0a1628; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(77,142,240,.1); }
.placeholder-icon { font-size: 2rem !important; color: rgba(77,142,240,.2); }
.service-card-body { padding: 1.25rem; }
.service-category { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: #4d8ef0; text-transform: uppercase; margin-bottom: .35rem; }
.service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; margin-bottom: .4rem; }
.service-desc { font-size: .83rem; color: rgba(240,237,230,.45); line-height: 1.6; margin-bottom: 1rem; min-height: 2.6em; }
.service-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(77,142,240,.1); padding-top: 1rem; }
.service-price { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; color: #f0ede6; }
.service-actions { display: flex; gap: .5rem; }

/* ── REQUESTS LIST ── */
.requests-list { display: flex; flex-direction: column; gap: 1rem; }
.req-card { background: #091222; border: 1px solid rgba(77,142,240,.15); transition: border-color .25s; }
.req-card:hover { border-color: rgba(77,142,240,.35); }
.req-main { display: grid; grid-template-columns: 1fr auto; align-items: start; padding: 1.25rem; gap: 1rem; }
.req-meta { display: flex; align-items: center; gap: .75rem; margin-bottom: .6rem; flex-wrap: wrap; }
.req-id { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.3); text-transform: uppercase; }
.req-badge { font-size: .6rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; padding: .25rem .7rem; border: 1px solid; }
.badge-pending { background: rgba(240,160,64,.08); border-color: rgba(240,160,64,.3); color: #f0a040; }
.badge-active { background: rgba(77,142,240,.08); border-color: rgba(77,142,240,.3); color: #4d8ef0; }
.badge-completed { background: rgba(62,207,130,.08); border-color: rgba(62,207,130,.3); color: #3ecf82; }
.badge-cancelled { background: rgba(255,96,96,.08); border-color: rgba(255,96,96,.3); color: #ff6060; }
.req-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; margin-bottom: .35rem; }
.req-desc { font-size: .83rem; color: rgba(240,237,230,.45); line-height: 1.6; max-width: 560px; }
.req-info { display: flex; gap: 1.5rem; margin-top: .75rem; flex-wrap: wrap; }
.req-info-item { display: flex; flex-direction: column; gap: .15rem; }
.req-info-label { font-size: .58rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.25); text-transform: uppercase; }
.req-info-val { font-size: .82rem; font-weight: 500; color: rgba(240,237,230,.7); }
.req-right { display: flex; flex-direction: column; align-items: flex-end; gap: .75rem; }
.req-price { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 900; color: #f0ede6; }
.req-actions { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: flex-end; }
.req-status-final { font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: rgba(240,237,230,.3); }

/* ── BUTTONS ── */
.svc-btn { background: transparent; border: 1px solid rgba(77,142,240,.2); color: rgba(240,237,230,.55); font-family: 'Barlow Condensed', sans-serif; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .4rem .85rem; cursor: pointer; clip-path: polygon(5% 0%,100% 0%,95% 100%,0% 100%); transition: all .2s; }
.svc-btn:hover { border-color: rgba(77,142,240,.45); color: #f0ede6; background: rgba(77,142,240,.06); }
.svc-btn--primary { background: #4d8ef0; border-color: #4d8ef0; color: #fff; }
.svc-btn--primary:hover { background: #6aa3f5; }
.svc-btn--danger { border-color: rgba(255,96,96,.2); color: rgba(255,96,96,.6); }
.svc-btn--danger:hover { border-color: rgba(255,96,96,.5); color: #ff6060; background: rgba(255,96,96,.06); }
.svc-btn:disabled { opacity: .5; cursor: wait; }

/* ── SKELETON ── */
.skel { background: linear-gradient(90deg,rgba(77,142,240,.06) 25%,rgba(77,142,240,.12) 50%,rgba(77,142,240,.06) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; height: 10px; border-radius: 2px; }
.skel.skel-img { height: 160px; border-radius: 0; }
.skel-body { padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
.skel.w-20 { width: 20%; } .skel.w-40 { width: 40%; } .skel.w-50 { width: 50%; } .skel.w-60 { width: 60%; } .skel.w-70 { width: 70%; } .skel.h-20 { height: 20px; }
@keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

/* ── EMPTY ── */
.empty-state { padding: 4rem 2rem; text-align: center; border: 1px dashed rgba(77,142,240,.15); }
.empty-icon { font-size: 3rem !important; color: rgba(77,142,240,.2); margin-bottom: 1rem; }
.empty-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 900; color: rgba(240,237,230,.3); }
.empty-sub { font-size: .85rem; color: rgba(240,237,230,.2); margin-top: .5rem; }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(6,13,26,.88); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.modal { background: #091222; border: 1px solid rgba(77,142,240,.25); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(77,142,240,.1); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #091222; z-index: 1; }
.modal-eyebrow { font-size: .65rem; font-weight: 700; letter-spacing: .25em; color: #4d8ef0; text-transform: uppercase; margin-bottom: .3rem; }
.modal-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; }
.modal-close { background: none; border: none; color: rgba(240,237,230,.35); cursor: pointer; transition: color .2s; }
.modal-close:hover { color: #f0ede6; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(77,142,240,.1); display: flex; gap: .75rem; justify-content: flex-end; position: sticky; bottom: 0; background: #091222; }

.modal-error { display: flex; align-items: center; gap: .5rem; background: rgba(255,96,96,.08); border: 1px solid rgba(255,96,96,.3); color: #ff6060; padding: .75rem 1rem; font-size: .82rem; margin-bottom: 1.25rem; }
.error-icon { font-size: 1rem !important; flex-shrink: 0; }
.modal-warn-text { font-size: .88rem; color: rgba(240,237,230,.55); line-height: 1.7; }

.modal-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.modal-full { grid-column: 1 / -1; }

/* Image upload */
.image-upload { border: 1px dashed rgba(77,142,240,.25); background: #0a1628; cursor: pointer; transition: border-color .2s; overflow: hidden; height: 140px; display: flex; align-items: center; justify-content: center; }
.image-upload:hover { border-color: rgba(77,142,240,.5); }
.image-preview { width: 100%; height: 100%; object-fit: cover; }
.image-placeholder { display: flex; flex-direction: column; align-items: center; gap: .5rem; color: rgba(240,237,230,.25); font-size: .82rem; }
.upload-icon { font-size: 2rem !important; color: rgba(77,142,240,.3); }

/* Form fields */
.field-group { display: flex; flex-direction: column; gap: .4rem; }
.field-label { font-size: .6rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.4); text-transform: uppercase; }
.field-wrap { position: relative; display: flex; align-items: center; background: #0a1628; border: 1px solid rgba(77,142,240,.15); transition: border-color .2s, box-shadow .2s; }
.field-wrap:focus-within { border-color: #4d8ef0; box-shadow: 0 0 0 3px rgba(77,142,240,.1); }
.field-wrap--textarea { align-items: flex-start; }
.field-icon { color: rgba(240,237,230,.25) !important; font-size: 1.05rem !important; padding: 0 .7rem; flex-shrink: 0; }
.field-input { flex: 1; background: transparent; border: none; outline: none; padding: .85rem .75rem .85rem 0; color: #f0ede6; font-family: 'Barlow', sans-serif; font-size: .9rem; }
.field-input::placeholder { color: rgba(240,237,230,.2); }
.field-textarea { resize: vertical; padding: .85rem .75rem; min-height: 90px; }
.field-select { appearance: none; cursor: pointer; padding-right: 2.2rem; }
.field-select option { background: #0d1a2e; color: #f0ede6; }
.select-caret { position: absolute; right: .6rem; color: rgba(240,237,230,.25) !important; font-size: 1rem !important; pointer-events: none; }

/* Modal buttons */
.modal-btn { background: transparent; border: 1px solid rgba(77,142,240,.2); color: rgba(240,237,230,.6); font-family: 'Barlow Condensed', sans-serif; font-size: .85rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .65rem 1.3rem; cursor: pointer; clip-path: polygon(4% 0%,100% 0%,96% 100%,0% 100%); transition: all .2s; display: flex; align-items: center; justify-content: center; min-width: 120px; min-height: 44px; }
.modal-btn:hover { border-color: rgba(77,142,240,.45); color: #f0ede6; }
.modal-btn--primary { background: #4d8ef0; border-color: #4d8ef0; color: #fff; }
.modal-btn--primary:hover { background: #6aa3f5; }
.modal-btn--danger { background: rgba(255,96,96,.1); border-color: rgba(255,96,96,.35); color: #ff6060; }
.modal-btn--danger:hover { background: rgba(255,96,96,.18); }
.modal-btn:disabled { opacity: .55; cursor: wait; }

/* Loading dots */
.loading-dots { display: flex; gap: 4px; align-items: center; }
.loading-dots span { width: 5px; height: 5px; background: currentColor; border-radius: 50%; animation: dotBounce .9s ease-in-out infinite; }
.loading-dots span:nth-child(2) { animation-delay: .15s; }
.loading-dots span:nth-child(3) { animation-delay: .3s; }
@keyframes dotBounce { 0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.2);opacity:1} }

/* Deco lines */
.deco-lines { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.deco-line { position: absolute; width: 1px; bottom: -10%; background: linear-gradient(to top, rgba(77,142,240,.2), transparent); animation: riseLine 4s ease-in-out infinite alternate; }
.deco-line:nth-child(1){left:12%;height:40%} .deco-line:nth-child(2){left:28%;height:60%}
.deco-line:nth-child(3){left:45%;height:35%} .deco-line:nth-child(4){left:62%;height:55%}
.deco-line:nth-child(5){left:78%;height:45%} .deco-line:nth-child(6){left:92%;height:65%}
@keyframes riseLine{0%{transform:translateY(0);opacity:.4}100%{transform:translateY(-40px);opacity:1}}

/* Responsive */
@media (max-width: 640px) {
  .pd-stats { grid-template-columns: repeat(2,1fr); }
  .req-main { grid-template-columns: 1fr; }
  .req-right { align-items: flex-start; }
  .modal-fields { grid-template-columns: 1fr; }
}
</style>