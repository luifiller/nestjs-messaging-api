# 📬 API de Mensagens - Documentação de Endpoints

## 📋 Visão Geral

API RESTful de mensagens desenvolvida com NestJS e AWS DynamoDB que permite criar, buscar, atualizar e deletar mensagens.

**Base URL:** `http://localhost:3000`

**Autenticação:** Bearer Token (JWT) - **Obrigatório** para o endpoint de `/messages`.

---

## 🔐 Autenticação

Como a rota autenticada, você precisa:

1. Fazer login em `/auth/login` para obter um token
2. Incluir o token com `Bearer` no header de todas as requisições (isso já é automatizado na Collection do Insomnia que eu criei):

```http
Authorization: Bearer <seu-token-aqui>
```

### Obter Token de Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "username": "seu-usuario",
  "password": "@1Sua-senha",
  "email": "email@mail.com"
}
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiI..."
}
```

---

## 📬 Endpoints de Mensagens

### 1. Criar Mensagem

**POST** `/mensagens`

Cria uma nova mensagem com status `SENT`.

#### Request

```http
POST /mensagens
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Olá, como vai?",
}
```

#### Body Parameters

| Campo   | Tipo   | Obrigatório | Descrição            |
| ------- | ------ | ----------- | -------------------- |
| content | string | Sim         | Conteúdo da mensagem |

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sender": "user-123",
  "content": "Olá, como vai?",
  "status": "SENT",
  "createdAt": 1707436800000,
  "updatedAt": 1707436800000,
  "entity": "MESSAGE"
}
```

---

### 2. Buscar Mensagem por ID

**GET** `/mensagens/:id`

Busca uma mensagem específica pelo seu ID.

#### Request

```http
GET /mensagens/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

#### Path Parameters

| Campo | Tipo | Descrição            |
| ----- | ---- | -------------------- |
| id    | UUID | ID único da mensagem |

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sender": "user-123",
  "content": "Olá, como vai?",
  "status": "READ",
  "createdAt": 1707436800000,
  "updatedAt": 1707437000000,
  "entity": "MESSAGE"
}
```

#### Response (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Message with ID 550e800-e29b-41d4-a716-44600 not found",
  "error": "Not Found"
}
```

---

### 3. Buscar Mensagens com Filtros

**GET** `/mensagens`

Busca mensagens aplicando filtros opcionais (remetente ou período).

#### Query Parameters

| Campo     | Tipo      | Obrigatório | Descrição                                |
| --------- | --------- | ----------- | ---------------------------------------- |
| sender    | string    | Não         | Filtrar por remetente                    |
| startDate | timestamp | Não         | Data inicial do período                  |
| endDate   | timestamp | Não         | Data final do período                    |
| limit     | integer   | Não         | Número máximo de resultados (padrão: 50) |

#### Casos de Uso

**1. Buscar por remetente:**

```http
GET /mensagens?sender=user-123
```

**2. Buscar por período:**

```http
GET /mensagens?startDate=1707436800000&endDate=1707437000000
```

#### Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "user-123",
    "content": "Primeira mensagem",
    "status": "READ",
    "createdAt": 1707436800000,
    "updatedAt": 1707437000000,
    "entity": "MESSAGE"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "sender": "user-123",
    "content": "Segunda mensagem",
    "status": "DELIVERED",
    "createdAt": 1707436900000,
    "updatedAt": 1707436900000,
    "entity": "MESSAGE"
  }
]
```

---

### 4. Atualizar Status da Mensagem

**PATCH** `/mensagens/:id/status`

Atualiza o status de uma mensagem existente.

#### Request

```http
PATCH /mensagens/50e80-e29b-41d4-a716-44400/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "READ"
}
```

#### Path Parameters

| Campo | Tipo | Descrição            |
| ----- | ---- | -------------------- |
| id    | UUID | ID único da mensagem |

#### Body Parameters

| Campo  | Tipo | Valores Possíveis           |
| ------ | ---- | --------------------------- |
| status | enum | `SENT`, `DELIVERED`, `READ` |

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sender": "user-123",
  "content": "Olá, como vai?",
  "status": "READ",
  "createdAt": 1707436800000,
  "updatedAt": 1707437200000,
  "entity": "MESSAGE"
}
```

---

## 🔍 Códigos de Resposta HTTP

| Código | Significado                                              |
| ------ | -------------------------------------------------------- |
| 200    | OK - Requisição bem-sucedida                             |
| 201    | Created - Recurso criado com sucesso                     |
| 204    | No Content - Operação bem-sucedida sem conteúdo          |
| 400    | Bad Request - Dados inválidos                            |
| 401    | Unauthorized - Autenticação necessária ou token inválido |
| 404    | Not Found - Recurso não encontrado                       |
| 500    | Internal Server Error - Erro interno do servidor         |

---
