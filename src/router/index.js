import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import Admin from '@/components/Admin.vue'
import Services from '@/components/Services.vue'
import ServiceRequests from '@/components/ServiceRequest.vue'
import HomePage from '@/components/HomePage.vue'
import LandingPage from '@/components/LandingPage.vue'
import Login from '@/components/Login.vue'
import Profile from '@/components/Profile.vue'
import SignUp from '@/components/SignUp.vue'

const routes = [
  // Public routes
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signUp', name: 'SignUp', component: SignUp },

  // Protected routes
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/homePage', name: 'HomePage', component: HomePage },
  { path: '/serviceRequests', name: 'ServiceRequests', component: ServiceRequests },
  { path: '/services', name: 'Services', component: Services },
  
  // Admin route
  { path: '/admin', name: 'Admin', component: Admin },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login' }
  }

  if ((to.path === '/login' || to.path === '/signUp') && auth.isLoggedIn) {
    return { path: '/homePage' }
  }
})

export default router
