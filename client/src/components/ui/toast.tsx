// src/lib/toast.js
import { toast as toastify, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Estilos customizados para melhor legibilidade
const toastStyles = `
  .Toastify__toast--success {
    background-color: #f0f9ff !important;
    color: #1e40af !important;
    border-left: 4px solid #22c55e !important;
  }
  
  .Toastify__toast--error {
    background-color: #fef2f2 !important;
    color: #b91c1c !important;
    border-left: 4px solid #ef4444 !important;
  }
  
  .Toastify__toast--info {
    background-color: #eff6ff !important;
    color: #1e40af !important;
    border-left: 4px solid #3b82f6 !important;
  }
  
  .Toastify__toast--warning {
    background-color: #fffbeb !important;
    color: #a16207 !important;
    border-left: 4px solid #f59e0b !important;
  }
`;

// Adicionar estilos ao head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = toastStyles;
  document.head.appendChild(styleSheet);
}

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
    theme="light"
    pauseOnHover
    toastClassName="!bg-white !text-gray-900 !border !border-gray-300 !shadow-xl !font-medium"
    className="!text-gray-900 !font-medium"
    progressClassName="!bg-blue-500"
  />
);

// Configurações padrão para os toasts
const toastConfig = {
  className: 'bg-base-200 text-base-content border border-base-300 shadow-lg',
  bodyClassName: 'text-sm',
};

// Export do toast
export const toast = {
  success: (message: string) => toastify.success(message, toastConfig),
  error: (message: string) => toastify.error(message, toastConfig),
  info: (message: string) => toastify.info(message, toastConfig),
  warn: (message: string) => toastify.warn(message, toastConfig),
  warning: (message: string) => toastify.warn(message, toastConfig),
};

// Tipos de toast (manter compatibilidade com código existente)
export const showSuccess = (message: string) => toastify.success(message, toastConfig);
export const showError = (message: string) => toastify.error(message, toastConfig);
export const showInfo = (message: string) => toastify.info(message, toastConfig);
export const showWarning = (message: string) => toastify.warn(message, toastConfig);
export const showToast = (message: string) => toastify(message, toastConfig); // genérico
