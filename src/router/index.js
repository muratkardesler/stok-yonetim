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
import SalesList from '@/views/SalesList.vue'
import Customers from '@/views/Customers.vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import Settings from '@/views/Settings.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import Products from '@/views/stock/Products.vue'
import Categories from '@/views/stock/Categories.vue'
import Packages from '@/views/stock/Packages.vue'
import ProductMedia from '@/views/stock/ProductMedia.vue'

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
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
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
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "stok/urunler",
        name: "Products",
        component: Products
      },
      {
        path: "stok/kategoriler",
        name: "Categories",
        component: Categories
      },
      {
        path: "stok/paketler",
        name: "Packages",
        component: Packages
      },
      {
        path: "stok/urun-medya",
        name: "ProductMedia",
        component: ProductMedia
      },
      {
        path: "sales",
        name: "Sales",
        component: Sales,
      },
      {
        path: "sales/list",
        name: "SalesList",
        component: SalesList,
      },
      {
        path: "customers",
        name: "Customers",
        component: Customers,
      },
      {
        path: "settings",
        name: "Settings",
        component: Settings,
      }
    ]
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard"
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/Dashboard.vue")
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/views/admin/Users.vue")
      },
      {
        path: "licenses",
        name: "AdminLicenses",
        component: () => import("@/views/admin/Licenses.vue")
      },
      {
        path: "logs",
        name: "AdminLogs",
        component: () => import("@/views/admin/Logs.vue")
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("@/views/admin/Settings.vue")
      }
    ]
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
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

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

  // Admin yetkisi kontrolü
  if (requiresAdmin) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      if (profile.role !== 'admin') {
        next('/dashboard')
        return
      }
    } catch (error) {
      console.error('Admin check error:', error)
      next('/dashboard')
      return
    }
  }

  // Ana sayfaya gidiyorsa ve oturum varsa dashboard'a yönlendir
  if (to.path === '/' && session) {
    next('/dashboard')
    return
  }

  // Deneme süresi kontrolü
  if (session && requiresAuth && !requiresAdmin) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('trial_end_date, is_active')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      const isTrialExpired = profile.trial_end_date && new Date(profile.trial_end_date) < new Date()
      const isActive = profile.is_active

      // Eğer deneme süresi bittiyse ve hesap aktif değilse
      if (isTrialExpired && !isActive) {
        // Sadece settings sayfasına erişime izin ver
        if (to.path !== '/settings') {
          next('/settings')
          return
        }
      }
    } catch (error) {
      console.error('Trial check error:', error)
    }
  }

  next()
})

export default router;