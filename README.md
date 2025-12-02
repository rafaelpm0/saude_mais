# Sistema de Saúde Mais - React + NestJS

Este é um sistema completo de gerenciamento de clínica médica com React (frontend) e NestJS (backend), incluindo módulo administrativo para cadastros.

## Estrutura do Projeto

```
├── client/          # Frontend React + TypeScript + Tailwind + DaisyUI
└── server/          # Backend NestJS + Prisma
```

## Frontend (client/)

### Tecnologias Incluídas
- **React 19** com TypeScript
- **Vite** como bundler
- **Tailwind CSS + DaisyUI** para styling
- **Redux Toolkit + RTK Query** para gerenciamento de estado e API
- **React Router Dom** para roteamento
- **React Hook Form** para formulários
- **Vitest** para testes

**📝 Documentação Detalhada de Testes:** [Ver README do Frontend](./client/README.md)

### Estrutura Mantida
- ✅ Header com navegação lateral (drawer)
- ✅ Sistema de tema claro/escuro
- ✅ Breadcrumb
- ✅ Configuração da API com RTK Query
- ✅ Componentes UI básicos (modal, table, toast, etc.)
- ✅ Layout responsivo

### Para Começar
1. Adicione suas rotas em `src/App.tsx`
2. Crie suas páginas em `src/pages/`
3. Defina seus tipos em `src/types/types.ts`
4. Configure seus endpoints de API em `src/services/endpoints/`
5. Personalize a navegação no `src/components/header.tsx`

## Backend (server/)

### Tecnologias Incluídas
- **NestJS** com TypeScript
- **Prisma** como ORM
- **Swagger** para documentação da API
- **Class Validator** para validação
- **Jest** para testes

**📝 Documentação Detalhada de Testes:** [Ver README do Backend](./server/README.md)

### Estrutura Base
- ✅ Configuração básica do NestJS
- ✅ Swagger configurado
- ✅ CORS habilitado
- ✅ Validação global configurada
- ✅ Prisma configurado (schema já atualizado pelo usuário)

### Para Começar
1. Crie seus módulos em `src/`
2. Defina seus DTOs para validação
3. Implemente seus controllers e services
4. Atualize o `app.module.ts` com os novos módulos

## Como Executar

### Backend - Primeira Execução
```bash
cd server
npm install                     # Instalar dependências
npx prisma generate             # Gerar Prisma Client
npx prisma migrate dev          # Executar migrações do banco
npm run seed                    # Popular banco com dados iniciais
npm run start:dev               # Iniciar servidor
```

**Credenciais após o seed:**
- **Admin**: `admin@teste.com` / Senha: `12345678`
- **Paciente**: `paciente@teste.com` / Senha: `12345678`
- **Médico**: `medico@teste.com` / Senha: `12345678`

### Backend - Execuções Posteriores
```bash
cd server
npm run start:dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Comandos Úteis

### Backend
- `npm run start:dev` - Modo desenvolvimento
- `npm run build` - Build para produção
- `npm run prisma:generate` - Gerar client Prisma
- `npm run prisma:migrate` - Executar migrações
- `npm run seed` - Popular banco com dados iniciais
- `npm run test` - Executar todos os testes
- `npm run test:watch` - Executar testes em modo watch
- `npm run test:cov` - Executar testes com cobertura

### Frontend
- `npm run dev` - Modo desenvolvimento
- `npm run build` - Build para produção  
- `npm run test` - Executar testes
- `npm run test:watch` - Executar testes em modo watch
- `npm run lint` - Verificar código

## Testes

### Estrutura de Testes do Backend
O projeto possui testes E2E (end-to-end) simples para as principais rotas:

**Arquivos de teste:**
- `test/auth.e2e-spec.ts` - Testes de autenticação (login/register)
- `test/consultas.e2e-spec.ts` - Testes de consultas e agendamentos
- `test/admin.e2e-spec.ts` - Testes do módulo administrativo

**Cobertura de testes:**
- ✅ Autenticação e autorização
- ✅ Validação de dados de entrada
- ✅ Proteção de rotas com JWT
- ✅ Controle de acesso por tipo de usuário
- ✅ Operações CRUD básicas

**Executar testes:**
```bash
cd server
npm run test           # Executar todos os testes
npm run test:watch     # Modo watch
npm run test:cov       # Com cobertura
```

## APIs e Endpoints

O backend está configurado para rodar na porta 5000 e o Swagger estará disponível em:
`http://localhost:5000/api`

## 🆕 Funcionalidades Implementadas - Módulo Admin

### Cadastros Administrativos
O sistema agora possui um módulo administrativo completo acessível apenas para usuários tipo 3 (Administradores).

#### Funcionalidades Principais:
- **📋 Cadastro de Especialidades**: CRUD completo com validações
- **🏥 Cadastro de Convênios**: CRUD completo com validações  
- **👨‍⚕️ Cadastro de Médicos**: CRUD complexo com relacionamentos

#### Características do Módulo:

**Backend (`/server/src/admin/`):**
- ✅ AdminController com todos os endpoints CRUD
- ✅ AdminService com transações Prisma
- ✅ AdminGuard para verificar permissões (tipo = 3)
- ✅ DTOs com validações completas
- ✅ Documentação Swagger

**Frontend (`/client/src/`):**
- ✅ Página AdminCadastros com layout responsivo (3 colunas desktop / coluna mobile)
- ✅ Modais específicos para cada cadastro
- ✅ Filtros com debounce (500ms) por coluna
- ✅ DataTable com skeleton loading animado
- ✅ Hook customizado useDebounce
- ✅ RTK Query para gerenciamento de estado e cache

#### Modal de Médicos (Complexo):
- ✅ useFieldArray para múltiplas especialidades
- ✅ Accordion com apenas 1 seção expandida por vez
- ✅ Checkboxes para seleção múltipla de convênios
- ✅ Validações: mínimo 1 especialidade com 1 convênio
- ✅ Carregamento automático de dados existentes para edição
- ✅ Substituição completa de relacionamentos (UsuarioMedico)

#### Navegação e Segurança:
- ✅ Link "Cadastros" no header (apenas para admins)
- ✅ Rota protegida `/cadastros` no App.tsx
- ✅ Verificação de tipo de usuário no frontend e backend

#### Filtros Específicos:
- **Especialidades**: Filtro por descrição (texto)
- **Convênios**: Filtro por nome (texto)
- **Médicos**: Filtros por nome (texto), CRM (texto) e especialidade (select)

### Como Testar:

1. **Faça login como administrador:**
   - Email: `admin@teste.com`
   - Senha: `123456`

2. **Acesse o menu "Cadastros"** (visível apenas para admins)

3. **Teste os cadastros:**
   - Especialidades: Criar, editar, excluir, filtrar
   - Convênios: Criar, editar, excluir, filtrar
   - Médicos: Criar (com múltiplas especialidades/convênios), editar, excluir, filtrar

### Arquitetura Seguida:
- ✅ Padrões do projeto mantidos (RTK Query, useForm, DataTable, Modal)
- ✅ Estrutura modular do NestJS
- ✅ Transações Prisma para integridade dos dados
- ✅ Cache invalidation apropriado
- ✅ Tratamento de erros com toast
- ✅ Layout responsivo com Tailwind CSS

Implementação completa e funcional para trabalho acadêmico! 🎓