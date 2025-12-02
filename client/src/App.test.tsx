import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './app/authSlice';
import { api } from './services/api';

// Criar store mock
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
};

describe('App Component', () => {
  it('deve renderizar sem erros', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Verificar se o app renderizou
    expect(document.body).toBeDefined();
  });

  it('deve renderizar página de welcome quando não autenticado', () => {
    const store = createMockStore({
      auth: {
        token: null,
        user: null,
      },
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Verificar se está na página welcome
    const welcomeElements = screen.queryAllByText(/bem-vindo|clínica|saúde/i);
    expect(welcomeElements.length).toBeGreaterThan(0);
  });
});
