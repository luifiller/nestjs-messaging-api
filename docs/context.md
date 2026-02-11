# 📩 Message Service API

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
- Atualiza`ção `e status da mensam (`enviado`, `recebido`, `lido`)
- Validações de entrada via DTOs
- Documentação técnica
- Testes unitários com Jest
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

---

### Requisitos diferenciais (não obrigatórios, mas desejáveis)

- [x] Autenticação usando JWT
- [x] Persistência de dados com DynamoDB
- [x] Observabilidade com Datadog ou Winston (logs, métricas e tracing)
  - Parcialmente atendido, pois a estratégia de logs com Winston não foi implementada devido ao tempo limitado (configurações específicas do Datadog no host pessoal), mas foi utilizado o `Logger` do `@nestjs/common` para mapeamento de casos de exceção.
- [x] Diagramas de arquitetura

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
- Garantir estados válidos para o status da mensagem, bloqueando transições inválidas

---

## Restrições

- Não haverá desenvolvimento de interface gráfica
- A comunicação será exclusivamente via API REST
- O projeto não depende de infraestrutura real da AWS (DynamoDB será simulado localmente)
- O uso de Datadog também é simulado localmente via Datadog Agent na minha máquina

---

## Requisitos de entrega de projeto

- [x] Repositório público no GitHub
- [x] README com instruções de execução e explicações sobre decisões técnicas
- [x] Criar um fluxograma da API no draw.io
- [x] Collection do Insomnia para teste da API
