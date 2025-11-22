import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsOptional, 
  IsDateString, 
  Matches,
  IsIn,
  Min,
  Max
} from 'class-validator';

/**
 * DTO para filtrar agenda do médico por período
 */
export class AgendaMedicoQueryDto {
  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @IsDateString()
  @IsNotEmpty()
  dataFim: string;
}

/**
 * DTO para criar consulta manualmente pelo médico
 */
export class CriarConsultaMedicoDto {
  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @IsInt()
  @IsNotEmpty()
  idEspecialidade: number;

  @IsInt()
  @IsNotEmpty()
  idConvenio: number;

  @IsDateString()
  @IsNotEmpty()
  dataHoraInicio: string;

  @IsDateString()
  @IsNotEmpty()
  dataHoraFim: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}

/**
 * DTO para criar bloqueio de horário
 */
export class CriarBloqueioDto {
  @IsDateString()
  @IsNotEmpty()
  dataHoraInicio: string;

  @IsDateString()
  @IsNotEmpty()
  dataHoraFim: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}

/**
 * DTO para atualizar consulta (observação e status)
 */
export class AtualizarConsultaMedicoDto {
  @IsString()
  @IsOptional()
  observacao?: string;

  @IsString()
  @IsOptional()
  @IsIn(['F', 'N', 'C'])
  status?: 'F' | 'N' | 'C';
}

/**
 * DTO para disponibilidade do médico
 */
export class DisponibilidadeDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Hora de início deve estar no formato HH:MM (ex: 08:00)'
  })
  horaInicio: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Hora de fim deve estar no formato HH:MM (ex: 17:00)'
  })
  horaFim: string;
}

/**
 * DTO para atualizar múltiplas disponibilidades
 */
export class AtualizarDisponibilidadeDto {
  @IsNotEmpty()
  disponibilidades: DisponibilidadeDto[];
}

/**
 * DTO de resposta para consulta com dados completos
 */
export interface ConsultaMedicoResponseDto {
  id: number;
  observacao?: string;
  status: string;
  agenda: {
    id: number;
    dtaInicial: Date;
    dtaFinal: Date;
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
  tipo?: 'consulta' | 'bloqueio'; // Para diferenciar no frontend
}

/**
 * DTO de resposta para histórico de consultas do paciente
 */
export interface HistoricoPacienteDto {
  consultas: {
    id: number;
    dtaInicial: Date;
    dtaFinal: Date;
    status: string;
    observacao?: string;
    convenio: string;
    especialidade?: string;
  }[];
  totalConsultas: number;
  totalFinalizadas: number;
  totalFaltas: number;
}
