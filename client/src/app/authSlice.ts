import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { isValidUser } from '../utils/userUtils';
import { cookieUtils } from '../utils/cookieUtils';

interface User {
  id: number;
  nome: string;
  tipo: number;
  nomeTipo: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: cookieUtils.get('token'),
  isAuthenticated: !!cookieUtils.get('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Usar cookies ao invés de localStorage
      cookieUtils.set('token', action.payload.token, 7); // Expira em 7 dias
      cookieUtils.set('user', JSON.stringify(action.payload.user), 7);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Remover cookies
      cookieUtils.remove('token');
      cookieUtils.remove('user');
    },
    loadUserFromCookies: (state) => {
      const token = cookieUtils.get('token');
      const userData = cookieUtils.get('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          // Verificar se o usuário tem os novos campos válidos
          if (!isValidUser(user)) {
            cookieUtils.remove('token');
            cookieUtils.remove('user');
            return;
          }
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        } catch (error) {
          // Se não conseguir fazer parse, limpar cookies
          cookieUtils.remove('token');
          cookieUtils.remove('user');
        }
      }
    },
  },
});

export const { loginSuccess, logout, loadUserFromCookies } = authSlice.actions;
export default authSlice.reducer;