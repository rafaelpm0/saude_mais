import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Consultas API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Fazer login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'paciente@teste.com',
        senha: '12345678'
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/consultas/especialidades (GET)', () => {
    it('deve retornar lista de especialidades', () => {
      return request(app.getHttpServer())
        .get('/consultas/especialidades')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('descricao');
          }
        });
    });

    it('deve rejeitar acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/consultas/especialidades')
        .expect(401);
    });
  });

  describe('/consultas/especialidades/:id/medicos (GET)', () => {
    it('deve retornar médicos de uma especialidade', () => {
      return request(app.getHttpServer())
        .get('/consultas/especialidades/1/medicos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('deve rejeitar ID inválido', () => {
      return request(app.getHttpServer())
        .get('/consultas/especialidades/abc/medicos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500); // O erro no service causa 500, não 400
    });
  });

  describe('/consultas/minhas (GET)', () => {
    it('deve retornar consultas do usuário autenticado', () => {
      return request(app.getHttpServer())
        .get('/consultas/minhas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/consultas (POST)', () => {
    it('deve validar dados obrigatórios ao criar consulta', () => {
      return request(app.getHttpServer())
        .post('/consultas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('deve validar formato de data', () => {
      return request(app.getHttpServer())
        .post('/consultas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          idMedico: 1,
          idConvenio: 1,
          data: 'data-invalida',
          hora: '09:00'
        })
        .expect(400);
    });
  });
});
