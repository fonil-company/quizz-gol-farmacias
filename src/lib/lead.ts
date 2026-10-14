import { config, isDemoMode } from '../config';
import { labelFor } from '../data/quiz';
import type { Attribution, ChoiceAnswers, Contact, LeadPayload, Location } from '../types';
import { maskCnpj } from './cnpj';
import { onlyDigits } from './phone';
import { classifyLead } from './qualify';
import { campaignOrigin } from './tracking';

export function buildLeadPayload(
  answers: ChoiceAnswers,
  location: Location,
  contact: Contact,
  attribution: Attribution,
): LeadPayload {
  return {
    nome_completo: contact.nome_completo.trim(),
    nome_farmacia: contact.nome_farmacia.trim(),
    cnpj: onlyDigits(contact.cnpj),
    whatsapp: `55${onlyDigits(contact.whatsapp)}`,
    comercializa_chinelos: labelFor('comercializa_chinelos', answers.comercializa_chinelos),
    faixa_investimento: labelFor('faixa_investimento', answers.faixa_investimento),
    cidade: location.cidade.trim(),
    estado: location.estado,
    classificacao_lead: classifyLead(answers),
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    data_cadastro: new Date().toISOString(),
    origem_campanha: campaignOrigin(attribution),
    fbclid: attribution.fbclid,
    gclid: attribution.gclid,
    landing_page: attribution.landing_page,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envia o lead ao webhook. Retorna 'demo' quando não há webhook configurado.
 * Lança erro se todas as tentativas falharem, para a interface oferecer nova tentativa.
 */
export async function sendLead(payload: LeadPayload): Promise<'sent' | 'demo'> {
  if (isDemoMode) return 'demo';

  let lastError: unknown;
  for (let attempt = 1; attempt <= config.webhookAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.webhookTimeoutMs);
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (response.ok) return 'sent';
      lastError = new Error(`Webhook respondeu HTTP ${response.status}`);
      // Erros 4xx indicam problema de configuração: repetir não resolve
      if (response.status < 500) break;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < config.webhookAttempts) await wait(800);
  }
  throw lastError;
}

const WHATSAPP_MESSAGE =
  'Olá! Respondi ao quiz da GOL Distribuidora e gostaria de receber o catálogo de chinelos e sandálias para minha farmácia.';

/** Link do WhatsApp comercial com a mensagem e um resumo das respostas (sem a classificação interna). */
export function buildWhatsAppUrl(payload: LeadPayload): string | null {
  if (!config.whatsappNumber) return null;
  const summary = [
    `Nome: ${payload.nome_completo}`,
    `Farmácia: ${payload.nome_farmacia}`,
    `CNPJ: ${maskCnpj(payload.cnpj)}`,
    `Cidade: ${payload.cidade}/${payload.estado}`,
    `Já comercializa chinelos: ${payload.comercializa_chinelos}`,
    `Investimento no primeiro pedido: ${payload.faixa_investimento}`,
  ].join('\n');
  const text = `${WHATSAPP_MESSAGE}\n\n${summary}`;
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
