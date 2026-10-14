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

/** Dispara eventos para Google Tag Manager e Meta Pixel, se estiverem instalados na página. */
export function track(event: string, data: Record<string, unknown> = {}): void {
  try {
    window.dataLayer?.push({ event, ...data });
    if (window.fbq) {
      if (event === 'Lead') window.fbq('track', 'Lead', data);
      else window.fbq('trackCustom', event, data);
    }
  } catch {
    /* rastreamento nunca deve quebrar o fluxo */
  }
}
