import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
    prepareHeaders: (headers, { getState, endpoint }) => {
      headers.set('Content-Type', 'application/json');
      
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
  tagTypes: ['User', 'Item', 'Especialidade', 'Medico', 'Convenio', 'Consulta', 'Calendario', 'Usuario'], // Adicione aqui os tipos de cache do seu projeto
  endpoints: () => ({}),
})