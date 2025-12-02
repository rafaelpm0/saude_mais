import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'admin@teste.com',
          senha: '12345678'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.tipo).toBe(3);
        });
    });

    it('deve rejeitar login com credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'admin@teste.com',
          senha: 'senhaerrada'
        })
        .expect(401);
    });

    it('deve validar campos obrigatórios', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/register (POST)', () => {
    const randomEmail = `teste${Date.now()}@teste.com`;
    const randomCpf = `${Date.now()}`.slice(0, 11);

    it('deve cadastrar um novo usuário', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          login: randomEmail,
          senha: '12345678',
          tipo: 1,
          cpf: randomCpf,
          nome: 'Usuário Teste',
          telefone: '11999999999',
          email: randomEmail,
          faltasConsecutivas: 0
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('deve rejeitar cadastro com email duplicado', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          login: 'admin@teste.com',
          senha: '12345678',
          tipo: 1,
          cpf: '99999999999',
          nome: 'Usuário Teste',
          telefone: '11999999999',
          email: 'admin@teste.com',
          faltasConsecutivas: 0
        })
        .expect(400);
    });

    it('deve validar formato de senha', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          login: 'novo@teste.com',
          senha: '123',
          tipo: 1,
          cpf: '12345678901',
          nome: 'Usuário Teste',
          telefone: '11999999999',
          email: 'novo@teste.com',
          faltasConsecutivas: 0
        })
        .expect(400);
    });
  });
});
