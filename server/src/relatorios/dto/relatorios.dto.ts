import { IsDateString } from 'class-validator';

export class RelatorioQueryDto {
  @IsDateString()
  dataInicio: string;

  @IsDateString()
  dataFim: string;
}

export interface ConsultaMedicoEspecialidadeDto {
  medico: {
    id: number;
    nome: string;
    crm: string;
  };
  especialidade: {
    id: number;
    descricao: string;
  };
  convenio: {
    id: number;
    nome: string;
  };
  paciente: {
    id: number;
    nome: string;
    cpf: string;
  };
  dataConsulta: Date;
  status: string;
  statusDescricao: string;
  observacao?: string;
}

export interface EstatisticasMedicoEspecialidadeDto {
  totalGeral: number;
  porStatus: {
    ativas: number;
    finalizadas: number;
    canceladas: number;
    faltas: number;
    transferidas: number;
  };
  porMedico: {
    medicoNome: string;
    especialidade: string;
    total: number;
    finalizadas: number;
  }[];
}

export interface RelatorioConsultasMedicoEspecialidadeDto {
  estatisticas: EstatisticasMedicoEspecialidadeDto;
  consultas: ConsultaMedicoEspecialidadeDto[];
}

export interface CancelamentoRemarcacaoDto {
  totalConsultas: number;
  canceladas: number;
  transferidas: number;
  faltas: number;
  percentualCanceladas: number;
  percentualTransferidas: number;
  percentualFaltas: number;
  porMedico: {
    medicoNome: string;
    especialidade: string;
    total: number;
    canceladas: number;
    transferidas: number;
    faltas: number;
  }[];
}

export interface PacienteFrequenteDto {
  paciente: {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  };
  totalConsultas: number;
  consultasFinalizadas: number;
  especialidades: string[];
  medicos: string[];
  primeiraConsulta: Date;
  ultimaConsulta: Date;
}

export interface RelatorioPacientesFrequentesDto {
  estatisticas: {
    totalPacientes: number;
    totalConsultas: number;
    mediaConsultasPorPaciente: number;
  };
  pacientes: PacienteFrequenteDto[];
}
