import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQuery() {
  console.log('\n=== Testando Query de Busca ===\n');

  // Teste 1: Buscar "Jo"
  console.log('Teste 1: Buscar "Jo"');
  const busca1 = 'Jo';
  const todosPacientes1 = await prisma.usuario.findMany({
    where: { tipo: 1 },
    select: { id: true, nome: true, cpf: true }
  });
  const filtrados1 = todosPacientes1.filter(p =>
    p.nome.toLowerCase().includes(busca1.toLowerCase()) ||
    p.cpf.includes(busca1)
  );
  console.log('Resultados:', filtrados1);

  // Teste 2: Buscar "Maria"
  console.log('\n\nTeste 2: Buscar "Maria"');
  const busca2 = 'Maria';
  const filtrados2 = todosPacientes1.filter(p =>
    p.nome.toLowerCase().includes(busca2.toLowerCase()) ||
    p.cpf.includes(busca2)
  );
  console.log('Resultados:', filtrados2);

  // Teste 3: Buscar "11111" (CPF)
  console.log('\n\nTeste 3: Buscar "11111" (CPF)');
  const busca3 = '11111';
  const filtrados3 = todosPacientes1.filter(p =>
    p.nome.toLowerCase().includes(busca3.toLowerCase()) ||
    p.cpf.includes(busca3)
  );
  console.log('Resultados:', filtrados3);

  await prisma.$disconnect();
}

testQuery().catch(console.error);
