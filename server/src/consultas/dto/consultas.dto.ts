import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConsultaDto {
  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @IsInt()
  @IsNotEmpty()
  idEspecialidade: number;

  @IsInt()
  @IsNotEmpty()
  idConvenio: number;

  @IsDateString()
  @IsNotEmpty()
  dataHora: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}

export class UpdateConsultaDto {
  @IsDateString()
  @IsOptional()
  dataHora?: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class HorariosDisponiveisDto {
  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @IsInt()
  @IsNotEmpty()
  idEspecialidade: number;

  @IsDateString()
  @IsNotEmpty()
  data: string;
}

export class ConsultaResponseDto {
  id: number;
  agenda: {
    id: number;
    dtaInicial: Date;
    dtaFinal: Date;
    status: string;
    medico: {
      id: number;
      nome: string;
      crm: string;
    };
    cliente: {
      id: number;
      nome: string;
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
  observacao?: string;
  status: string;
}

export class HorarioSlotDto {
  hora: string;
  disponivel: boolean;
  ocupadoPor?: string;
}

export class EspecialidadeDto {
  id: number;
  descricao: string;
}

export class MedicoDto {
  id: number;
  nome: string;
  crm: string;
  especialidades: {
    id: number;
    descricao: string;
    tempoConsulta: number;
  }[];
}

export class ConvenioDto {
  id: number;
  nome: string;
}