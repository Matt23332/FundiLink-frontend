<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mobileOpen = ref(false);
const scrolled = ref(false);
const navLinks = [
    { label: 'Home', to: '/homePage' },
    { label: 'Login', to: '/login' },
    { label: 'Sign Up', to: '/signUp' },
    { label: 'Profile', to: '/profile' },
    { label: 'Bundles', to: '/bundles' },
    { label: 'Admin', to: '/admin' },
    { label: 'Gym Locations', to: '/gymLocations' }
]

const handleScroll = () => {
    scrolled.value = window.scrollY > 0;
}
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
    <v-app-bar color="#000000" dark :elevation="scrolled ? 4 : 0">
        <v-app-bar-title>MacFit</v-app-bar-title>
        <v-btn to="/homePage">Home</v-btn>
        <v-btn to="/login">Login</v-btn>
        <v-btn to="/signUp">Sign Up</v-btn>
        <v-btn to="/profile">Profile</v-btn>
        <v-btn to="/bundles">Bundles</v-btn>
        <v-btn to="/admin">Admin</v-btn>
        <v-btn to="/gymLocations">Gym Locations</v-btn>
    </v-app-bar>
</template>