# DOCUMENTAÇÃO DA API REST

## API Clínica Saúde+

**Base URL:** `http://localhost:5000`  
**Swagger UI:** `http://localhost:5000/api`

---

## ENDPOINTS

### 🔐 AUTENTICAÇÃO

#### [POST] - /auth/login
**Descrição:** Realizar login no sistema

**Corpo da requisição:**
```json
{
  "login": "admin@teste.com",
  "senha": "12345678"
}
```

**Parâmetros da requisição:**
- `login`: string (CPF ou email do usuário)
- `senha`: string (senha do usuário)

**Resposta de sucesso (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin Teste",
    "tipo": 3,
    "nomeTipo": "Administrador(a)",
    "cpf": "12345678900",
    "email": "admin@teste.com"
  }
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "login deve ser uma string"
  - "login não deve estar vazio"
  - "senha deve ser uma string"
  - "senha não deve estar vazia"

- **401 - Unauthorized**
  - "Credenciais inválidas"

---

#### [POST] - /auth/register
**Descrição:** Cadastrar novo usuário (paciente)

**Corpo da requisição:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "telefone": "(11) 98765-4321",
  "senha": "senha123",
  "tipo": 1
}
```

**Parâmetros da requisição:**
- `nome`: string (nome completo do usuário)
- `cpf`: string (CPF sem formatação)
- `email`: string (email válido)
- `telefone`: string (telefone com DDD)
- `senha`: string (mínimo 8 caracteres, máximo 20)
- `tipo`: number (1=Paciente, 2=Médico, 3=Admin)

**Resposta de sucesso (201):**
```json
{
  "id": 10,
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "tipo": 1,
  "nomeTipo": "Paciente"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "nome não deve estar vazio"
  - "cpf não deve estar vazio"
  - "email deve ser um email válido"
  - "senha deve ter entre 8 e 20 caracteres"
  - "tipo deve ser um número entre 1 e 3"
  - "CPF ou email já cadastrado"

---

### 📅 CONSULTAS (Requer autenticação JWT)

**Headers necessários:**
```
Authorization: Bearer {token}
```

#### [GET] - /consultas/especialidades
**Descrição:** Buscar todas as especialidades médicas disponíveis

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 1,
    "descricao": "Cardiologia"
  },
  {
    "id": 2,
    "descricao": "Pediatria"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [GET] - /consultas/especialidades/:id/medicos
**Descrição:** Buscar médicos por especialidade

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID da especialidade na URL)

**Resposta de sucesso (200):**
```json
[
  {
    "id": 5,
    "nome": "Dr. Carlos Souza",
    "crm": "CRM/SP 123456"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [GET] - /consultas/medicos/:medicoId/especialidades/:especialidadeId/convenios
**Descrição:** Buscar convênios aceitos por um médico em uma especialidade específica

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `medicoId`: number (ID do médico na URL)
- `especialidadeId`: number (ID da especialidade na URL)

**Resposta de sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Unimed"
  },
  {
    "id": 2,
    "nome": "Amil"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [GET] - /consultas/medicos/:id/calendario
**Descrição:** Buscar dias habilitados para um médico em um mês específico

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID do médico na URL)
- `ano`: number (ano, ex: 2025)
- `mes`: number (mês de 1 a 12)

**Exemplo:** `/consultas/medicos/5/calendario?ano=2025&mes=12`

**Resposta de sucesso (200):**
```json
{
  "dias": [1, 2, 3, 5, 8, 9, 10, 15, 16, 17, 22, 23, 24]
}
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [POST] - /consultas/horarios-disponiveis
**Descrição:** Calcular horários disponíveis para uma data específica

**Corpo da requisição:**
```json
{
  "idMedico": 5,
  "idEspecialidade": 1,
  "data": "2025-12-15"
}
```

**Parâmetros da requisição:**
- `idMedico`: number (ID do médico)
- `idEspecialidade`: number (ID da especialidade)
- `data`: string (data no formato YYYY-MM-DD)

**Resposta de sucesso (200):**
```json
[
  {
    "horario": "08:00",
    "disponivel": true
  },
  {
    "horario": "08:30",
    "disponivel": false
  },
  {
    "horario": "09:00",
    "disponivel": true
  }
]
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "idMedico deve ser um número"
  - "data deve ser uma string de data válida"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [POST] - /consultas
**Descrição:** Criar nova consulta (apenas pacientes)

**Corpo da requisição:**
```json
{
  "idMedico": 5,
  "idEspecialidade": 1,
  "idConvenio": 2,
  "dataHora": "2025-12-15T09:00:00",
  "observacao": "Primeira consulta"
}
```

**Parâmetros da requisição:**
- `idMedico`: number (ID do médico)
- `idEspecialidade`: number (ID da especialidade)
- `idConvenio`: number (ID do convênio)
- `dataHora`: string (data e hora no formato ISO)
- `observacao`: string (opcional - observações sobre a consulta)

**Resposta de sucesso (201):**
```json
{
  "id": 15,
  "agenda": {
    "id": 25,
    "dtaInicial": "2025-12-15T09:00:00.000Z",
    "dtaFinal": "2025-12-15T09:30:00.000Z",
    "status": "agendada",
    "medico": {
      "id": 5,
      "nome": "Dr. Carlos Souza",
      "crm": "CRM/SP 123456"
    },
    "cliente": {
      "id": 10,
      "nome": "João Silva"
    }
  },
  "convenio": {
    "id": 2,
    "nome": "Amil"
  },
  "especialidade": {
    "id": 1,
    "descricao": "Cardiologia"
  }
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Apenas pacientes podem agendar consultas"
  - "A data da consulta não pode ser no passado"
  - "Horário não disponível"
  - "Dados inválidos"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [GET] - /consultas/minhas
**Descrição:** Buscar consultas do usuário logado (paciente)

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 15,
    "agenda": {
      "id": 25,
      "dtaInicial": "2025-12-15T09:00:00.000Z",
      "dtaFinal": "2025-12-15T09:30:00.000Z",
      "status": "agendada",
      "medico": {
        "id": 5,
        "nome": "Dr. Carlos Souza",
        "crm": "CRM/SP 123456"
      }
    },
    "convenio": {
      "id": 2,
      "nome": "Amil"
    },
    "especialidade": {
      "id": 1,
      "descricao": "Cardiologia"
    }
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [GET] - /consultas/medico/minhas
**Descrição:** Buscar consultas do médico logado

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 15,
    "agenda": {
      "id": 25,
      "dtaInicial": "2025-12-15T09:00:00.000Z",
      "dtaFinal": "2025-12-15T09:30:00.000Z",
      "status": "agendada",
      "cliente": {
        "id": 10,
        "nome": "João Silva"
      }
    },
    "convenio": {
      "id": 2,
      "nome": "Amil"
    },
    "especialidade": {
      "id": 1,
      "descricao": "Cardiologia"
    }
  }
]
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Apenas médicos podem acessar esta rota"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

#### [PUT] - /consultas/:id/status
**Descrição:** Atualizar status da consulta (médicos e administradores)

**Corpo da requisição:**
```json
{
  "status": "realizada"
}
```

**Parâmetros da requisição:**
- `id`: number (ID da consulta na URL)
- `status`: string (agendada, realizada, cancelada, falta)

**Resposta de sucesso (200):**
```json
{
  "id": 15,
  "agenda": {
    "id": 25,
    "status": "realizada"
  }
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Sem permissão para alterar esta consulta"
  - "Status inválido"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **404 - Not Found**
  - "Consulta não encontrada"

---

#### [POST] - /consultas/processar-vencidas
**Descrição:** Processar consultas vencidas e marcar como falta automaticamente

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
{
  "message": "Consultas vencidas processadas com sucesso"
}
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

---

### 🔧 ADMINISTRAÇÃO (Requer autenticação JWT + tipo=3)

**Headers necessários:**
```
Authorization: Bearer {token_admin}
```

#### [GET] - /admin/especialidades
**Descrição:** Buscar todas as especialidades

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 1,
    "descricao": "Cardiologia"
  },
  {
    "id": 2,
    "descricao": "Pediatria"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [POST] - /admin/especialidades
**Descrição:** Criar nova especialidade

**Corpo da requisição:**
```json
{
  "descricao": "Dermatologia"
}
```

**Parâmetros da requisição:**
- `descricao`: string (nome da especialidade)

**Resposta de sucesso (201):**
```json
{
  "id": 5,
  "descricao": "Dermatologia"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "descricao não deve estar vazio"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [PUT] - /admin/especialidades/:id
**Descrição:** Atualizar especialidade

**Corpo da requisição:**
```json
{
  "descricao": "Cardiologia Clínica"
}
```

**Parâmetros da requisição:**
- `id`: number (ID da especialidade na URL)
- `descricao`: string (novo nome da especialidade)

**Resposta de sucesso (200):**
```json
{
  "id": 1,
  "descricao": "Cardiologia Clínica"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "descricao não deve estar vazio"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Especialidade não encontrada"

---

#### [DELETE] - /admin/especialidades/:id
**Descrição:** Deletar especialidade

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID da especialidade na URL)

**Resposta de sucesso (204):** Sem conteúdo

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Especialidade não encontrada"

---

#### [GET] - /admin/convenios
**Descrição:** Buscar todos os convênios

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Unimed"
  },
  {
    "id": 2,
    "nome": "Amil"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [POST] - /admin/convenios
**Descrição:** Criar novo convênio

**Corpo da requisição:**
```json
{
  "nome": "Bradesco Saúde"
}
```

**Parâmetros da requisição:**
- `nome`: string (nome do convênio)

**Resposta de sucesso (201):**
```json
{
  "id": 5,
  "nome": "Bradesco Saúde"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "nome não deve estar vazio"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [PUT] - /admin/convenios/:id
**Descrição:** Atualizar convênio

**Corpo da requisição:**
```json
{
  "nome": "Unimed Nacional"
}
```

**Parâmetros da requisição:**
- `id`: number (ID do convênio na URL)
- `nome`: string (novo nome do convênio)

**Resposta de sucesso (200):**
```json
{
  "id": 1,
  "nome": "Unimed Nacional"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "nome não deve estar vazio"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Convênio não encontrado"

---

#### [DELETE] - /admin/convenios/:id
**Descrição:** Deletar convênio

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID do convênio na URL)

**Resposta de sucesso (204):** Sem conteúdo

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Convênio não encontrado"

---

#### [GET] - /admin/medicos
**Descrição:** Buscar todos os médicos com especialidades e convênios

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 5,
    "nome": "Dr. Carlos Souza",
    "cpf": "98765432100",
    "crm": "CRM/SP 123456",
    "email": "carlos@clinica.com",
    "telefone": "(11) 98888-7777",
    "especialidades": [
      {
        "especialidade": {
          "id": 1,
          "descricao": "Cardiologia"
        },
        "tempoConsulta": 30,
        "convenios": [
          {
            "id": 1,
            "nome": "Unimed"
          },
          {
            "id": 2,
            "nome": "Amil"
          }
        ]
      }
    ]
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [GET] - /admin/medicos/:id
**Descrição:** Buscar médico por ID com relacionamentos

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID do médico na URL)

**Resposta de sucesso (200):**
```json
{
  "id": 5,
  "nome": "Dr. Carlos Souza",
  "cpf": "98765432100",
  "crm": "CRM/SP 123456",
  "email": "carlos@clinica.com",
  "telefone": "(11) 98888-7777",
  "especialidades": [
    {
      "especialidade": {
        "id": 1,
        "descricao": "Cardiologia"
      },
      "tempoConsulta": 30,
      "convenios": [
        {
          "id": 1,
          "nome": "Unimed"
        }
      ]
    }
  ]
}
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Médico não encontrado"

---

#### [POST] - /admin/medicos
**Descrição:** Criar novo médico

**Corpo da requisição:**
```json
{
  "nome": "Dr. Pedro Santos",
  "cpf": "11122233344",
  "email": "pedro@clinica.com",
  "telefone": "(11) 99999-8888",
  "login": "pedro.santos",
  "senha": "senha123",
  "crm": "CRM/SP 654321",
  "especialidades": [
    {
      "especialidadeId": 2,
      "convenioIds": [1, 2],
      "tempoConsulta": 30
    }
  ]
}
```

**Parâmetros da requisição:**
- `nome`: string (nome completo do médico)
- `cpf`: string (CPF sem formatação)
- `email`: string (email válido)
- `telefone`: string (telefone com DDD)
- `login`: string (login para acesso ao sistema)
- `senha`: string (senha de acesso)
- `crm`: string (CRM com UF)
- `especialidades`: array (lista de especialidades com convênios)
  - `especialidadeId`: number (ID da especialidade)
  - `convenioIds`: array de numbers (IDs dos convênios)
  - `tempoConsulta`: number (tempo em minutos, mínimo 15)

**Resposta de sucesso (201):**
```json
{
  "id": 10,
  "nome": "Dr. Pedro Santos",
  "crm": "CRM/SP 654321",
  "especialidades": [
    {
      "especialidade": {
        "id": 2,
        "descricao": "Pediatria"
      },
      "tempoConsulta": 30,
      "convenios": [
        {
          "id": 1,
          "nome": "Unimed"
        },
        {
          "id": 2,
          "nome": "Amil"
        }
      ]
    }
  ]
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "nome não deve estar vazio"
  - "crm não deve estar vazio"
  - "Médico deve ter pelo menos uma especialidade com convênio"
  - "tempoConsulta deve ser no mínimo 15 minutos"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [PUT] - /admin/medicos/:id
**Descrição:** Atualizar médico

**Corpo da requisição:**
```json
{
  "nome": "Dr. Pedro Santos Jr",
  "telefone": "(11) 98888-9999",
  "especialidades": [
    {
      "especialidadeId": 2,
      "convenioIds": [1, 2, 3],
      "tempoConsulta": 45
    }
  ]
}
```

**Parâmetros da requisição:**
- `id`: number (ID do médico na URL)
- Mesmos campos do POST (todos opcionais)

**Resposta de sucesso (200):**
```json
{
  "id": 10,
  "nome": "Dr. Pedro Santos Jr",
  "telefone": "(11) 98888-9999",
  "especialidades": [...]
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Médico deve ter pelo menos uma especialidade com convênio"
  - "Dados inválidos"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Médico não encontrado"

---

#### [DELETE] - /admin/medicos/:id
**Descrição:** Deletar médico

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:**
- `id`: number (ID do médico na URL)

**Resposta de sucesso (204):** Sem conteúdo

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Médico não encontrado"

---

#### [GET] - /admin/usuarios
**Descrição:** Listar todos os usuários do sistema

**Corpo da requisição:** Nenhum

**Parâmetros da requisição:** Nenhum

**Resposta de sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Admin Teste",
    "cpf": "12345678900",
    "email": "admin@teste.com",
    "tipo": 3,
    "nomeTipo": "Administrador(a)"
  },
  {
    "id": 10,
    "nome": "João Silva",
    "cpf": "11122233344",
    "email": "joao@email.com",
    "tipo": 1,
    "nomeTipo": "Paciente"
  }
]
```

**Possíveis erros e mensagens:**
- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [POST] - /admin/usuarios
**Descrição:** Criar novo usuário (qualquer tipo: paciente, médico ou admin)

**Corpo da requisição (Paciente/Admin):**
```json
{
  "nome": "Maria Santos",
  "cpf": "55566677788",
  "email": "maria@email.com",
  "telefone": "(11) 97777-6666",
  "senha": "senha123",
  "tipo": 1
}
```

**Corpo da requisição (Médico):**
```json
{
  "nome": "Dr. Roberto Lima",
  "cpf": "99988877766",
  "email": "roberto@clinica.com",
  "telefone": "(11) 96666-5555",
  "senha": "senha123",
  "tipo": 2,
  "crm": "CRM/RJ 789012",
  "especialidades": [
    {
      "especialidadeId": 1,
      "convenioIds": [1],
      "tempoConsulta": 30
    }
  ]
}
```

**Parâmetros da requisição:**
- `nome`: string (nome completo)
- `cpf`: string (CPF sem formatação)
- `email`: string (email válido)
- `telefone`: string (telefone com DDD)
- `senha`: string (senha de acesso)
- `tipo`: number (1=Paciente, 2=Médico, 3=Admin)
- `crm`: string (obrigatório se tipo=2)
- `especialidades`: array (obrigatório se tipo=2)

**Resposta de sucesso (201):**
```json
{
  "id": 15,
  "nome": "Maria Santos",
  "cpf": "55566677788",
  "email": "maria@email.com",
  "tipo": 1,
  "nomeTipo": "Paciente"
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Médicos devem ter CRM e especialidades"
  - "tipo deve ser 1, 2 ou 3"
  - "CPF ou email já cadastrado"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

---

#### [PUT] - /admin/usuarios/:id
**Descrição:** Atualizar usuário

**Corpo da requisição:**
```json
{
  "nome": "Maria Santos Silva",
  "telefone": "(11) 98888-7777",
  "email": "maria.silva@email.com"
}
```

**Parâmetros da requisição:**
- `id`: number (ID do usuário na URL)
- Campos opcionais para atualização

**Resposta de sucesso (200):**
```json
{
  "id": 15,
  "nome": "Maria Santos Silva",
  "email": "maria.silva@email.com",
  "tipo": 1
}
```

**Possíveis erros e mensagens:**
- **400 - Bad Request**
  - "Dados inválidos"
  - "Médicos devem ter CRM e especialidades"

- **401 - Unauthorized**
  - "Token não fornecido ou inválido"

- **403 - Forbidden**
  - "Acesso negado. Apenas administradores"

- **404 - Not Found**
  - "Usuário não encontrado"

---

## 📝 NOTAS IMPORTANTES

### Autenticação
- Todas as rotas, exceto `/auth/login` e `/auth/register`, requerem token JWT
- Token deve ser enviado no header: `Authorization: Bearer {token}`
- Token é obtido após login bem-sucedido

### Tipos de Usuário
- **1** = Paciente (pode agendar consultas)
- **2** = Médico (pode visualizar suas consultas)
- **3** = Administrador (acesso total ao sistema)

### Status de Consulta
- **agendada** = Consulta marcada e confirmada
- **realizada** = Consulta já aconteceu
- **cancelada** = Consulta foi cancelada
- **falta** = Paciente não compareceu

### Formato de Datas
- Use ISO 8601: `YYYY-MM-DDTHH:mm:ss`
- Exemplo: `2025-12-15T09:00:00`

### Códigos HTTP
- **200** = Sucesso (GET, PUT)
- **201** = Criado com sucesso (POST)
- **204** = Sem conteúdo (DELETE)
- **400** = Requisição inválida
- **401** = Não autenticado
- **403** = Sem permissão
- **404** = Não encontrado

---

**Versão da API:** 1.0  
**Última atualização:** Dezembro 2025
