# Decisão de Infraestrutura: Docker e Docker Compose

---

## Índice

- [Decisão de Infraestrutura](#decisão-de-infraestrutura)
- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Arquitetura Docker](#arquitetura-docker)
  - [Multi-Stage Build](#multi-stage-build)
  - [Segurança](#segurança)
  - [Processo de Inicialização](#processo-de-inicialização)
- [Serviços e Dependências](#serviços-e-dependências)
  - [DynamoDB Local](#dynamodb-local)
  - [Networks](#networks)
  - [Volumes](#volumes)
- [Ambientes Disponíveis](#ambientes-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Principais Comandos](#principais-comandos)
- [Comandos Úteis](#comandos-úteis)
- [Troubleshooting](#troubleshooting)

---

## Decisão de Infraestrutura

Este projeto utiliza Docker e Docker Compose como estratégia de padronização de ambiente e paridade entre desenvolvimento, homologação e produção.

A decisão foi tomada para facilitar a minha vida na hora de subir a aplicação localmente e testar os ambientes no APM Datadog, e também me ajudou a economizar tempo e evitar dores de cabeça com setup de dependências, versões de Node, variáveis de ambiente.

Além disso, a abordagem prepara o terreno para uma futura orquestração em ambientes como ECS ou Kubernetes (EKS).

Como eu instalei o Datadog Agent na minha máquina host local Windows, então a execução dele acontece fora do container, sendo acessado via `host.docker.internal`. Assim, a observabilidade permanece ativa em todos ambientes.

### Por que Docker?

A decisão foi tomada para:

- **Facilitar o setup local**: Subir a aplicação sem configuração manual de dependências
- **Consistência entre ambientes**: builds reproduzíveis e controlados
- **Integração com Datadog**: Testar ambientes diferentes no APM
- **Economizar tempo**: Evitar dores de cabeça com versões de Node, variáveis de ambiente, etc.
- **Preparação para produção**: Base para orquestração futura (ECS, Kubernetes/EKS)

---

## Visão Geral

Em todos os ambientes (development, staging e production), a aplicação é executada a partir da **mesma imagem Docker**, garantindo consistência e reprodutibilidade do artefato.

A aplicação foi construída usando **multi-stage builds** para otimização de tamanho e segurança, com geração automática de chaves JWT e configuração de usuário não-root.

### Estrutura de Arquivos

```plaintext
├── Dockerfile              # Definição da imagem Docker (multi-stage build)
├── docker-compose.yml      # Orquestração dos serviços por ambiente
└── .dockerignore           # Arquivos ignorados no contexto de build
```

---

## Pré-requisitos

Certifique-se de ter instalado:

- **Docker**: versão 20.10 ou superior
- **Docker Compose**: versão 2.0 ou superior

### Verificar instalações

```bash
docker --version
docker compose version
```

---

## Arquitetura Docker

### Multi-Stage Build

O Dockerfile utiliza **multi-stage build** com dois estágios:

#### 1️⃣ **Builder Stage**

- Base: `node:20-alpine`
- Instala **todas as dependências** (incluindo devDependencies)
- Compila o código TypeScript para JavaScript
- Gera o diretório `dist/`

#### 2️⃣ **Production Stage**

- Base: `node:20-alpine`
- Instala **apenas dependências de produção**
- Copia o código compilado do estágio builder
- Copia scripts auxiliares (`scripts/` directory)
- Instala `curl` para healthcheck
- Gera chaves RSA JWT automaticamente
- Executa como usuário não-root (`nestjs:1001`) para maior segurança
- Expõe a porta **3000**

#### Benefícios do Multi-Stage Build

- **Imagem final menor**: apenas código compilado e dependências de produção
- **Mais segura**: sem dependências de desenvolvimento
- **Otimizada**: layers de cache eficientes
- **Reprodutível**: builds consistentes em qualquer ambiente

---

### Processo de Inicialização

O container usa um **entrypoint customizado** (`docker-entrypoint.sh`) que serve para:

- Garantir que o DynamoDB Local esteja pronto antes de iniciar a aplicação
- Executar o script `create-dynamodb-tables.js` para criar as tabelas necessárias no DynamoDB (se ainda não existirem)

---

### Networks

Todos os serviços rodam na mesma rede Docker:

```yaml
networks:
  messaging-network:
    driver: bridge
```

Isso permite:

- Comunicação entre containers pelo nome do serviço
- Isolamento da rede host

---

### Volumes

```yaml
volumes:
  dynamodb-data:
```

- **dynamodb-data**: Persiste os dados do DynamoDB Local entre restarts do container

---

## Ambientes Disponíveis

O projeto possui **3 ambientes** configurados através de **profiles** no Docker Compose:

| Ambiente        | Profile       | Porta | NODE_ENV    | DynamoDB Endpoint          | Serviços             |
| --------------- | ------------- | ----- | ----------- | -------------------------- | -------------------- |
| **Development** | `development` | 3000  | development | DynamoDB Local (port 8000) | app + dynamodb-local |
| **Staging**     | `staging`     | 3001  | staging     | AWS DynamoDB               | app                  |
| **Production**  | `production`  | 3002  | production  | AWS DynamoDB               | app                  |

---

## Variáveis de Ambiente

### Comuns a Todos os Ambientes

| Variável               | Descrição                       | Valor                          |
| ---------------------- | ------------------------------- | ------------------------------ |
| `NODE_ENV`             | Ambiente da aplicação Node.js   | development/staging/production |
| `DD_ENV`               | Ambiente do Datadog APM         | development/staging/production |
| `DD_SERVICE`           | Nome do serviço no Datadog      | nestjs-messaging-api           |
| `DD_AGENT_HOST`        | Endereço do agente Datadog      | host.docker.internal           |
| `JWT_EXPIRES_IN`       | Tempo de expiração do token JWT | 3600s                          |
| `JWT_PRIVATE_KEY_PATH` | Caminho da chave privada RSA    | ./certs/private.pem            |
| `JWT_PUBLIC_KEY_PATH`  | Caminho da chave pública RSA    | ./certs/public.pem             |
| `AWS_REGION`           | Região AWS                      | us-east-1                      |

---

## Principais Comandos

### Executar Containers

Os scripts npm já incluem `--build` para garantir que a imagem está atualizada:

```bash
# Development (porta 3000 + DynamoDB Local na 8000)
npm run docker:dev

# Staging (porta 3001)
npm run docker:staging

# Production (porta 3002)
npm run docker:prod
```

---

### Parar Containers

#### Forçar parada (CTRL+C no terminal em foreground)

Pressione `CTRL+C` uma vez para parada graceful, duas vezes para forçar.

Ou basta executar o comando:

```bash
docker-compose down -v
```

---
