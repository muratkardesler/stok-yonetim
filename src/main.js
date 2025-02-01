import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/main.css"; // Tailwind CSS
import 'animate.css';

const app = createApp(App);

const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: {
    enter: "animate__animated animate__fadeInDown",
    leave: "animate__animated animate__fadeOutUp"
  }
};

app.use(router);
app.use(store);
app.use(Toast, toastOptions);
app.mount("#app");