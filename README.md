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

Selecione Nixpacks como método de build, com a raiz do repositório como diretório de build. O arquivo `nixpacks.toml` fixa o Node.js 22, os comandos de instalação e build e a inicialização do servidor da API de Conversões junto com o Caddy. Deixe o comando de início sem sobrescrita no painel para usar o comando definido nesse arquivo.

O `Caddyfile` serve exclusivamente `/app/dist`, na porta definida por `PORT` (padrão: `3000`). O domínio no EasyPanel deve encaminhar para essa porta. A página publicada deve carregar arquivos `.js` de `/assets/`; uma tentativa de carregar `/src/main.tsx` indica que o servidor está apontando para a raiz do projeto.

Se houver `NIXPACKS_NODE_VERSION` nas variáveis do EasyPanel, use `22`. As dependências opcionais precisam ser instaladas, pois incluem os módulos nativos do Tailwind, Lightning CSS e Rollup para Linux.

Após atualizar o repositório conectado, execute um novo deploy. O plano de build deve indicar `nodejs_22` e a instalação deve executar `npm ci --include=dev --include=optional`.

## Configuração

As variáveis ficam em `.env.production` (ou nas variáveis de ambiente da hospedagem):

| Variável | Uso |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | WhatsApp do consultor (DDI + DDD + número, só dígitos) |
| `VITE_WEBHOOK_URL` | Endpoint que recebe o lead em JSON (CRM, Make, n8n...). Vazio = modo demonstração |
| `VITE_PRIVACY_URL` | Link da Política de Privacidade |
| `VITE_META_PIXEL_ID` | ID do Meta Pixel. Ativa o Pixel e a API de Conversões |

Toda variável `VITE_` fica visível no navegador: não coloque tokens ou senhas.

O webhook recebe um `POST` com `Content-Type: application/json` e precisa liberar CORS para o domínio da página.

### Campos enviados ao webhook

`nome_completo`, `nome_farmacia`, `cnpj`, `whatsapp`, `comercializa_chinelos`, `faixa_investimento`, `cidade`, `estado`, `classificacao_lead` (`prioritario` ou `acompanhamento`), `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `data_cadastro`, `origem_campanha`, `fbclid`, `gclid`, `landing_page`.

## Meta Pixel e API de Conversões

Com `VITE_META_PIXEL_ID` preenchido, o navegador carrega o Pixel. Em produção, o servidor também lê esse ID de `.env.production`; `META_PIXEL_ID` ou `VITE_META_PIXEL_ID` no ambiente do EasyPanel podem sobrescrevê-lo. Os eventos `PageView`, `QuizStart` e `Lead` também são enviados a `/api/meta-event`. Essa rota é atendida por `server/capi.mjs`, que repassa os eventos à API de Conversões com o token guardado no servidor. Pixel e servidor usam o mesmo `event_id`, e a Meta deduplica o evento. No `Lead`, telefone, nome, cidade, estado e CNPJ (como `external_id`) seguem com hash SHA-256 aplicado no servidor.

Variáveis só do servidor, cadastradas em Environment no EasyPanel e nunca no repositório:

| Variável | Uso |
| --- | --- |
| `META_ACCESS_TOKEN` | Token da API de Conversões (obrigatório) |
| `META_TEST_EVENT_CODE` | Opcional: código de "Testar eventos". Remova depois de validar |

Localmente, rode `npm run capi` (lê o `.env`) junto com `npm run dev`; o Vite encaminha `/api` para a porta 3001. Use `GET /api/health` para conferir se o servidor está configurado.

## Onde editar

- Perguntas e alternativas: `src/data/quiz.ts`
- Regra de classificação do lead: `src/lib/qualify.ts`
- Mensagem do WhatsApp e envio ao webhook: `src/lib/lead.ts`
