import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      
      // Incluir token de autenticação se disponível
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Item'], // Adicione aqui os tipos de cache do seu projeto
  endpoints: () => ({}),
})