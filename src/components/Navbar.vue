<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref, onMounted } from 'vue';

// Don't use storeToRefs at all — access store directly
const auth = useAuthStore();

const isLoggedIn = computed(() => auth.isLoggedIn);
const userRole = computed(() => auth.userRole);
const user = computed(() => auth.user);

const isCustomer = computed(() => auth.userRole === 'Customer');
const isAdmin = computed(() => auth.userRole === 'Admin');
const isProvider = computed(() => auth.userRole === 'Provider');

const scrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => { scrolled.value = window.scrollY > 50; };
const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value; };

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    console.log('NAV MOUNTED - isLoggedIn:', auth.isLoggedIn);
    console.log('NAV MOUNTED - userRole:', auth.userRole);
    console.log('NAV MOUNTED - user:', auth.user);
});

import { onUnmounted } from 'vue';
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
    <v-app-bar 
        :class="['navbar', { 'navbar--scrolled': scrolled }]" 
        color="transparent" 
        flat
        height="80"
    >
        <v-container class="navbar-container" fluid>
            <div class="navbar-inner">
                <!-- Logo -->
                <div class="logo-wrapper">
                    <v-app-bar-title class="logo">
                        <span class="logo-text">Fundi<span class="logo-highlight">Link</span></span>
                    </v-app-bar-title>
                </div>

                <!-- Desktop Navigation -->
                <div class="nav-links-desktop">
                    <template v-if="!isLoggedIn">
                        <v-btn class="nav-btn nav-btn--outline" to="/login">
                            <span>Login</span>
                        </v-btn>
                        <v-btn class="nav-btn nav-btn--primary" to="/signUp">
                            <span>Sign Up</span>
                        </v-btn>
                    </template>

                    <template v-else>
                        <v-btn class="nav-link" to="/homePage">
                            <v-icon icon="mdi-home-outline" size="18"></v-icon>
                            <span>Home</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="nav-link" to="/service-requests">
                            <v-icon icon="mdi-file-document-outline" size="18"></v-icon>
                            <span>My Requests</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="nav-link" to="/services">
                            <v-icon icon="mdi-wrench-outline" size="18"></v-icon>
                            <span>Services</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="nav-link nav-link--highlight" to="/request-service">
                            <v-icon icon="mdi-plus-circle-outline" size="18"></v-icon>
                            <span>Request Service</span>
                        </v-btn>
                        
                        <v-btn v-if="isProvider" class="nav-link" to="/service-provider">
                            <v-icon icon="mdi-view-dashboard-outline" size="18"></v-icon>
                            <span>Dashboard</span>
                        </v-btn>
                        
                        <v-btn v-if="isAdmin" class="nav-link nav-link--admin" to="/admin">
                            <v-icon icon="mdi-shield-account-outline" size="18"></v-icon>
                            <span>Admin</span>
                        </v-btn>
                        
                        <!-- User Menu -->
                        <div class="user-menu">
                            <v-btn class="user-menu-trigger" variant="text">
                                <div class="user-avatar">
                                    <span>{{ user?.name?.charAt(0) || 'U' }}</span>
                                </div>
                                <div class="user-info">
                                    <span class="user-name">{{ user?.name?.split(' ')[0] || 'User' }}</span>
                                    <span class="user-role-badge" :class="{
                                        'role-admin': isAdmin,
                                        'role-provider': isProvider,
                                        'role-customer': isCustomer
                                    }">
                                        {{ userRole || 'Role' }}
                                    </span>
                                </div>
                                <v-icon icon="mdi-chevron-down" size="16" class="user-menu-icon"></v-icon>
                                
                                <v-menu activator="parent" location="bottom end" offset="8">
                                    <v-list class="user-dropdown" bg-color="#0f0f0f" border>
                                        <v-list-item class="dropdown-header">
                                            <div class="dropdown-user-info">
                                                <div class="dropdown-avatar">
                                                    {{ user?.name?.charAt(0) || 'U' }}
                                                </div>
                                                <div>
                                                    <div class="dropdown-user-name">{{ user?.name || 'User' }}</div>
                                                    <div class="dropdown-user-email">{{ user?.email || '' }}</div>
                                                </div>
                                            </div>
                                        </v-list-item>
                                        
                                        <v-divider class="dropdown-divider"></v-divider>
                                        
                                        <v-list-item>
                                            <v-btn class="dropdown-item" variant="text" to="/profile" prepend-icon="mdi-account-outline">
                                                Profile Settings
                                            </v-btn>
                                        </v-list-item>
                                        
                                        <v-list-item v-if="isCustomer">
                                            <v-btn class="dropdown-item" variant="text" to="/service-requests" prepend-icon="mdi-file-document-outline">
                                                My Activity
                                            </v-btn>
                                        </v-list-item>
                                        
                                        <v-divider class="dropdown-divider"></v-divider>
                                        
                                        <v-list-item>
                                            <v-btn class="dropdown-item dropdown-item--danger" variant="text" prepend-icon="mdi-logout" @click="auth.logout">
                                                Logout
                                            </v-btn>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-btn>
                        </div>
                    </template>
                </div>

                <button class="mobile-menu-btn" @click="toggleMobileMenu">
                    <span class="menu-icon" :class="{ 'menu-icon--open': mobileMenuOpen }">
                        <span></span><span></span><span></span>
                    </span>
                </button>
            </div>
        </v-container>

        <transition name="mobile-menu">
            <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click.self="mobileMenuOpen = false">
                <div class="mobile-menu-content">
                    <template v-if="!isLoggedIn">
                        <v-btn class="mobile-nav-btn" to="/login" block @click="mobileMenuOpen = false">
                            Login
                        </v-btn>
                        <v-btn class="mobile-nav-btn mobile-nav-btn--primary" to="/signUp" block @click="mobileMenuOpen = false">
                            Sign Up
                        </v-btn>
                    </template>

                    <template v-else>
                        <div class="mobile-user-info">
                            <div class="mobile-avatar">{{ user?.name?.charAt(0) || 'U' }}</div>
                            <div class="mobile-user-details">
                                <div class="mobile-user-name">{{ user?.name || 'User' }}</div>
                                <div class="mobile-user-role" :class="{
                                    'role-admin': userRole === 'Admin',
                                    'role-provider': userRole === 'Provider',
                                    'role-customer': userRole === 'Customer'
                                }">{{ userRole || 'Role' }}</div>
                            </div>
                        </div>
                        
                        <v-divider class="mobile-divider"></v-divider>
                        
                        <v-btn class="mobile-nav-link" to="/homePage" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-home-outline" size="20"></v-icon>
                            <span>Home</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="mobile-nav-link" to="/service-requests" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-file-document-outline" size="20"></v-icon>
                            <span>My Requests</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="mobile-nav-link" to="/services" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-wrench-outline" size="20"></v-icon>
                            <span>Services</span>
                        </v-btn>
                        
                        <v-btn v-if="isCustomer" class="mobile-nav-link mobile-nav-link--highlight" to="/request-service" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-plus-circle-outline" size="20"></v-icon>
                            <span>Request Service</span>
                        </v-btn>
                        
                        <v-btn v-if="isProvider" class="mobile-nav-link" to="/service-provider" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-view-dashboard-outline" size="20"></v-icon>
                            <span>Dashboard</span>
                        </v-btn>
                        
                        <v-btn v-if="isAdmin" class="mobile-nav-link mobile-nav-link--admin" to="/admin" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-shield-account-outline" size="20"></v-icon>
                            <span>Admin Panel</span>
                        </v-btn>
                        
                        <v-divider class="mobile-divider"></v-divider>
                        
                        <v-btn class="mobile-nav-link" to="/profile" block @click="mobileMenuOpen = false">
                            <v-icon icon="mdi-account-outline" size="20"></v-icon>
                            <span>Profile Settings</span>
                        </v-btn>
                        
                        <v-btn class="mobile-nav-link mobile-nav-link--danger" block @click="auth.logout(); mobileMenuOpen = false">
                            <v-icon icon="mdi-logout" size="20"></v-icon>
                            <span>Logout</span>
                        </v-btn>
                    </template>
                </div>
            </div>
        </transition>
    </v-app-bar>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.navbar {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    background: #000000 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
}

.navbar--scrolled {
    background: rgba(0, 0, 0, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(77, 142, 240, 0.15);
}

.navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    width: 100%;
}

.logo-wrapper {
    flex-shrink: 0;
}

.logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
}

.logo-text {
    background: linear-gradient(135deg, #ffffff 0%, #4d8ef0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.logo-highlight {
    color: #4d8ef0;
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
}

.nav-links-desktop {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
}

.nav-link {
    background: transparent !important;
    color: rgba(240, 237, 230, 0.7) !important;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.5rem 1rem !important;
    transition: all 0.2s ease !important;
    position: relative;
}

.nav-link::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: #4d8ef0;
    transition: width 0.2s ease;
}

.nav-link:hover {
    color: #f0ede6 !important;
    background: rgba(77, 142, 240, 0.08) !important;
}

.nav-link:hover::before {
    width: 80%;
}

.nav-link--highlight {
    background: rgba(77, 142, 240, 0.12) !important;
    color: #4d8ef0 !important;
    border: 1px solid rgba(77, 142, 240, 0.3);
}

.nav-link--highlight:hover {
    background: rgba(77, 142, 240, 0.2) !important;
    border-color: #4d8ef0;
}

.nav-link--admin {
    background: rgba(255, 107, 107, 0.1) !important;
    color: #ff6b6b !important;
    border: 1px solid rgba(255, 107, 107, 0.3);
}

.nav-link--admin:hover {
    background: rgba(255, 107, 107, 0.15) !important;
}

.nav-btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.5rem 1.2rem !important;
    transition: all 0.2s ease !important;
}

.nav-btn--outline {
    background: transparent !important;
    color: #f0ede6 !important;
    border: 1px solid rgba(240, 237, 230, 0.2);
}

.nav-btn--outline:hover {
    border-color: #4d8ef0;
    color: #4d8ef0 !important;
}

.nav-btn--primary {
    background: #4d8ef0 !important;
    color: #0a0a0a !important;
    clip-path: polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%);
}

.nav-btn--primary:hover {
    background: #3b6fd1 !important;
    transform: translateY(-1px);
}

.user-menu {
    margin-left: 0.5rem;
}

.user-menu-trigger {
    display: flex !important;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0.8rem 0.4rem 0.6rem !important;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 40px;
    transition: all 0.2s ease;
}

.user-menu-trigger:hover {
    background: rgba(77, 142, 240, 0.08) !important;
    border-color: rgba(77, 142, 240, 0.3);
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #4d8ef0, #0d39a9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
}

.user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #f0ede6;
}

.user-role-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
}

.role-admin {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
}

.role-provider {
    background: rgba(39, 174, 96, 0.15);
    color: #27ae60;
}

.role-customer {
    background: rgba(77, 142, 240, 0.15);
    color: #4d8ef0;
}

.user-menu-icon {
    color: rgba(240, 237, 230, 0.4);
}

.user-dropdown {
    background: #0f0f0f !important;
    border: 1px solid rgba(77, 142, 240, 0.15);
    border-radius: 8px;
    min-width: 260px;
    padding: 0.5rem 0;
}

.dropdown-header {
    padding: 0.75rem 1rem !important;
}

.dropdown-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.dropdown-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4d8ef0, #0d39a9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
}

.dropdown-user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #f0ede6;
}

.dropdown-user-email {
    font-size: 0.75rem;
    color: rgba(240, 237, 230, 0.4);
}

.dropdown-divider {
    background: rgba(255, 255, 255, 0.05);
    margin: 0.25rem 0;
}

.dropdown-item {
    justify-content: flex-start !important;
    color: rgba(240, 237, 230, 0.7) !important;
    font-size: 0.85rem;
    padding: 0.6rem 1rem !important;
    width: 100%;
}

.dropdown-item:hover {
    background: rgba(77, 142, 240, 0.08) !important;
    color: #f0ede6 !important;
}

.dropdown-item--danger {
    color: #ff6b6b !important;
}

.dropdown-item--danger:hover {
    background: rgba(255, 107, 107, 0.1) !important;
}

.mobile-menu-btn {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    z-index: 1001;
}

.menu-icon {
    width: 24px;
    height: 18px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.menu-icon span {
    width: 100%;
    height: 2px;
    background: #f0ede6;
    transition: all 0.3s ease;
}

.menu-icon--open span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.menu-icon--open span:nth-child(2) {
    opacity: 0;
}

.menu-icon--open span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
}

.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(12px);
    z-index: 999;
    animation: fadeIn 0.3s ease;
}

.mobile-menu-content {
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
}

.mobile-user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(77, 142, 240, 0.05);
    border: 1px solid rgba(77, 142, 240, 0.1);
    border-radius: 12px;
    margin-bottom: 1rem;
}

.mobile-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #4d8ef0, #0d39a9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffffff;
}

.mobile-user-details {
    flex: 1;
}

.mobile-user-name {
    font-size: 1rem;
    font-weight: 600;
    color: #f0ede6;
    margin-bottom: 0.25rem;
}

.mobile-user-role {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
}

.mobile-divider {
    background: rgba(255, 255, 255, 0.05);
    margin: 0.5rem 0;
}

.mobile-nav-btn,
.mobile-nav-link {
    justify-content: flex-start !important;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.8rem 1rem !important;
    color: rgba(240, 237, 230, 0.7) !important;
    gap: 0.75rem;
}

.mobile-nav-btn--primary {
    background: #4d8ef0 !important;
    color: #0a0a0a !important;
    justify-content: center !important;
}

.mobile-nav-link--highlight {
    background: rgba(77, 142, 240, 0.1) !important;
    color: #4d8ef0 !important;
    border: 1px solid rgba(77, 142, 240, 0.3);
}

.mobile-nav-link--admin {
    background: rgba(255, 107, 107, 0.1) !important;
    color: #ff6b6b !important;
    border: 1px solid rgba(255, 107, 107, 0.3);
}

.mobile-nav-link--danger {
    color: #ff6b6b !important;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
    transition: opacity 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
    opacity: 0;
}

@media (max-width: 1024px) {
    .nav-links-desktop {
        gap: 0.25rem;
    }
    
    .nav-link {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.8rem;
    }
}

@media (max-width: 768px) {
    .navbar-container {
        padding: 0 1rem;
    }
    
    .nav-links-desktop {
        display: none;
    }
    
    .mobile-menu-btn {
        display: block;
    }
    
    .logo {
        font-size: 1.5rem;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .user-info {
        display: none;
    }
    
    .user-menu-trigger {
        padding: 0.4rem !important;
    }
}
</style>