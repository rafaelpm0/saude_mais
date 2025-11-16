import { IsString, IsNotEmpty, IsInt, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// DTO para Especialidade
export class CreateEspecialidadeDto {
  @ApiProperty({ description: 'Descrição da especialidade', example: 'Cardiologia' })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class UpdateEspecialidadeDto {
  @ApiProperty({ description: 'Descrição da especialidade', example: 'Cardiologia' })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class EspecialidadeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  descricao: string;
}

// DTO para Convênio
export class CreateConvenioDto {
  @ApiProperty({ description: 'Nome do convênio', example: 'Unimed' })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class UpdateConvenioDto {
  @ApiProperty({ description: 'Nome do convênio', example: 'Unimed' })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class ConvenioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;
}

// DTO para relacionamento Médico-Especialidade-Convênio
export class MedicoEspecialidadeDto {
  @ApiProperty({ description: 'ID da especialidade' })
  @IsInt()
  @Min(1)
  especialidadeId: number;

  @ApiProperty({ description: 'IDs dos convênios', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  convenioIds: number[];

  @ApiProperty({ description: 'Tempo da consulta em minutos', example: 30 })
  @IsInt()
  @Min(15)
  tempoConsulta: number;
}

// DTO para Médico
export class CreateMedicoDto {
  @ApiProperty({ description: 'Nome completo do médico' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ description: 'CPF do médico' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ description: 'Email do médico' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Telefone do médico' })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ description: 'Login do médico' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Senha do médico' })
  @IsString()
  @IsNotEmpty()
  senha: string;

  @ApiProperty({ description: 'CRM do médico' })
  @IsString()
  @IsNotEmpty()
  crm: string;

  @ApiProperty({ description: 'Especialidades e convênios do médico', type: [MedicoEspecialidadeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicoEspecialidadeDto)
  especialidades: MedicoEspecialidadeDto[];
}

export class UpdateMedicoDto {
  @ApiProperty({ description: 'Nome completo do médico' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ description: 'CPF do médico' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ description: 'Email do médico' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Telefone do médico' })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ description: 'Login do médico' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Senha do médico', required: false })
  @IsOptional()
  @IsString()
  senha?: string;

  @ApiProperty({ description: 'CRM do médico' })
  @IsString()
  @IsNotEmpty()
  crm: string;

  @ApiProperty({ description: 'Especialidades e convênios do médico', type: [MedicoEspecialidadeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicoEspecialidadeDto)
  especialidades: MedicoEspecialidadeDto[];
}

export class MedicoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  crm: string;

  @ApiProperty()
  especialidades: {
    especialidade: { id: number; descricao: string };
    convenio: { id: number; nome: string };
    tempoConsulta: number;
  }[];
}