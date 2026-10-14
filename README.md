# Quiz GOL Distribuidora — Farmácias

Landing page em formato de quiz para captação de farmácias e drogarias interessadas no catálogo de chinelos e sandálias da GOL Distribuidora.

React + TypeScript + Tailwind CSS (Vite).

## Rodar localmente

Use Node.js 22 e npm 10 ou superior.

```bash
npm ci --include=dev --include=optional
npm run dev
```

## Build

```bash
npm run build   # gera a pasta dist/
```

Na Vercel ou Netlify: comando de build `npm run build`, pasta de saída `dist`.

## Deploy no EasyPanel

Selecione Nixpacks como método de build, com a raiz do repositório como diretório de build. O arquivo `nixpacks.toml` fixa o Node.js 22 e os comandos de instalação e build. O Nixpacks serve a pasta `dist` pelo Caddy configurado automaticamente; deixe o comando de início sem sobrescrita no painel.

Se houver `NIXPACKS_NODE_VERSION` nas variáveis do EasyPanel, use `22`. As dependências opcionais precisam ser instaladas, pois incluem os módulos nativos do Tailwind, Lightning CSS e Rollup para Linux.

Após atualizar o repositório conectado, execute um novo deploy. O plano de build deve indicar `nodejs_22` e a instalação deve executar `npm ci --include=dev --include=optional`.

## Configuração

As variáveis ficam em `.env.production` (ou nas variáveis de ambiente da hospedagem):

| Variável | Uso |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | WhatsApp do consultor (DDI + DDD + número, só dígitos) |
| `VITE_WEBHOOK_URL` | Endpoint que recebe o lead em JSON (CRM, Make, n8n...). Vazio = modo demonstração |
| `VITE_PRIVACY_URL` | Link da Política de Privacidade |

Toda variável `VITE_` fica visível no navegador: não coloque tokens ou senhas.

O webhook recebe um `POST` com `Content-Type: application/json` e precisa liberar CORS para o domínio da página.

### Campos enviados ao webhook

`nome_completo`, `nome_farmacia`, `cnpj`, `whatsapp`, `comercializa_chinelos`, `faixa_investimento`, `cidade`, `estado`, `classificacao_lead` (`prioritario` ou `acompanhamento`), `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `data_cadastro`, `origem_campanha`, `fbclid`, `gclid`, `landing_page`.

## Onde editar

- Perguntas e alternativas: `src/data/quiz.ts`
- Regra de classificação do lead: `src/lib/qualify.ts`
- Mensagem do WhatsApp e envio ao webhook: `src/lib/lead.ts`
