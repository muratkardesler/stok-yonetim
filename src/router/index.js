import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import Dashboard from "../views/Dashboard.vue";
import Stock from "../views/Stock.vue";

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
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                    sessionStorage.getItem('isLoggedIn') === 'true';

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Home' });
    } else {
      next();
    }
  } else if (isLoggedIn && (to.name === 'Login' || to.name === 'Signup')) {
    // Eğer kullanıcı giriş yapmışsa ve login/signup sayfalarına gitmeye çalışıyorsa
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;