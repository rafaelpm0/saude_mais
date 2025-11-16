import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateConsultaDto, 
  UpdateConsultaDto, 
  HorariosDisponiveisDto,
  ConsultaResponseDto,
  HorarioSlotDto,
  EspecialidadeDto,
  MedicoDto,
  ConvenioDto
} from './dto/consultas.dto';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}

  // Buscar todas as especialidades
  async getEspecialidades(): Promise<EspecialidadeDto[]> {
    return await this.prisma.especialidade.findMany({
      orderBy: { descricao: 'asc' }
    });
  }

  // Buscar médicos por especialidade
  async getMedicosByEspecialidade(especialidadeId: number): Promise<MedicoDto[]> {
    const usuariosMedicos = await this.prisma.usuarioMedico.findMany({
      where: { idEspecialidade: especialidadeId },
      include: {
        medico: true,
        especialidade: true
      }
    });

    const medicosMap = new Map<number, MedicoDto>();

    usuariosMedicos.forEach(um => {
      if (!medicosMap.has(um.medico.id)) {
        medicosMap.set(um.medico.id, {
          id: um.medico.id,
          nome: um.medico.nome,
          crm: um.medico.crm,
          especialidades: []
        });
      }

      const medico = medicosMap.get(um.medico.id);
      medico.especialidades.push({
        id: um.especialidade.id,
        descricao: um.especialidade.descricao,
        tempoConsulta: um.tempoConsulta
      });
    });

    return Array.from(medicosMap.values());
  }

  // Buscar convênios por médico e especialidade
  async getConveniosByMedicoEspecialidade(medicoId: number, especialidadeId: number): Promise<ConvenioDto[]> {
    const usuariosMedicos = await this.prisma.usuarioMedico.findMany({
      where: { 
        idUsuario: medicoId,
        idEspecialidade: especialidadeId
      },
      include: {
        convenio: true
      }
    });

    return usuariosMedicos.map(um => ({
      id: um.convenio.id,
      nome: um.convenio.nome
    }));
  }

  // Buscar dias habilitados para um médico em um mês
  async getDiasHabilitados(medicoId: number, ano: number, mes: number): Promise<number[]> {
    // Buscar disponibilidades do médico
    const disponibilidades = await this.prisma.dispMedico.findMany({
      where: { idUsuario: medicoId }
    });

    if (disponibilidades.length === 0) {
      return [];
    }

    const diasSemanaDisponiveis = disponibilidades.map(d => d.diaSemana);
    const diasHabilitados: number[] = [];

    // Calcular todos os dias do mês que correspondem aos dias da semana disponíveis
    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(ano, mes - 1, dia);
      const diaSemana = data.getDay(); // Usar 0-6 como no banco
      
      if (diasSemanaDisponiveis.includes(diaSemana)) {
        diasHabilitados.push(dia);
      }
    }

    return diasHabilitados;
  }

  // Calcular horários disponíveis para uma data específica
  async calcularHorariosDisponiveis(dto: HorariosDisponiveisDto): Promise<HorarioSlotDto[]> {
    const { idMedico, idEspecialidade, data } = dto;

    // Buscar tempo de consulta para esta especialidade
    const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
      where: {
        idUsuario: idMedico,
        idEspecialidade: idEspecialidade
      }
    });

    if (!usuarioMedico) {
      throw new BadRequestException('Médico não atende esta especialidade');
    }

    const tempoConsulta = usuarioMedico.tempoConsulta;
    const dataConsulta = new Date(data);
    const diaSemana = dataConsulta.getDay(); // Usar 0-6 como no banco

    // Buscar disponibilidade do médico para este dia da semana
    const disponibilidade = await this.prisma.dispMedico.findUnique({
      where: {
        idUsuario_diaSemana: {
          idUsuario: idMedico,
          diaSemana: diaSemana
        }
      }
    });

    if (!disponibilidade) {
      return [];
    }

    // Buscar agendas existentes para esta data
    const inicioData = new Date(dataConsulta);
    inicioData.setHours(0, 0, 0, 0);
    const fimData = new Date(dataConsulta);
    fimData.setHours(23, 59, 59, 999);

    const agendasExistentes = await this.prisma.agenda.findMany({
      where: {
        idMedico: idMedico,
        dtaInicial: {
          gte: inicioData,
          lte: fimData
        },
        status: 'A' // Apenas agendas ativas
      },
      orderBy: { dtaInicial: 'asc' }
    });

    // Gerar slots disponíveis
    const slots = this.gerarSlotsDisponiveis(
      disponibilidade.horaInicio,
      disponibilidade.horaFim,
      tempoConsulta,
      agendasExistentes,
      dataConsulta
    );

    return slots;
  }

  private gerarSlotsDisponiveis(
    horaInicio: string,
    horaFim: string,
    tempoConsulta: number,
    agendasExistentes: any[],
    dataConsulta: Date
  ): HorarioSlotDto[] {
    const slots: HorarioSlotDto[] = [];
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFimNum, minFim] = horaFim.split(':').map(Number);

    const inicioMinutos = horaIni * 60 + minIni;
    const fimMinutos = horaFimNum * 60 + minFim;

    // Converter agendas para minutos para facilitar cálculos
    const agendamentosMinutos = agendasExistentes.map(agenda => ({
      inicio: agenda.dtaInicial.getHours() * 60 + agenda.dtaInicial.getMinutes(),
      fim: agenda.dtaFinal.getHours() * 60 + agenda.dtaFinal.getMinutes(),
      paciente: 'Ocupado' // Poderia buscar o nome do paciente se necessário
    }));

    // Algoritmo de preenchimento sequencial
    let minutoAtual = inicioMinutos;

    while (minutoAtual + tempoConsulta <= fimMinutos) {
      const horaSlot = Math.floor(minutoAtual / 60);
      const minutoSlot = minutoAtual % 60;
      const horaFormatada = `${horaSlot.toString().padStart(2, '0')}:${minutoSlot.toString().padStart(2, '0')}`;

      // Verificar se há conflito com agendamentos existentes
      const temConflito = agendamentosMinutos.some(agendamento => {
        return (minutoAtual < agendamento.fim && minutoAtual + tempoConsulta > agendamento.inicio);
      });

      if (temConflito) {
        // Encontrar o próximo horário livre após o conflito
        const proximoLivre = agendamentosMinutos
          .filter(a => a.inicio >= minutoAtual)
          .sort((a, b) => a.inicio - b.inicio)[0];

        if (proximoLivre) {
          minutoAtual = proximoLivre.fim;
        } else {
          minutoAtual += tempoConsulta;
        }
        continue;
      }

      // Slot disponível
      slots.push({
        hora: horaFormatada,
        disponivel: true
      });

      minutoAtual += tempoConsulta;
    }

    return slots;
  }

  // Criar nova consulta
  async criarConsulta(dto: CreateConsultaDto, idCliente: number): Promise<ConsultaResponseDto> {
    const { idMedico, idEspecialidade, idConvenio, dataHora, observacao } = dto;

    // Verificar se o médico atende esta especialidade/convênio
    const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
      where: {
        idUsuario: idMedico,
        idEspecialidade: idEspecialidade,
        idConvenio: idConvenio
      }
    });

    if (!usuarioMedico) {
      throw new BadRequestException('Médico não atende esta especialidade/convênio');
    }

    const dataConsulta = new Date(dataHora);
    const dataFinal = new Date(dataConsulta.getTime() + usuarioMedico.tempoConsulta * 60000);

    // Verificar conflitos de horário
    const conflito = await this.prisma.agenda.findFirst({
      where: {
        idMedico: idMedico,
        status: 'A',
        OR: [
          {
            dtaInicial: {
              lt: dataFinal
            },
            dtaFinal: {
              gt: dataConsulta
            }
          }
        ]
      }
    });

    if (conflito) {
      throw new BadRequestException('Horário indisponível - conflito com outro agendamento');
    }

    // Criar agenda e consulta em transação
    const resultado = await this.prisma.$transaction(async (prisma) => {
      const agenda = await prisma.agenda.create({
        data: {
          idMedico,
          idCliente,
          dtaInicial: dataConsulta,
          dtaFinal: dataFinal,
          status: 'A'
        }
      });

      const consulta = await prisma.consulta.create({
        data: {
          idAgenda: agenda.id,
          idConvenio,
          observacao,
          status: 'A'
        }
      });

      return { agenda, consulta };
    });

    // Buscar consulta completa para retorno
    return await this.getConsultaById(resultado.consulta.id);
  }

  // Buscar consulta por ID
  async getConsultaById(id: number): Promise<ConsultaResponseDto> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: {
        agenda: {
          include: {
            medico: true,
            cliente: true
          }
        },
        convenio: true
      }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Buscar a especialidade da consulta através do UsuarioMedico
    const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
      where: {
        idUsuario: consulta.agenda.idMedico,
        idConvenio: consulta.idConvenio
      },
      include: {
        especialidade: true
      }
    });

    return {
      id: consulta.id,
      agenda: {
        id: consulta.agenda.id,
        dtaInicial: consulta.agenda.dtaInicial,
        dtaFinal: consulta.agenda.dtaFinal,
        status: consulta.agenda.status,
        medico: {
          id: consulta.agenda.medico.id,
          nome: consulta.agenda.medico.nome,
          crm: consulta.agenda.medico.crm
        },
        cliente: {
          id: consulta.agenda.cliente.id,
          nome: consulta.agenda.cliente.nome
        }
      },
      convenio: {
        id: consulta.convenio.id,
        nome: consulta.convenio.nome
      },
      especialidade: usuarioMedico ? {
        id: usuarioMedico.especialidade.id,
        descricao: usuarioMedico.especialidade.descricao
      } : undefined,
      observacao: consulta.observacao,
      status: consulta.status
    };
  }

  // Buscar consultas do paciente
  async getConsultasPaciente(idPaciente: number): Promise<ConsultaResponseDto[]> {
    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          idCliente: idPaciente
        }
      },
      include: {
        agenda: {
          include: {
            medico: true,
            cliente: true
          }
        },
        convenio: true
      },
      orderBy: {
        agenda: {
          dtaInicial: 'desc'
        }
      }
    });

    // Buscar especialidades para cada consulta
    const consultasComEspecialidades = await Promise.all(
      consultas.map(async (consulta) => {
        const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
          where: {
            idUsuario: consulta.agenda.idMedico,
            idConvenio: consulta.idConvenio
          },
          include: {
            especialidade: true
          }
        });

        return {
          id: consulta.id,
          agenda: {
            id: consulta.agenda.id,
            dtaInicial: consulta.agenda.dtaInicial,
            dtaFinal: consulta.agenda.dtaFinal,
            status: consulta.agenda.status,
            medico: {
              id: consulta.agenda.medico.id,
              nome: consulta.agenda.medico.nome,
              crm: consulta.agenda.medico.crm
            },
            cliente: {
              id: consulta.agenda.cliente.id,
              nome: consulta.agenda.cliente.nome
            }
          },
          convenio: {
            id: consulta.convenio.id,
            nome: consulta.convenio.nome
          },
          especialidade: usuarioMedico ? {
            id: usuarioMedico.especialidade.id,
            descricao: usuarioMedico.especialidade.descricao
          } : undefined,
          observacao: consulta.observacao,
          status: consulta.status
        };
      })
    );

    return consultasComEspecialidades;
  }

  // Cancelar consulta
  async cancelarConsulta(id: number, idUsuario: number): Promise<void> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar se o usuário pode cancelar (é o paciente da consulta)
    if (consulta.agenda.idCliente !== idUsuario) {
      throw new BadRequestException('Você não pode cancelar esta consulta');
    }

    // Verificar antecedência mínima de 24 horas
    const agora = new Date();
    const horasAntecedencia = (consulta.agenda.dtaInicial.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (horasAntecedencia < 24) {
      throw new BadRequestException('Cancelamento deve ser feito com pelo menos 24 horas de antecedência');
    }

    // Atualizar status em ambas as tabelas (sincronização manual)
    await this.prisma.$transaction(async (prisma) => {
      await prisma.consulta.update({
        where: { id },
        data: { status: 'C' }
      });

      await prisma.agenda.update({
        where: { id: consulta.agenda.id },
        data: { status: 'C' }
      });
    });
  }

  // Atualizar consulta
  async atualizarConsulta(id: number, dto: UpdateConsultaDto, idUsuario: number): Promise<ConsultaResponseDto> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar se o usuário pode editar
    if (consulta.agenda.idCliente !== idUsuario) {
      throw new BadRequestException('Você não pode editar esta consulta');
    }

    // Se está alterando data/hora, verificar antecedência
    if (dto.dataHora) {
      const agora = new Date();
      const horasAntecedencia = (consulta.agenda.dtaInicial.getTime() - agora.getTime()) / (1000 * 60 * 60);

      if (horasAntecedencia < 24) {
        throw new BadRequestException('Alteração deve ser feita com pelo menos 24 horas de antecedência');
      }
    }

    // Atualizar consulta e agenda
    await this.prisma.$transaction(async (prisma) => {
      if (dto.observacao !== undefined) {
        await prisma.consulta.update({
          where: { id },
          data: { observacao: dto.observacao }
        });
      }

      if (dto.status) {
        await prisma.consulta.update({
          where: { id },
          data: { status: dto.status }
        });

        await prisma.agenda.update({
          where: { id: consulta.agenda.id },
          data: { status: dto.status }
        });
      }

      if (dto.dataHora) {
        const novaData = new Date(dto.dataHora);
        // Buscar tempo de consulta (assumindo que não mudou)
        const usuarioMedico = await prisma.usuarioMedico.findFirst({
          where: { idUsuario: consulta.agenda.idMedico }
        });
        
        const novaDataFinal = new Date(novaData.getTime() + (usuarioMedico?.tempoConsulta || 30) * 60000);

        await prisma.agenda.update({
          where: { id: consulta.agenda.id },
          data: {
            dtaInicial: novaData,
            dtaFinal: novaDataFinal
          }
        });
      }
    });

    return await this.getConsultaById(id);
  }
}