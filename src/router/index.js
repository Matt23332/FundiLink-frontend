import { createRouter, createWebHistory } from 'vue-router'
import Admin from '@/components/Admin.vue'
import Bundles from '@/components/Bundles.vue'
import GymLocations from '@/components/GymLocations.vue'
import HomePage from '@/components/HomePage.vue'
import LandingPage from '@/components/LandingPage.vue'
import Login from '@/components/Login.vue'
import Profile from '@/components/Profile.vue'
import SignUp from '@/components/SignUp.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      name: 'Admin',
      component: Admin
    },
    {
      path: '/bundles',
      name: 'Bundles',
      component: Bundles
    },
    {
      path: '/gymLocations',
      name: 'GymLocations',
      component: GymLocations
    },
    {
      path: '/homePage',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/signUp',
      name: 'SignUp',
      component: SignUp
    }
  ],
})

export default router
