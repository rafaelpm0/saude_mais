import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUserFromCookies } from '../app/authSlice';

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Carregar dados do usuário dos cookies ao inicializar a aplicação
    dispatch(loadUserFromCookies());
  }, [dispatch]);

  return null; // Este componente não renderiza nada
}

export default AuthInitializer;