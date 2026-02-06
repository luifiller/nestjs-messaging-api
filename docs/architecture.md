# Arquitetura do Sistema

## Visão Geral

A arquitetura da aplicação foi desenhada com foco em clareza, separação de responsabilidades e facilidade de evolução.

O sistema segue uma abordagem modular e orientada a domínio, onde:

- regras de negócio são protegidas de detalhes de infraestrutura;
- preocupações transversais (observabilidade, autenticação) não poluem o domínio;
- cada módulo é responsável por uma funcionalidade específica;
- a persistência pode evoluir sem impacto nas camadas superiores.

A aplicação foi pensada como uma API-first, preparada para ser consumida por um front-end futuro.

---

## Camadas da Aplicação

A aplicação é dividida nas seguintes camadas:

### Controller

Tendo as seguintes responsabilidades:

- Expor endpoints REST
- Receber requisições HTTP
- Validar dados de entrada via DTOs
- Orquestrar autenticação (JWT Guards)
- Delegar a execução para a camada de serviço
- Traduzir exceções de domínio em respostas HTTP

### Service

Tendo as seguintes responsabilidades:

- Implementar os casos de uso do sistema
- Orquestrar regras de negócio
- Coordenar chamadas para a camada de persistência
- Emitir logs, métricas e traces de negócio

### Domain

Tendo as seguintes responsabilidades:

- Definir a entidade `Mensagem`
- Definir estados e transições válidas
- Conter regras de negócio puras
- Garantir integridade do ciclo de vida da mensagem

### Repository

Tendo as seguintes responsabilidades:

- Persistir e recuperar mensagens
- Implementar estratégias de armazenamento
- Traduzir dados entre domínio e infraestrutura

A persistência é acessada por meio de interfaces, permitindo múltiplas implementações:

- In-memory (V1)
- DynamoDB (evolução)

A camada de serviço depende apenas da abstração, nunca da implementação concreta.

### Camadas Transversais

Algumas funcionalidades são implementadas de forma transversal, sem poluir as camadas de domínio:

#### Autenticação

- Implementada via Guards
- Atua antes da entrada nos controllers
- Não interfere nas regras de negócio
- Protege os endpoints da API

#### Observabilidade

- Logs estruturados
- Métricas de negócio
- Tracing distribuído
- Atua de forma transversal em controllers, services e ExceptionFilters

---

## Arquitetura Visual

```plaintext
+---------------------------+
|     Client / Consumer     |
|        (Front-end )       |
+---------------------------+
              |
              | HTTP / REST
              v
+---------------------------+
|        API Gateway        |
+---------------------------+
              |
              v
+---------------------------+
|        API (NestJS)       |
|---------------------------|
|                           |
|  +---------------------+  |
|  |    Auth Guard (JWT) |  |
|  +---------------------+  |
|             |             |
|             v             |
|  +---------------------+  |
|  |     Controller      |  |
|  +---------------------+  |
|             |             |-------|
|             v             |       |
|  +---------------------+  |       |
|  |       Service       |  |       |
|  +---------------------+  |       |
|             |             |       |
|             v             |       |
|  +---------------------+  |       |
|  |      Repository     |  |       |
|  +---------------------+  |       |
|             |             |       |
+-------------|-------------+       |
              |                     |
              v                     |
+---------------------------+       |
|        Data Storage       |       |
+---------------------------+       |
              |---------------------|
              | Logs / Metrics / Traces
              v
+---------------------------+
|         Datadog           |
+---------------------------+
```

---

## Decisões Técnicas

**Separação clara de camadas**

- Facilita manutenção
- Facilita testes
- Reduz acoplamento

**Domínio isolado**

- Protege regras de negócio
- Permite evoluções sem grandes impactos estruturais

**Repository pattern**

- Permite múltiplas persistências
- Facilita migração para DynamoDB

**Observabilidade desde o início**

- Facilita debugging
- Simula ambiente real de produção
- Evita retrabalho futuro

**JWT**

- Garante segurança na autenticação
- Facilita integração com front-end
- Suporta escalabilidade
