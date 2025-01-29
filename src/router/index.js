import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Dashboard from "@/views/Dashboard.vue";
import Stock from "@/views/Stock.vue";
import Sales from '@/views/Sales.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { requiresGuest: true }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: "/stock",
    name: "Stock",
    component: Stock,
    meta: { requiresAuth: true }
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales,
    meta: {
      requiresAuth: true,
      title: 'Satışlar'
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Şifre sıfırlama sayfasına gidiyorsa
  if (to.path === '/reset-password') {
    // Eğer hash varsa ve error parametresi yoksa devam et
    if (to.hash && !to.hash.includes('error')) {
      next()
      return
    }
    // Hash yoksa veya error varsa forgot-password sayfasına yönlendir
    next('/forgot-password')
    return
  }

  // Eğer oturum varsa ve misafir sayfasına gitmeye çalışıyorsa (login/register)
  if (session && requiresGuest) {
    next('/dashboard')
    return
  }

  // Eğer oturum yoksa ve kimlik doğrulama gerektiren bir sayfaya gitmeye çalışıyorsa
  if (!session && requiresAuth) {
    next('/login')
    return
  }

  // Ana sayfaya gidiyorsa ve oturum varsa dashboard'a yönlendir
  if (to.path === '/' && session) {
    next('/dashboard')
    return
  }

  next()
})

export default router;