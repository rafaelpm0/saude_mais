import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar usuários existentes (opcional)
    await prisma.usuario.deleteMany();
    console.log('🗑️ Usuários existentes removidos');

    // Hash da senha padrão "12345678" para todos os usuários
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // 1. Usuário Paciente
    const paciente = await prisma.usuario.create({
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

    // 2. Usuário Médico
    const medico = await prisma.usuario.create({
      data: {
        login: 'medico@teste.com',
        senha: hashedPassword,
        tipo: 2, // Médico
        crm: 'CRM12345',
        faltasConsecutivas: 0,
        cpf: '22222222222',
        nome: 'Dra. Maria Santos',
        telefone: '11888888888',
        email: 'medico@teste.com',
      },
    });

    // 3. Usuário Administrador
    const admin = await prisma.usuario.create({
      data: {
        login: 'admin@teste.com',
        senha: hashedPassword,
        tipo: 3, // Administrador
        crm: null,
        faltasConsecutivas: 0,
        cpf: '33333333333',
        nome: 'Carlos Oliveira',
        telefone: '11777777777',
        email: 'admin@teste.com',
      },
    });

    console.log('✅ Usuários criados com sucesso:');
    console.log(`👤 Paciente: ${paciente.nome} (${paciente.email})`);
    console.log(`👨‍⚕️ Médico: ${medico.nome} (${medico.email})`);
    console.log(`👨‍💼 Admin: ${admin.nome} (${admin.email})`);
    console.log('\n📋 Credenciais para teste:');
    console.log('Email/CPF: Use qualquer um dos emails acima ou CPFs (11111111111, 22222222222, 33333333333)');
    console.log('Senha: 12345678 (para todos os usuários)');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seed();