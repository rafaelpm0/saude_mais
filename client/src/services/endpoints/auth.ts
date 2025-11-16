import { api } from '../api';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  tipo: number;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nome: string;
    tipo: number;
    nomeTipo: string;
  };
}

export interface RegisterResponse {
  message: string;
  id: number;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation } = authApi;