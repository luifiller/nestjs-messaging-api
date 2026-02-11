# Datadog - Observabilidade e APM

---

![Exemplo de trace no Datadog APM](./assets/datadog-apm-usage.gif)

---

## 📊 Visão Geral

## Este projeto utiliza o **Datadog APM** (Application Performance Monitoring) para monitoramento, tracing distribuído e análise de performance da aplicação.

---

## 🔧 Configuração

### Variáveis de Ambiente

As seguintes variáveis de ambiente devem ser configuradas no arquivo `.env`:

```dotenv
# Datadog Configuration
DD_SERVICE=nestjs-messaging-api      # Nome do serviço no Datadog
DD_VERSION=1.0.0                     # Versão da aplicação
DD_ENV=local                         # Ambiente (local/development/staging/production)
DD_AGENT_HOST=localhost              # Host do Datadog Agent
DD_TRACE_ENABLED=true                # Habilita/desabilita tracing
DD_LOGS_INJECTION=true               # Injeta trace IDs nos logs
```

### Ambientes

| Ambiente    | DD_ENV        | Uso                         |
| ----------- | ------------- | --------------------------- |
| Local       | `local`       | Desenvolvimento local       |
| Development | `development` | Ambiente de desenvolvimento |
| Staging     | `staging`     | Ambiente de homologação     |
| Production  | `production`  | Ambiente de produção        |

---

## 🚀 Implementação

### 1. Inicialização do Tracer

O tracer do Datadog é inicializado **antes de qualquer outro import** no [main.ts](../src/main.ts#L1):

#### Recursos habilitados no ([dd-tracing.ts](../src/infrastructure/observability/datadog/dd-tracing.ts))

- **Log Injection**: IDs de traces são injetados nos logs para correlação
- **Runtime Metrics**: Coleta métricas do Node.js (CPU, memória, event loop)
- **Instrumentação Automática**: Captura automaticamente traces de HTTP, banco de dados, etc.

---

### 2. Rastreamento de Usuários Autenticados

O [DatadogUserInterceptor](../src/infrastructure/observability/datadog/interceptor/datadog-user.interceptor.ts) é aplicado globalmente para associar usuários autenticados aos traces, assim, todo trace gerado por uma requisição autenticada terá tags com informações do usuário.

#### Recursos habilitados:

- **Identifica usuários**: Extrai informações do usuário autenticado (via Guards)
- **Adiciona tags customizadas**: `user.id` e `user.username` nos spans
- **Correlação**: Permite filtrar traces por usuário específico no Datadog

---

## Visualizando no APM

### 1. Acesse o Datadog APM

- URL: `https://app.datadoghq.com/apm/entity/service%3Anestjs-messaging-api`

### 2. Filtros Úteis

- **Por ambiente**: `env:local`
- **Por usuário**: `@user.id:123` ou `@user.username:luifiller`
- **Por endpoint**: `resource_name:/api/v1/messages`
- **Por status**: `status:error`

### 3. Métricas Disponíveis

- **Latência**: Tempo de resposta das requisições
- **Throughput**: Taxa de requisições por segundo
- **Error Rate**: Taxa de erros
- **Memory/CPU**: Métricas de runtime do Node.js
- **Request Flow**: Fluxo completo de requests através dos serviços

---
