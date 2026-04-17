<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const auth = useAuthStore();
// Use storeToRefs to keep reactivity
const { user, isLoggedIn, userRole } = storeToRefs(auth);
const scrolled = ref(false);

// Computed properties for role checking
const isCustomer = ref(false);
const isAdmin = ref(false);
const isProvider = ref(false);

// Watch for role changes
import { watch } from 'vue';
watch(userRole, (newRole) => {
    console.log('Role updated:', newRole);
    isCustomer.value = newRole === 'Customer';
    isAdmin.value = newRole === 'Admin';
    isProvider.value = newRole === 'Provider';
}, { immediate: true });

const handleScroll = () => {
    scrolled.value = window.scrollY > 0;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    console.log('NavBar mounted - User:', user.value);
    console.log('User role:', userRole.value);
    console.log('Is logged in:', isLoggedIn.value);
});

onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
    <v-app-bar :key="isLoggedIn" color="#000000" dark :elevation="scrolled ? 4 : 0">
        <v-app-bar-title>FundiLink</v-app-bar-title>

        <!--Visible when logged out-->
        <template v-if="!isLoggedIn">
            <v-btn to="/login">Login</v-btn>
            <v-btn to="/signUp" color="#4d8ef0" variant="flat">Sign Up</v-btn>
        </template>

        <!--Visible when logged in-->
        <template v-else>
            <v-btn to="/homePage">Home</v-btn>
            <v-btn v-if="isCustomer" to="/service-requests">Service Requests</v-btn>
            <v-btn v-if="isCustomer" to="/services">Services</v-btn>
            <v-btn v-if="isCustomer" to="/request-service">Request Service</v-btn>
            <v-btn v-if="isProvider" to="/service-provider">Dashboard</v-btn>
            <v-btn v-if="isAdmin" to="/admin">Admin</v-btn>
            
            <v-btn icon="mdi-account">
                <v-icon>mdi-account</v-icon>
                <v-menu activator="parent">
                    <v-list bg-color="#111" border>
                        <v-list-item>
                            <v-btn variant="text" to="/profile" prepend-icon="mdi-account-outline">
                                Profile ({{ userRole || 'No Role' }})
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn variant="text" color="#ff6060" prepend-icon="mdi-logout" @click="auth.logout">
                                Logout
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
        </template>
    </v-app-bar>
</template>