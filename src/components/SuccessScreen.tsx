import { useEffect } from 'react';
import { Info, MessageCircle } from 'lucide-react';
import type { SubmitResult } from '../types';
import { BrandMark } from './ui';

interface SuccessScreenProps {
  result: SubmitResult;
  whatsappUrl: string | null;
}

const COPY: Record<SubmitResult, { title: string; text: string }> = {
  sent: {
    title: 'Recebemos seus dados!',
    text: 'Agora é só continuar no WhatsApp para receber o catálogo e conversar com um consultor comercial.',
  },
  unsent: {
    title: 'Continue pelo WhatsApp',
    text: 'Suas respostas já vão na mensagem. É só enviar para receber o catálogo e conversar com um consultor comercial.',
  },
  demo: {
    title: 'Quiz concluído',
    text: 'Continue no WhatsApp para receber o catálogo e conversar com um consultor comercial.',
  },
};

export function SuccessScreen({ result, whatsappUrl }: SuccessScreenProps) {
  const { title, text } = COPY[result];

  // Com o lead confirmado no CRM, abre o WhatsApp automaticamente
  useEffect(() => {
    if (result !== 'sent' || !whatsappUrl) return;
    const timer = setTimeout(() => window.location.assign(whatsappUrl), 1800);
    return () => clearTimeout(timer);
  }, [result, whatsappUrl]);

  return (
    <section className="pt-6 text-center" aria-live="polite">
      <BrandMark className="mx-auto mb-7 size-20" />
      <h1
        tabIndex={-1}
        data-step-heading
        className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-gol-navy outline-none sm:text-[2.1rem]"
      >
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-[40ch] text-base leading-relaxed text-gol-ink">{text}</p>

      {result === 'demo' && (
        <div className="mx-auto mt-6 flex max-w-md gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left text-sm leading-relaxed text-amber-900">
          <Info className="mt-0.5 size-[18px] shrink-0" aria-hidden />
          <p>
            <strong className="font-semibold">Modo demonstração:</strong> nenhum webhook de CRM está configurado, então
            os dados <strong className="font-semibold">não foram enviados</strong>. Defina{' '}
            <code className="rounded bg-amber-100 px-1">VITE_WEBHOOK_URL</code> para ativar o envio.
          </p>
        </div>
      )}

      <div className="mx-auto mt-8 max-w-md">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-gol-orange px-6 py-4 font-display text-[15px] font-bold tracking-wide text-white uppercase shadow-[0_10px_24px_-10px_rgba(245,141,67,0.75)] transition-colors hover:bg-gol-orange-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gol-orange/40"
          >
            <MessageCircle className="size-5" aria-hidden />
            Abrir WhatsApp
          </a>
        ) : (
          <p className="rounded-2xl border border-gol-line bg-gol-mist p-4 text-sm text-gol-muted">
            O número do WhatsApp comercial ainda não foi configurado (
            <code className="rounded bg-white px-1">VITE_WHATSAPP_NUMBER</code>).
          </p>
        )}
        {result === 'sent' && whatsappUrl && (
          <p className="mt-3 text-[13px] text-gol-muted">Abrindo o WhatsApp automaticamente...</p>
        )}
      </div>
    </section>
  );
}
