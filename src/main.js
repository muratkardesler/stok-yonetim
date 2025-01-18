import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import 'animate.css';

// Import Tailwind CSS
import './assets/main.css';

const app = createApp(App);

const toastOptions = {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true,
  filterBeforeCreate: (toast, toasts) => {
    if (toasts.filter(t => t.type === toast.type).length !== 0) {
      return false;
    }
    return toast;
  }
};

app.use(router);
app.use(store);
app.use(Toast, toastOptions);
app.mount("#app");