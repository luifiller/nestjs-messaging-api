# Arquitetura do Sistema

## Visão Geral

Pensando que é um projeto de pequeno porte, com resquisitos "simples" e com uma constraint de tempo para seu devido desenvolvimento, escolhi construir esse sistema com foco em clareza, separação de responsabilidades e facilidade de evolução.

Desta forma, decidi seguir pela abordagem modular em camadas e orientada a domínio (Padrão do NestJS e semelhante ao Angular), onde:

- regras de negócio são protegidas de detalhes de infraestrutura;
- preocupações transversais (observabilidade, autenticação) não poluem o domínio;
- cada módulo é responsável por uma funcionalidade específica;
- a persistência pode evoluir sem impacto nas camadas superiores.

A aplicação foi pensada como uma API-first, preparada para ser consumida por um front-end futuro.

> ⚠️ Nota
> No momento de pensar e refinar o domínio do sistema e no design/arquitetura dele, foi pensado em utilizar Clean Architecture para se beneficiar da flexibilidade, desacoplamento e manutenibilidade, bem como do menor esforço e atritos frente a oportunidades/necessidades de escalar ou de estar em um contexto de grandes ou recorrentes mudanças (de framework, de banco de dados, de provedor de cloud).
> No entanto, dada a simplicidade do domínio e a natureza de um projeto de pequeno porte, optei por uma arquitetura que pudesse favorecer uma entrega de valor rápida, consistente, de qualidade e organizada, tendo a possibilidade de lidar com evoluções e melhoria contínua a depender de futuras mudanças do contexto na qual ela se encontraria.

---

## Camadas da Aplicação

A aplicação foi, então, dividida da seguinte forma, para cada domínio e contexto (autenticação [`auth`], mensagens [`messages`], saúde da aplicação [`health`]) foi criado um módulo próprio e em sua estrutura interna, cada módulo é organizado nas seguintes camadas:

### Controller

Tendo as seguintes responsabilidades:

- Expor endpoints REST
- Receber requisições HTTP
- Validar dados de entrada via DTOs usando `class-transformer` e `class-validator`
- Orquestrar autenticação (Local Guards ou JWT Guards)
- Delegar a execução para a camada de serviço

### Service

Tendo as seguintes responsabilidades:

- Implementar os casos de uso do sistema
- Orquestrar regras de negócio
- Coordenar chamadas para a camada de persistência
- Lançar exceções a partir de regras de negócio
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

### Camadas Transversais

Algumas funcionalidades são implementadas de forma transversal, sem poluir as camadas de domínio:

#### Autenticação

`AuthModule` foi tratado como módulo vertical da aplicação, encapsulando controller, estratégias, guards e providers relacionados à autenticação.

Isso mantém alta coesão e facilita futura extração para microserviço independente, se necessário.

- Implementada via Guards
- Atua antes da entrada nos controllers
- Não interfere nas regras de negócio
- Protege os endpoints da API

O guard e o strategy local são específicos para o endpoint de login, enquanto o guard JWT é utilizado para proteger os endpoints que exigem autenticação.

#### Observabilidade

- Tracing distribuído
- Atua de forma transversal em controllers, services e ExceptionFilter

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
|  |  Auth Guard (Local) |  |
|  +---------------------+  |
|             |             |
|             v             |
|  +---------------------+  |
|  |   Auth Guard (JWT)  |  |
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
