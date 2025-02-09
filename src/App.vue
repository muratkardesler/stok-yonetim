<template>
  <div :class="{ 'dark': isDarkMode }" class="min-h-screen bg-background dark:bg-background-dark transition-colors duration-300">
    <router-view v-slot="{ Component }">
      <transition 
        name="page" 
        mode="out-in"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { ref, onMounted, watch, provide } from 'vue'
import gsap from 'gsap'

export default {
  name: 'App',
  setup() {
    const isDarkMode = ref(false)

    // Tema değişkenini provide et
    provide('isDarkMode', isDarkMode)

    // Tema değişimini izle ve localStorage'a kaydet
    watch(isDarkMode, (newValue) => {
      localStorage.setItem('darkMode', newValue)
      if (newValue) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })

    // Sayfa geçiş animasyonları
    const beforeEnter = (el) => {
      el.style.opacity = 0
      el.style.transform = 'translateY(20px)'
    }

    const enter = (el, done) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        onComplete: done
      })
    }

    const leave = (el, done) => {
      gsap.to(el, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: done
      })
    }

    // Sistem temasını kontrol et
    onMounted(() => {
      // localStorage'dan tema tercihini al
      const savedTheme = localStorage.getItem('darkMode')
      if (savedTheme !== null) {
        isDarkMode.value = savedTheme === 'true'
      } else {
        // Sistem temasını kontrol et
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      // Sistem tema değişikliğini dinle
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
          isDarkMode.value = e.matches
        }
      })
    })

    return {
      isDarkMode,
      beforeEnter,
      enter,
      leave
    }
  }
}
</script>

<style>
:root {
  /* Light theme variables */
  --color-primary: 79 70 229;
  --color-surface: 255 255 255;
  --color-background: 249 250 251;
  --color-text: 17 24 39;
  --color-border: 229 231 235;
}

.dark {
  /* Dark theme variables */
  --color-primary: 99 102 241;
  --color-surface: 31 41 55;
  --color-background: 17 24 39;
  --color-text: 243 244 246;
  --color-border: 55 65 81;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Base transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom form elements */
.custom-select {
  @apply appearance-none bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200;
  background-image: url("data:image/svg+xml,...");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.custom-checkbox {
  @apply rounded-lg border-2 border-border dark:border-border-dark checked:bg-primary checked:border-primary focus:ring-primary/20 transition-all duration-200;
}

.custom-radio {
  @apply rounded-full border-2 border-border dark:border-border-dark checked:bg-primary checked:border-primary focus:ring-primary/20 transition-all duration-200;
}

/* Number counter animation */
@keyframes count-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-count {
  animation: count-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>