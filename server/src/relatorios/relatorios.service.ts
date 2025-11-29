import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  RelatorioConsultasMedicoEspecialidadeDto,
  ConsultaMedicoEspecialidadeDto,
  CancelamentoRemarcacaoDto,
  RelatorioPacientesFrequentesDto,
  PacienteFrequenteDto,
  EstatisticasMedicoEspecialidadeDto
} from './dto/relatorios.dto';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  // Helper para mapear status
  private getStatusDescricao(status: string): string {
    const statusMap = {
      'A': 'Ativo',
      'F': 'Finalizado',
      'C': 'Cancelado',
      'N': 'Nao Compareceu',
      'T': 'Transferido/Remarcado',
      'R': 'Reserva/Bloqueio'
    };
    return statusMap[status] || status;
  }

  // Validar período de datas
  private validarPeriodo(dataInicio: string, dataFim: string): void {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio > fim) {
      throw new BadRequestException('Data inicial nao pode ser maior que data final');
    }

    // Validar período máximo de 1 ano
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      throw new BadRequestException('Periodo nao pode ser maior que 1 ano');
    }
  }

  // Relatório 1: Consultas por Médico/Especialidade
  async gerarRelatorioConsultasMedicoEspecialidade(
    dataInicio: string,
    dataFim: string
  ): Promise<RelatorioConsultasMedicoEspecialidadeDto> {
    this.validarPeriodo(dataInicio, dataFim);

    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          dtaInicial: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim)
          }
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

    // Buscar especialidades dos médicos
    const consultasComEspecialidade: ConsultaMedicoEspecialidadeDto[] = [];
    
    for (const consulta of consultas) {
      const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
        where: {
          idUsuario: consulta.agenda.idMedico,
          idConvenio: consulta.idConvenio
        },
        include: {
          especialidade: true
        }
      });

      if (usuarioMedico) {
        consultasComEspecialidade.push({
          medico: {
            id: consulta.agenda.medico.id,
            nome: consulta.agenda.medico.nome,
            crm: consulta.agenda.medico.crm || 'N/A'
          },
          especialidade: {
            id: usuarioMedico.especialidade.id,
            descricao: usuarioMedico.especialidade.descricao
          },
          convenio: {
            id: consulta.convenio.id,
            nome: consulta.convenio.nome
          },
          paciente: {
            id: consulta.agenda.cliente.id,
            nome: consulta.agenda.cliente.nome,
            cpf: consulta.agenda.cliente.cpf
          },
          dataConsulta: consulta.agenda.dtaInicial,
          status: consulta.status,
          statusDescricao: this.getStatusDescricao(consulta.status),
          observacao: consulta.observacao
        });
      }
    }

    // Calcular estatísticas
    const estatisticas: EstatisticasMedicoEspecialidadeDto = {
      totalGeral: consultasComEspecialidade.length,
      porStatus: {
        ativas: consultasComEspecialidade.filter(c => c.status === 'A').length,
        finalizadas: consultasComEspecialidade.filter(c => c.status === 'F').length,
        canceladas: consultasComEspecialidade.filter(c => c.status === 'C').length,
        faltas: consultasComEspecialidade.filter(c => c.status === 'N').length,
        transferidas: consultasComEspecialidade.filter(c => c.status === 'T').length
      },
      porMedico: []
    };

    // Agrupar por médico
    const medicoMap = new Map<string, any>();
    consultasComEspecialidade.forEach(c => {
      const key = `${c.medico.id}-${c.especialidade.id}`;
      if (!medicoMap.has(key)) {
        medicoMap.set(key, {
          medicoNome: c.medico.nome,
          especialidade: c.especialidade.descricao,
          total: 0,
          finalizadas: 0
        });
      }
      const stats = medicoMap.get(key);
      stats.total++;
      if (c.status === 'F') stats.finalizadas++;
    });

    estatisticas.porMedico = Array.from(medicoMap.values());

    return {
      estatisticas,
      consultas: consultasComEspecialidade
    };
  }

  // Relatório 2: Cancelamentos e Remarcações
  async gerarRelatorioCancelamentosRemarcacoes(
    dataInicio: string,
    dataFim: string
  ): Promise<CancelamentoRemarcacaoDto> {
    this.validarPeriodo(dataInicio, dataFim);

    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          dtaInicial: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim)
          }
        }
      },
      include: {
        agenda: {
          include: {
            medico: true
          }
        },
        convenio: true
      }
    });

    const totalConsultas = consultas.length;
    const canceladas = consultas.filter(c => c.status === 'C').length;
    const transferidas = consultas.filter(c => c.status === 'T').length;
    const faltas = consultas.filter(c => c.status === 'N').length;

    // Calcular percentuais
    const percentualCanceladas = totalConsultas > 0 ? (canceladas / totalConsultas) * 100 : 0;
    const percentualTransferidas = totalConsultas > 0 ? (transferidas / totalConsultas) * 100 : 0;
    const percentualFaltas = totalConsultas > 0 ? (faltas / totalConsultas) * 100 : 0;

    // Agrupar por médico
    const medicoMap = new Map<number, any>();
    
    for (const consulta of consultas) {
      const medicoId = consulta.agenda.idMedico;
      
      if (!medicoMap.has(medicoId)) {
        // Buscar especialidade
        const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
          where: {
            idUsuario: medicoId,
            idConvenio: consulta.idConvenio
          },
          include: {
            especialidade: true
          }
        });

        medicoMap.set(medicoId, {
          medicoNome: consulta.agenda.medico.nome,
          especialidade: usuarioMedico?.especialidade.descricao || 'N/A',
          total: 0,
          canceladas: 0,
          transferidas: 0,
          faltas: 0
        });
      }

      const stats = medicoMap.get(medicoId);
      stats.total++;
      if (consulta.status === 'C') stats.canceladas++;
      if (consulta.status === 'T') stats.transferidas++;
      if (consulta.status === 'N') stats.faltas++;
    }

    return {
      totalConsultas,
      canceladas,
      transferidas,
      faltas,
      percentualCanceladas: parseFloat(percentualCanceladas.toFixed(2)),
      percentualTransferidas: parseFloat(percentualTransferidas.toFixed(2)),
      percentualFaltas: parseFloat(percentualFaltas.toFixed(2)),
      porMedico: Array.from(medicoMap.values())
    };
  }

  // Relatório 3: Pacientes Frequentes
  async gerarRelatorioPacientesFrequentes(
    dataInicio: string,
    dataFim: string
  ): Promise<RelatorioPacientesFrequentesDto> {
    this.validarPeriodo(dataInicio, dataFim);

    const consultas = await this.prisma.consulta.findMany({
      where: {
        status: 'F', // Apenas finalizadas
        agenda: {
          dtaInicial: {
            gte: new Date(dataInicio),
            lte: new Date(dataFim)
          }
        }
      },
      include: {
        agenda: {
          include: {
            cliente: true,
            medico: true
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

    // Agrupar por paciente
    const pacienteMap = new Map<number, any>();

    for (const consulta of consultas) {
      const pacienteId = consulta.agenda.idCliente;

      if (!pacienteMap.has(pacienteId)) {
        pacienteMap.set(pacienteId, {
          paciente: {
            id: consulta.agenda.cliente.id,
            nome: consulta.agenda.cliente.nome,
            cpf: consulta.agenda.cliente.cpf,
            email: consulta.agenda.cliente.email,
            telefone: consulta.agenda.cliente.telefone
          },
          consultas: [],
          especialidades: new Set<string>(),
          medicos: new Set<string>()
        });
      }

      const pacienteData = pacienteMap.get(pacienteId);
      pacienteData.consultas.push(consulta);

      // Buscar especialidade
      const usuarioMedico = await this.prisma.usuarioMedico.findFirst({
        where: {
          idUsuario: consulta.agenda.idMedico,
          idConvenio: consulta.idConvenio
        },
        include: {
          especialidade: true
        }
      });

      if (usuarioMedico) {
        pacienteData.especialidades.add(usuarioMedico.especialidade.descricao);
      }
      pacienteData.medicos.add(consulta.agenda.medico.nome);
    }

    // Converter para array e ordenar por número de consultas
    const pacientesFrequentes: PacienteFrequenteDto[] = Array.from(pacienteMap.values())
      .map(p => ({
        paciente: p.paciente,
        totalConsultas: p.consultas.length,
        consultasFinalizadas: p.consultas.length,
        especialidades: Array.from(p.especialidades) as string[],
        medicos: Array.from(p.medicos) as string[],
        primeiraConsulta: p.consultas[0].agenda.dtaInicial,
        ultimaConsulta: p.consultas[p.consultas.length - 1].agenda.dtaInicial
      }))
      .sort((a, b) => b.totalConsultas - a.totalConsultas);

    const totalConsultas = consultas.length;
    const totalPacientes = pacientesFrequentes.length;
    const mediaConsultasPorPaciente = totalPacientes > 0 
      ? parseFloat((totalConsultas / totalPacientes).toFixed(2))
      : 0;

    return {
      estatisticas: {
        totalPacientes,
        totalConsultas,
        mediaConsultasPorPaciente
      },
      pacientes: pacientesFrequentes
    };
  }
}
