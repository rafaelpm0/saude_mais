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
    const ultimoDia = new Date(ano, mes, 0).getDate();

    for (let dia = 1; dia <= ultimoDia; dia++) {
      // Criar data local sem problemas de timezone
      const data = new Date(ano, mes - 1, dia);
      const diaSemana = data.getDay(); // JavaScript: 0=Dom, 1=Seg, 2=Ter, etc.
      
      if (diasSemanaDisponiveis.includes(diaSemana)) {
        diasHabilitados.push(dia);
      }
    }

    return diasHabilitados;
  }

  // Calcular horários disponíveis para uma data específica
  async calcularHorariosDisponiveis(dto: HorariosDisponiveisDto): Promise<HorarioSlotDto[]> {
    const { idMedico, idEspecialidade, data } = dto;

    // Validar se a data não é no passado
    const partesData = data.split('-');
    const dataConsulta = new Date(parseInt(partesData[0]), parseInt(partesData[1]) - 1, parseInt(partesData[2]));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataConsulta < hoje) {
      return []; // Retornar lista vazia para datas no passado
    }

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
    const diaSemana = dataConsulta.getDay(); // JavaScript: 0=Dom, 1=Seg, 2=Ter, etc.

    // Buscar disponibilidade do médico para este dia da semana
    const disponibilidade = await this.prisma.dispMedico.findFirst({
      where: {
        idUsuario: idMedico,
        diaSemana: diaSemana
      }
    });

    if (!disponibilidade) {
      return [];
    }

    // Buscar agendas existentes para esta data
    // Criar datas em UTC para corresponder ao formato salvo no banco
    const ano = dataConsulta.getFullYear();
    const mes = dataConsulta.getMonth();
    const dia = dataConsulta.getDate();
    
    const inicioData = new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
    const fimData = new Date(Date.UTC(ano, mes, dia, 23, 59, 59, 999));

    console.log(`Buscando agendas para médico ${idMedico} entre ${inicioData} e ${fimData}`);

    const agendasExistentes = await this.prisma.agenda.findMany({
      where: {
        idMedico: idMedico,
        dtaInicial: {
          gte: inicioData,
          lte: fimData
        },
        status: {
          in: ['A', 'R'] // Agendas ativas e reservadas pelo médico
        }
      },
      orderBy: { dtaInicial: 'asc' }
    });

    console.log(`Encontradas ${agendasExistentes.length} agendas:`, agendasExistentes.map(a => ({
      id: a.id,
      dtaInicial: a.dtaInicial,
      dtaFinal: a.dtaFinal,
      status: a.status
    })));

    // Gerar slots disponíveis
    const agora = new Date();
    const slots = this.gerarSlotsDisponiveis(
      disponibilidade.horaInicio,
      disponibilidade.horaFim,
      tempoConsulta,
      agendasExistentes,
      dataConsulta,
      agora
    );

    return slots;
  }

  private gerarSlotsDisponiveis(
    horaInicio: string,
    horaFim: string,
    tempoConsulta: number,
    agendasExistentes: any[],
    dataConsulta: Date,
    agora: Date
  ): HorarioSlotDto[] {
    const slots: HorarioSlotDto[] = [];
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFimNum, minFim] = horaFim.split(':').map(Number);

    let inicioMinutos = horaIni * 60 + minIni;
    const fimMinutos = horaFimNum * 60 + minFim;

    // Se for hoje, verificar se o horário já passou
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const isHoje = dataConsulta.getTime() === hoje.getTime();
    
    if (isHoje) {
      const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
      // Adicionar margem de 30 minutos para agendamento
      const margemMinutos = horaAtualMinutos + 30;
      
      if (margemMinutos > inicioMinutos) {
        inicioMinutos = margemMinutos;
      }
    }

    // Converter agendas para minutos para facilitar cálculos
    // Usar UTC para extrair horas/minutos pois as datas estão salvas em UTC
    const agendamentosMinutos = agendasExistentes.map(agenda => {
      const inicioMin = agenda.dtaInicial.getUTCHours() * 60 + agenda.dtaInicial.getUTCMinutes();
      const fimMin = agenda.dtaFinal.getUTCHours() * 60 + agenda.dtaFinal.getUTCMinutes();
      console.log(`Agenda bloqueada: ${agenda.dtaInicial.toISOString()} (UTC ${agenda.dtaInicial.getUTCHours()}:${agenda.dtaInicial.getUTCMinutes()}) -> ${inicioMin}-${fimMin} minutos`);
      return {
        inicio: inicioMin,
        fim: fimMin,
        status: agenda.status
      };
    });

    console.log(`Total de agendas bloqueando: ${agendamentosMinutos.length}`);

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
        // Pular para o próximo slot após o conflito
        const proximoLivre = agendamentosMinutos
          .filter(a => a.fim > minutoAtual)
          .sort((a, b) => a.fim - b.fim)[0];

        if (proximoLivre && proximoLivre.fim > minutoAtual) {
          minutoAtual = proximoLivre.fim;
        } else {
          minutoAtual += tempoConsulta;
        }
        continue; // NÃO adiciona o slot ocupado à lista
      }

      // Slot disponível - adiciona apenas se NÃO tem conflito
      slots.push({
        hora: horaFormatada,
        disponivel: true
      });

      minutoAtual += tempoConsulta;
    }

    console.log(`Gerados ${slots.length} slots disponíveis:`, slots.map(s => s.hora));

    return slots;
  }

  // Criar nova consulta
  async criarConsulta(dto: CreateConsultaDto, idCliente: number): Promise<ConsultaResponseDto> {
    const { idMedico, idEspecialidade, idConvenio, dataHora, observacao } = dto;

    // Validar se a data não é no passado
    // Parse como UTC para manter consistência
    const dataConsulta = new Date(dataHora + (dataHora.endsWith('Z') ? '' : 'Z'));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataConsulta < hoje) {
      throw new BadRequestException('A data da consulta não pode ser no passado');
    }

    // Verificar se o paciente já possui 2 consultas pendentes (considerando apenas consultas futuras)
    const consultasPendentes = await this.prisma.consulta.count({
      where: {
        agenda: {
          idCliente: idCliente,
          dtaInicial: {
            gte: hoje
          }
        },
        status: 'A' // Status ativo (pendente)
      }
    });

    if (consultasPendentes >= 2) {
      throw new BadRequestException('Limite máximo de 2 consultas pendentes atingido. Finalize ou cancele uma consulta antes de agendar outra.');
    }

    // Verificar se o paciente não está bloqueado por faltas consecutivas
    const paciente = await this.prisma.usuario.findUnique({
      where: { id: idCliente },
      select: { faltasConsecutivas: true, nome: true }
    });

    if (paciente && paciente.faltasConsecutivas >= 3) {
      throw new BadRequestException(`Paciente ${paciente.nome} está bloqueado por ter 3 ou mais faltas consecutivas. Entre em contato com a administração.`);
    }

    // Verificar se a especialidade existe
    const especialidade = await this.prisma.especialidade.findUnique({
      where: { id: idEspecialidade }
    });

    if (!especialidade) {
      throw new BadRequestException('Especialidade não encontrada');
    }

    // Verificar se o convênio existe
    const convenio = await this.prisma.convenio.findUnique({
      where: { id: idConvenio }
    });

    if (!convenio) {
      throw new BadRequestException('Convênio não encontrado');
    }

    // Verificar se o médico existe e está ativo
    const medico = await this.prisma.usuario.findFirst({
      where: {
        id: idMedico,
        tipo: 2 // Deve ser médico
      }
    });

    if (!medico) {
      throw new BadRequestException('Médico não encontrado ou inativo');
    }

    // Verificar se o cliente/paciente existe e não está bloqueado
    const cliente = await this.prisma.usuario.findFirst({
      where: {
        id: idCliente,
        tipo: 1 // Deve ser paciente
      }
    });

    if (!cliente) {
      throw new BadRequestException('Paciente não encontrado');
    }

    // Verificação adicional de bloqueio (dupla validação por segurança)
    if (cliente.faltasConsecutivas >= 3) {
      throw new BadRequestException(`Paciente está bloqueado por ${cliente.faltasConsecutivas} faltas consecutivas. Entre em contato com a administração.`);
    }

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

    const dataFinal = new Date(dataConsulta.getTime() + usuarioMedico.tempoConsulta * 60000);

    // Verificar conflitos de horário - checar se há sobreposição de horários
    const conflito = await this.prisma.agenda.findFirst({
      where: {
        idMedico: idMedico,
        status: 'A', // Apenas agendas ativas
        OR: [
          {
            // Novo agendamento começa antes do existente terminar
            // E novo agendamento termina depois do existente começar
            AND: [
              {
                dtaInicial: {
                  lt: dataFinal
                }
              },
              {
                dtaFinal: {
                  gt: dataConsulta
                }
              }
            ]
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

    // Retornar consulta criada (buscar consulta completa)
    return await this.getConsultaById(resultado.consulta.id, idCliente, 1); // Passar dados do paciente
  }

  // Buscar consulta por ID
  async getConsultaById(id: number, idUsuario?: number, tipoUsuario?: number): Promise<ConsultaResponseDto> {
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

    // Validar acesso baseado no tipo de usuário
    if (idUsuario && tipoUsuario) {
      if (tipoUsuario === 1) { // Paciente
        if (consulta.agenda.idCliente !== idUsuario) {
          throw new BadRequestException('Você só pode visualizar suas próprias consultas');
        }
      } else if (tipoUsuario === 2) { // Médico
        if (consulta.agenda.idMedico !== idUsuario) {
          throw new BadRequestException('Você só pode visualizar consultas onde é o médico responsável');
        }
      }
      // Administradores (tipo 3) podem ver qualquer consulta
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

  // Método auxiliar para buscar consultas com especialidades de forma otimizada
  private async buscarConsultasComEspecialidades(
    consultas: any[]
  ): Promise<ConsultaResponseDto[]> {
    // Criar mapa de especialidades por médico e convênio para evitar consultas duplicadas
    const especialidadesMap = new Map<string, any>();
    
    // Buscar todas as especialidades de uma só vez
    const combinacoesMedicoConvenio = consultas.map(c => ({
      medico: c.agenda.idMedico,
      convenio: c.idConvenio
    }));
    
    // Remover duplicatas
    const combinacoesUnicas = combinacoesMedicoConvenio.filter((combo, index, arr) => 
      arr.findIndex(c => c.medico === combo.medico && c.convenio === combo.convenio) === index
    );
    
    // Buscar especialidades para todas as combinações únicas
    const usuariosMedicos = await this.prisma.usuarioMedico.findMany({
      where: {
        OR: combinacoesUnicas.map(combo => ({
          idUsuario: combo.medico,
          idConvenio: combo.convenio
        }))
      },
      include: {
        especialidade: true
      }
    });
    
    // Criar mapa para acesso rápido
    usuariosMedicos.forEach(um => {
      const chave = `${um.idUsuario}-${um.idConvenio}`;
      especialidadesMap.set(chave, um.especialidade);
    });
    
    // Mapear consultas com especialidades
    return consultas.map(consulta => {
      const chaveEspecialidade = `${consulta.agenda.idMedico}-${consulta.idConvenio}`;
      const especialidade = especialidadesMap.get(chaveEspecialidade);
      
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
        especialidade: especialidade ? {
          id: especialidade.id,
          descricao: especialidade.descricao
        } : undefined,
        observacao: consulta.observacao,
        status: consulta.status
      };
    });
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

    return this.buscarConsultasComEspecialidades(consultas);
  }

  // Cancelar consulta
  async cancelarConsulta(id: number, idUsuario: number, tipoUsuario?: number): Promise<void> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar se o usuário pode cancelar
    // Pacientes só podem cancelar suas próprias consultas
    // Administradores podem cancelar qualquer consulta
    if (tipoUsuario === 1 || !tipoUsuario) { // Paciente ou não especificado (padrão paciente)
      if (consulta.agenda.idCliente !== idUsuario) {
        throw new BadRequestException('Você só pode cancelar suas próprias consultas');
      }
    } else if (tipoUsuario === 3) {
      // Administrador pode cancelar qualquer consulta (sem restrição adicional)
    } else {
      throw new BadRequestException('Você não tem permissão para cancelar consultas');
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
  async atualizarConsulta(id: number, dto: UpdateConsultaDto, idUsuario: number, tipoUsuario?: number): Promise<ConsultaResponseDto> {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Verificar se o usuário pode editar
    // Pacientes só podem editar suas próprias consultas
    // Administradores podem editar qualquer consulta
    if (tipoUsuario === 1 || !tipoUsuario) { // Paciente ou não especificado (padrão paciente)
      if (consulta.agenda.idCliente !== idUsuario) {
        throw new BadRequestException('Você só pode editar suas próprias consultas');
      }
    } else if (tipoUsuario === 3) {
      // Administrador pode editar qualquer consulta (sem restrição adicional)
    } else {
      throw new BadRequestException('Você não tem permissão para editar consultas');
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

        // Se o status foi alterado para 'F' (finalizado/atendido), resetar faltas consecutivas
        if (dto.status === 'F') {
          await prisma.usuario.update({
            where: { id: consulta.agenda.idCliente },
            data: { faltasConsecutivas: 0 }
          });
        }
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

  /**
   * Processa consultas vencidas e marca como falta ('N')
   * Este método deve ser chamado periodicamente ou antes de consultar dados
   */
  async processarConsultasVencidas(): Promise<void> {
    const agora = new Date();
    
    // Buscar consultas com status 'A' que já passaram da data/hora (excluindo bloqueios 'R')
    const consultasVencidas = await this.prisma.consulta.findMany({
      where: {
        status: 'A',
        agenda: {
          dtaFinal: {
            lt: agora
          }
        }
      },
      include: {
        agenda: {
          include: {
            cliente: true
          }
        }
      }
    });

    if (consultasVencidas.length > 0) {
      // Atualizar consultas e agendas vencidas para status 'N' (não compareceu)
      await this.prisma.$transaction(async (prisma) => {
        // Atualizar consultas
        await prisma.consulta.updateMany({
          where: {
            id: {
              in: consultasVencidas.map(c => c.id)
            }
          },
          data: {
            status: 'N'
          }
        });

        // Atualizar agendas
        await prisma.agenda.updateMany({
          where: {
            id: {
              in: consultasVencidas.map(c => c.idAgenda)
            }
          },
          data: {
            status: 'N'
          }
        });

        // Incrementar faltas consecutivas dos pacientes
        const pacientesComFalta = new Map<number, number>();
        
        // Contar quantas faltas cada paciente teve
        consultasVencidas.forEach(consulta => {
          const pacienteId = consulta.agenda.cliente.id;
          const faltasAtuais = pacientesComFalta.get(pacienteId) || 0;
          pacientesComFalta.set(pacienteId, faltasAtuais + 1);
        });

        // Incrementar faltas para cada paciente
        for (const [pacienteId, quantidadeFaltas] of pacientesComFalta.entries()) {
          await prisma.usuario.update({
            where: { id: pacienteId },
            data: {
              faltasConsecutivas: {
                increment: quantidadeFaltas
              }
            }
          });
        }
      });

      console.log(`Processadas ${consultasVencidas.length} consultas vencidas como faltas`);
    }
  }

  /**
   * Buscar consultas do paciente com processamento de consultas vencidas
   */
  async getConsultasPacienteComProcessamento(idPaciente: number): Promise<ConsultaResponseDto[]> {
    // Retornar consultas (processamento automático já acontece via task service)
    return this.getConsultasPaciente(idPaciente);
  }



  /**
   * Atualizar status da consulta (usado por médicos e administradores)
   */
  async atualizarStatusConsulta(
    consultaId: number, 
    novoStatus: 'A' | 'F' | 'C' | 'N' | 'R', 
    idUsuario: number,
    tipoUsuario: number
  ): Promise<ConsultaResponseDto> {
    // Verificar se o usuário tem permissão (médico ou admin)
    if (tipoUsuario !== 2 && tipoUsuario !== 3) {
      throw new BadRequestException('Apenas médicos e administradores podem alterar o status da consulta');
    }

    const consulta = await this.prisma.consulta.findUnique({
      where: { id: consultaId },
      include: { agenda: true }
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // Se for médico, verificar se é o médico da consulta
    if (tipoUsuario === 2 && consulta.agenda.idMedico !== idUsuario) {
      throw new BadRequestException('Você só pode alterar o status de suas próprias consultas');
    }

    // Validações específicas por status
    if (novoStatus === 'F') {
      // Finalizar consulta: deve estar no passado ou presente
      const agora = new Date();
      if (consulta.agenda.dtaInicial > agora) {
        throw new BadRequestException('Não é possível finalizar uma consulta futura');
      }
    }

    // Atualizar status em transação
    await this.prisma.$transaction(async (prisma) => {
      await prisma.consulta.update({
        where: { id: consultaId },
        data: { status: novoStatus }
      });

      await prisma.agenda.update({
        where: { id: consulta.agenda.id },
        data: { status: novoStatus }
      });

      // Se finalizada, resetar faltas consecutivas do paciente
      if (novoStatus === 'F') {
        await prisma.usuario.update({
          where: { id: consulta.agenda.idCliente },
          data: { faltasConsecutivas: 0 }
        });
      }

      // Se marcada como falta (N), incrementar faltas consecutivas
      if (novoStatus === 'N') {
        await prisma.usuario.update({
          where: { id: consulta.agenda.idCliente },
          data: {
            faltasConsecutivas: {
              increment: 1
            }
          }
        });
      }
    });

    return await this.getConsultaById(consultaId);
  }

  /**
   * Buscar consultas de um médico específico
   */
  async getConsultasMedico(idMedico: number): Promise<ConsultaResponseDto[]> {
    const consultas = await this.prisma.consulta.findMany({
      where: {
        agenda: {
          idMedico: idMedico
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

    return this.buscarConsultasComEspecialidades(consultas);
  }
}