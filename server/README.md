# Backend - Sistema Saúde Mais

## 🧪 Testes

Este projeto utiliza **Jest** como framework de testes e **Supertest** para testes E2E (end-to-end) de APIs.

### Estrutura de Testes

```
test/
├── auth.e2e-spec.ts           # Testes de autenticação
├── consultas.e2e-spec.ts      # Testes de consultas e agendamentos
└── admin.e2e-spec.ts          # Testes do módulo administrativo
```

### 📋 Cobertura de Testes

#### 1. **Testes de Autenticação** (`auth.e2e-spec.ts`)
**6 testes** que validam:
- ✅ `/auth/login` - Endpoint de login
  - Login bem-sucedido com credenciais válidas
  - Retorna token JWT válido
  - Rejeita credenciais inválidas (401)
  - Valida campos obrigatórios (400)

- ✅ `/auth/register` - Endpoint de registro
  - Registro bem-sucedido de novo paciente
  - Valida dados obrigatórios (CPF, email, senha, nome)
  - Valida formato de email
  - Retorna dados do usuário criado

**Resultado:** 6/6 testes passando ✅

#### 2. **Testes de Consultas** (`consultas.e2e-spec.ts`)
**8 testes** que validam:
- ✅ `/consultas/especialidades` - Listar especialidades
  - Retorna lista de especialidades (200)
  - Requer autenticação JWT (401)

- ✅ `/consultas/medicos/:especialidadeId` - Listar médicos
  - Retorna médicos da especialidade (200)
  - Requer autenticação JWT (401)

- ✅ `/consultas` - Agendamentos
  - Lista consultas do usuário autenticado (200)
  - Cria nova consulta com dados válidos (201)
  - Valida campos obrigatórios (400)
  - Requer autenticação JWT (401)

**Resultado:** 8/8 testes passando ✅

#### 3. **Testes do Módulo Admin** (`admin.e2e-spec.ts`)
**10 testes** que validam:
- ✅ **Controle de Acesso**
  - Rotas protegidas por tipo de usuário (tipo = 3)
  - Rejeita acesso de não-administradores (403)
  - Requer autenticação JWT (401)

- ✅ **CRUD de Especialidades**
  - Listar todas as especialidades
  - Criar nova especialidade
  - Atualizar especialidade existente
  - Deletar especialidade

- ✅ **CRUD de Convênios**
  - Listar todos os convênios
  - Criar novo convênio
  - Atualizar convênio existente
  - Deletar convênio

- ✅ **Listagens Administrativas**
  - Listar todos os médicos com relacionamentos
  - Listar todos os usuários do sistema

**Resultado:** 10/10 testes passando ✅

### 🚀 Comandos de Teste

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:cov

# Executar apenas testes E2E
npm run test:e2e
```

### 📊 Resultados Atuais

```
Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Duration:    ~26s
```

**Taxa de Sucesso: 100%** ✅

### 🔒 Segurança Testada

- ✅ Autenticação JWT em todas as rotas protegidas
- ✅ Autorização baseada em tipo de usuário (RBAC)
- ✅ Validação de entrada com Class Validator
- ✅ Proteção contra acesso não autorizado
- ✅ Hashing de senhas (bcrypt)

### 🛠️ Tecnologias de Teste

- **Jest** - Framework de testes JavaScript/TypeScript
- **Supertest** - Biblioteca para testar APIs HTTP
- **@nestjs/testing** - Utilitários de teste do NestJS
- **SQLite in-memory** - Banco de dados para testes isolados

### 📝 Padrões de Teste Utilizados

1. **E2E Testing** - Testa fluxo completo da requisição à resposta
2. **Test Isolation** - Cada teste é independente
3. **AAA Pattern** - Arrange, Act, Assert
4. **Given-When-Then** - Estrutura clara de cenários
5. **Database Seeding** - Dados iniciais para testes consistentes

### 🔧 Configuração

Os testes estão configurados em:
- `jest.config.ts` - Configuração principal do Jest
- `test/*.e2e-spec.ts` - Suítes de teste E2E
- `prisma/seed.ts` - Dados iniciais para testes

### 📖 Exemplo de Teste

```typescript
it('/auth/login (POST) - deve fazer login com sucesso', async () => {
  const loginDto = {
    login: 'admin@teste.com',
    senha: '12345678',
  };

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginDto)
    .expect(200);

  expect(response.body).toHaveProperty('access_token');
  expect(response.body).toHaveProperty('usuario');
  expect(response.body.usuario.email).toBe('admin@teste.com');
});
```

### 🎯 Cobertura por Módulo

| Módulo | Endpoints | Testes | Status |
|--------|-----------|--------|--------|
| Auth | 2 | 6 | ✅ 100% |
| Consultas | 3 | 8 | ✅ 100% |
| Admin | 8 | 10 | ✅ 100% |
| **Total** | **13** | **24** | **✅ 100%** |

### 🔍 Tipos de Validação Testados

- ✅ **Autenticação** - JWT válido e inválido
- ✅ **Autorização** - Controle de acesso por tipo
- ✅ **Validação de Dados** - DTOs com Class Validator
- ✅ **Códigos HTTP** - 200, 201, 400, 401, 403, 404
- ✅ **Formato de Resposta** - Estrutura JSON esperada
- ✅ **Integridade de Dados** - Relacionamentos Prisma
- ✅ **Casos de Erro** - Tratamento de exceções

### 🎯 Próximos Passos

Áreas sugeridas para expansão de testes:
- [ ] Testes unitários de Services
- [ ] Testes de Guards customizados
- [ ] Testes de Pipes de validação
- [ ] Testes de performance
- [ ] Testes de carga (stress testing)
- [ ] Testes de migração de banco
- [ ] Testes de webhooks/callbacks

### 💡 Boas Práticas

- ✅ Testes isolados com banco in-memory
- ✅ Limpeza de dados após cada teste
- ✅ Seeds consistentes para testes previsíveis
- ✅ Nomes descritivos em português
- ✅ Cobertura de casos felizes e casos de erro
- ✅ Validação de todos os códigos HTTP relevantes
- ✅ Testes de segurança (autenticação/autorização)

### 🐛 Debugging de Testes

```bash
# Executar com logs detalhados
npm run test -- --verbose

# Executar apenas um arquivo específico
npm run test -- auth.e2e-spec.ts

# Executar testes com inspetor do Node
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand
```

### 📚 Documentação Adicional

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
