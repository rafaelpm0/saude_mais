import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await prisma.consulta.deleteMany();
    await prisma.agenda.deleteMany();
    await prisma.usuarioMedico.deleteMany();
    await prisma.dispMedico.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.especialidade.deleteMany();
    await prisma.convenio.deleteMany();
    console.log('🗑️ Dados existentes removidos');

    // Hash da senha padrão "12345678" para todos os usuários
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // 1. Criar Especialidades
    const especialidades = await Promise.all([
      prisma.especialidade.create({
        data: { id: 1, descricao: 'Clínica Geral' }
      }),
      prisma.especialidade.create({
        data: { id: 2, descricao: 'Cardiologia' }
      }),
      prisma.especialidade.create({
        data: { id: 3, descricao: 'Dermatologia' }
      }),
      prisma.especialidade.create({
        data: { id: 4, descricao: 'Pediatria' }
      }),
      prisma.especialidade.create({
        data: { id: 5, descricao: 'Ortopedia' }
      })
    ]);

    // 2. Criar Convênios
    const convenios = await Promise.all([
      prisma.convenio.create({
        data: { id: 1, nome: 'SUS' }
      }),
      prisma.convenio.create({
        data: { id: 2, nome: 'Unimed' }
      }),
      prisma.convenio.create({
        data: { id: 3, nome: 'Bradesco Saúde' }
      }),
      prisma.convenio.create({
        data: { id: 4, nome: 'Amil' }
      }),
      prisma.convenio.create({
        data: { id: 5, nome: 'Particular' }
      })
    ]);

    // 3. Criar Usuários
    const paciente1 = await prisma.usuario.create({
      data: {
        login: 'paciente@teste.com',
        senha: hashedPassword,
        tipo: 1, // Paciente
        crm: null,
        faltasConsecutivas: 0,
        cpf: '11111111111',
        nome: 'João Silva',
        telefone: '11999999999',
        email: 'paciente@teste.com',
      },
    });

    const paciente2 = await prisma.usuario.create({
      data: {
        login: 'maria.paciente@teste.com',
        senha: hashedPassword,
        tipo: 1,
        crm: null,
        faltasConsecutivas: 0,
        cpf: '44444444444',
        nome: 'Maria Oliveira',
        telefone: '11888888888',
        email: 'maria.paciente@teste.com',
      },
    });

    const medico1 = await prisma.usuario.create({
      data: {
        login: 'medico@teste.com',
        senha: hashedPassword,
        tipo: 2, // Médico
        crm: 'CRM12345',
        faltasConsecutivas: 0,
        cpf: '22222222222',
        nome: 'Dra. Ana Santos',
        telefone: '11777777777',
        email: 'medico@teste.com',
      },
    });

    const medico2 = await prisma.usuario.create({
      data: {
        login: 'carlos.medico@teste.com',
        senha: hashedPassword,
        tipo: 2,
        crm: 'CRM54321',
        faltasConsecutivas: 0,
        cpf: '55555555555',
        nome: 'Dr. Carlos Pereira',
        telefone: '11666666666',
        email: 'carlos.medico@teste.com',
      },
    });

    const admin = await prisma.usuario.create({
      data: {
        login: 'admin@teste.com',
        senha: hashedPassword,
        tipo: 3, // Administrador
        crm: null,
        faltasConsecutivas: 0,
        cpf: '33333333333',
        nome: 'Carlos Oliveira',
        telefone: '11555555555',
        email: 'admin@teste.com',
      },
    });

    // 4. Criar UsuarioMedico (Especialidades + Convênios + Tempo de Consulta)
    await Promise.all([
      // Dra. Ana Santos - Clínica Geral
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico1.id,
          idEspecialidade: 1, // Clínica Geral
          idConvenio: 1, // SUS
          tempoConsulta: 30 // 30 minutos
        }
      }),
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico1.id,
          idEspecialidade: 1, // Clínica Geral
          idConvenio: 2, // Unimed
          tempoConsulta: 30
        }
      }),
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico1.id,
          idEspecialidade: 1, // Clínica Geral
          idConvenio: 5, // Particular
          tempoConsulta: 45 // Particular tem mais tempo
        }
      }),
      // Dra. Ana Santos - Cardiologia
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico1.id,
          idEspecialidade: 2, // Cardiologia
          idConvenio: 2, // Unimed
          tempoConsulta: 60 // Cardiologia precisa de mais tempo
        }
      }),
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico1.id,
          idEspecialidade: 2, // Cardiologia
          idConvenio: 5, // Particular
          tempoConsulta: 60
        }
      }),
      // Dr. Carlos Pereira - Pediatria
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico2.id,
          idEspecialidade: 4, // Pediatria
          idConvenio: 1, // SUS
          tempoConsulta: 45
        }
      }),
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico2.id,
          idEspecialidade: 4, // Pediatria
          idConvenio: 3, // Bradesco
          tempoConsulta: 45
        }
      }),
      // Dr. Carlos Pereira - Ortopedia
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico2.id,
          idEspecialidade: 5, // Ortopedia
          idConvenio: 3, // Bradesco
          tempoConsulta: 60
        }
      }),
      prisma.usuarioMedico.create({
        data: {
          idUsuario: medico2.id,
          idEspecialidade: 5, // Ortopedia
          idConvenio: 4, // Amil
          tempoConsulta: 60
        }
      })
    ]);

    // 5. Criar Disponibilidades dos Médicos
    await Promise.all([
      // Dra. Ana Santos - Segunda a Sexta, 8h às 17h
      prisma.dispMedico.create({
        data: {
          idUsuario: medico1.id,
          diaSemana: 1, // Segunda
          horaInicio: '08:00',
          horaFim: '17:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico1.id,
          diaSemana: 2, // Terça
          horaInicio: '08:00',
          horaFim: '17:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico1.id,
          diaSemana: 3, // Quarta
          horaInicio: '08:00',
          horaFim: '17:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico1.id,
          diaSemana: 4, // Quinta
          horaInicio: '08:00',
          horaFim: '17:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico1.id,
          diaSemana: 5, // Sexta
          horaInicio: '08:00',
          horaFim: '12:00'
        }
      }),
      // Dr. Carlos Pereira - Terça, Quinta e Sábado
      prisma.dispMedico.create({
        data: {
          idUsuario: medico2.id,
          diaSemana: 2, // Terça
          horaInicio: '14:00',
          horaFim: '18:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico2.id,
          diaSemana: 4, // Quinta
          horaInicio: '14:00',
          horaFim: '18:00'
        }
      }),
      prisma.dispMedico.create({
        data: {
          idUsuario: medico2.id,
          diaSemana: 6, // Sábado
          horaInicio: '08:00',
          horaFim: '12:00'
        }
      })
    ]);

    // 6. Criar Agendas e Consultas de exemplo com diferentes status e datas
    
    // Consulta futura (amanhã) - Ativa
    const dataAmanha = new Date();
    dataAmanha.setDate(dataAmanha.getDate() + 1);
    dataAmanha.setHours(9, 0, 0, 0);

    const agenda1 = await prisma.agenda.create({
      data: {
        idMedico: medico1.id,
        idCliente: paciente1.id,
        dtaInicial: dataAmanha,
        dtaFinal: new Date(dataAmanha.getTime() + 30 * 60000), // +30 minutos
        status: 'A' // Ativo
      }
    });

    // Consulta futura (próxima semana) - Ativa
    const dataProximaSemana = new Date();
    dataProximaSemana.setDate(dataProximaSemana.getDate() + 7);
    dataProximaSemana.setHours(14, 0, 0, 0);

    const agenda2 = await prisma.agenda.create({
      data: {
        idMedico: medico2.id,
        idCliente: paciente2.id,
        dtaInicial: dataProximaSemana,
        dtaFinal: new Date(dataProximaSemana.getTime() + 45 * 60000), // +45 minutos
        status: 'A'
      }
    });

    // Consulta no passado - Deve ser marcada como falta (N) pelo processamento automático
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 2); // 2 dias atrás
    dataPassada.setHours(10, 0, 0, 0);

    const agenda3 = await prisma.agenda.create({
      data: {
        idMedico: medico1.id,
        idCliente: paciente1.id,
        dtaInicial: dataPassada,
        dtaFinal: new Date(dataPassada.getTime() + 30 * 60000),
        status: 'A' // Será alterado para 'N' pelo processamento
      }
    });

    // Consulta finalizada (ontem)
    const dataOntem = new Date();
    dataOntem.setDate(dataOntem.getDate() - 1);
    dataOntem.setHours(15, 0, 0, 0);

    const agenda4 = await prisma.agenda.create({
      data: {
        idMedico: medico2.id,
        idCliente: paciente2.id,
        dtaInicial: dataOntem,
        dtaFinal: new Date(dataOntem.getTime() + 45 * 60000),
        status: 'F' // Finalizada
      }
    });

    // Consulta cancelada
    const dataCancelada = new Date();
    dataCancelada.setDate(dataCancelada.getDate() + 3);
    dataCancelada.setHours(11, 0, 0, 0);

    const agenda5 = await prisma.agenda.create({
      data: {
        idMedico: medico1.id,
        idCliente: paciente1.id,
        dtaInicial: dataCancelada,
        dtaFinal: new Date(dataCancelada.getTime() + 60 * 60000), // Cardiologia = 60min
        status: 'C' // Cancelada
      }
    });

    // Criar consultas correspondentes
    await Promise.all([
      // Consulta ativa futura
      prisma.consulta.create({
        data: {
          idAgenda: agenda1.id,
          idConvenio: 1, // SUS
          observacao: 'Consulta de rotina - check-up geral',
          status: 'A'
        }
      }),
      // Consulta ativa futura
      prisma.consulta.create({
        data: {
          idAgenda: agenda2.id,
          idConvenio: 1, // SUS
          observacao: 'Consulta pediátrica - acompanhamento do crescimento',
          status: 'A'
        }
      }),
      // Consulta que será marcada como falta
      prisma.consulta.create({
        data: {
          idAgenda: agenda3.id,
          idConvenio: 2, // Unimed
          observacao: 'Consulta de clínica geral - não compareceu',
          status: 'A' // Será alterado para 'N'
        }
      }),
      // Consulta finalizada
      prisma.consulta.create({
        data: {
          idAgenda: agenda4.id,
          idConvenio: 3, // Bradesco
          observacao: 'Consulta pediátrica realizada com sucesso',
          status: 'F'
        }
      }),
      // Consulta cancelada
      prisma.consulta.create({
        data: {
          idAgenda: agenda5.id,
          idConvenio: 2, // Unimed
          observacao: 'Consulta de cardiologia - cancelada pelo paciente',
          status: 'C'
        }
      })
    ]);

    console.log('✅ Seed executado com sucesso!');
    console.log('\n📊 Dados criados:');
    console.log(`📋 ${especialidades.length} Especialidades`);
    console.log(`🏥 ${convenios.length} Convênios`);
    console.log(`👤 2 Pacientes, 2 Médicos, 1 Admin`);
    console.log(`👨‍⚕️ 9 Combinações Médico+Especialidade+Convênio`);
    console.log(`📅 8 Disponibilidades configuradas`);
    console.log(`📝 5 Consultas com diferentes status criadas`);
    
    console.log('\n👨‍⚕️ Médicos e suas especialidades:');
    console.log('• Dra. Ana Santos (CRM12345):');
    console.log('  - Clínica Geral: SUS (30min), Unimed (30min), Particular (45min)');
    console.log('  - Cardiologia: Unimed (60min), Particular (60min)');
    console.log('  - Disponível: Seg-Sex 8h-17h (Sex até 12h)');
    console.log('• Dr. Carlos Pereira (CRM54321):');
    console.log('  - Pediatria: SUS (45min), Bradesco (45min)');
    console.log('  - Ortopedia: Bradesco (60min), Amil (60min)');
    console.log('  - Disponível: Ter-Qui 14h-18h, Sáb 8h-12h');

    console.log('\n📝 Consultas criadas para teste:');
    console.log('• 2 Consultas futuras ativas (amanhã e próxima semana)');
    console.log('• 1 Consulta no passado (será marcada como falta automaticamente)');
    console.log('• 1 Consulta finalizada (ontem)');
    console.log('• 1 Consulta cancelada');

    console.log('\n📋 Credenciais para teste:');
    console.log('Pacientes:');
    console.log('• paciente@teste.com ou CPF: 11111111111 (João Silva)');
    console.log('• maria.paciente@teste.com ou CPF: 44444444444 (Maria Oliveira)');
    console.log('Médicos:');
    console.log('• medico@teste.com ou CPF: 22222222222 (Dra. Ana Santos)');
    console.log('• carlos.medico@teste.com ou CPF: 55555555555 (Dr. Carlos Pereira)');
    console.log('Admin:');
    console.log('• admin@teste.com ou CPF: 33333333333 (Carlos Oliveira)');
    console.log('Senha: 12345678 (para todos os usuários)');
    
    console.log('\n⚠️  Nota: A consulta no passado será automaticamente marcada como falta (N)');
    console.log('quando o sistema processar consultas vencidas na próxima inicialização.');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seed();