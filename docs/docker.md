# Docker & Docker Compose - Guia de Uso

Este documento contém todas as instruções e comandos para construir, executar, gerenciar e parar os containers Docker do projeto.

---

## Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Arquitetura Docker](#arquitetura-docker)
- [Ambientes Disponíveis](#ambientes-disponíveis)
- [Principais Comandos](#principais-comandos)
  - [Executar Containers](#executar-containers)
  - [Parar Containers](#parar-containers)
- [Comandos Úteis](#comandos-úteis)
- [Referências](#referências)

---

## Visão Geral

O projeto utiliza **Docker** e **Docker Compose** para containerização da aplicação, garantindo consistência entre ambientes de desenvolvimento, staging e produção. A aplicação é construída usando multi-stage builds para otimização de tamanho e segurança.

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

### Dockerfile - Multi-Stage Build

O Dockerfile utiliza **multi-stage build** com dois estágios:

#### 1️⃣ **Builder Stage**

- Base: `node:20-alpine`
- Instala todas as dependências (incluindo devDependencies)
- Compila o código TypeScript para JavaScript
- Gera o diretório `dist/`

#### 2️⃣ **Production Stage**

- Base: `node:20-alpine`
- Instala apenas dependências de produção
- Copia o código compilado do estágio builder
- Executa como usuário não-root (`nestjs`) para segurança
- Expõe a porta 3000

### Benefícios do Multi-Stage Build

- **Imagem final menor**: apenas código compilado e dependências de produção
- **Mais segura**: sem dependências de desenvolvimento
- **Otimizada**: layers de cache eficientes
- **Reprodutível**: builds consistentes em qualquer ambiente

---

## Ambientes Disponíveis

O projeto possui **3 ambientes** configurados através de **profiles** no Docker Compose:

| Ambiente        | Profile       | Porta | NODE_ENV    | DD_ENV      |
| --------------- | ------------- | ----- | ----------- | ----------- |
| **Development** | `development` | 3000  | development | development |
| **Staging**     | `staging`     | 3001  | staging     | staging     |
| **Production**  | `production`  | 3002  | production  | production  |

### Variáveis de Ambiente

Cada ambiente configura:

- `NODE_ENV`: Ambiente da aplicação Node.js
- `DD_ENV`: Ambiente do Datadog (observabilidade)
- `DD_SERVICE`: Nome do serviço no Datadog
- `DD_AGENT_HOST`: Endereço do agente Datadog (aponta para host)

---

## Principais Comandos

### Executar Containers

Os scripts npm já incluem `--build` para garantir que a imagem está atualizada:

```bash
# Development
npm run docker:dev

# Staging
npm run docker:staging

# Production
npm run docker:prod
```

---

### Parar Containers

#### Forçar parada (CTRL+C no terminal em foreground)

Pressione `CTRL+C` uma vez para parada graceful, duas vezes para forçar.

---

## Comandos Úteis

### Gerenciamento de Imagens

```bash
# Listar imagens
docker images

# Remover imagem específica
docker rmi <image_id>

# Remover imagens não utilizadas
docker image prune
```

### Gerenciamento de Containers

```bash
# Listar todos containers (incluindo parados)
docker ps -a

# Remover container específico
docker rm <container_id>

# Remover todos containers parados
docker container prune
```

### Limpeza Geral

```bash
# Remover tudo não utilizado (containers, networks, imagens, build cache)
docker system prune -a

# Liberar espaço (com confirmação)
docker system prune -a --volumes
```

### Verificar Uso de Disco

```bash
docker system df
docker system df -v  # Verbose
```

---
