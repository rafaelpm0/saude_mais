# Projeto Base - React + NestJS

Este é um projeto base limpo com React (frontend) e NestJS (backend) pronto para iniciar um novo desenvolvimento.

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

### Backend
```bash
cd server
npm install
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
- `npm run prisma:generate` - Gerar client Prisma
- `npm run prisma:migrate` - Executar migrações
- `npm run test` - Executar testes

### Frontend
- `npm run dev` - Modo desenvolvimento
- `npm run build` - Build para produção  
- `npm run test` - Executar testes
- `npm run lint` - Verificar código

## APIs e Endpoints

O backend está configurado para rodar na porta 5000 e o Swagger estará disponível em:
`http://localhost:5000/api`

## Próximos Passos

1. **Defina o domínio do seu projeto** - que tipos de entidades você vai trabalhar?
2. **Atualize o schema do Prisma** (já feito pelo usuário)
3. **Crie os módulos do backend** para suas entidades
4. **Implemente as páginas do frontend** correspondentes
5. **Configure os endpoints da API** no frontend
6. **Personalize o header e navegação** conforme suas necessidades

Boa sorte com seu novo projeto! 🚀