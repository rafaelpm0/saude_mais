import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';
import authReducer from '../app/authSlice';
import { api } from '../services/api';

// Mock do router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Criar store mock
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
};

describe('Login Page', () => {
  it('deve renderizar o formulário de login', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/CPF ou Email/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Digite seu CPF ou email/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Digite sua senha/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeDefined();
  });

  it('deve mostrar erros de validação quando campos vazios', async () => {
    const store = createMockStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText(/obrigatório/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('deve ter link para cadastro', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const cadastroButton = screen.getByText(/Cadastrar como Paciente/i);
    expect(cadastroButton).toBeDefined();
  });
});
