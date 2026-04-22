<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

const error = ref('');
const loading = ref(false);
const tab = ref(1);
const search = ref('');

// ── DIALOG VISIBILITY ──
const showAddUserDialog = ref(false);
const showAddRoleDialog = ref(false);
const showAddServiceDialog = ref(false);
const showAddServiceRequestDialog = ref(false);
const showEditUserDialog = ref(false);
const showEditRoleDialog = ref(false);
const showEditServiceDialog = ref(false);
const showEditServiceRequestDialog = ref(false);
const showDeleteUserDialog = ref(false);
const showDeleteRoleDialog = ref(false);
const showDeleteServiceDialog = ref(false);
const showDeleteServiceRequestDialog = ref(false);

// ── EDITING IDS ──
const editingUserId = ref(null);
const editingRoleId = ref(null);
const editingServiceId = ref(null);
const editingServiceRequestId = ref(null);

// ── USER FORM FIELDS ──
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const address = ref('');
const userRole = ref('');

// ── ROLE FORM FIELDS ──
const roleName = ref('');
const roleDescription = ref('');

// ── SERVICE FORM FIELDS ──
const serviceName = ref('');
const serviceDescription = ref('');
const servicePrice = ref('');
const serviceLocation = ref('');
const serviceContactInfo = ref('');
const serviceImagePath = ref('');
const serviceCategory = ref('');

// ── SERVICE REQUEST FORM FIELDS ──
const requestUserId = ref('');
const requestServiceId = ref('');
const requestDate = ref('');
const requestStatus = ref('');
const requestAddress = ref('');
const requestDescription = ref('');
const requestPrice = ref('');

// ── DATA ──
const users = ref([]);
const roles = ref([]);
const services = ref([]);
const serviceRequests = ref([]);

// ── COMPUTED ──
const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  const q = search.value.toLowerCase();
  return users.value.filter(u =>
    (u.name ?? '').toLowerCase().includes(q) ||
    (u.email ?? '').toLowerCase().includes(q) ||
    (u.phone ?? '').toLowerCase().includes(q) ||
    (u.role ?? '').toLowerCase().includes(q)
  );
});

const stats = computed(() => [
  { label: 'Users', value: users.value.length, icon: 'mdi-account-group', color: '#4d8ef0' },
  { label: 'Roles', value: roles.value.length, icon: 'mdi-shield-account', color: '#f39c12' },
  { label: 'Services', value: services.value.length, icon: 'mdi-wrench', color: '#27ae60' },
  { label: 'Service Requests', value: serviceRequests.value.length, icon: 'mdi-file-document', color: '#e74c3c' },
]);

// ── COLOR MAPS ──
const roleColors = { Admin: '#ff6b6b', Customer: '#4d8ef0', Provider: '#27ae60' };
const statusColors = { pending: '#f39c12', active: '#4d8ef0', completed: '#27ae60', cancelled: '#e74c3c' };

// ── FETCH ──
async function fetchUsers() {
  loading.value = true;
  try {
    const { data } = await api.get('/users');
    users.value = data.users ?? data.data ?? data ?? [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch users';
  } finally {
    loading.value = false;
  }
}

async function fetchRoles() {
  try {
    const { data } = await api.get('/roles');
    roles.value = data.roles ?? data.data ?? data ?? [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch roles';
  }
}

async function fetchServices() {
  try {
    const { data } = await api.get('/services');
    services.value = data.services ?? data.data ?? data ?? [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch services';
  }
}

async function fetchServiceRequests() {
  try {
    const { data } = await api.get('/service-requests');
    serviceRequests.value = data.service_requests ?? data.data ?? data ?? [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch service requests';
  }
}

// ── ADD ──
async function addUser() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', `${firstName.value} ${lastName.value}`);
    payload.append('email', email.value);
    payload.append('phone', phone.value);
    payload.append('address', address.value);
    payload.append('role', userRole.value);
    await api.post('/users', payload);
    close();
    await fetchUsers();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add user';
  } finally {
    loading.value = false;
  }
}

async function addRole() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', roleName.value);
    payload.append('description', roleDescription.value);
    await api.post('/roles', payload);
    close();
    await fetchRoles();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add role';
  } finally {
    loading.value = false;
  }
}

async function addService() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', serviceName.value);
    payload.append('description', serviceDescription.value);
    payload.append('price', servicePrice.value);
    payload.append('category', serviceCategory.value);
    payload.append('location', serviceLocation.value);
    payload.append('contact_info', serviceContactInfo.value);
    if (serviceImagePath.value) payload.append('image', serviceImagePath.value);
    await api.post('services', payload);
    close();
    await fetchServices();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add service';
  } finally {
    loading.value = false;
  }
}

async function addServiceRequest() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('user_id', requestUserId.value);
    payload.append('service_id', requestServiceId.value);
    payload.append('request_date', requestDate.value);
    payload.append('status', requestStatus.value);
    payload.append('address', requestAddress.value);
    payload.append('description', requestDescription.value);
    await api.post('/service-requests', payload);
    close();
    await fetchServiceRequests();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add service request';
  } finally {
    loading.value = false;
  }
}

// ── EDIT OPENERS ──
function editUser(item) {
  editingUserId.value = item.id;
  const parts = (item.name ?? '').split(' ');
  firstName.value = parts[0] ?? '';
  lastName.value = parts.slice(1).join(' ') ?? '';
  email.value = item.email ?? '';
  phone.value = item.phone ?? '';
  address.value = item.address ?? '';
  userRole.value = item.role ?? '';
  showEditUserDialog.value = true;
}

function editRole(item) {
  editingRoleId.value = item.id;
  roleName.value = item.name ?? '';
  roleDescription.value = item.description ?? '';
  showEditRoleDialog.value = true;
}

function editService(item) {
  editingServiceId.value = item.id;
  serviceName.value = item.name ?? '';
  serviceDescription.value = item.description ?? '';
  servicePrice.value = item.price ?? '';
  serviceCategory.value = item.category ?? '';
  serviceLocation.value = item.location ?? '';
  serviceContactInfo.value = item.contact_info ?? '';
  showEditServiceDialog.value = true;
}

function editServiceRequest(item) {
  editingServiceRequestId.value = item.id;
  requestUserId.value = item.user_id ?? '';
  requestServiceId.value = item.service_id ?? '';
  requestDate.value = item.request_date ?? '';
  requestStatus.value = item.status ?? '';
  requestAddress.value = item.address ?? '';
  requestDescription.value = item.description ?? '';
  showEditServiceRequestDialog.value = true;
}

function openDeleteUser(item) {
  editingUserId.value = item.id;
  showDeleteUserDialog.value = true;
}

function openDeleteRole(item) {
  editingRoleId.value = item.id;
  showDeleteRoleDialog.value = true;
}

function openDeleteService(item) {
  editingServiceId.value = item.id;
  showDeleteServiceDialog.value = true;
}

function openDeleteServiceRequest(item) {
  editingServiceRequestId.value = item.id;
  showDeleteServiceRequestDialog.value = true;
}

// ── UPDATE ──
async function updateUser() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', `${firstName.value} ${lastName.value}`);
    payload.append('email', email.value);
    payload.append('phone', phone.value);
    payload.append('address', address.value);
    payload.append('role', userRole.value);
    payload.append('_method', 'PUT');
    await api.post(`/users/${editingUserId.value}`, payload);
    close();
    await fetchUsers();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update user';
  } finally {
    loading.value = false;
  }
}

async function updateRole() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', roleName.value);
    payload.append('description', roleDescription.value);
    payload.append('_method', 'PUT');
    await api.post(`/roles/${editingRoleId.value}`, payload);
    close();
    await fetchRoles();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update role';
  } finally {
    loading.value = false;
  }
}

async function updateService() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('name', serviceName.value);
    payload.append('description', serviceDescription.value);
    payload.append('price', servicePrice.value);
    payload.append('category', serviceCategory.value);
    payload.append('_method', 'PUT');
    if (serviceImagePath.value instanceof File) payload.append('image', serviceImagePath.value);
    await api.post(`/services/${editingServiceId.value}`, payload);
    close();
    await fetchServices();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update service';
  } finally {
    loading.value = false;
  }
}

async function updateServiceRequest() {
  error.value = '';
  loading.value = true;
  try {
    const payload = new FormData();
    payload.append('user_id', requestUserId.value);
    payload.append('service_id', requestServiceId.value);
    payload.append('request_date', requestDate.value);
    payload.append('status', requestStatus.value);
    payload.append('address', requestAddress.value);
    payload.append('description', requestDescription.value);
    payload.append('_method', 'PUT');
    await api.post(`/service-requests/${editingServiceRequestId.value}`, payload);
    close();
    await fetchServiceRequests();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update service request';
  } finally {
    loading.value = false;
  }
}

// ── DELETE ──
async function deleteUser() {
  loading.value = true;
  try {
    await api.delete(`/users/${editingUserId.value}`);
    close();
    await fetchUsers();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete user';
  } finally {
    loading.value = false;
  }
}

async function deleteRole() {
  loading.value = true;
  try {
    await api.delete(`/roles/${editingRoleId.value}`);
    close();
    await fetchRoles();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete role';
  } finally {
    loading.value = false;
  }
}

async function deleteService() {
  loading.value = true;
  try {
    await api.delete(`/services/${editingServiceId.value}`);
    close();
    await fetchServices();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete service';
  } finally {
    loading.value = false;
  }
}

async function deleteServiceRequest() {
  loading.value = true;
  try {
    await api.delete(`/service-requests/${editingServiceRequestId.value}`);
    close();
    await fetchServiceRequests();
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete service request';
  } finally {
    loading.value = false;
  }
}

// ── CLOSE / RESET ──
function close() {
  showAddUserDialog.value = false;
  showAddRoleDialog.value = false;
  showAddServiceDialog.value = false;
  showAddServiceRequestDialog.value = false;
  showEditUserDialog.value = false;
  showEditRoleDialog.value = false;
  showEditServiceDialog.value = false;
  showEditServiceRequestDialog.value = false;
  showDeleteUserDialog.value = false;
  showDeleteRoleDialog.value = false;
  showDeleteServiceDialog.value = false;
  showDeleteServiceRequestDialog.value = false;
  editingUserId.value = null;
  editingRoleId.value = null;
  editingServiceId.value = null;
  editingServiceRequestId.value = null;
  firstName.value = ''; lastName.value = ''; email.value = '';
  phone.value = ''; address.value = ''; userRole.value = '';
  roleName.value = ''; roleDescription.value = '';
  serviceName.value = ''; serviceDescription.value = '';
  servicePrice.value = ''; serviceCategory.value = '';
  serviceLocation.value = ''; serviceContactInfo.value = '';
  serviceImagePath.value = '';
  requestUserId.value = ''; requestServiceId.value = '';
  requestDate.value = ''; requestStatus.value = '';
  requestAddress.value = ''; requestDescription.value = '';
  error.value = '';
}

onMounted(() => {
  fetchUsers();
  fetchRoles();
  fetchServices();
  fetchServiceRequests();
});
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="admin-page">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-eyebrow">CONTROL PANEL</div>
          <h1 class="page-title">ADMIN<br><em>DASHBOARD</em></h1>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-icon-wrap" :style="{ background: s.color + '18' }">
          <v-icon :icon="s.icon" class="stat-icon" :style="{ color: s.color }"></v-icon>
        </div>
        <div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Main panel -->
    <div class="main-panel">

      <!-- Tabs -->
      <div class="tabs-row">
        <button
          v-for="(t, i) in ['Users', 'Roles', 'Services', 'Service Requests']"
          :key="t"
          class="tab-btn"
          :class="{ 'tab-btn--active': tab === i + 1 }"
          @click="tab = i + 1"
        >
          <v-icon :icon="['mdi-account-group','mdi-shield-account','mdi-wrench','mdi-file-document'][i]" size="16"></v-icon>
          {{ t }}
        </button>
      </div>

      <!-- Error banner -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle-outline" size="16"></v-icon>
        {{ error }}
        <button class="error-close" @click="error = ''">✕</button>
      </div>

      <!-- ── USERS TAB ── -->
      <div v-if="tab === 1" class="tab-content">
        <div class="table-toolbar">
          <div class="search-wrap">
            <v-icon icon="mdi-magnify" class="search-icon"></v-icon>
            <input v-model="search" placeholder="Search users…" class="search-input" />
          </div>
          <button class="add-btn" @click="showAddUserDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add User
          </button>
        </div>

        <div v-if="loading" class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="n in 4" :key="n">
                <td colspan="6"><div class="skel" style="height:14px;width:80%;border-radius:2px"></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!filteredUsers.length" class="empty-state">
          <v-icon icon="mdi-account-off-outline" class="empty-icon"></v-icon>
          <div class="empty-text">No users found</div>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>Role</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredUsers" :key="item.id" :class="{ 'row--inactive': item.deleted_at }">
                <td>
                  <div class="user-name-cell">
                    <div class="user-avatar">{{ item.name?.charAt(0) }}</div>
                    {{ item.name }}
                  </div>
                </td>
                <td class="cell-muted">{{ item.email }}</td>
                <td class="cell-muted">{{ item.phone ?? '—' }}</td>
                <td>
                  <span class="role-badge" :style="{ background: (roleColors[item.role] || '#888') + '18', color: roleColors[item.role] || '#888' }">
                    {{ item.role ?? '—' }}
                  </span>
                </td>
                <td>
                  <span class="status-dot" :class="item.deleted_at ? 'status-dot--off' : 'status-dot--on'">
                    {{ item.deleted_at ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" @click="editUser(item)" title="Edit">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                    <button class="action-btn action-btn--warn" @click="openDeleteUser(item)" title="Delete">
                      <v-icon icon="mdi-delete" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── ROLES TAB ── -->
      <div v-if="tab === 2" class="tab-content">
        <div class="table-toolbar">
          <div class="toolbar-title">System Roles</div>
          <button class="add-btn" @click="showAddRoleDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add Role
          </button>
        </div>

        <div v-if="!roles.length" class="empty-state">
          <v-icon icon="mdi-shield-off-outline" class="empty-icon"></v-icon>
          <div class="empty-text">No roles found</div>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in roles" :key="item.id">
                <td>
                  <span class="role-badge" :style="{ background: (roleColors[item.name] || '#888') + '18', color: roleColors[item.name] || '#888' }">
                    {{ item.name }}
                  </span>
                </td>
                <td class="cell-muted">{{ item.description ?? '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" @click="editRole(item)" title="Edit">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                    <button class="action-btn action-btn--warn" @click="openDeleteRole(item)" title="Delete">
                      <v-icon icon="mdi-delete" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── SERVICES TAB ── -->
      <div v-if="tab === 3" class="tab-content">
        <div class="table-toolbar">
          <div class="toolbar-title">All Services</div>
          <button class="add-btn" @click="showAddServiceDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add Service
          </button>
        </div>

        <div v-if="!services.length" class="empty-state">
          <v-icon icon="mdi-wrench-outline" class="empty-icon"></v-icon>
          <div class="empty-text">No services found</div>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Description</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in services" :key="item.id">
                <td class="cell-bold">{{ item.name }}</td>
                <td>
                  <span class="role-badge" style="background:rgba(77,142,240,.1);color:#4d8ef0">
                    {{ item.category ?? '—' }}
                  </span>
                </td>
                <td class="cell-muted">{{ item.description?.slice(0, 60) }}{{ item.description?.length > 60 ? '…' : '' }}</td>
                <td class="cell-muted">KES {{ Number(item.price).toLocaleString() }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" @click="editService(item)" title="Edit">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                    <button class="action-btn action-btn--warn" @click="openDeleteService(item)" title="Delete">
                      <v-icon icon="mdi-delete" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── SERVICE REQUESTS TAB ── -->
      <div v-if="tab === 4" class="tab-content">
        <div class="table-toolbar">
          <div class="toolbar-title">All Service Requests</div>
          <button class="add-btn" @click="showAddServiceRequestDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add Request
          </button>
        </div>

        <div v-if="!serviceRequests.length" class="empty-state">
          <v-icon icon="mdi-file-document-off-outline" class="empty-icon"></v-icon>
          <div class="empty-text">No service requests found</div>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Service</th><th>Customer</th><th>Description</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in serviceRequests" :key="item.id">
                <td class="cell-muted">REQ-{{ String(item.id).padStart(3,'0') }}</td>
                <td class="cell-bold">{{ item.service?.name ?? 'Service #' + item.service_id }}</td>
                <td class="cell-muted">{{ item.user?.name ?? '—' }}</td>
                <td class="cell-muted">{{ item.description?.slice(0, 50) }}{{ item.description?.length > 50 ? '…' : '' }}</td>
                <td class="cell-muted">
                  {{ item.request_date
                    ? new Date(item.request_date).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' })
                    : '—' }}
                </td>
                <td>
                  <span class="status-dot" :style="{ color: statusColors[item.status] ?? '#aaa' }">
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" @click="editServiceRequest(item)" title="Edit">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                    <button class="action-btn action-btn--warn" @click="openDeleteServiceRequest(item)" title="Delete">
                      <v-icon icon="mdi-delete" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         DIALOGS
    ══════════════════════════════════════════ -->

    <!-- ADD USER -->
    <v-dialog v-model="showAddUserDialog" max-width="580">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">ADMIN ACTION</div>
            <h3 class="dialog-title">Add New User</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">First Name</label>
              <div class="field-wrap"><input v-model="firstName" type="text" class="field-input" placeholder="John" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Last Name</label>
              <div class="field-wrap"><input v-model="lastName" type="text" class="field-input" placeholder="Doe" /></div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Email</label>
              <div class="field-wrap"><input v-model="email" type="email" class="field-input" placeholder="user@example.com" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Phone</label>
              <div class="field-wrap"><input v-model="phone" type="tel" class="field-input" placeholder="+254 700 000 000" /></div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Address</label>
            <div class="field-wrap"><input v-model="address" type="text" class="field-input" placeholder="123 Main St, Nairobi" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Role</label>
            <div class="radio-grid">
              <label v-for="r in [['Admin','Admin'],['Provider','Provider'],['Customer','Customer']]" :key="r[0]"
                class="radio-chip" :class="{ 'radio-chip--sel': userRole === r[0] }">
                <input type="radio" v-model="userRole" :value="r[0]" hidden />{{ r[1] }}
              </label>
            </div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="addUser">
            <span v-if="!loading">SAVE USER →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- EDIT USER -->
    <v-dialog v-model="showEditUserDialog" max-width="580">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">EDIT RECORD</div>
            <h3 class="dialog-title">Edit User</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">First Name</label>
              <div class="field-wrap"><input v-model="firstName" type="text" class="field-input" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Last Name</label>
              <div class="field-wrap"><input v-model="lastName" type="text" class="field-input" /></div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Email</label>
              <div class="field-wrap"><input v-model="email" type="email" class="field-input" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Phone</label>
              <div class="field-wrap"><input v-model="phone" type="tel" class="field-input" /></div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Address</label>
            <div class="field-wrap"><input v-model="address" type="text" class="field-input" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Role</label>
            <div class="radio-grid">
              <label v-for="r in [['Admin','Admin'],['Provider','Provider'],['Customer','Customer']]" :key="r[0]"
                class="radio-chip" :class="{ 'radio-chip--sel': userRole === r[0] }">
                <input type="radio" v-model="userRole" :value="r[0]" hidden />{{ r[1] }}
              </label>
            </div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="updateUser">
            <span v-if="!loading">UPDATE USER →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- DELETE USER -->
    <v-dialog v-model="showDeleteUserDialog" max-width="440">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow" style="color:#ff6b6b">CONFIRM DELETE</div>
            <h3 class="dialog-title">Delete User?</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <p style="font-size:.88rem;color:rgba(240,237,230,.55);line-height:1.7">This will permanently delete this user. This action cannot be undone.</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">GO BACK</button>
          <button class="dialog-btn-danger" :disabled="loading" @click="deleteUser">
            <span v-if="!loading">YES, DELETE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ADD ROLE -->
    <v-dialog v-model="showAddRoleDialog" max-width="480">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">ADMIN ACTION</div>
            <h3 class="dialog-title">Add New Role</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-group">
            <label class="field-label">Role Name</label>
            <div class="field-wrap"><input v-model="roleName" type="text" class="field-input" placeholder="e.g. Admin" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="roleDescription" class="field-input field-textarea" placeholder="Describe this role…" rows="3"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="addRole">
            <span v-if="!loading">SAVE ROLE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- EDIT ROLE -->
    <v-dialog v-model="showEditRoleDialog" max-width="480">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">EDIT RECORD</div>
            <h3 class="dialog-title">Edit Role</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-group">
            <label class="field-label">Role Name</label>
            <div class="field-wrap"><input v-model="roleName" type="text" class="field-input" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="roleDescription" class="field-input field-textarea" rows="3"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="updateRole">
            <span v-if="!loading">UPDATE ROLE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- DELETE ROLE -->
    <v-dialog v-model="showDeleteRoleDialog" max-width="440">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow" style="color:#ff6b6b">CONFIRM DELETE</div>
            <h3 class="dialog-title">Delete Role?</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <p style="font-size:.88rem;color:rgba(240,237,230,.55);line-height:1.7">This will permanently delete this role. Users assigned to it may be affected.</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">GO BACK</button>
          <button class="dialog-btn-danger" :disabled="loading" @click="deleteRole">
            <span v-if="!loading">YES, DELETE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ADD SERVICE -->
    <v-dialog v-model="showAddServiceDialog" max-width="560">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">ADMIN ACTION</div>
            <h3 class="dialog-title">Add New Service</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Service Name</label>
              <div class="field-wrap"><input v-model="serviceName" type="text" class="field-input" placeholder="e.g. Plumbing Repair" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Price (KES)</label>
              <div class="field-wrap"><input v-model="servicePrice" type="number" class="field-input" placeholder="5000" /></div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Category</label>
            <div class="field-wrap field-wrap--select">
              <select v-model="serviceCategory" class="field-input field-select">
                <option value="" disabled>Select category</option>
                <option v-for="c in ['Plumbing','Electrical','Cleaning','Web Design','Marketing','Construction','Other']" :key="c" :value="c">{{ c }}</option>
              </select>
              <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="serviceDescription" class="field-input field-textarea" placeholder="Describe the service…" rows="3"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="addService">
            <span v-if="!loading">SAVE SERVICE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- EDIT SERVICE -->
    <v-dialog v-model="showEditServiceDialog" max-width="560">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">EDIT RECORD</div>
            <h3 class="dialog-title">Edit Service</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Service Name</label>
              <div class="field-wrap"><input v-model="serviceName" type="text" class="field-input" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Price (KES)</label>
              <div class="field-wrap"><input v-model="servicePrice" type="number" class="field-input" /></div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Category</label>
            <div class="field-wrap field-wrap--select">
              <select v-model="serviceCategory" class="field-input field-select">
                <option value="" disabled>Select category</option>
                <option v-for="c in ['Plumbing','Electrical','Cleaning','Web Design','Marketing','Construction','Other']" :key="c" :value="c">{{ c }}</option>
              </select>
              <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="serviceDescription" class="field-input field-textarea" rows="3"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="updateService">
            <span v-if="!loading">UPDATE SERVICE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- DELETE SERVICE -->
    <v-dialog v-model="showDeleteServiceDialog" max-width="440">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow" style="color:#ff6b6b">CONFIRM DELETE</div>
            <h3 class="dialog-title">Delete Service?</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <p style="font-size:.88rem;color:rgba(240,237,230,.55);line-height:1.7">This will permanently delete this service and all associated requests.</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">GO BACK</button>
          <button class="dialog-btn-danger" :disabled="loading" @click="deleteService">
            <span v-if="!loading">YES, DELETE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- ADD SERVICE REQUEST -->
    <v-dialog v-model="showAddServiceRequestDialog" max-width="560">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">ADMIN ACTION</div>
            <h3 class="dialog-title">Add Service Request</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">User ID</label>
              <div class="field-wrap"><input v-model="requestUserId" type="number" class="field-input" placeholder="User ID" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Service ID</label>
              <div class="field-wrap"><input v-model="requestServiceId" type="number" class="field-input" placeholder="Service ID" /></div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Request Date</label>
              <div class="field-wrap"><input v-model="requestDate" type="date" class="field-input field-date" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Status</label>
              <div class="field-wrap field-wrap--select">
                <select v-model="requestStatus" class="field-input field-select">
                  <option value="" disabled>Select status</option>
                  <option v-for="s in ['pending','active','completed','cancelled']" :key="s" :value="s">{{ s }}</option>
                </select>
                <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Address</label>
            <div class="field-wrap"><input v-model="requestAddress" type="text" class="field-input" placeholder="Service address" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="requestDescription" class="field-input field-textarea" rows="3" placeholder="Describe the request…"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="addServiceRequest">
            <span v-if="!loading">SAVE REQUEST →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- EDIT SERVICE REQUEST -->
    <v-dialog v-model="showEditServiceRequestDialog" max-width="560">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">EDIT RECORD</div>
            <h3 class="dialog-title">Edit Service Request</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Request Date</label>
              <div class="field-wrap"><input v-model="requestDate" type="date" class="field-input field-date" /></div>
            </div>
            <div class="field-group">
              <label class="field-label">Status</label>
              <div class="field-wrap field-wrap--select">
                <select v-model="requestStatus" class="field-input field-select">
                  <option v-for="s in ['pending','active','completed','cancelled']" :key="s" :value="s">{{ s }}</option>
                </select>
                <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Address</label>
            <div class="field-wrap"><input v-model="requestAddress" type="text" class="field-input" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <div class="field-wrap"><textarea v-model="requestDescription" class="field-input field-textarea" rows="3"></textarea></div>
          </div>
          <div v-if="error" class="dialog-error">{{ error }}</div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">CANCEL</button>
          <button class="dialog-btn-primary" :disabled="loading" @click="updateServiceRequest">
            <span v-if="!loading">UPDATE REQUEST →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- DELETE SERVICE REQUEST -->
    <v-dialog v-model="showDeleteServiceRequestDialog" max-width="440">
      <div class="dialog-card">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow" style="color:#ff6b6b">CONFIRM DELETE</div>
            <h3 class="dialog-title">Delete Request?</h3>
          </div>
          <button class="dialog-close" @click="close"><v-icon icon="mdi-close" size="18"></v-icon></button>
        </div>
        <div class="dialog-body">
          <p style="font-size:.88rem;color:rgba(240,237,230,.55);line-height:1.7">This will permanently delete this service request. This action cannot be undone.</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn-ghost" @click="close">GO BACK</button>
          <button class="dialog-btn-danger" :disabled="loading" @click="deleteServiceRequest">
            <span v-if="!loading">YES, DELETE →</span>
            <span v-else class="loading-dots"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>
    </v-dialog>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.admin-page {
    font-family: 'Barlow', sans-serif;
    background: #0a0a0a;
    color: #f0ede6;
    min-height: 100vh;
}

.page-header {
    background: #060d1a;
    border-bottom: 1px solid rgba(200, 255, 0, 0.08);
    padding: 3rem 0 2rem;
}

.page-header-inner {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 2.5rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
}

.page-eyebrow {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #4d8ef0;
    margin-bottom: 0.4rem;
}

.page-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    text-transform: uppercase;
    line-height: 0.92;
    color: #f0ede6;
}

.page-title em {
    font-style: italic;
    color: #4d8ef0;
}

.header-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.7rem 1.4rem;
    background: #4d8ef0;
    border: none;
    color: #0a0a0a;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
}

.header-btn:hover {
    background: #4d8ef0;
}

/* Stats row */
.stats-row {
    max-width: 1300px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 2rem auto;
    padding: 0 2.5rem;
}

@media (max-width: 800px) { 
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
}

.stat-card {
    background: #0f0f0f;
    padding: 1.3rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-radius: 6px;
}

.stat-icon-wrap {
    width: 42px; 
    height: 42px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    clip-path: polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%);
}

.stat-icon { font-size: 1.2rem !important; }
.stat-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    line-height: 1;
    color: #f0ede6;
}

.stat-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(240, 237, 230, 0.35);
    margin-top: 0.15rem;
}

/* Main panel */
.main-panel {
    max-width: 1300px;
    margin: 0 auto 4rem;
    padding: 0 2.5rem;
}

.tabs-row {
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 1.5rem;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.6rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(240, 237, 230, 0.4);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
}

.tab-btn:hover {
    color: rgba(240, 237, 230, 0.75);
}

.tab-btn--active {
    color: #f0ede6;
    border-bottom-color: #4d8ef0;
}

.error-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
    font-size: 0.85rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
}

.error-close {
    margin-left: auto;
    background: none;
    border: none;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 0.85rem;
}

.table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.toolbar-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    color: rgba(240, 237, 230, 0.5);
}

.search-wrap {
    position: relative;
    flex: 1;
    max-width: 320px;
    display: flex;
    align-items: center;
    background: #111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s;
}

.search-wrap:focus-within {
    border-color: rgba(200, 255, 0, 0.3);
}

.search-icon {
    color: rgba(240, 237, 230, 0.25);
    font-size: 1rem !important;
    padding: 0 0.65rem;
    flex-shrink: 0;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.65rem 0.5rem 0.65rem 0;
    color: #f0ede6;
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
}

.search-input::placeholder {
    color: rgba(240, 237, 230, 0.2);
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1.2rem;
    background: rgba(13, 57, 169, 0.188);
    border: 1px solid rgba(13, 57, 169, 0.3);
    color: #4d8ef0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.add-btn:hover {
    background: rgba(13, 57, 169, 0.18);
    border-color: #4d8ef0;
}

.table-wrap {
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.data-table thead tr {
    background: #111;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.data-table th {
    padding: 0.85rem 1.1rem;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(240, 237, 230, 0.4);
    text-align: left;
    white-space: nowrap;
}

.data-table tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.15s;
    background: #0f0f0f;
}

.data-table tbody tr:hover { background: #141414; }
.data-table tbody tr.row--inactive { opacity: 0.45; }
.data-table td {
    padding: 0.85rem 1.1rem;
    color: rgba(240, 237, 230, 0.75);
    white-space: nowrap;
    vertical-align: middle;
}

.cell-muted { color: rgba(240, 237, 230, 0.4) !important; font-size: 0.82rem; }
.cell-bold { color: #f0ede6 !important; font-weight: 500; }
.mono { font-family: 'Courier New', monospace; font-size: 0.8rem; color: rgba(240, 237, 230, 0.6); }

.user-name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: #f0ede6;
}

.user-avatar {
    width: 30px; 
    height: 30px;
    border: 1px solid rgba(200, 255, 0, 0.1);
    color: #4d8ef0;
    display: grid;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    place-items: center;
    flex-shrink: 0;
    border-radius: 50%;
}

.role-badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.22rem 0.55rem;
}

.status-dot {
    display: inline-block;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 700;
}

.status-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-dot--on { color: #4d8ef0; }
.status-dot--on::before { background: #4d8ef0; box-shadow: 0 0 6px #4d8ef088; }
.status-dot--off { color: rgba(240, 237, 230, 0.35); }
.status-dot--off::before { background: rgba(240, 237, 230, 0.2); }
.status-dot--warn { color: #ffaa00; }
.status-dot--warn::before { background: #ffaa00; }

.usage-tag {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    background: rgba(77, 184, 255, 0.1);
    color: #4db8ff;
}

.count-pill {
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(240, 237, 230, 0.6);
    border-radius: 50%;
}

.action-btns {
    display: flex;
    gap: 0.4rem;
}

.action-btn {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    color: rgba(240, 237, 230, 0.5);
    transition: all 0.15s;
}

.action-btn--edit:hover { border-color: #4db8ff; color: #4db8ff; background: rgba(77, 184, 255, 0.1); }
.action-btn--warn:hover { border-color: #ff6b6b; color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
.action-btn--success:hover { border-color: #4d8ef0; color: #4d8ef0; background: rgba(13, 57, 169, 0.18); }

.empty-state {
    text-align: center;
    padding: 5rem 2rem;
    border: 1px dashed rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.empty-icon { 
    font-size: 3rem !important;
    color: rgba(240, 237, 230, 0.12) !important;
}

.empty-text {
    font-size: 0.9rem;
    color: rgba(240, 237, 230, 0.35);
    letter-spacing: 0.05em;
}

.dialog-card {
    background: #111;
    border: 1px solid rgba(200, 255, 0, 0.15);
    font-family: 'Barlow', sans-serif;
    border-radius: 6px;
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.6rem 1.8rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dialog-eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.28em;
    color: #4d8ef0;
    margin-bottom: 0.3rem;
}

.dialog-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #f0ede6;
    text-transform: uppercase;
}

.dialog-close {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(240, 237, 230, 0.4);
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.2s;
}

.dialog-close:hover { border-color: #ff6b6b; color: #ff6b6b; } 
.dialog-body {
    padding: 1.4rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.dialog-footer {
    padding: 1rem 1.8rem 1.4rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dialog-btn-ghost {
    padding: 0.65rem 1.4rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(240, 237, 230, 0.4);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
}

.dialog-btn-ghost:hover { border-color: rgba(255, 255, 255, 0.25); color: #f0ede6; }
.dialog-btn-primary {
    padding: 0.65rem 1.6rem;
    background: #4d8ef0;
    border: none;
    color: #0a0a0a;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
    transition: background 0.2s;
}

.dialog-btn-primary:hover:not(:disabled) { background: #d9ff33; }
.dialog-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.dialog-error {
    font-size: 0.8rem;
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: 0.6rem 0.9rem;
}

/* Form fields */
.field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
}

@media (max-width: 480px) {
    .field-row {
        grid-template-columns: 1fr;
    }
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.field-label {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: rgba(240, 237, 230, 0.4);
    text-transform: uppercase;
}

.field-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #0f0f0f;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s;
}

.field-wrap:focus-within { border-color: rgba(200, 255, 0, 0.35); }
.field-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.7rem 0.85rem;
    color: #f0ede6;
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
}

.field-input::placeholder { color: rgba(240, 237, 230, 0.2); }
.field-select {
    appearance: none; 
    cursor: pointer;
    padding-right: 2rem;
}

.field-select option { background: #1a1a1a; }
.select-caret {
    position: absolute;
    right: 0.5rem;
    color: rgba(240, 237, 230, 0.25) !important;
    font-size: 1rem !important;
    pointer-events: none;
}

.field-date { color-scheme: dark; }
.radio-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.radio-chip {
    padding: 0.35rem 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(240, 237, 230, 0.4);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    background: #0f0f0f;
}

.radio-chip:hover { border-color: rgba(200, 255, 0, 0.2); color: #f0ede6; }
.radio-chip--sel {
    border-color: #4d8ef0;
    color: #4d8ef0;
    background: rgba(200, 255, 0, 0.1);
}

.field-textarea {
  resize: vertical;
  padding: 0.7rem 0.85rem;
  min-height: 80px;
  line-height: 1.6;
}

.field-wrap--select { position: relative; }
.select-caret {
  position: absolute;
  right: 0.5rem;
  color: rgba(240, 237, 230, 0.25) !important;
  font-size: 1rem !important;
  pointer-events: none;
}

.field-date {
  color-scheme: dark;
}

.cell-bold {
  color: #f0ede6 !important;
  font-weight: 500;
}

.dialog-btn-danger {
  padding: 0.65rem 1.6rem;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.35);
  color: #ff6b6b;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
  clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
}

.dialog-btn-danger:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
}

.dialog-btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skel {
  background: linear-gradient(90deg, rgba(77, 142, 240, 0.06) 25%, rgba(77, 142, 240, 0.12) 50%, rgba(77, 142, 240, 0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {background-position: 200% 0;}
  100% {background-position: -200% 0;}
}
.loading-dots {
  display: flex; 
  gap: 4px; 
  align-items: center;
}

.loading-dots span {
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
  animation: dotBounce 0.9s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dotBounce { 0%, 80%, 100% { transform:scale(0.8); opacity: 0.5} 40% { transform:scale(1.2); opacity:1} }
</style>