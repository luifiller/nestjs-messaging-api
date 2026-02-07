# 📩 Message Service API

> API RESTful de mensagens construída com foco em arquitetura, observabilidade e evolução contínua.

---

## Objetivo

Este projeto tem como objetivo desenvolver uma API RESTful de mensagens, utilizando Node.js com NestJS, simulando um cenário real de um ambiente bancário.

O foco principal não está apenas na entrega de funcionalidades, mas sim na demonstração de decisões conscientes de arquitetura e design, aplicação de boas práticas de Engenharia de Software, preparo para observabilidade desde o início e uma construção arquitetada e planejada para evolução contínua (ex: persistência de dados com DynamoDB).

O projeto foi confeccionado como um sistema orgânico, preparado para crescer, ser monitorado, evoluir e incorporar novas responsabilidades sem impactar o domínio central.

---

## Escopo

- API RESTful para gerenciamento de mensagens
- Criação de mensagens
- Consulta de mensagens:
  - por ID
  - por remetente
  - por período (intervalo de datas)
- Atualização de status da mensagem (`enviado`, `recebido`, `lido`)
- Validações de entrada via DTOs
- Autenticação usando JWT
- Persistência **in-memory** na V1
- Observabilidade desde o início:
  - logs estruturados
  - métricas básicas
  - tracing distribuído (Datadog)
- Documentação técnica e diagramas de arquitetura
- Testes unitários
- Arquitetura modular e organizada, preparada para evolução futura
- Organização do código seguindo boas práticas do NestJS

---

## Requisitos

### Requisitos Funcionais

- Criar uma nova mensagem
  - Sempre que uma mensagem for criada, ela deve ser persistida inicialmente com o status `enviado`.
- Buscar mensagem por ID
- Buscar mensagens por remetente
- Buscar mensagens por período
- Atualizar status de uma mensagem
  - Permitir apenas a transição sequencial de status de uma mensagem (`enviado` → `recebido` → `lido`)
- Garantir estados válidos para o status da mensagem, bloqueando transições inválidas ou regressões de status

---

### Requisitos Não Funcionais

- Código limpo, organizado e modular
- Separação clara de responsabilidades entre camadas
- Aderência às boas práticas do NestJS
- Facilidade de evolução da camada de persistência
- Observabilidade integrada desde o início
- Código testável e de fácil manutenção
- Documentação clara, objetiva e acessível
- API preparada para consumo por um front-end futuro

---

## Restrições

- Não haverá desenvolvimento de interface gráfica
- A comunicação será exclusivamente via API REST
- A persistência inicial será in-memory
- O projeto não depende de infraestrutura real da AWS para rodar localmente
- O uso de Datadog será preparado no código, mesmo que não esteja ativo no ambiente local

---

## Tecnologias Utilizadas

- Node.js
- NestJS
- TypeScript
- JWT para autenticação
- Datadog para observabilidade
- Jest para testes unitários
- Swagger para documentação da API
- Docker para containerização
- Docker Compose para orquestração de containers
- Git para controle de versão
- ESLint e Prettier para linting e formatação de código
- Insomnia para testes de API
- In-memory database (ex: Map ou Array) para persistência inicial
