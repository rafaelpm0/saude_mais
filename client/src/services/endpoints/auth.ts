import { api } from '../api';

export interface LoginRequest {
  login: string;
  senha: string;
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

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;