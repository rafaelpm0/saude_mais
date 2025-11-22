// Adicione aqui os tipos do seu novo projeto

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== TIPOS DO MÓDULO MÉDICO ====================

/**
 * Interface para consulta com dados completos (visão do médico)
 */
export interface ConsultaMedico {
  id: number;
  observacao?: string;
  status: 'A' | 'F' | 'C' | 'N' | 'R';
  agenda: {
    id: number;
    dtaInicial: string;
    dtaFinal: string;
    status: string;
    cliente: {
      id: number;
      nome: string;
      cpf: string;
      telefone: string;
      email: string;
      faltasConsecutivas: number;
    };
  };
  convenio: {
    id: number;
    nome: string;
  };
  especialidade?: {
    id: number;
    descricao: string;
  };
  tipo?: 'consulta' | 'bloqueio';
}

/**
 * Interface para bloqueio de horário
 */
export interface BloqueioHorario {
  dataHoraInicio: string;
  dataHoraFim: string;
  motivo?: string;
}

/**
 * Interface para disponibilidade semanal do médico
 */
export interface DisponibilidadeSemanal {
  diaSemana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horaInicio: string; // Formato HH:MM
  horaFim: string; // Formato HH:MM
  habilitado?: boolean; // Para controle do UI
}

/**
 * Interface para histórico de consultas de um paciente
 */
export interface HistoricoPaciente {
  consultas: {
    id: number;
    dtaInicial: string;
    dtaFinal: string;
    status: string;
    observacao?: string;
    convenio: string;
    especialidade?: string;
  }[];
  totalConsultas: number;
  totalFinalizadas: number;
  totalFaltas: number;
}

/**
 * Interface para paciente (usado em selects)
 */
export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  faltasConsecutivas: number;
}

/**
 * Interface para criar consulta manual (médico)
 */
export interface CriarConsultaMedicoDto {
  idPaciente: number;
  idEspecialidade: number;
  idConvenio: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  observacao?: string;
}

/**
 * Interface para atualizar consulta (médico)
 */
export interface AtualizarConsultaMedicoDto {
  observacao?: string;
  status?: 'F' | 'N' | 'C';
}


