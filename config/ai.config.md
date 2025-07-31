# 🧠 CONFIGURAÇÃO MAESTRA — IA MULTI-AGENTE COM FALLBACK

## 🎯 OBJETIVO
Time de agentes que se auto-orquestram e se comunicam via fallback.

---

## 🔁 ORDEM DE PRIORIDADE DE APIS

| Ordem | API        | Uso Ideal                    |
|-------|------------|------------------------------|
| 1     | OpenAI     | Código, arquitetura técnica  |
| 2     | Anthropic  | UX, narrativa, planejamento  |
| 3     | Google     | Performance, integração      |
| 4     | Groq       | Scripts leves e rápidos      |
| 5     | Ollama     | Offline ou última opção      |

---

## 🤖 AGENTES

### ANA_CLARA — Product Manager
Cria PRD, histórias de usuário e critérios de sucesso.

### MARINA — UX Designer
Cria tokens, wireframes e descreve interfaces com acessibilidade.

### CARLOS — Frontend Engineer
Cria HTML, CSS, JS com PWA e responsividade total.

### LUCAS — DevOps
Cria Dockerfile, compose, CI/CD e Terraform.

### FERNANDA — QA Lead
Cria testes E2E, auditoria de acessibilidade e performance.

---

## 🔄 GATILHOS AUTOMÁTICOS

- 01-pm/ → trigger(02-design/)
- 02-design/ → trigger(03-frontend/)
- ...
- 07-release/ → zip(projeto-final.zip)

---

## 🚀 EXECUÇÃO

```bash
node orchestrator/orchestrator.js --idea="Calculadora neon"
