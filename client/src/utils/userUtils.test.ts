import { describe, it, expect } from 'vitest';
import { getTipoNome, isValidUser } from '../utils/userUtils';

describe('userUtils', () => {
  describe('getTipoNome', () => {
    it('deve retornar "Paciente" para tipo 1', () => {
      expect(getTipoNome(1)).toBe('Paciente');
    });

    it('deve retornar "Médico(a)" para tipo 2', () => {
      expect(getTipoNome(2)).toBe('Médico(a)');
    });

    it('deve retornar "Administrador(a)" para tipo 3', () => {
      expect(getTipoNome(3)).toBe('Administrador(a)');
    });

    it('deve retornar "Usuário" para tipo inválido', () => {
      expect(getTipoNome(0)).toBe('Usuário');
      expect(getTipoNome(4)).toBe('Usuário');
      expect(getTipoNome(-1)).toBe('Usuário');
    });
  });

  describe('isValidUser', () => {
    it('deve validar usuário completo', () => {
      const user = {
        id: 1,
        nome: 'João Silva',
        tipo: 1,
        nomeTipo: 'Paciente'
      };
      expect(isValidUser(user)).toBe(true);
    });

    it('deve rejeitar usuário com campos faltando', () => {
      const userSemNome = {
        id: 1,
        tipo: 1,
        nomeTipo: 'Paciente'
      };
      expect(isValidUser(userSemNome)).toBe(false);
    });

    it('deve rejeitar usuário com tipo inválido', () => {
      const userTipoInvalido = {
        id: 1,
        nome: 'João Silva',
        tipo: 0,
        nomeTipo: 'Usuário'
      };
      expect(isValidUser(userTipoInvalido)).toBe(false);
    });

    it('deve rejeitar usuário null ou undefined', () => {
      expect(isValidUser(null)).toBeFalsy();
      expect(isValidUser(undefined)).toBeFalsy();
    });

    it('deve rejeitar objeto vazio', () => {
      expect(isValidUser({})).toBe(false);
    });
  });
});
