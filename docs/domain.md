# Descrição do Domínio

## Visão Geral

O domínio deste projeto é o gerenciamento de mensagens em um contexto de comunicação estruturada, no qual as mensagens precisam ser registradas, rastreadas e acompanhadas ao longo do seu ciclo de vida.

Cada mensagem representa uma comunicação enviada por um remetente, contendo um conteúdo textual, que passa por diferentes estados até ser considerada lida. O sistema é responsável por persistir essas mensagens, permitir sua consulta por diferentes critérios e controlar de forma explícita a evolução do seu estado, garantindo consistência e rastreabilidade.

---

## Exemplo de Fluxo de Mensagem

1. O remetente cria uma nova mensagem com o conteúdo e a data de envio.
2. A mensagem é persistida com o status `enviado`.
3. Algum consumidor processa a mensagem e atualiza seu status para `recebido`.
4. Um consumidor lê a mensagem, e o status é atualizado para `lido`.
5. O sistema permite consultas para verificar o status da mensagem, buscar mensagens por remetente ou por período.

---

## Entidade

### Mensagem

Representa a unidade de comunicação persistida no sistema.

- **ID**: Identificador único da mensagem. Permite rastrear a mensagem ao longo do seu ciclo de vida.
- **Remetente**: Identifica quem enviou a mensagem. Pode ser um nome.
- **Conteúdo**: O texto da mensagem. Deve ser validado para garantir que não esteja vazio.
- **Data de Envio**: A data e hora em que a mensagem foi criada. Deve ser registrada para permitir consultas por período.
- **Status**: O estado atual da mensagem, que pode ser apenas 1 desses por vez: `enviado`, `recebido` ou `lido`.

---

### Status

Representa o estado atual da mensagem no seu ciclo de vida.

- O status `enviado` é o estado inicial de uma mensagem.
- O status `recebido` indica que a mensagem foi processada, mas ainda não lida.
- O status `lido` indica que a mensagem foi lida por um consumidor.
