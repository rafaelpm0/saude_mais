import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUserFromStorage } from '../app/authSlice';

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Carregar dados do usuário do localStorage ao inicializar a aplicação
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return null; // Este componente não renderiza nada
}

export default AuthInitializer;