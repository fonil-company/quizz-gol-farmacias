const env = import.meta.env;

export const config = {
  whatsappNumber: (env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, ''),
  webhookUrl: (env.VITE_WEBHOOK_URL ?? '').trim(),
  privacyUrl: (env.VITE_PRIVACY_URL ?? '').trim(),
  webhookTimeoutMs: 8000,
  webhookAttempts: 2,
};

/** Sem webhook configurado, nada é enviado ao CRM e a interface avisa isso. */
export const isDemoMode = !config.webhookUrl;
