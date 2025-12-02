import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let pacienteToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login como admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'admin@teste.com',
        senha: '12345678'
      });
    adminToken = adminLogin.body.access_token;

    // Login como paciente (não admin)
    const pacienteLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'paciente@teste.com',
        senha: '12345678'
      });
    pacienteToken = pacienteLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autorização Admin', () => {
    it('deve permitir acesso com token de admin', () => {
      return request(app.getHttpServer())
        .get('/admin/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('deve bloquear acesso sem ser admin', () => {
      return request(app.getHttpServer())
        .get('/admin/especialidades')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .expect(403);
    });

    it('deve bloquear acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/admin/especialidades')
        .expect(401);
    });
  });

  describe('/admin/especialidades (GET)', () => {
    it('deve retornar lista de especialidades', () => {
      return request(app.getHttpServer())
        .get('/admin/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/admin/especialidades (POST)', () => {
    it('deve criar nova especialidade', () => {
      const descricao = `Especialidade Teste ${Date.now()}`;
      
      return request(app.getHttpServer())
        .post('/admin/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ descricao })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.descricao).toBe(descricao);
        });
    });

    it('deve validar campo obrigatório', () => {
      return request(app.getHttpServer())
        .post('/admin/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/admin/convenios (GET)', () => {
    it('deve retornar lista de convênios', () => {
      return request(app.getHttpServer())
        .get('/admin/convenios')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/admin/convenios (POST)', () => {
    it('deve criar novo convênio', () => {
      const nome = `Convênio Teste ${Date.now()}`;
      
      return request(app.getHttpServer())
        .post('/admin/convenios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nome })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nome).toBe(nome);
        });
    });

    it('deve validar campo obrigatório', () => {
      return request(app.getHttpServer())
        .post('/admin/convenios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/admin/medicos (GET)', () => {
    it('deve retornar lista de médicos', () => {
      return request(app.getHttpServer())
        .get('/admin/medicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/admin/usuarios (GET)', () => {
    it('deve retornar lista de usuários bloqueados', () => {
      return request(app.getHttpServer())
        .get('/admin/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
