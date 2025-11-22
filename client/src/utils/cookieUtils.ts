// Utilitários para trabalhar com cookies
export const cookieUtils = {
  // Definir um cookie
  set: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },

  // Obter um cookie
  get: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // Remover um cookie
  remove: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
  },

  // Verificar se cookies estão disponíveis
  isAvailable: (): boolean => {
    try {
      // Tentar definir um cookie de teste
      document.cookie = "cookietest=1;SameSite=Strict";
      const supported = document.cookie.indexOf("cookietest=") !== -1;
      // Remover cookie de teste
      document.cookie = "cookietest=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict";
      return supported;
    } catch (e) {
      return false;
    }
  }
};