// Ponte para a API de Conversões da Meta e para o webhook do CRM. Tokens ficam somente aqui, no servidor.
// O Caddy encaminha /api/* para este processo (ver Caddyfile). Sem dependências: Node 22+.
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.CAPI_PORT || 3001);
const PIXEL_ID = (process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || '').trim();
const ACCESS_TOKEN = (process.env.META_ACCESS_TOKEN || '').trim();
const TEST_EVENT_CODE = (process.env.META_TEST_EVENT_CODE || '').trim();
const API_VERSION = process.env.META_API_VERSION || 'v23.0';
const LEAD_WEBHOOK_URL = (process.env.LEAD_WEBHOOK_URL || '').trim();

const ALLOWED_EVENTS = new Set(['PageView', 'QuizStart', 'Lead']);
const MAX_BODY_BYTES = 16 * 1024;

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const clean = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const digits = (value) => (typeof value === 'string' ? value.replace(/\D/g, '') : '');
/** Remove acentos, espaços e pontuação, como a Meta pede para nome e cidade. */
const plain = (value) => clean(value).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const hashed = (value) => (value ? [sha256(value)] : undefined);

function buildUserData(input, req) {
  const [firstName = '', ...rest] = clean(input.nome_completo).split(/\s+/).filter(Boolean);
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return {
    ph: hashed(digits(input.whatsapp)),
    fn: hashed(plain(firstName)),
    ln: hashed(plain(rest.at(-1) || '')),
    ct: hashed(plain(input.cidade)),
    st: hashed(plain(input.estado).slice(0, 2)),
    country: hashed('br'),
    external_id: hashed(digits(input.cnpj)),
    fbp: typeof input.fbp === 'string' ? input.fbp : undefined,
    fbc: typeof input.fbc === 'string' ? input.fbc : undefined,
    client_ip_address: forwarded || req.socket.remoteAddress,
    client_user_agent: req.headers['user-agent'],
  };
}

async function sendToMeta(body, req) {
  const event = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(body.event_id || '').slice(0, 100) || undefined,
    event_source_url: typeof body.event_source_url === 'string' ? body.event_source_url : undefined,
    action_source: 'website',
    user_data: buildUserData(body.user_data || {}, req),
    custom_data: body.custom_data && typeof body.custom_data === 'object' ? body.custom_data : undefined,
  };
  const payload = { data: [event], ...(TEST_EVENT_CODE && { test_event_code: TEST_EVENT_CODE }) };
  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Meta respondeu HTTP ${response.status}: ${await response.text()}`);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('corpo muito grande'));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

/** Repassa o lead ao webhook do CRM e devolve o status recebido, para o navegador decidir se tenta de novo. */
async function forwardLead(lead) {
  const response = await fetch(LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) console.error('[LEAD] webhook respondeu HTTP', response.status, await response.text());
  return response.status;
}

const reply = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    return reply(res, 200, { ok: true, configured: !!(PIXEL_ID && ACCESS_TOKEN), webhook: !!LEAD_WEBHOOK_URL });
  }
  if (req.method === 'POST' && req.url === '/api/lead') {
    if (!LEAD_WEBHOOK_URL) return reply(res, 503, { error: 'LEAD_WEBHOOK_URL ausente' });
    let lead;
    try {
      lead = await readJson(req);
    } catch {
      return reply(res, 400, { error: 'json inválido' });
    }
    try {
      const status = await forwardLead(lead);
      return reply(res, status >= 200 && status < 300 ? 200 : 502, { webhook_status: status });
    } catch (error) {
      console.error('[LEAD]', error.message);
      return reply(res, 504, { error: 'webhook indisponível' });
    }
  }
  if (req.method !== 'POST' || req.url !== '/api/meta-event') return reply(res, 404, { error: 'not found' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return reply(res, 400, { error: 'json inválido' });
  }
  if (!ALLOWED_EVENTS.has(body?.event_name)) return reply(res, 400, { error: 'evento não permitido' });
  if (!PIXEL_ID || !ACCESS_TOKEN) return reply(res, 202, { skipped: 'META_PIXEL_ID ou META_ACCESS_TOKEN ausente' });

  try {
    await sendToMeta(body, req);
    reply(res, 200, { ok: true });
  } catch (error) {
    console.error('[CAPI]', body.event_name, error.message);
    reply(res, 502, { error: 'falha ao enviar para a Meta' });
  }
}).listen(PORT, '127.0.0.1', () => {
  const status = PIXEL_ID && ACCESS_TOKEN ? `pixel ${PIXEL_ID}` : 'NÃO CONFIGURADO (defina META_PIXEL_ID e META_ACCESS_TOKEN)';
  console.log(`[CAPI] ouvindo em 127.0.0.1:${PORT} · ${status}${TEST_EVENT_CODE ? ` · teste ${TEST_EVENT_CODE}` : ''}`);
  console.log(`[LEAD] webhook ${LEAD_WEBHOOK_URL ? 'configurado' : 'NÃO CONFIGURADO (defina LEAD_WEBHOOK_URL)'}`);
});
