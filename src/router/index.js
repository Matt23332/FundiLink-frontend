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
import RequestService from '@/components/RequestService.vue'
import ServiceProvider from '@/components/ServiceProvider.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import ResetPassword from '@/components/ResetPassword.vue'

const routes = [
  // Public routes
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signUp', name: 'SignUp', component: SignUp },

  // Protected routes
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/homePage', name: 'HomePage', component: HomePage },
  { path: '/service-requests', name: 'ServiceRequests', component: ServiceRequests },
  { path: '/services', name: 'Services', component: Services },
  { path: '/request-service', name: 'RequestService', component: RequestService },
  { path: '/service-provider', name: 'ServiceProvider', component: ServiceProvider },
  
  // Admin route
  { path: '/admin', name: 'Admin', component: Admin },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login' }
  } else if ((to.path === '/login' || to.path === '/signUp') && auth.isLoggedIn) {
    return { path: '/homePage' }
  }
})

export default router
