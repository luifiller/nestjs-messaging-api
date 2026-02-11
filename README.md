# NestJS Messaging API

API RESTful de mensageria desenvolvida com **NestJS**, com foco em boas práticas de Engenharia de Software, clareza arquitetural, observabilidade e preparo para evolução de persistência e escala.

---

## Documentação

A documentação do projeto está organizada no diretório [`/docs`](./docs) e descreve as decisões tomadas antes e durante a implementação do código.

- **Contexto e Intenção**
  - [`context.md`](./docs/context.md)
    Define objetivo do projeto, escopo, requisitos e restrições.

- **Domínio**
  - [`domain.md`](./docs/domain.md)
    Descreve o domínio do problema, entidade principal, estados da mensagem.

- **Arquitetura e System Design**
  - [`architecture.md`](./docs/architecture.md)
    Apresenta o fluxograma dos componentes de arquitetura da aplicação, responsabilidades das camadas e principais trade-offs arquiteturais.

- **Infraestrutura**
  - [`infrastructure.md`](./docs/infrastructure.md)
    Detalha a decisão de utilizar Docker e Docker Compose, benefícios, explicações de trechos, instruções e comandos.

- **Autenticação e Segurança**
  - [`authentication.md`](./docs/authentication.md)
    Documentação completa do sistema de autenticação implementado, incluindo JWT, Passport, Guards, Strategies e fluxos de autenticação.

- **Documentação de Endpoints**
  - [`api-endpoints.md`](./docs/api-endpoints.md)
    Descreve todos os endpoints da API, incluindo parâmetros, respostas e códigos de status HTTP.
    Está tamém disponível e mais detalhado via Swagger em `http://localhost:3000/api/`.

- **DynamoDB**
  - [`dynamodb.md`](./docs/dynamodb.md)
    Detalha a estrutura de dados no DynamoDB, incluindo tabelas, índices e atributos.

## Decisões Técnicas

**Separação clara de camadas dos modules**

- Facilita manutenção
- Facilita testes
- Reduz acoplamento

**Domínio isolado**

- Protege regras de negócio
- Permite evoluções sem grandes impactos estruturais

**Repository pattern**

- Permite múltiplas persistências

**Observabilidade desde o início**

- Facilita debugging
- Simula ambiente real de produção
- Evita retrabalho futuro

**JWT**

- Garante segurança na autenticação
- Facilita integração com front-end
- Suporta escalabilidade

---

## 🚧 Status do Projeto

> **Terminado (mas em constante evolução)**

---

## Rodando localmente?

```bash
# Clone o repositório
git clone https://github.com/luifiller/nestjs-messaging-api.git
cd nestjs-messaging-api

# Instale as dependências
npm install

# Inicie a aplicação (com DynamoDB Local)
npm run dev

# Copiar arquivo de ambiente
copy .env.example .env


# Acesse a documentaçao da API em http://localhost:3000/api/
# Utilize o Insomnia para testar, basta usar a collection disponível em: insomnia/Insomnia_2026-02-10.yaml
```

## Querendo executar no container?

```bash
# Inicie o ambiente de desenvolvimento (Docker)
npm run docker:dev

# Será criado um container, startado o NestJS API e o DynamoDB Local, além de um volume para persistência dos dados

# Acesse a documentaçao da API em http://localhost:3000/api/
# Utilize o Insomnia para testar, basta usar a collection disponível em: insomnia/Insomnia_2026-02-10.yaml

# Para mais comandos úteis, acesse o docker.md em docs/
```

---

## Tecnologias

![Node.js](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) versão 24.11.1
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white) versão 11.8.0
![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) para autenticação
![Passport](https://img.shields.io/badge/Passport-000000?style=for-the-badge&logo=passport&logoColor=white) para estratégias de autenticação e Guards para proteção de rotas
![Datadog](https://img.shields.io/badge/DATADOG-632CA6?style=for-the-badge&logo=datadog&logoColor=white) para observabilidade
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) para testes unitários
![AWS CLI](https://img.shields.io/badge/AWS%20CLI-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white) para gerenciamento do DynamoDB Local
![DynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white) **Local** para persistência de dados e **DynamoDB Client SDK** para integração e simulação de operações de banco de dados
![Insomnia](https://img.shields.io/badge/Insomnia-5849be?style=for-the-badge&logo=Insomnia&logoColor=white) para testes de API
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=white) para documentação da API
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=Prettier&logoColor=white) para formatação de código
![ESLint](https://img.shields.io/badge/ESLint-4B32A8?style=for-the-badge&logo=ESLint&logoColor=white) para linting
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white) para documentação
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white) para containerização
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white) para orquestração de containers
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) para controle de versão
![Copilot](https://img.shields.io/badge/GitHub%20Copilot-8A9199?style=for-the-badge&logo=GitHub%20Copilot&logoColor=white) + ![Claude Sonnet](https://img.shields.io/badge/Claude%20Sonnet-000000?style=for-the-badge&logo=anthropic&logoColor=white) para auxílio na escrita de código e geração de testes

---

## Commits e Branches semânticas

- **`feat:`** ... implementação de nova funcionalidade
- **`fix:`** ... resolução de bugs
- **`refactor:`** ... refatoração e melhoria de código
- **`style:`** ... ajustes na formatação do código
- **`chore:`** ... mudanças em ferramentas, configurações, dependências
- **`test:`** ... mudanças em testes
- **`doc:`** ... alterações na documentação

```

```

```

```
