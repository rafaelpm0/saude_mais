import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AgendaMedicoQueryDto,
  CriarConsultaMedicoDto,
  CriarBloqueioDto,
  AtualizarConsultaMedicoDto,
  DisponibilidadeDto,
  AtualizarDisponibilidadeDto,
  ConsultaMedicoResponseDto,
  HistoricoPacienteDto
} from './dto/medico.dto';

@Injectable()
export class MedicoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Buscar agenda do médico filtrada por período
   */
  async getAgendaMedico(
    idMedico: number,
    query: AgendaMedicoQueryDto
  ): Promise<ConsultaMedicoResponseDto[]> {
    // Criar datas com horário explícito para evitar problemas de timezone
    const dataInicio = new Date(query.dataInicio + 'T00:00:00.000Z');
    const dataFim = new Date(query.dataFim + 'T23:59:59.999Z');

    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          idMedico: idMedico,
          dtaInicial: {
            gte: dataInicio,
            lte: dataFim
          },
          status: {
            in: ['A', 'R', 'F', 'N'] // Incluir ativos, bloqueios, finalizados e faltas
          }
        }
      },
      include: {
        agenda: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                telefone: true,
                email: true,
                faltasConsecutivas: true
              }
            }
          }
        },
        convenio: true
      },
      orderBy: {
        agenda: {
          dtaInicial: 'asc'
        }
      }
    });

    // Buscar especialidades para cada consulta
    const consultasComEspecialidades = await Promise.all(
      consultas.map(async (consulta) => {
        const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
          where: {
            idUsuario: idMedico,
            idConvenio: consulta.idConvenio
          },
          include: {
            especialidade: true
          }
        });

        return {
          id: consulta.id,
          observacao: consulta.observacao,
          status: consulta.status,
          agenda: consulta.agenda,
          convenio: consulta.convenio,
          especialidade: usuarioMedico?.especialidade,
          tipo: consulta.status === 'R' ? 'bloqueio' as const : 'consulta' as const
        };
      })
    );

    return consultasComEspecialidades;
  }

  /**
   * Verificar conflitos de horário
   */
  private async verificarConflito(
    idMedico: number,
    dataInicio: Date,
    dataFim: Date,
    idAgendaExcluir?: number
  ): Promise<boolean> {
    const conflito = await this.prisma.agenda.findFirst({
      where: {
        idMedico: idMedico,
        id: idAgendaExcluir ? { not: idAgendaExcluir } : undefined,
        status: {
          in: ['A', 'R'] // Verificar apenas consultas ativas e bloqueios
        },
        OR: [
          {
            AND: [
              { dtaInicial: { lte: dataInicio } },
              { dtaFinal: { gt: dataInicio } }
            ]
          },
          {
            AND: [
              { dtaInicial: { lt: dataFim } },
              { dtaFinal: { gte: dataFim } }
            ]
          },
          {
            AND: [
              { dtaInicial: { gte: dataInicio } },
              { dtaFinal: { lte: dataFim } }
            ]
          }
        ]
      }
    });

    return conflito !== null;
  }

  /**
   * Criar consulta manualmente
   */
  async criarConsulta(
    idMedico: number,
    dto: CriarConsultaMedicoDto
  ): Promise<ConsultaMedicoResponseDto> {
    const dataInicio = new Date(dto.dataHoraInicio);
    const dataFim = new Date(dto.dataHoraFim);

    // Validações básicas
    if (dataInicio >= dataFim) {
      throw new BadRequestException('Data/hora de início deve ser anterior à data/hora de fim');
    }

    if (dataInicio < new Date()) {
      throw new BadRequestException('Não é possível criar consulta no passado');
    }

    // Verificar se o paciente existe e é realmente um paciente
    const paciente = await this.prisma.usuario.findUnique({
      where: { id: dto.idPaciente }
    });

    if (!paciente || paciente.tipo !== 1) {
      throw new BadRequestException('Paciente não encontrado ou inválido');
    }

    // Verificar se o paciente está bloqueado
    if (paciente.faltasConsecutivas >= 3) {
      throw new BadRequestException('Paciente bloqueado por faltas consecutivas');
    }

    // Verificar conflito de horário
    const temConflito = await this.verificarConflito(idMedico, dataInicio, dataFim);
    if (temConflito) {
      throw new BadRequestException('Conflito de horário com outra consulta ou bloqueio');
    }

    // Verificar se o médico atende a especialidade com o convênio
    const usuarioMedico = await this.prisma.usuarioMedico.findUnique({
      where: {
        idUsuario_idEspecialidade_idConvenio: {
          idUsuario: idMedico,
          idEspecialidade: dto.idEspecialidade,
          idConvenio: dto.idConvenio
        }
      },
      include: {
        especialidade: true
      }
    });

    if (!usuarioMedico) {
      throw new BadRequestException('Médico não atende essa combinação de especialidade e convênio');
    }

    // Criar agenda e consulta em transação
    const resultado = await this.prisma.$transaction(async (prisma) => {
      const agenda = await prisma.agenda.create({
        data: {
          idMedico: idMedico,
          idCliente: dto.idPaciente,
          dtaInicial: dataInicio,
          dtaFinal: dataFim,
          status: 'A'
        }
      });

      const consulta = await prisma.consulta.create({
        data: {
          idAgenda: agenda.id,
          idConvenio: dto.idConvenio,
          observacao: dto.observacao,
          status: 'A'
        },
        include: {
          agenda: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nome: true,
                  cpf: true,
                  telefone: true,
                  email: true,
                  faltasConsecutivas: true
                }
              }
            }
          },
          convenio: true
        }
      });

      return consulta;
    });

    return {
      id: resultado.id,
      observacao: resultado.observacao,
      status: resultado.status,
      agenda: resultado.agenda,
      convenio: resultado.convenio,
      especialidade: usuarioMedico.especialidade,
      tipo: 'consulta'
    };
  }

  /**
   * Criar bloqueio de horário
   */
  async criarBloqueio(
    idMedico: number,
    dto: CriarBloqueioDto
  ): Promise<ConsultaMedicoResponseDto> {
    const dataInicio = new Date(dto.dataHoraInicio);
    const dataFim = new Date(dto.dataHoraFim);

    // Validações básicas
    if (dataInicio >= dataFim) {
      throw new BadRequestException('Data/hora de início deve ser anterior à data/hora de fim');
    }

    if (dataInicio < new Date()) {
      throw new BadRequestException('Não é possível criar bloqueio no passado');
    }

    // Verificar conflito de horário
    const temConflito = await this.verificarConflito(idMedico, dataInicio, dataFim);
    if (temConflito) {
      throw new BadRequestException('Conflito de horário com outra consulta ou bloqueio');
    }

    // Buscar um convênio qualquer do médico para satisfazer a FK
    const convenioMedico = await this.prisma.usuarioMedico.findFirst({
      where: { idUsuario: idMedico }
    });

    if (!convenioMedico) {
      throw new BadRequestException('Médico sem convênios cadastrados');
    }

    // Criar bloqueio (agenda + consulta com status 'R' e idCliente = idMedico)
    const resultado = await this.prisma.$transaction(async (prisma) => {
      const agenda = await prisma.agenda.create({
        data: {
          idMedico: idMedico,
          idCliente: idMedico, // Bloqueio: cliente é o próprio médico
          dtaInicial: dataInicio,
          dtaFinal: dataFim,
          status: 'R'
        }
      });

      const consulta = await prisma.consulta.create({
        data: {
          idAgenda: agenda.id,
          idConvenio: convenioMedico.idConvenio,
          observacao: dto.motivo || 'Horário bloqueado',
          status: 'R'
        },
        include: {
          agenda: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nome: true,
                  cpf: true,
                  telefone: true,
                  email: true,
                  faltasConsecutivas: true
                }
              }
            }
          },
          convenio: true
        }
      });

      return consulta;
    });

    return {
      id: resultado.id,
      observacao: resultado.observacao,
      status: resultado.status,
      agenda: resultado.agenda,
      convenio: resultado.convenio,
      tipo: 'bloqueio'
    };
  }

  /**
   * Atualizar consulta (observação e/ou status)
   */
  async atualizarConsulta(
    idMedico: number,
    idConsulta: number,
    dto: AtualizarConsultaMedicoDto
  ): Promise<ConsultaMedicoResponseDto> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id: idConsulta },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar se é consulta do médico
    if (consulta.agenda.idMedico !== idMedico) {
      throw new BadRequestException('Você só pode atualizar suas próprias consultas');
    }

    // Não permitir atualização de bloqueios para status finalizado/falta
    if (consulta.status === 'R' && dto.status && dto.status !== 'C') {
      throw new BadRequestException('Bloqueios só podem ser cancelados');
    }

    // Validações específicas por status
    if (dto.status === 'F' || dto.status === 'N') {
      const agora = new Date();
      if (consulta.agenda.dtaInicial > agora) {
        throw new BadRequestException('Não é possível finalizar/marcar falta em consulta futura');
      }
    }

    // Atualizar em transação
    await this.prisma.$transaction(async (prisma) => {
      // Atualizar consulta
      await prisma.consulta.update({
        where: { id: idConsulta },
        data: {
          observacao: dto.observacao !== undefined ? dto.observacao : consulta.observacao,
          status: dto.status || consulta.status
        }
      });

      // Atualizar agenda se houver mudança de status
      if (dto.status) {
        await prisma.agenda.update({
          where: { id: consulta.agenda.id },
          data: { status: dto.status }
        });

        // Se finalizada (F), resetar faltas do paciente
        if (dto.status === 'F') {
          await prisma.usuario.update({
            where: { id: consulta.agenda.idCliente },
            data: { faltasConsecutivas: 0 }
          });
        }

        // Se marcada como falta (N), incrementar faltas
        if (dto.status === 'N') {
          await prisma.usuario.update({
            where: { id: consulta.agenda.idCliente },
            data: {
              faltasConsecutivas: {
                increment: 1
              }
            }
          });
        }
      }
    });

    // Buscar consulta atualizada
    const consultaAtualizada = await this.prisma.consulta.findUnique({
      where: { id: idConsulta },
      include: {
        agenda: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                telefone: true,
                email: true,
                faltasConsecutivas: true
              }
            }
          }
        },
        convenio: true
      }
    });

    // Buscar especialidade
    const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
      where: {
        idUsuario: idMedico,
        idConvenio: consultaAtualizada.idConvenio
      },
      include: {
        especialidade: true
      }
    });

    return {
      id: consultaAtualizada.id,
      observacao: consultaAtualizada.observacao,
      status: consultaAtualizada.status,
      agenda: consultaAtualizada.agenda,
      convenio: consultaAtualizada.convenio,
      especialidade: usuarioMedico?.especialidade,
      tipo: consultaAtualizada.status === 'R' ? 'bloqueio' : 'consulta'
    };
  }

  /**
   * Buscar histórico de consultas de um paciente
   */
  async getHistoricoPaciente(
    idMedico: number,
    idPaciente: number
  ): Promise<HistoricoPacienteDto> {
    // Buscar todas as consultas do paciente com o médico
    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          idMedico: idMedico,
          idCliente: idPaciente,
          status: {
            in: ['F', 'N', 'C'] // Apenas consultas finalizadas, faltas e canceladas
          }
        }
      },
      include: {
        agenda: true,
        convenio: true
      },
      orderBy: {
        agenda: {
          dtaInicial: 'desc'
        }
      }
    });

    // Buscar especialidades
    const consultasComEspecialidades = await Promise.all(
      consultas.map(async (consulta) => {
        const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
          where: {
            idUsuario: idMedico,
            idConvenio: consulta.idConvenio
          },
          include: {
            especialidade: true
          }
        });

        return {
          id: consulta.id,
          dtaInicial: consulta.agenda.dtaInicial,
          dtaFinal: consulta.agenda.dtaFinal,
          status: consulta.status,
          observacao: consulta.observacao,
          convenio: consulta.convenio.nome,
          especialidade: usuarioMedico?.especialidade.descricao
        };
      })
    );

    const totalFinalizadas = consultas.filter(c => c.status === 'F').length;
    const totalFaltas = consultas.filter(c => c.status === 'N').length;

    return {
      consultas: consultasComEspecialidades,
      totalConsultas: consultas.length,
      totalFinalizadas,
      totalFaltas
    };
  }

  /**
   * Buscar disponibilidade do médico
   */
  async getDisponibilidade(idMedico: number): Promise<DisponibilidadeDto[]> {
    const disponibilidades = await this.prisma.dispMedico.findMany({
      where: { idUsuario: idMedico },
      orderBy: { diaSemana: 'asc' }
    });

    return disponibilidades.map(d => ({
      diaSemana: d.diaSemana,
      horaInicio: d.horaInicio,
      horaFim: d.horaFim
    }));
  }

  /**
   * Atualizar disponibilidade do médico
   */
  async atualizarDisponibilidade(
    idMedico: number,
    dto: AtualizarDisponibilidadeDto
  ): Promise<DisponibilidadeDto[]> {
    // Validar horários
    for (const disp of dto.disponibilidades) {
      if (disp.horaInicio >= disp.horaFim) {
        throw new BadRequestException(
          `Horário inválido para ${this.getNomeDia(disp.diaSemana)}: início deve ser anterior ao fim`
        );
      }

      // Verificar mínimo 1 hora
      const [horaIni, minIni] = disp.horaInicio.split(':').map(Number);
      const [horaFim, minFim] = disp.horaFim.split(':').map(Number);
      const minutosTotal = (horaFim * 60 + minFim) - (horaIni * 60 + minIni);
      
      if (minutosTotal < 60) {
        throw new BadRequestException(
          `${this.getNomeDia(disp.diaSemana)}: período mínimo de 1 hora necessário`
        );
      }
    }

    // Deletar todas as disponibilidades existentes e criar novas (upsert manual)
    await this.prisma.$transaction(async (prisma) => {
      // Deletar todas
      await prisma.dispMedico.deleteMany({
        where: { idUsuario: idMedico }
      });

      // Criar novas
      for (const disp of dto.disponibilidades) {
        await prisma.dispMedico.create({
          data: {
            idUsuario: idMedico,
            diaSemana: disp.diaSemana,
            horaInicio: disp.horaInicio,
            horaFim: disp.horaFim
          }
        });
      }
    });

    return await this.getDisponibilidade(idMedico);
  }

  /**
   * Helper para nome do dia da semana
   */
  private getNomeDia(dia: number): string {
    const nomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return nomes[dia] || 'Dia inválido';
  }

  /**
   * Buscar lista de pacientes (para select no modal)
   */
  async getPacientes(busca?: string): Promise<any[]> {
    let where: any;

    if (busca && busca.trim().length > 0) {
      const buscaTrim = busca.trim().toLowerCase(); // Converter para minúsculas
      
      // SQLite não tem suporte nativo para case-insensitive LIKE, então precisamos buscar todos
      // os pacientes e filtrar no JavaScript
      const todosPacientes = await this.prisma.usuario.findMany({
        where: { tipo: 1 },
        select: {
          id: true,
          nome: true,
          cpf: true,
          telefone: true,
          email: true,
          faltasConsecutivas: true
        },
        orderBy: { nome: 'asc' }
      });

      // Filtrar no JavaScript (case-insensitive)
      const pacientesFiltrados = todosPacientes.filter(p =>
        p.nome.toLowerCase().includes(buscaTrim) ||
        p.cpf.includes(busca.trim()) // CPF é exato
      ).slice(0, 50); // Limitar a 50 resultados

      return pacientesFiltrados;
    }

    // Sem busca, retornar apenas tipo=1 limitado
    const pacientes = await this.prisma.usuario.findMany({
      where: { tipo: 1 },
      select: {
        id: true,
        nome: true,
        cpf: true,
        telefone: true,
        email: true,
        faltasConsecutivas: true
      },
      orderBy: { nome: 'asc' },
      take: 50
    });

    return pacientes;
  }

  /**
   * Buscar convênios disponíveis para o médico
   */
  async getConvenios(idMedico: number): Promise<any[]> {
    const usuarioMedicos = await this.prisma.usuarioMedico.findMany({
      where: { idUsuario: idMedico },
      include: { convenio: true },
      distinct: ['idConvenio']
    });

    // Extrair convênios únicos
    const conveniosUnicos = usuarioMedicos
      .map(um => um.convenio)
      .filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      );

    return conveniosUnicos;
  }

  /**
   * Buscar especialidades do médico
   */
  async getEspecialidades(idMedico: number): Promise<any[]> {
    const usuarioMedicos = await this.prisma.usuarioMedico.findMany({
      where: { idUsuario: idMedico },
      include: { especialidade: true },
      distinct: ['idEspecialidade']
    });

    // Extrair especialidades únicas
    const especialidadesUnicas = usuarioMedicos
      .map(um => um.especialidade)
      .filter((esp, index, self) => 
        index === self.findIndex(e => e.id === esp.id)
      );

    return especialidadesUnicas;
  }
}
