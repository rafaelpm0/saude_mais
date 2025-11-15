// Utilitário para limpar dados de autenticação do localStorage
// Execute no console do navegador se necessário: clearAuthData()
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('theme'); // manter tema se desejado
  console.log('Dados de autenticação limpos do localStorage');
  window.location.reload();
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).clearAuthData = clearAuthData;
}