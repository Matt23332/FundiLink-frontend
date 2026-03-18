<script setup>

import { ref, onMounted, computed } from 'vue'
import api  from '../services/api';

const token = localStorage.getItem('authToken');
const error = ref('')
const loading = ref(false)
const tab = ref(null)
const search = ref('')

const showAddUserDialog = ref(false)
const showAddRoleDialog = ref(false)
const showAddEquipmentDialog = ref(false)
const showEditUserDialog = ref(false)

const editingUserId = ref(null)
const firstName = ref(null)
const lastName = ref(null)
const fullName = ref(null)
const email = ref(null)
const phone = ref(null)
const gender = ref(null)
const dob = ref(null)
const gymLocation = ref(null)
const userRole = ref(null)
const userIdNo = ref(null)

const users = ref([])
const roles = ref([])
const equipment = ref([])
const filteredUsers = computed (() => {
    if (!search.value) return users.value
    const q = search.value.toLowerCase()
    return users.value.filter(u => 
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.gymLocation?.toLowerCase().includes(q)
    )
})

const stats = computed(() => [
    { label: 'Total Users', value: users.value.length, icon: 'mdi-account-group', color: '#4db8ff' },
    { label: 'Active Equipment', value: equipment.value.filter(e => e.status === 'Active').length, icon: 'mdi-dumbbell', color: '#c8ff00' },
    { label: 'System Roles', value: roles.value.length, icon: 'mdi-shield-account', color: '#ff9f43' },
    { label: 'Active users', value: users.value.filter(u => !u.deleted_at).length, icon: 'mdi-account-check', color: '#ff9f43' }
])

const rules = {
    required: value => !!value || 'Required.',
    min: v => v.length >= 8 || 'Min 8 characters',
}

const headers = { Authorization: `Bearer ${token}` }

async function fetchUsers() {
    try {
        loading.value = true
        const response = await api.get('users', { headers })
        users.value = response.data ?? []
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to retrieve data'
    } finally {
        loading.value = false
    }
}

async function fetchRoles() {
  console.log('token:', localStorage.getItem('authToken'))
    try {
        const response = await api.get('getRoles', { headers })
        console.log('roles response:', response.data)
        roles.value = response.data ?? []
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to retrieve data'
    }
}

async function fetchEquipment() {
    try {
        const response = await api.get('getEquipment', { headers })
        equipment.value = response.data ?? []
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to retrieve data'
    }
}

async function addUser() {
    error.value = ''
    loading.value = true
    const formData = new FormData()
    formData.append('name', `${firstName.value} ${lastName.value}`)
    formData.append('email', email.value)
    formData.append('phone', phone.value)
    formData.append('gender', gender.value)
    formData.append('dob', dob.value)
    formData.append('gymLocation', gymLocation.value)
    formData.append('role_id', userRole.value)
    try {
        await api.post('users', formData, { headers })
        close()
        await fetchUsers()
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to create user'
    } finally {
        loading.value = false
    }
}

function editUser(item) {
    editingUserId.value = item.id
    const parts = item.name?.split(' ') ?? []
    firstName.value = parts[0] ?? ''
    lastName.value = parts.slice(1).join(' ') ?? ''
    email.value = item.email
    phone.value = item.phone
    userRole.value = String(item.role_id ?? '')
    showEditUserDialog.value = true
}

async function updateUser() {
    error.value = ''
    loading.value = true
    try {
        await api.put(`users/${editingUserId.value}`, {
            name: `${firstName.value} ${lastName.value}`,
            email: email.value,
            phone: phone.value,
            role_id: userRole.value,
        }, { headers})
        close()
        await fetchUsers()
    } catch (err) {
        error.value = err.response?.data?.message || 'User update failed'
    } finally {
        loading.value = false
    }
}

// Activate or Deactivate user
async function deactivateUser(item) {
    try {
        await api.delete(`users/${item.id}`, { headers })
        await fetchUsers()
    } catch (err) {
        error.value = err.response?.data?.message || 'Deactivation failed'
    }
}

async function activateUser(item) {
    try {
        await api.post(`users/${item.id}/restore`, {}, { headers })
        await fetchUsers()
    } catch (err) {
        error.value = err.response?.data?.message || 'Activation failed'
    }
}

async function addRole() {
    error.value = ''
    loading.value = true
    try {
        await api.post('saveRole', { name: roleName.value }, { headers })
        close()
        await fetchRoles()
    } catch (err) {
        error.value = err.response?.data?.message || 'Creating role failed'
    } finally {
        loading.value = false
    }
}

async function addEquipment() {
    error.value = ''
    loading.value = true
    const formData = new FormData()
    formData.append('name', equipmentName.value)
    formData.append('model_no', modelNo.value)
    formData.append('value', equipmentValue.value)
    formData.append('usage', equipmentUsage.value)
    formData.append('status', equipmentStatus.value)
    try {
        await api.post('saveEquipment', formData, { headers })
        close()
        await fetchEquipment()
    } catch (err) {
        error.value = err.response?.data?.message || 'Adding equipment failed'
    } finally {
        loading.value = false
    }
}

async function updateEquipment() {
    error.value = ''
    loading.value = true
    try {
        await api.put(`updateEquipment/${editingEquipmentId.value}`, {
            name: equipmentName.value,
            model_no: modelNo.value,
            value: equipmentValue.value,
            status: equipmentStatus.value,
        }, { headers })
        close()
        await fetchEquipment()
    } catch (err) {
        error.value = err.response?.data?.message || 'Updating equipment failed'
    } finally {
        loading.value = false
    }
}

async function updateRole() {
    error.value = ''
    loading.value = true
    try {
        await api.put(`updateRole/${editingRoleId.value}`, { name: roleName.value }, { headers })
        close()
        await fetchRoles()
    } catch (err) {
        error.value = err.response?.data?.message || 'Updating role failed'
    } finally {
        loading.value = false
    }
}

function close() {
    showAddUserDialog.value = false
    showEditUserDialog.value = false
    showAddRoleDialog.value = false
    showAddEquipmentDialog.value = false
    editingUserId.value = null
    firstName.value = null
    lastName.value = null
    fullName.value = null
    email.value = null
    phone.value = null
    gender.value = null
    dob.value = null
    gymLocation.value = null
    userRole.value = null
    error.value = ''
}

const roleColors = { Admin: '#ff6b6b', Trainer: '#4db8ff', Member: '#c8ff00', Staff: '#ff9f43' }
const statusColors = { Active: '#c8ff00', Maintenance: '#ffaa00', Retired: '#ff6b6b', Available: '#4db8ff' }

onMounted(() => {
    fetchUsers()
    fetchRoles()
    fetchEquipment()
})
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <div class="admin-page">

    <!-- ── PAGE HEADER ─────────────────────────────────── -->
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-eyebrow">CONTROL PANEL</div>
          <h1 class="page-title">ADMIN<br><em>DASHBOARD</em></h1>
        </div>
        <div class="header-actions">
          <button class="header-btn" @click="tab === 1 ? showAddUserDialog = true : tab === 2 ? showAddRoleDialog = true : showAddEquipmentDialog = true">
            <v-icon icon="mdi-plus" size="16"></v-icon>
            Add {{ tab === 1 ? 'User' : tab === 2 ? 'Role' : 'Equipment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── STATS ROW ───────────────────────────────────── -->
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

    <!-- ── MAIN PANEL ──────────────────────────────────── -->
    <div class="main-panel">

      <!-- Tabs -->
      <div class="tabs-row">
        <button
          v-for="(t, i) in ['Users', 'Roles', 'Equipment']"
          :key="t"
          class="tab-btn"
          :class="{ 'tab-btn--active': tab === i + 1 }"
          @click="tab = i + 1"
        >
          <v-icon :icon="['mdi-account-group', 'mdi-shield-account', 'mdi-dumbbell'][i]" size="16"></v-icon>
          {{ t }}
        </button>
      </div>

      <!-- Error banner -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle-outline" size="16"></v-icon>
        {{ error }}
        <button class="error-close" @click="error = ''">✕</button>
      </div>

      <!-- ── USERS TAB ──────────────────────────────────── -->
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

        <div v-if="!filteredUsers.length" class="empty-state">
          <v-icon icon="mdi-account-off-outline" class="empty-icon"></v-icon>
          <div class="empty-text">No users found</div>
          <button class="add-btn" @click="showAddUserDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add First User
          </button>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredUsers" :key="item.id" :class="{ 'row--inactive': item.deleted_at }">
                <td>
                  <div class="user-name-cell">
                    <div class="user-avatar">{{ item.name.charAt(0) }}</div>
                    {{ item.name }}
                  </div>
                </td>
                <td class="cell-muted">{{ item.email }}</td>
                <td class="cell-muted">{{ item.phone }}</td>
                <td>
                  <span class="role-badge" :style="{ background: (roleColors[item.role] || '#aaa') + '18', color: roleColors[item.role] || '#aaa' }">
                    {{ item.role }}
                  </span>
                </td>
                <td class="cell-muted">{{ item.gymLocation }}</td>
                <td>
                  <span class="status-dot" :class="item.deleted_at ? 'status-dot--off' : 'status-dot--on'">
                    {{ item.deleted_at ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <template v-if="!item.deleted_at">
                      <button class="action-btn action-btn--edit" @click="editUser(item)" title="Edit">
                        <v-icon icon="mdi-pencil" size="14"></v-icon>
                      </button>
                      <button class="action-btn action-btn--warn" title="Deactivate">
                        <v-icon icon="mdi-account-cancel" size="14"></v-icon>
                      </button>
                    </template>
                    <template v-else>
                      <button class="action-btn action-btn--success" title="Activate">
                        <v-icon icon="mdi-account-check" size="14"></v-icon>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── ROLES TAB ──────────────────────────────────── -->
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
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in roles" :key="item.id">
                <td>
                  <span class="role-badge" :style="{ background: (roleColors[item.name] || '#aaa') + '18', color: roleColors[item.name] || '#aaa' }">
                    {{ item.name }}
                  </span>
                </td>
                <td class="cell-muted">{{ item.description }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" title="Edit Role">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── EQUIPMENT TAB ──────────────────────────────── -->
      <div v-if="tab === 3" class="tab-content">
        <div class="table-toolbar">
          <div class="toolbar-title">Gym Equipment</div>
          <button class="add-btn" @click="showAddEquipmentDialog = true">
            <v-icon icon="mdi-plus" size="15"></v-icon> Add Equipment
          </button>
        </div>

        <div v-if="!equipment.length" class="empty-state">
          <v-icon icon="mdi-dumbbell" class="empty-icon"></v-icon>
          <div class="empty-text">No equipment found</div>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Model No</th>
                <th>Value</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in equipment" :key="item.id">
                <td class="cell-bold">{{ item.name }}</td>
                <td><span class="mono">{{ item.model_no }}</span></td>
                <td class="cell-muted">{{ item.value }}</td>
                <td>
                  <span class="usage-tag">{{ item.usage }}</span>
                </td>
                <td>
                  <span class="status-dot" :class="item.status === 'Active' ? 'status-dot--on' : 'status-dot--warn'">
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" title="Edit">
                      <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>
                    <button class="action-btn action-btn--warn" title="Retire">
                      <v-icon icon="mdi-archive-outline" size="14"></v-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <!-- ── ADD USER DIALOG ───────────────────────────────── -->
  <v-dialog v-model="showAddUserDialog" max-width="580">
    <div class="dialog-card">
      <div class="dialog-header">
        <div>
          <div class="dialog-eyebrow">ADMIN ACTION</div>
          <h3 class="dialog-title">Add New User</h3>
        </div>
        <button class="dialog-close" @click="close">
          <v-icon icon="mdi-close" size="18"></v-icon>
        </button>
      </div>

      <div class="dialog-body">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">FIRST NAME</label>
            <div class="field-wrap">
              <input v-model="firstName" type="text" class="field-input" placeholder="John" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">LAST NAME</label>
            <div class="field-wrap">
              <input v-model="lastName" type="text" class="field-input" placeholder="Doe" />
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">EMAIL</label>
            <div class="field-wrap">
              <input v-model="email" type="email" class="field-input" placeholder="user@macfit.co.ke" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">PHONE NUMBER</label>
            <div class="field-wrap">
              <input v-model="phone" type="tel" class="field-input" placeholder="+254 700 000 000" />
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">GYM LOCATION</label>
            <div class="field-wrap field-wrap--select">
              <select v-model="gymLocation" class="field-input field-select">
                <option value="" disabled>Select location</option>
                <option v-for="loc in ['CBD','Kilimani','Westlands','Buruburu']" :key="loc" :value="loc">{{ loc }}</option>
              </select>
              <v-icon icon="mdi-chevron-down" class="select-caret"></v-icon>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">DATE OF BIRTH</label>
            <div class="field-wrap">
              <input v-model="dob" type="date" class="field-input field-date" />
            </div>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">ROLE</label>
          <div class="radio-grid">
            <label v-for="r in [['1','Admin'],['2','Trainer'],['3','Staff'],['4','User']]" :key="r[0]" class="radio-chip" :class="{ 'radio-chip--sel': userRole === r[0] }">
              <input type="radio" v-model="userRole" :value="r[0]" hidden />
              {{ r[1] }}
            </label>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">GENDER</label>
          <div class="radio-grid">
            <label v-for="g in ['Male','Female','Non-binary','Prefer not to say']" :key="g" class="radio-chip" :class="{ 'radio-chip--sel': gender === g }">
              <input type="radio" v-model="gender" :value="g" hidden />
              {{ g }}
            </label>
          </div>
        </div>

        <div v-if="error" class="dialog-error">{{ error }}</div>
      </div>

      <div class="dialog-footer">
        <button class="dialog-btn-ghost" @click="close">CANCEL</button>
        <button class="dialog-btn-primary" :disabled="loading" @click="addUser">
          <span v-if="!loading">SAVE USER →</span>
          <span v-else>SAVING…</span>
        </button>
      </div>
    </div>
  </v-dialog>

  <!-- ── EDIT USER DIALOG ──────────────────────────────── -->
  <v-dialog v-model="showEditUserDialog" max-width="500">
    <div class="dialog-card">
      <div class="dialog-header">
        <div>
          <div class="dialog-eyebrow">EDIT RECORD</div>
          <h3 class="dialog-title">Edit User</h3>
        </div>
        <button class="dialog-close" @click="close">
          <v-icon icon="mdi-close" size="18"></v-icon>
        </button>
      </div>
      <div class="dialog-body">
        <div class="field-group">
          <label class="field-label">FULL NAME</label>
          <div class="field-wrap">
            <input v-model="firstName" type="text" class="field-input" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">EMAIL</label>
          <div class="field-wrap">
            <input v-model="email" type="email" class="field-input" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">PHONE</label>
          <div class="field-wrap">
            <input v-model="phone" type="tel" class="field-input" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">ROLE</label>
          <div class="radio-grid">
            <label v-for="r in [['1','Admin'],['2','Trainer'],['3','Staff'],['4','User']]" :key="r[0]" class="radio-chip" :class="{ 'radio-chip--sel': userRole === r[0] }">
              <input type="radio" v-model="userRole" :value="r[0]" hidden />
              {{ r[1] }}
            </label>
          </div>
        </div>
        <div v-if="error" class="dialog-error">{{ error }}</div>
      </div>
      <div class="dialog-footer">
        <button class="dialog-btn-ghost" @click="close">CANCEL</button>
        <button class="dialog-btn-primary" :disabled="loading">UPDATE USER →</button>
      </div>
    </div>
  </v-dialog>

  <!--ADD EQUIPMENT DIALOG-->
  <v-dialog v-model="showAddEquipmentDialog" max-width="500">
    <div class="dialog-card">
      <div class="dialog-header">
        <div>
          <div class="dialog-eyebrow">ADMIN ACTION</div>
          <h3 class="dialog-title">Add New Equipment</h3>
        </div>
        <button class="dialog-close" @click="close">
          <v-icon icon="mdi-close" size="18"></v-icon>
        </button>
      </div>

      <div class="dialog-body">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">EQUIPMENT NAME</label>
            <div class="field-wrap">
              <input v-model="name" type="text" class="field-input" placeholder="Equipment Name">
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">STATUS</label>
            <div class="field-wrap">
              <input v-model="status" type="text" class="field-input" placeholder="Equipment Status">
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">MODEL NUMBER</label>
            <div class="field-wrap">
              <input v-model="modelNumber" type="text" class="field-input" placeholder="Model Number">
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">USAGE</label>
            <div class="field-wrap">
              <input v-model="usage" type="text" class="field-input" placeholder="Equipment Usage">
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">VALUE</label>
            <div class="field-wrap">
              <input v-model="value" type="text" class="field-input" placeholder="Equipment Value">
            </div>
          </div>
        </div>
        <div v-if="error" class="dialog-error">{{ error }}</div>
      </div>

      <div class="dialog-footer">
        <button class="dialog-btn-ghost" @click="close">CANCEL</button>
        <button class="dialog-btn-primary" :disabled="loading" @click="addEquipment">
          <span v-if="!loading">SAVE EQUIPMENT</span>
          <span v-else>SAVING...</span>
        </button>
      </div>
    </div>
  </v-dialog>
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
    background: #0d0d0d;
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
    color: #c8ff00;
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
    color: #c8ff00;
}

.header-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.7rem 1.4rem;
    background: #c8ff00;
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
    background: #d9ff33;
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
    border-bottom-color: #c8ff00;
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
    background: rgba(200, 255, 0, 0.1);
    border: 1px solid rgba(200, 255, 0, 0.3);
    color: #c8ff00;
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
    background: rgba(200, 255, 0, 0.18);
    border-color: #c8ff00;
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
    color: #c8ff00;
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

.status-dot--on { color: #c8ff00; }
.status-dot--on::before { background: #c8ff00; box-shadow: 0 0 6px #c8ff0088; }
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
.action-btn--success:hover { border-color: #c8ff00; color: #c8ff00; background: rgba(200, 255, 0, 0.1); }

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
    color: #c8ff00;
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
    background: #c8ff00;
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
    border-color: #c8ff00;
    color: #c8ff00;
    background: rgba(200, 255, 0, 0.1);
}
</style>
