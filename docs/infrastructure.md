# Decisão de Infraestrutura: Docker e Docker Compose

Este projeto utiliza Docker e Docker Compose como estratégia de padronização de ambiente e paridade entre desenvolvimento, homologação e produção.

A decisão foi tomada para facilitar a minha vida na hora de subir a aplicação localmente e testar os ambientes no APM Datadog, e também me ajudou a economizar tempo e evitar dores de cabeça com setup de dependências, versões de Node, variáveis de ambiente.

Além disso, a abordagem prepara o terreno para uma futura orquestração em ambientes como ECS ou Kubernetes (EKS).

---

## Ambientes

Em todos os ambientes (development, staging e production), a aplicação é executada a partir da mesma imagem Docker, garantindo consistência e repodutibilidade do artefato.

Assim, com o Docker Compose, é possível:

- Subir a aplicação de forma isolada
- Injetar variáveis de ambiente via `process.env` e `environment`
- Segmentar ambientes de forma clara (inclusive para o Datadog)
- Facilitar testes locais sem dependência de setup manual
- Garantir paridade com ambientes superiores

Como eu instalei o Datadog Agent na minha máquina host local Windows, então a execução dele acontece fora do container, sendo acessado via `host.docker.internal`. Assim, a observabilidade permanece ativa em todos ambientes.

### Benefícios da abordagem

- Ganho de tempo e redução de desgaste com setup manual
- Consistência total entre ambientes
- Builds reproduzíveis
- Menor risco de “funciona na minha máquina”
- Facilidade de observabilidade e troubleshooting
- Base preparada para orquestração futura de container ou clusteres (ECS, Kubernetes, etc.)

---

### Trade-offs

- Overhead inicial maior comparado à execução direta via Node.js
- Tive que reaprender a lidar com containers e Docker Compose
