<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const auth = useAuthStore();

const requests = ref([]);
const loading = ref(true);
const search = ref('');
const activeFilter = ref('all');
const actionLoadingId = ref(null);

const detailModal = ref(false);
const cancelModal = ref(false);
const deleteModal = ref(false);
const selectedRequest = ref(null);

const STEPS = ['Submitted', 'Reviewing', 'In Progress', 'Completed'];
const FILTERS = ['all', 'pending', 'reviewing', 'active', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS = { pending: 'Pending', reviewing: 'Reviewing', active: 'Active', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

const STATUS_TO_STEP = {
    pending: 0,
    reviewing: 1,
    active: 2,
    in_progress: 2,
    completed: 3,
    cancelled: -1,
    default: 0
};

const fetchRequests = async () => {
    loading.value = true;
    try {
        const { data } = await api.get('/service-requests');
        console.log('Fetched requests: ', data);
        let requestsData = [];

        if (data) {
          if (Array.isArray(data)) {
            requestsData = data;
          } else if (data.service_requests && Array.isArray(data.service_requests)) {
            requestsData = data.service_requests;
          } else if (data.data && Array.isArray(data.data)) {
            requestsData = data.data;
          } else if (data.requests && Array.isArray(data.requests)) {
            requestsData = data.requests;
          } else {
            console.warn('Unexpected response structure: ', data);
            requestsData = [];
          }
        }
        requests.value = requestsData;
        console.log('Processed requests: ', requests.value.length, 'requests found');
    } catch (error) {
        console.error('Error fetching requests: ', error.response?.status, error.response?.data);
    } finally {
        loading.value = false;
    }
}

const stats = computed(() => {
  const requestsArray = Array.isArray(requests.value) ? requests.value : [];
  return {
    total: requestsArray.length,
    pending: requestsArray.filter(r => r.status === 'pending').length,
    reviewing: requestsArray.filter(r => r.status === 'reviewing').length,
    active: requestsArray.filter(r => r.status === 'active').length,
    in_progress: requestsArray.filter(r => r.status === 'in_progress').length,
    completed: requestsArray.filter(r => r.status === 'completed').length,
    cancelled: requestsArray.filter(r => r.status === 'cancelled').length,
  };
});

const filteredRequests = computed(() => {
    const requestsArray = Array.isArray(requests.value) ? requests.value : [];
    return requestsArray.filter(r => {
        const matchFilter = activeFilter.value === 'all' || r.status === activeFilter.value;
        const serviceName = r.service?.name ?? r.service ?? '';
        const matchSearch = serviceName.toLowerCase().includes(search.value.toLowerCase());
        return matchFilter && matchSearch;
    });
});

const openDetail = (request) => { selectedRequest.value = request; detailModal.value = true; }
const openCancel = (request) => { selectedRequest.value = request; cancelModal.value = true; }
const openDelete = (request) => { selectedRequest.value = request; deleteModal.value = true; }

const confirmCancel = async () => {
    actionLoadingId.value = selectedRequest.value.id
    try {
      let response;
      try {
        response = await api.patch(`/service-requests/${selectedRequest.value.id}/cancel`);
      } catch {
        response = await api.post(`/service-requests/${selectedRequest.value.id}/cancel`);
      }
      if (Array.isArray(requests.value)) {
        requests.value = requests.value.map(r => r.id === selectedRequest.value.id ? { ...r, status: 'cancelled' } : r);
      }
      cancelModal.value = false;
    } catch (error) {
        console.error('Error cancelling request: ', error.response?.status, error.response?.data);
        alert('Failed to cancel the request. Please try again later.');
    } finally {
        actionLoadingId.value = null;
    }
}

const confirmDelete = async () => {
    actionLoadingId.value = selectedRequest.value.id
    try {
        await api.delete(`/service-requests/${selectedRequest.value.id}`);
        if (Array.isArray(requests.value)) {
          requests.value = requests.value.filter(r => r.id !== selectedRequest.value.id);
        }
        deleteModal.value = false;
    } catch (error) {
        console.error('Error deleting request: ', error.response?.status, error.response?.data);
        alert('Failed to delete the request. Please try again later.');
    } finally {
        actionLoadingId.value = null;
    }
}

onMounted(() => {
    fetchRequests();
})
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="rp">
    <div class="deco-lines">
      <div class="deco-line" v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></div>
    </div>

    <div class="rp-inner">

      <!-- Header -->
      <div class="rp-header">
        <div class="rp-eyebrow"></div>
        <h1 class="rp-title">MY<br><em>REQUESTS.</em></h1>
        <div class="rp-bar"></div>
      </div>

      <!-- Stats -->
      <div class="rp-stats">
        <div class="stat-card">
          <div class="stat-label">Total Requests</div>
          <div class="stat-num blue">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending</div>
          <div class="stat-num amber">{{ stats.pending }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-num blue">{{ stats.active }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">In Progress</div>
          <div class="stat-num blue">{{ stats.in_progress }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Reviewing</div>
          <div class="stat-num blue">{{ stats.reviewing }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Completed</div>
          <div class="stat-num green">{{ stats.completed }}</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="rp-controls">
        <div class="search-wrap">
          <v-icon icon="mdi-magnify" class="search-icon"></v-icon>
          <input v-model="search" class="search-input" placeholder="Search requests…" />
        </div>
        <div class="filter-tabs">
          <button
            v-for="f in FILTERS" :key="f"
            class="ftab" :class="{ active: activeFilter === f }"
            @click="activeFilter = f"
          >{{ f === 'all' ? 'All' : STATUS_LABELS[f] }}</button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="requests-list">
        <div v-for="n in 3" :key="n" class="req-card skeleton-card">
          <div class="skeleton-body">
            <div class="skel w-20"></div>
            <div class="skel w-50 h-20"></div>
            <div class="skel w-70"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <v-icon icon="mdi-clipboard-text-off-outline" class="empty-icon"></v-icon>
        <p class="empty-title">NO REQUESTS FOUND</p>
        <p class="empty-sub">Try a different filter or search term</p>
      </div>

      <!-- List -->
      <div v-else class="requests-list">
        <div v-for="req in filteredRequests" :key="req.id" class="req-card">
          <div class="req-card-main">
            <div class="req-left">
              <div class="req-meta">
                <span class="req-id">REQ-{{ String(req.id).padStart(3, '0') }}</span>
                <span class="req-badge" :class="`badge-${req.status}`">
                  {{ STATUS_LABELS[req.status] }}
                </span>
              </div>
              <h3 class="req-title">{{ req.service?.name ?? 'Service #' + req.service_id }}</h3>
              <p class="req-desc">{{ req.description }}</p>
              <div class="req-info">
                <div class="req-info-item">
                  <div class="req-info-label">Date</div>
                  <div class="req-info-val">{{ req.request_date ? new Date(req.request_date).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' }) : new Date(req.created_at).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' }) }}</div>
                </div>
                <div class="req-info-item">
                  <div class="req-info-label">Provider</div>
                  <div class="req-info-val">{{ req.provider?.name ?? 'Unassigned' }}</div>
                </div>
                <div v-if="req.address" class="req-info-item">
                    <div class="req-info-label">Address</div>
                    <div class="req-info-val">{{ req.address }}</div>
                </div>
              </div>
            </div>
            <div class="req-right">
              <div class="req-price">KES {{ Number(req.price).toLocaleString() }}</div>
              <div class="req-actions">
                <button class="action-btn primary" @click="openDetail(req)">Details →</button>
                <button
                  v-if="req.status === 'pending' || req.status === 'active'"
                  class="action-btn danger"
                  @click="openCancel(req)"
                >Cancel</button>
                <button
                  v-if="req.status === 'cancelled' || req.status === 'completed'"
                  class="action-btn danger"
                  @click="openDelete(req)"
                >Delete</button>
              </div>
            </div>
          </div>

          <!-- Progress tracker -->
          <div v-if="req.status !== 'cancelled'" class="req-progress">
            <div class="progress-label">Progress</div>
            <div class="progress-steps">
              <div
                v-for="(step, i) in STEPS" :key="i"
                class="pstep-wrap"
                :class="{ done: i < (STATUS_TO_STEP[req.status] ?? 0), current: i === (STATUS_TO_STEP[req.status] ?? 0) }"
              >
                <div style="display:flex;align-items:center;width:100%">
                  <div v-if="i > 0" class="pstep-line" :class="{ done: i <= (STATUS_TO_STEP[req.status] ?? 0) }"></div>
                  <div class="pstep-dot" :class="{ done: i < (STATUS_TO_STEP[req.status] ?? 0), current: i === (STATUS_TO_STEP[req.status] ?? 0) }"></div>
                  <div v-if="i < STEPS.length - 1" class="pstep-line" :class="{ done: i < (STATUS_TO_STEP[req.status] ?? 0) }"></div>
                </div>
                <div class="pstep-text">{{ step }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Modal -->
  <Teleport to="body">
    <div v-if="detailModal" class="modal-overlay" @click.self="detailModal = false">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-eyebrow">REQUEST DETAILS</div>
            <div class="modal-title">{{ selectedRequest?.service?.name ?? 'Service #' + selectedRequest?.service_id }}</div>
          </div>
          <button class="modal-close" @click="detailModal = false">
            <v-icon icon="mdi-close"></v-icon>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-row"><div class="modal-key">Request ID</div><div class="modal-val">REQ-{{ String(selectedRequest.id).padStart(3,'0') }}</div></div>
          <div class="modal-row"><div class="modal-key">Status</div><div class="modal-val">{{ STATUS_LABELS[selectedRequest.status] }}</div></div>
          <div class="modal-row"><div class="modal-key">Date Submitted</div><div class="modal-val">{{ selectedRequest.request_date ? new Date(selectedRequest.request_date).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' }) : new Date(selectedRequest.created_at).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' }) }}</div></div>
          <div class="modal-row"><div class="modal-key">Provider</div><div class="modal-val">{{ selectedRequest.provider?.name ?? 'Unassigned' }}</div></div>
          <div class="modal-row"><div class="modal-key">Price</div><div class="modal-val">KES {{ Number(selectedRequest.price).toLocaleString() }}</div></div>
          <div class="modal-row"><div class="modal-key">Description</div><div class="modal-val">{{ selectedRequest.description }}</div></div>
          <div class="modal-row"><div class="modal-key">Address</div><div class="modal-val">{{ selectedRequest.address ?? 'Not Provided' }}</div></div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="detailModal = false">Close</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Cancel Modal -->
  <Teleport to="body">
    <div v-if="cancelModal" class="modal-overlay" @click.self="cancelModal = false">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-eyebrow" style="color:#ff6060">CONFIRM ACTION</div>
            <div class="modal-title">CANCEL REQUEST?</div>
          </div>
          <button class="modal-close" @click="cancelModal = false">
            <v-icon icon="mdi-close"></v-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-warning-text">This will cancel your service request. The service provider will be notified. This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="cancelModal = false">Go Back</button>
          <button
            class="modal-btn confirm-danger"
            :disabled="actionLoadingId === selectedRequest?.id"
            @click="confirmCancel"
          >
            <span v-if="actionLoadingId !== selectedRequest?.id">Yes, Cancel It</span>
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
            <div class="modal-title">DELETE REQUEST?</div>
          </div>
          <button class="modal-close" @click="deleteModal = false">
            <v-icon icon="mdi-close"></v-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-warning-text">This will permanently delete this request from your history. This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="deleteModal = false">Go Back</button>
          <button
            class="modal-btn confirm-danger"
            :disabled="actionLoadingId === selectedRequest?.id"
            @click="confirmDelete"
          >
            <span v-if="actionLoadingId !== selectedRequest?.id">Yes, Delete It</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.rp {
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  background: #060d1a;
  color: #f0ede6;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.rp-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

/* ── HEADER ── */
.rp-eyebrow { font-size: .75rem; font-weight: 700; letter-spacing: .3em; color: #4d8ef0; margin-bottom: .5rem; }
.rp-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 900; text-transform: uppercase; line-height: .92; color: #f0ede6; }
.rp-title em { font-style: italic; color: #4d8ef0; }
.rp-bar { width: 40px; height: 3px; background: #4d8ef0; margin-top: 1rem; margin-bottom: 2rem; }

/* ── STATS ── */
.rp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: #091222; border: 1px solid rgba(77,142,240,.15); padding: 1.1rem 1.25rem; }
.stat-label { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.35); text-transform: uppercase; margin-bottom: .4rem; }
.stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; }
.stat-num.blue { color: #4d8ef0; }
.stat-num.amber { color: #f0a040; }
.stat-num.green { color: #3ecf82; }

/* ── CONTROLS ── */
.rp-controls { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; max-width: 380px; display: flex; align-items: center; background: #0a1628; border: 1px solid rgba(77,142,240,.15); transition: border-color .2s, box-shadow .2s; }
.search-wrap:focus-within { border-color: #4d8ef0; box-shadow: 0 0 0 3px rgba(77,142,240,.12); }
.search-icon { color: rgba(240,237,230,.25); font-size: 1.1rem !important; padding: 0 .75rem; flex-shrink: 0; }
.search-input { flex: 1; background: transparent; border: none; outline: none; padding: .8rem .75rem .8rem 0; color: #f0ede6; font-family: 'Barlow', sans-serif; font-size: .9rem; }
.search-input::placeholder { color: rgba(240,237,230,.2); }
.filter-tabs { display: flex; gap: .35rem; flex-wrap: wrap; }
.ftab { background: transparent; border: 1px solid rgba(77,142,240,.15); color: rgba(240,237,230,.45); font-family: 'Barlow Condensed', sans-serif; font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .4rem .9rem; cursor: pointer; transition: all .2s; }
.ftab:hover { border-color: rgba(77,142,240,.35); color: #f0ede6; }
.ftab.active { background: rgba(77,142,240,.12); border-color: #4d8ef0; color: #4d8ef0; }

/* ── REQUEST CARD ── */
.requests-list { display: flex; flex-direction: column; gap: 1rem; }
.req-card { background: #091222; border: 1px solid rgba(77,142,240,.15); transition: border-color .25s, transform .2s; overflow: hidden; }
.req-card:hover { border-color: rgba(77,142,240,.35); transform: translateX(3px); }
.req-card-main { display: grid; grid-template-columns: 1fr auto; align-items: start; padding: 1.25rem; gap: 1rem; }
.req-meta { display: flex; align-items: center; gap: .75rem; margin-bottom: .6rem; flex-wrap: wrap; }
.req-id { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.3); text-transform: uppercase; }
.req-badge { font-size: .6rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; padding: .25rem .7rem; border: 1px solid; }
.badge-pending { background: rgba(240,160,64,.08); border-color: rgba(240,160,64,.3); color: #f0a040; }
.badge-active { background: rgba(77,142,240,.08); border-color: rgba(77,142,240,.3); color: #4d8ef0; }
.badge-completed { background: rgba(62,207,130,.08); border-color: rgba(62,207,130,.3); color: #3ecf82; }
.badge-cancelled { background: rgba(255,96,96,.08); border-color: rgba(255,96,96,.3); color: #ff6060; }
.req-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; margin-bottom: .4rem; }
.req-desc { font-size: .83rem; font-weight: 300; color: rgba(240,237,230,.45); line-height: 1.6; max-width: 560px; }
.req-info { display: flex; gap: 1.5rem; margin-top: .75rem; flex-wrap: wrap; }
.req-info-item { display: flex; flex-direction: column; gap: .15rem; }
.req-info-label { font-size: .58rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.25); text-transform: uppercase; }
.req-info-val { font-size: .82rem; font-weight: 500; color: rgba(240,237,230,.7); }
.req-right { display: flex; flex-direction: column; align-items: flex-end; gap: .75rem; }
.req-price { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 900; color: #f0ede6; }
.req-actions { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: flex-end; }

/* ── ACTION BUTTONS ── */
.action-btn { background: transparent; border: 1px solid rgba(77,142,240,.2); color: rgba(240,237,230,.55); font-family: 'Barlow Condensed', sans-serif; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .4rem .85rem; cursor: pointer; clip-path: polygon(5% 0%,100% 0%,95% 100%,0% 100%); transition: all .2s; white-space: nowrap; }
.action-btn:hover { border-color: rgba(77,142,240,.45); color: #f0ede6; background: rgba(77,142,240,.06); }
.action-btn.primary { background: #4d8ef0; border-color: #4d8ef0; color: #fff; }
.action-btn.primary:hover { background: #6aa3f5; }
.action-btn.danger { border-color: rgba(255,96,96,.2); color: rgba(255,96,96,.6); }
.action-btn.danger:hover { border-color: rgba(255,96,96,.5); color: #ff6060; background: rgba(255,96,96,.06); }

/* ── PROGRESS ── */
.req-progress { padding: .85rem 1.25rem; border-top: 1px solid rgba(77,142,240,.1); display: flex; align-items: center; gap: 1.5rem; }
.progress-label { font-size: .62rem; font-weight: 700; letter-spacing: .2em; color: rgba(240,237,230,.3); text-transform: uppercase; white-space: nowrap; }
.progress-steps { display: flex; align-items: center; flex: 1; }
.pstep-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; }
.pstep-wrap > div { display: flex; align-items: center; width: 100%; }
.pstep-dot { width: 8px; height: 8px; background: rgba(77,142,240,.2); border: 1px solid rgba(77,142,240,.3); flex-shrink: 0; }
.pstep-dot.done { background: #4d8ef0; border-color: #4d8ef0; }
.pstep-dot.current { background: transparent; border-color: #4d8ef0; box-shadow: 0 0 0 3px rgba(77,142,240,.15); }
.pstep-line { flex: 1; height: 1px; background: rgba(77,142,240,.15); }
.pstep-line.done { background: #4d8ef0; }
.pstep-text { font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(240,237,230,.2); margin-top: .4rem; white-space: nowrap; }
.pstep-wrap.done .pstep-text { color: #4d8ef0; }
.pstep-wrap.current .pstep-text { color: rgba(240,237,230,.6); }

/* ── SKELETON ── */
.skeleton-card { padding: 1.25rem; }
.skeleton-body { display: flex; flex-direction: column; gap: .75rem; }
.skel { background: linear-gradient(90deg,rgba(77,142,240,.06) 25%,rgba(77,142,240,.12) 50%,rgba(77,142,240,.06) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; height: 10px; border-radius: 2px; }
.skel.w-20 { width: 20%; }
.skel.w-50 { width: 50%; }
.skel.w-70 { width: 70%; }
.skel.h-20 { height: 20px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── EMPTY ── */
.empty-state { padding: 4rem 2rem; text-align: center; border: 1px dashed rgba(77,142,240,.15); }
.empty-icon { font-size: 3rem !important; color: rgba(77,142,240,.2); margin-bottom: 1rem; }
.empty-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 900; color: rgba(240,237,230,.3); }
.empty-sub { font-size: .85rem; color: rgba(240,237,230,.2); margin-top: .5rem; }

/* ── MODALS ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(6,13,26,.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.modal { background: #091222; border: 1px solid rgba(77,142,240,.25); width: 100%; max-width: 520px; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(77,142,240,.1); display: flex; align-items: center; justify-content: space-between; }
.modal-eyebrow { font-size: .65rem; font-weight: 700; letter-spacing: .25em; color: #4d8ef0; text-transform: uppercase; margin-bottom: .3rem; }
.modal-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; color: #f0ede6; }
.modal-close { background: none; border: none; color: rgba(240,237,230,.35); cursor: pointer; transition: color .2s; }
.modal-close:hover { color: #f0ede6; }
.modal-body { padding: 1.5rem; }
.modal-row { display: flex; justify-content: space-between; align-items: flex-start; padding: .65rem 0; border-bottom: 1px solid rgba(77,142,240,.07); }
.modal-row:last-child { border-bottom: none; }
.modal-key { font-size: .65rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: rgba(240,237,230,.3); }
.modal-val { font-size: .88rem; color: #f0ede6; text-align: right; max-width: 60%; }
.modal-warning-text { font-size: .88rem; color: rgba(240,237,230,.55); line-height: 1.7; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(77,142,240,.1); display: flex; gap: .75rem; justify-content: flex-end; }
.modal-btn { background: transparent; border: 1px solid rgba(77,142,240,.2); color: rgba(240,237,230,.6); font-family: 'Barlow Condensed', sans-serif; font-size: .85rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: .6rem 1.3rem; cursor: pointer; clip-path: polygon(4% 0%,100% 0%,96% 100%,0% 100%); transition: all .2s; }
.modal-btn:hover { border-color: rgba(77,142,240,.45); color: #f0ede6; }
.modal-btn.confirm-danger { background: rgba(255,96,96,.1); border-color: rgba(255,96,96,.35); color: #ff6060; }
.modal-btn.confirm-danger:hover { background: rgba(255,96,96,.18); }
.modal-btn:disabled { opacity: .55; cursor: wait; }

/* ── LOADING DOTS ── */
.loading-dots { display: flex; gap: 4px; align-items: center; }
.loading-dots span { width: 5px; height: 5px; background: #ff6060; border-radius: 50%; animation: dotBounce .9s ease-in-out infinite; }
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

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .rp-stats { grid-template-columns: repeat(2, 1fr); }
  .req-card-main { grid-template-columns: 1fr; }
  .req-right { align-items: flex-start; }
}
</style>