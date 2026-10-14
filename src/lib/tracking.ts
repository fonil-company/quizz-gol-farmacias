import { config } from '../config';
import type { Attribution } from '../types';
import { readSession, writeSession } from './storage';

const STORAGE_KEY = 'gol_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Lê UTMs e click IDs da URL. Mantém a primeira atribuição da sessão se a URL atual não trouxer nenhuma. */
export function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const hasCampaignParams = [...UTM_KEYS, 'fbclid', 'gclid'].some((key) => params.get(key));
  const stored = readSession<Attribution>(STORAGE_KEY);
  if (stored && !hasCampaignParams) return stored;

  const attribution: Attribution = {
    utm_source: params.get('utm_source') ?? '',
    utm_medium: params.get('utm_medium') ?? '',
    utm_campaign: params.get('utm_campaign') ?? '',
    utm_content: params.get('utm_content') ?? '',
    utm_term: params.get('utm_term') ?? '',
    fbclid: params.get('fbclid') ?? '',
    gclid: params.get('gclid') ?? '',
    referrer: document.referrer,
    landing_page: window.location.href,
  };
  writeSession(STORAGE_KEY, attribution);
  return attribution;
}

export function campaignOrigin(a: Attribution): string {
  if (a.utm_source) return [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(' / ');
  if (a.fbclid) return 'meta_ads';
  if (a.gclid) return 'google_ads';
  if (a.referrer) {
    try {
      return new URL(a.referrer).hostname;
    } catch {
      return a.referrer;
    }
  }
  return 'direto';
}

const PIXEL_EVENTS = new Set(['PageView', 'Lead']);
const CAPI_EVENTS = new Set(['PageView', 'QuizStart', 'Lead']);

/** Carrega o Meta Pixel quando VITE_META_PIXEL_ID está definido. O PageView é enviado por track(). */
export function initMetaPixel(): void {
  if (!config.metaPixelId || window.fbq) return;
  // Snippet oficial do Meta Pixel
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    b.head.appendChild(t);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq!('init', config.metaPixelId);
}

function readCookie(name: string): string {
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] ?? '';
}

/** _fbc vem do cookie do Pixel; sem ele, é montado a partir do fbclid da URL de entrada. */
function facebookClickId(): string {
  const cookie = readCookie('_fbc');
  if (cookie) return cookie;
  const fbclid = captureAttribution().fbclid;
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : '';
}

/** Envia o evento à API de Conversões pelo servidor da página (o token nunca chega ao navegador). */
function sendToConversionsApi(event: string, eventId: string, data: Record<string, unknown>, user: Record<string, string>) {
  const body = JSON.stringify({
    event_name: event,
    event_id: eventId,
    event_source_url: window.location.href,
    custom_data: data,
    user_data: { ...user, fbp: readCookie('_fbp') || undefined, fbc: facebookClickId() || undefined },
  });
  fetch(config.conversionsApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(
    () => {},
  );
}

/**
 * Dispara eventos para Google Tag Manager, Meta Pixel e API de Conversões.
 * Pixel e API recebem o mesmo eventID, e a Meta deduplica o evento.
 * `user` (dados do lead) segue só para o servidor, que aplica o hash SHA-256.
 */
export function track(event: string, data: Record<string, unknown> = {}, user: Record<string, string> = {}): void {
  try {
    const eventId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.dataLayer?.push({ event, event_id: eventId, ...data });
    if (window.fbq) {
      const method = PIXEL_EVENTS.has(event) ? 'track' : 'trackCustom';
      window.fbq(method, event, data, { eventID: eventId });
    }
    if (config.metaPixelId && CAPI_EVENTS.has(event)) sendToConversionsApi(event, eventId, data, user);
  } catch {
    /* rastreamento nunca deve quebrar o fluxo */
  }
}
