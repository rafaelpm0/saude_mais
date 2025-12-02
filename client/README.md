# Frontend - Sistema Saúde Mais

## 🧪 Testes

Este projeto utiliza **Vitest** como framework de testes, junto com **@testing-library/react** para testes de componentes.

### Estrutura de Testes

```
src/
├── utils/
│   └── userUtils.test.ts          # Testes de funções utilitárias
├── components/
│   └── ui/
│       └── modal.test.tsx         # Testes de componentes UI
├── pages/
│   └── Login.test.tsx             # Testes de páginas
└── App.test.tsx                   # Testes de nível de aplicação
```

### 📋 Cobertura de Testes

#### 1. **Testes de Utilidades** (`userUtils.test.ts`)
**9 testes** que validam:
- ✅ `getTipoNome()` - Mapeamento de tipos de usuário
  - Retorna "Paciente" para tipo 1
  - Retorna "Médico(a)" para tipo 2
  - Retorna "Administrador(a)" para tipo 3
  - Retorna "Usuário" para tipo inválido

- ✅ `isValidUser()` - Validação de objetos de usuário
  - Valida usuário completo com todos os campos
  - Rejeita usuário com campos faltando
  - Rejeita usuário com tipo inválido
  - Rejeita null ou undefined
  - Rejeita objeto vazio

#### 2. **Testes de Componentes** (`modal.test.tsx`)
**3 testes** que validam:
- ✅ Renderização do botão com label correto
- ✅ Exibição do conteúdo do modal
- ✅ Criação do dialog com ID único

#### 3. **Testes de Páginas** (`Login.test.tsx`)
**3 testes** que validam:
- ✅ Renderização completa do formulário de login
  - Campos de CPF/Email e Senha
  - Botão de login
  - Botão de cadastro
  - Link para voltar

- ✅ Validação de campos vazios
  - Exibe mensagem "Preencha todos os campos"
  - Previne submit com campos incompletos

- ✅ Presença de elementos de cadastro
  - Botão "Cadastrar como Paciente"

#### 4. **Testes de Aplicação** (`App.test.tsx`)
**2 testes** que validam:
- ✅ Renderização sem erros
  - App carrega corretamente
  - Providers Redux e Router funcionam

- ✅ Roteamento baseado em autenticação
  - Renderiza página Welcome quando não autenticado
  - Verifica estado de autenticação

### 🚀 Comandos de Teste

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Executar testes com UI interativa do Vitest
npm run test:ui

# Executar testes com cobertura
npm run test:cov
```

### 📊 Resultados Atuais

```
Test Files  4 passed (4)
Tests      17 passed (17)
Duration   ~4s
```

**Taxa de Sucesso: 100%** ✅

### 🛠️ Tecnologias de Teste

- **Vitest** - Framework de testes rápido e moderno
- **@testing-library/react** - Utilitários para testar componentes React
- **@testing-library/user-event** - Simulação de interações do usuário
- **happy-dom** - Ambiente DOM leve para Node.js

### 📝 Padrões de Teste Utilizados

1. **Arrange-Act-Assert** - Estrutura clara de testes
2. **Component Testing** - Testes isolados de componentes
3. **Integration Testing** - Testes com Redux e Router integrados
4. **User-Centric Testing** - Testes focados na experiência do usuário

### 🔧 Configuração

Os testes estão configurados em:
- `vitest.config.ts` - Configuração principal do Vitest
- `vitest.setup.ts` - Setup global (limpeza após cada teste)

### 📖 Exemplo de Teste

```typescript
it('deve validar usuário completo', () => {
  const user: UsuarioLogado = {
    cpf: '12345678900',
    email: 'test@test.com',
    nome: 'Teste',
    tipo: 1,
    nomeTipo: 'Paciente'
  };
  
  expect(isValidUser(user)).toBe(true);
});
```

### 🎯 Próximos Passos

Áreas sugeridas para expansão de testes:
- [ ] Testes de componentes do módulo de Agendamento
- [ ] Testes de componentes administrativos
- [ ] Testes E2E com Playwright
- [ ] Testes de hooks customizados
- [ ] Testes de integração com API

### 💡 Boas Práticas

- ✅ Testes isolados e independentes
- ✅ Mocks de dependências externas (Redux, Router)
- ✅ Nomes descritivos e em português
- ✅ Foco no comportamento, não na implementação
- ✅ Cobertura de casos felizes e casos de erro

---

## 🚀 Tecnologias do Projeto

- **React 19** com TypeScript
- **Vite** como bundler
- **Tailwind CSS + DaisyUI** para styling
- **Redux Toolkit + RTK Query** para gerenciamento de estado
- **React Router Dom** para roteamento
- **React Hook Form** para formulários
- **Vitest** para testes
