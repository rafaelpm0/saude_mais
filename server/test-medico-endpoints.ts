/**
 * Arquivo de teste para validar endpoints do módulo médico
 * Execute: npx ts-node test-medico-endpoints.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarBuscaPacientes() {
  console.log('\n========================================');
  console.log('TESTE 1: Busca de Pacientes');
  console.log('========================================\n');

  // Buscar todos os pacientes primeiro
  const todosPacientes = await prisma.usuario.findMany({
    where: { tipo: 1 },
    select: { id: true, nome: true, cpf: true }
  });

  console.log(`Total de pacientes no banco: ${todosPacientes.length}`);
  console.log('Lista completa:', JSON.stringify(todosPacientes, null, 2));

  // Teste 1: Buscar "Jo"
  console.log('\n--- Teste 1.1: Buscar "Jo" ---');
  const busca1 = 'Jo';
  const resultado1 = todosPacientes.filter(p =>
    p.nome.toLowerCase().includes(busca1.toLowerCase()) ||
    p.cpf.includes(busca1)
  );
  console.log(`Termo de busca: "${busca1}"`);
  console.log(`Resultados encontrados: ${resultado1.length}`);
  console.log('Pacientes:', JSON.stringify(resultado1, null, 2));
  console.log(`✓ Passou: ${resultado1.length === 1 && resultado1[0].nome.includes('João') ? 'SIM' : 'NÃO'}`);

  // Teste 2: Buscar "Maria"
  console.log('\n--- Teste 1.2: Buscar "Maria" ---');
  const busca2 = 'Maria';
  const resultado2 = todosPacientes.filter(p =>
    p.nome.toLowerCase().includes(busca2.toLowerCase()) ||
    p.cpf.includes(busca2)
  );
  console.log(`Termo de busca: "${busca2}"`);
  console.log(`Resultados encontrados: ${resultado2.length}`);
  console.log('Pacientes:', JSON.stringify(resultado2, null, 2));
  console.log(`✓ Passou: ${resultado2.length === 1 && resultado2[0].nome.includes('Maria') ? 'SIM' : 'NÃO'}`);

  // Teste 3: Buscar "11111" (CPF)
  console.log('\n--- Teste 1.3: Buscar "11111" (por CPF) ---');
  const busca3 = '11111';
  const resultado3 = todosPacientes.filter(p =>
    p.nome.toLowerCase().includes(busca3.toLowerCase()) ||
    p.cpf.includes(busca3)
  );
  console.log(`Termo de busca: "${busca3}"`);
  console.log(`Resultados encontrados: ${resultado3.length}`);
  console.log('Pacientes:', JSON.stringify(resultado3, null, 2));
  console.log(`✓ Passou: ${resultado3.length >= 1 ? 'SIM' : 'NÃO'}`);

  // Teste 4: Busca case-insensitive
  console.log('\n--- Teste 1.4: Buscar "joão" (minúsculas) ---');
  const busca4 = 'joão';
  const resultado4 = todosPacientes.filter(p =>
    p.nome.toLowerCase().includes(busca4.toLowerCase()) ||
    p.cpf.includes(busca4)
  );
  console.log(`Termo de busca: "${busca4}"`);
  console.log(`Resultados encontrados: ${resultado4.length}`);
  console.log('Pacientes:', JSON.stringify(resultado4, null, 2));
  console.log(`✓ Passou: ${resultado4.length >= 1 && resultado4[0].nome.toLowerCase().includes('joão') ? 'SIM' : 'NÃO'}`);

  // Teste 5: Busca sem resultados
  console.log('\n--- Teste 1.5: Buscar "XYZ999" (sem resultados) ---');
  const busca5 = 'XYZ999';
  const resultado5 = todosPacientes.filter(p =>
    p.nome.toLowerCase().includes(busca5.toLowerCase()) ||
    p.cpf.includes(busca5)
  );
  console.log(`Termo de busca: "${busca5}"`);
  console.log(`Resultados encontrados: ${resultado5.length}`);
  console.log(`✓ Passou: ${resultado5.length === 0 ? 'SIM' : 'NÃO'}`);
}

async function testarConveniosMedico() {
  console.log('\n========================================');
  console.log('TESTE 2: Convênios do Médico');
  console.log('========================================\n');

  // Pegar primeiro médico
  const medico = await prisma.usuario.findFirst({
    where: { tipo: 2 }
  });

  if (!medico) {
    console.log('❌ Nenhum médico encontrado no banco');
    return;
  }

  console.log(`Médico: ${medico.nome} (ID: ${medico.id})`);

  const usuarioMedicos = await prisma.usuarioMedico.findMany({
    where: { idUsuario: medico.id },
    include: { convenio: true }
  });

  const conveniosUnicos = usuarioMedicos
    .map(um => um.convenio)
    .filter((conv, index, self) => 
      index === self.findIndex(c => c.id === conv.id)
    );

  console.log(`Convênios encontrados: ${conveniosUnicos.length}`);
  console.log('Lista:', JSON.stringify(conveniosUnicos.map(c => ({ id: c.id, nome: c.nome })), null, 2));
  console.log(`✓ Passou: ${conveniosUnicos.length > 0 ? 'SIM' : 'NÃO'}`);
}

async function testarEspecialidadesMedico() {
  console.log('\n========================================');
  console.log('TESTE 3: Especialidades do Médico');
  console.log('========================================\n');

  // Pegar primeiro médico
  const medico = await prisma.usuario.findFirst({
    where: { tipo: 2 }
  });

  if (!medico) {
    console.log('❌ Nenhum médico encontrado no banco');
    return;
  }

  console.log(`Médico: ${medico.nome} (ID: ${medico.id})`);

  const usuarioMedicos = await prisma.usuarioMedico.findMany({
    where: { idUsuario: medico.id },
    include: { especialidade: true }
  });

  const especialidadesUnicas = usuarioMedicos
    .map(um => um.especialidade)
    .filter((esp, index, self) => 
      index === self.findIndex(e => e.id === esp.id)
    );

  console.log(`Especialidades encontradas: ${especialidadesUnicas.length}`);
  console.log('Lista:', JSON.stringify(especialidadesUnicas.map(e => ({ id: e.id, descricao: e.descricao })), null, 2));
  console.log(`✓ Passou: ${especialidadesUnicas.length > 0 ? 'SIM' : 'NÃO'}`);
}

async function executarTodosTestes() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  TESTE DOS ENDPOINTS DO MÓDULO MÉDICO  ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await testarBuscaPacientes();
    await testarConveniosMedico();
    await testarEspecialidadesMedico();

    console.log('\n========================================');
    console.log('✓ TODOS OS TESTES CONCLUÍDOS');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n❌ ERRO DURANTE OS TESTES:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar testes
executarTodosTestes();
