// src/lib/toast.js
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuração global para o ToastContainer
export const CustomToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    theme=''
    pauseOnHover
  />
);

// Configurações padrão para os toasts
const toastConfig = {
  className: 'bg-base-200 text-base-content border border-base-300 shadow-lg',
  bodyClassName: 'text-sm',
};

// Tipos de toast
export const showSuccess = (message: string) => toast.success(message, toastConfig);
export const showError = (message: string) => toast.error(message, toastConfig);
export const showInfo = (message: string) => toast.info(message, toastConfig);
export const showWarning = (message: string) => toast.warn(message, toastConfig);
export const showToast = (message: string) => toast(message, toastConfig); // genérico
