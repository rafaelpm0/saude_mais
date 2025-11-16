import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateEspecialidadeDto,
  UpdateEspecialidadeDto,
  EspecialidadeResponseDto,
  CreateConvenioDto,
  UpdateConvenioDto,
  ConvenioResponseDto,
  CreateMedicoDto,
  UpdateMedicoDto,
  MedicoResponseDto
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ========== ESPECIALIDADES ==========
  
  /**
   * Buscar todas as especialidades
   */
  async getEspecialidades(): Promise<EspecialidadeResponseDto[]> {
    const especialidades = await this.prisma.especialidade.findMany({
      orderBy: { descricao: 'asc' }
    });
    
    return especialidades;
  }

  /**
   * Criar nova especialidade
   */
  async createEspecialidade(dto: CreateEspecialidadeDto): Promise<EspecialidadeResponseDto> {
    try {
      const especialidade = await this.prisma.especialidade.create({
        data: {
          descricao: dto.descricao
        }
      });

      return especialidade;
    } catch (error) {
      throw new BadRequestException('Erro ao criar especialidade');
    }
  }

  /**
   * Atualizar especialidade
   */
  async updateEspecialidade(id: number, dto: UpdateEspecialidadeDto): Promise<EspecialidadeResponseDto> {
    try {
      const especialidade = await this.prisma.especialidade.update({
        where: { id },
        data: {
          descricao: dto.descricao
        }
      });

      return especialidade;
    } catch (error) {
      throw new NotFoundException('Especialidade não encontrada');
    }
  }

  /**
   * Deletar especialidade
   */
  async deleteEspecialidade(id: number): Promise<void> {
    // Primeiro verificar se a especialidade existe
    const especialidade = await this.prisma.especialidade.findUnique({
      where: { id }
    });

    if (!especialidade) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    // Verificar se há médicos associados
    const medicosAssociados = await this.prisma.usuarioMedico.count({
      where: { idEspecialidade: id }
    });

    if (medicosAssociados > 0) {
      throw new BadRequestException('Não é possível excluir esta especialidade pois há médicos cadastrados com ela.');
    }

    try {
      await this.prisma.especialidade.delete({
        where: { id }
      });
    } catch (error) {
      throw new BadRequestException('Erro interno ao excluir especialidade');
    }
  }

  // ========== CONVÊNIOS ==========

  /**
   * Buscar todos os convênios
   */
  async getConvenios(): Promise<ConvenioResponseDto[]> {
    const convenios = await this.prisma.convenio.findMany({
      orderBy: { nome: 'asc' }
    });
    
    return convenios;
  }

  /**
   * Criar novo convênio
   */
  async createConvenio(dto: CreateConvenioDto): Promise<ConvenioResponseDto> {
    try {
      const convenio = await this.prisma.convenio.create({
        data: {
          nome: dto.nome
        }
      });

      return convenio;
    } catch (error) {
      throw new BadRequestException('Erro ao criar convênio');
    }
  }

  /**
   * Atualizar convênio
   */
  async updateConvenio(id: number, dto: UpdateConvenioDto): Promise<ConvenioResponseDto> {
    try {
      const convenio = await this.prisma.convenio.update({
        where: { id },
        data: {
          nome: dto.nome
        }
      });

      return convenio;
    } catch (error) {
      throw new NotFoundException('Convênio não encontrado');
    }
  }

  /**
   * Deletar convênio
   */
  async deleteConvenio(id: number): Promise<void> {
    // Primeiro verificar se o convênio existe
    const convenio = await this.prisma.convenio.findUnique({
      where: { id }
    });

    if (!convenio) {
      throw new NotFoundException('Convênio não encontrado');
    }

    // Verificar se há médicos associados
    const medicosAssociados = await this.prisma.usuarioMedico.count({
      where: { idConvenio: id }
    });

    if (medicosAssociados > 0) {
      throw new BadRequestException('Não é possível excluir este convênio pois há médicos cadastrados com ele.');
    }

    // Verificar se há consultas associadas
    const consultasAssociadas = await this.prisma.consulta.count({
      where: { idConvenio: id }
    });

    if (consultasAssociadas > 0) {
      throw new BadRequestException('Não é possível excluir este convênio pois há consultas registradas com ele.');
    }

    try {
      await this.prisma.convenio.delete({
        where: { id }
      });
    } catch (error) {
      throw new BadRequestException('Erro interno ao excluir convênio');
    }
  }

  // ========== MÉDICOS ==========

  /**
   * Buscar todos os médicos com suas especialidades e convênios
   */
  async getMedicos(): Promise<MedicoResponseDto[]> {
    const medicos = await this.prisma.usuario.findMany({
      where: { tipo: 2 }, // Apenas médicos
      include: {
        medicoEspecialidades: {
          include: {
            especialidade: true,
            convenio: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return medicos.map(medico => ({
      id: medico.id,
      nome: medico.nome,
      cpf: medico.cpf,
      email: medico.email,
      telefone: medico.telefone,
      login: medico.login,
      crm: medico.crm || '',
      especialidades: medico.medicoEspecialidades.map(me => ({
        especialidade: {
          id: me.especialidade.id,
          descricao: me.especialidade.descricao
        },
        convenio: {
          id: me.convenio.id,
          nome: me.convenio.nome
        },
        tempoConsulta: me.tempoConsulta
      }))
    }));
  }

  /**
   * Buscar médico por ID com relacionamentos
   */
  async getMedicoById(id: number): Promise<MedicoResponseDto> {
    const medico = await this.prisma.usuario.findUnique({
      where: { id, tipo: 2 },
      include: {
        medicoEspecialidades: {
          include: {
            especialidade: true,
            convenio: true
          }
        }
      }
    });

    if (!medico) {
      throw new NotFoundException('Médico não encontrado');
    }

    return {
      id: medico.id,
      nome: medico.nome,
      cpf: medico.cpf,
      email: medico.email,
      telefone: medico.telefone,
      login: medico.login,
      crm: medico.crm || '',
      especialidades: medico.medicoEspecialidades.map(me => ({
        especialidade: {
          id: me.especialidade.id,
          descricao: me.especialidade.descricao
        },
        convenio: {
          id: me.convenio.id,
          nome: me.convenio.nome
        },
        tempoConsulta: me.tempoConsulta
      }))
    };
  }

  /**
   * Criar novo médico
   */
  async createMedico(dto: CreateMedicoDto): Promise<MedicoResponseDto> {
    // Validar se pelo menos uma especialidade foi fornecida
    if (!dto.especialidades || dto.especialidades.length === 0) {
      throw new BadRequestException('Médico deve ter pelo menos uma especialidade');
    }

    // Validar se cada especialidade tem pelo menos um convênio
    for (const esp of dto.especialidades) {
      if (!esp.convenioIds || esp.convenioIds.length === 0) {
        throw new BadRequestException('Cada especialidade deve ter pelo menos um convênio');
      }
    }

    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(dto.senha, 10);

      // Usar transação para criar médico e relacionamentos
      const result = await this.prisma.$transaction(async (prisma) => {
        // Criar usuário médico
        const medico = await prisma.usuario.create({
          data: {
            nome: dto.nome,
            cpf: dto.cpf,
            email: dto.email,
            telefone: dto.telefone,
            login: dto.login,
            senha: hashedPassword,
            crm: dto.crm,
            tipo: 2, // Médico
            faltasConsecutivas: 0
          }
        });

        // Criar relacionamentos UsuarioMedico
        const relacionamentos = [];
        for (const esp of dto.especialidades) {
          for (const convenioId of esp.convenioIds) {
            relacionamentos.push({
              idUsuario: medico.id,
              idEspecialidade: esp.especialidadeId,
              idConvenio: convenioId,
              tempoConsulta: esp.tempoConsulta
            });
          }
        }

        await prisma.usuarioMedico.createMany({
          data: relacionamentos
        });

        return medico;
      });

      // Buscar o médico criado com relacionamentos
      return await this.getMedicoById(result.id);
    } catch (error) {
      throw new BadRequestException('Erro ao criar médico');
    }
  }

  /**
   * Atualizar médico
   */
  async updateMedico(id: number, dto: UpdateMedicoDto): Promise<MedicoResponseDto> {
    // Validar se pelo menos uma especialidade foi fornecida
    if (!dto.especialidades || dto.especialidades.length === 0) {
      throw new BadRequestException('Médico deve ter pelo menos uma especialidade');
    }

    // Validar se cada especialidade tem pelo menos um convênio
    for (const esp of dto.especialidades) {
      if (!esp.convenioIds || esp.convenioIds.length === 0) {
        throw new BadRequestException('Cada especialidade deve ter pelo menos um convênio');
      }
    }

    try {
      // Usar transação para atualizar médico e relacionamentos
      const result = await this.prisma.$transaction(async (prisma) => {
        // Dados para atualização
        const updateData: any = {
          nome: dto.nome,
          cpf: dto.cpf,
          email: dto.email,
          telefone: dto.telefone,
          login: dto.login,
          crm: dto.crm
        };

        // Atualizar senha apenas se fornecida
        if (dto.senha) {
          updateData.senha = await bcrypt.hash(dto.senha, 10);
        }

        // Atualizar usuário médico
        const medico = await prisma.usuario.update({
          where: { id, tipo: 2 },
          data: updateData
        });

        // Deletar todos os relacionamentos existentes
        await prisma.usuarioMedico.deleteMany({
          where: { idUsuario: id }
        });

        // Criar novos relacionamentos
        const relacionamentos = [];
        for (const esp of dto.especialidades) {
          for (const convenioId of esp.convenioIds) {
            relacionamentos.push({
              idUsuario: medico.id,
              idEspecialidade: esp.especialidadeId,
              idConvenio: convenioId,
              tempoConsulta: esp.tempoConsulta
            });
          }
        }

        await prisma.usuarioMedico.createMany({
          data: relacionamentos
        });

        return medico;
      });

      // Buscar o médico atualizado com relacionamentos
      return await this.getMedicoById(result.id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Médico não encontrado');
      }
      throw new BadRequestException('Erro ao atualizar médico');
    }
  }

  /**
   * Deletar médico
   */
  async deleteMedico(id: number): Promise<void> {
    // Primeiro verificar se o médico existe
    const medico = await this.prisma.usuario.findUnique({
      where: { id, tipo: 2 }
    });

    if (!medico) {
      throw new NotFoundException('Médico não encontrado');
    }

    // Verificar se há agendamentos/consultas associados
    const agendamentos = await this.prisma.agenda.count({
      where: { idMedico: id }
    });

    if (agendamentos > 0) {
      throw new BadRequestException('Não é possível excluir este médico pois há consultas agendadas ou histórico de atendimentos associados.');
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        // Deletar relacionamentos primeiro
        await prisma.usuarioMedico.deleteMany({
          where: { idUsuario: id }
        });

        // Deletar médico
        await prisma.usuario.delete({
          where: { id, tipo: 2 }
        });
      });
    } catch (error) {
      throw new BadRequestException('Erro interno ao excluir médico');
    }
  }

  async getUsuarios() {
    const usuarios = await this.prisma.usuario.findMany({
      where: { tipo: { in: [1, 2] } },
      select: {
        id: true, nome: true, cpf: true, email: true, telefone: true,
        tipo: true, faltasConsecutivas: true
      },
      orderBy: { nome: 'asc' }
    });
    return usuarios.map(u => ({
      ...u,
      tipoDescricao: u.tipo === 1 ? 'Paciente' : 'Médico',
      status: u.faltasConsecutivas >= 3 ? 'Bloqueado' : 'Normal'
    }));
  }

  async resetarFaltasUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    if (usuario.tipo === 3) throw new BadRequestException('Não é possível resetar faltas de administradores');
    return await this.prisma.usuario.update({
      where: { id },
      data: { faltasConsecutivas: 0 }
    });
  }
}