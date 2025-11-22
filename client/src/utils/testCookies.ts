// Teste dos utilitários de cookie
import { cookieUtils } from '../utils/cookieUtils';

// Teste básico dos cookies (pode ser executado no console do navegador)
export const testCookies = () => {
  console.log('=== Teste dos Cookies ===');
  
  // Verificar se cookies estão disponíveis
  console.log('Cookies disponíveis:', cookieUtils.isAvailable());
  
  // Definir um cookie de teste
  cookieUtils.set('teste', 'valor-teste', 1);
  console.log('Cookie definido: teste=valor-teste');
  
  // Ler o cookie
  const valor = cookieUtils.get('teste');
  console.log('Cookie lido:', valor);
  
  // Remover o cookie
  cookieUtils.remove('teste');
  const valorRemovido = cookieUtils.get('teste');
  console.log('Cookie após remoção:', valorRemovido);
  
  console.log('=== Fim do Teste ===');
};

// Exportar para usar se necessário
export default testCookies;