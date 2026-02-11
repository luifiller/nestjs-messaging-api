# AWS DynamoDB - Estratégia e Configuração

## Visão Geral

Este documento explica a integração criada com o AWS DynamoDB local, estratégia de persistência e configuração para diferentes ambientes.

---

# Por que DynamoDB?

- **DynamoDB Local**: Permite desenvolvimento e testes locais sem custos
- **Serverless e Gerenciado**: tempo mais focado nas regras de negócio, sem necessidade de gerenciar servidores de banco de dados
- **Escalabilidade Automática**: Escala horizontalmente conforme a demanda
- **Altíssima durabilidade**: 99.999999999% (11 noves)
- **Alta Disponibilidade**: Replicação multi-AZ automática
- **Performance Previsível**: Latência de milissegundos para leitura/escrita
- **Pay-per-use**: Paga apenas pelo que usa (ou use On-Demand)
- **Flexibilidade de Modelagem**: Suporta modelos de dados flexíveis (documentos, chave-valor)

---

## Cenários de Persistência

### **Desenvolvimento - DynamoDB Local**

```
┌─────────────────────────────────────────────┐
│          Seu Computador (Docker)            │
│                                             │
│  ┌─────────────┐       ┌─────────────────┐  │
│  │  NestJS API │◄─────►│ DynamoDB Local  │  │
│  │ (Container) │       │   (Container)   │  │
│  └─────────────┘       └────────┬────────┘  │
│                                 │           │
│                         ┌───────▼────────┐  │
│                         │ Docker Volume  │  │
│                         │ dynamodb-data  │  │
│                         │  (persistido)  │  │
│                         └────────────────┘  │
└─────────────────────────────────────────────┘
```

---

### **Staging/Production - AWS DynamoDB (Real)**

```
┌──────────────────────────┐       ┌────────────────────────────┐
│  Seu Servidor            │       │      AWS Cloud             │
│  (EC2/ECS/Lambda)        │       │                            │
│                          │       │  ┌──────────────────────┐  │
│  ┌─────────────────┐     │       │  │  DynamoDB Service    │  │
│  │   NestJS API    │◄────┼───────┼─►│  (Gerenciado)        │  │
│  │                 │     │ AWS   │  │                      │  │
│  └─────────────────┘     │ SDK   │  └──────────┬───────────┘  │
│                          │       │             │              │
└──────────────────────────┘       │    ┌────────▼──────────┐   │
                                   │    │  S3 (Backups)     │   │
                                   │    │  Multi-AZ         │   │
                                   │    │  Replication      │   │
                                   │    └───────────────────┘   │
                                   └────────────────────────────┘
```

---

## Design da Tabela de Mensagens

### Tabela: `messages`

**Primary Key:**

- **Partition Key (PK):** `id` (String) - UUID da mensagem
- Não foi preciso definir uma Sort Key (SK) para esta tabela, pois é impossível ter uma mensagem ou item como o mesmo ID.

Para satisfazer requisitos específicos de consulta, que não podem ser atendidos apenas pela chave primária, foram criados dois índices secundários globais (GSIs):

1. **GSI_SenderMessages:**
   Serve para as consultas de mensagens por remetente.
   - **Partition Key:** `sender` (String)
   - **Sort Key:** `createdAt` (Number)
   - **Projeção:** ALL (todos os atributos)

2. **GSI_CreatedAt:**
   Serve para satisfazer consultas globais de mensagens baseadas na data de criação.
   - **Partition Key:** `entity` (String)
   - **Sort Key:** `createdAt` (Number)
   - **Projeção:** ALL (todos os atributos)

**Atributos:**

- `id`: UUID único
- `sender`: ID do remetente
- `content`: Conteúdo da mensagem
- `status`: Status atual (enum)
- `createdAt`: Timestamp de criação
- `updatedAt`: Timestamp da última atualização
- `entity`: Tipo de entidade, espécie de etiqueta do registro (ex: "MESSAGE")

---
