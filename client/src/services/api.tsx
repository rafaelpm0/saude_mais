import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/',
    prepareHeaders: (headers, { getState, endpoint }) => {
      headers.set('Content-Type', 'application/json');
      
      // Desabilitar cache completamente para aplicação de aula
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      
      // Não incluir token para rotas de autenticação (login e register)
      const authRoutes = ['login', 'register'];
      const isAuthRoute = authRoutes.some(route => endpoint?.includes(route));
      
      // Incluir token de autenticação apenas se disponível e não for rota de auth
      if (!isAuthRoute) {
        const token = (getState() as RootState).auth.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      
      return headers;
    },
  }),
  // Tags para invalidação de cache
  tagTypes: ['Usuarios', 'Medicos', 'Especialidades', 'Convenios'],
  // Desabilitar cache por padrão
  keepUnusedDataFor: 0,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
})