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
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: false,
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__bounce",
  maxToasts: 3,
  newestOnTop: true,
  toastClassName: "custom-toast",
  bodyClassName: ["custom-toast-body"],
  containerClassName: "custom-toast-container"
};

app.use(router);
app.use(store);
app.use(Toast, toastOptions);
app.mount("#app");

// Özel CSS stilleri
const style = document.createElement('style');
style.textContent = `
.custom-toast {
  background-color: white !important;
  color: #1F2937 !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #E5E7EB !important;
  margin-bottom: 8px !important;
  font-size: 14px !important;
}

.custom-toast.Vue-Toastification__toast--error {
  border-left: 4px solid #EF4444 !important;
}

.custom-toast.Vue-Toastification__toast--success {
  border-left: 4px solid #10B981 !important;
}

.custom-toast.Vue-Toastification__toast--warning {
  border-left: 4px solid #F59E0B !important;
}

.custom-toast.Vue-Toastification__toast--info {
  border-left: 4px solid #3B82F6 !important;
}

.Vue-Toastification__toast-body {
  margin: 0 !important;
  padding: 0 !important;
}
`;
document.head.appendChild(style);