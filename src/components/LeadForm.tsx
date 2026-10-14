import { useState, type FormEvent } from 'react';
import { AlertTriangle, Check, MessageCircle, RotateCw } from 'lucide-react';
import { config } from '../config';
import { isValidCnpj, maskCnpj } from '../lib/cnpj';
import { isValidPhone, maskPhone } from '../lib/phone';
import type { Contact } from '../types';
import { BackButton, Field, PrimaryButton, StepActions, StepHeader, inputClass } from './ui';

const CONDITIONS = [
  'Pedido mínimo de R$ 1.050.',
  'Frete incluso nas regiões atendidas.',
  'Produtos à pronta entrega, conforme disponibilidade.',
  'Pagamento por boleto mediante análise.',
  'Garantia de troca em até 7 dias, conforme condições comerciais.',
];

type FieldName = keyof Contact;

function validate(contact: Contact): Record<FieldName, string> {
  const words = contact.nome_completo.trim().split(/\s+/).filter((w) => w.length > 1);
  return {
    nome_completo: words.length < 2 ? 'Informe seu nome e sobrenome.' : '',
    nome_farmacia: contact.nome_farmacia.trim().length < 2 ? 'Informe o nome da farmácia.' : '',
    cnpj: !contact.cnpj.trim()
      ? 'Informe o CNPJ da farmácia.'
      : !isValidCnpj(contact.cnpj)
        ? 'CNPJ inválido. Confira os números.'
        : '',
    whatsapp: !isValidPhone(contact.whatsapp) ? 'Informe um WhatsApp válido com DDD.' : '',
  };
}

interface LeadFormProps {
  value: Contact;
  onChange: (value: Contact) => void;
  onSubmit: () => void;
  onBack: () => void;
  sending: boolean;
  failed: boolean;
  canContinueWithoutCrm: boolean;
  onContinueWithoutCrm: () => void;
}

export function LeadForm({
  value,
  onChange,
  onSubmit,
  onBack,
  sending,
  failed,
  canContinueWithoutCrm,
  onContinueWithoutCrm,
}: LeadFormProps) {
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(value);
  const show = (field: FieldName) => (submitted || touched[field] ? errors[field] : '');
  const blur = (field: FieldName) => () => setTouched((t) => ({ ...t, [field]: true }));
  const set = (field: FieldName, v: string) => onChange({ ...value, [field]: v });
  const describedBy = (field: FieldName) => (show(field) ? `${field}-error` : undefined);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = (Object.keys(errors) as FieldName[]).find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeader
        eyebrow="Última etapa"
        title="Sua farmácia pode contar com a GOL para ampliar o mix de produtos!"
        description="Conheça nosso catálogo de chinelos e sandálias e confira as condições de fornecimento disponíveis para sua farmácia."
      />

      <section
        aria-labelledby="conditions-title"
        className="relative overflow-hidden rounded-2xl bg-gol-navy p-5 text-white sm:p-6"
      >
        {/* Anel no vocabulário da logo, bem sutil */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-14 -right-14 size-40 rounded-full border-[26px] border-white/[0.06]"
        />
        <h2 id="conditions-title" className="relative mb-4 font-display text-base font-semibold">
          Condições comerciais
        </h2>
        <ul className="relative grid gap-3">
          {CONDITIONS.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-snug text-white/90">
              <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-gol-orange">
                <Check className="size-3 text-white" strokeWidth={3.5} aria-hidden />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-7 mb-4 font-display text-[15px] font-semibold text-gol-navy">
        Preencha seus dados para receber nosso catálogo.
      </p>

      <div className="grid gap-4">
        <Field id="nome_completo" label="Nome completo" error={show('nome_completo')}>
          <input
            id="nome_completo"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Seu nome e sobrenome"
            value={value.nome_completo}
            onChange={(e) => set('nome_completo', e.target.value)}
            onBlur={blur('nome_completo')}
            aria-invalid={!!show('nome_completo')}
            aria-describedby={describedBy('nome_completo')}
            className={inputClass(!!show('nome_completo'))}
          />
        </Field>
        <Field id="nome_farmacia" label="Nome da farmácia" error={show('nome_farmacia')}>
          <input
            id="nome_farmacia"
            type="text"
            autoComplete="organization"
            placeholder="Como sua farmácia se chama"
            value={value.nome_farmacia}
            onChange={(e) => set('nome_farmacia', e.target.value)}
            onBlur={blur('nome_farmacia')}
            aria-invalid={!!show('nome_farmacia')}
            aria-describedby={describedBy('nome_farmacia')}
            className={inputClass(!!show('nome_farmacia'))}
          />
        </Field>
        <Field id="cnpj" label="CNPJ da farmácia" error={show('cnpj')}>
          <input
            id="cnpj"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00.000.000/0000-00"
            maxLength={18}
            value={value.cnpj}
            onChange={(e) => set('cnpj', maskCnpj(e.target.value))}
            onBlur={blur('cnpj')}
            aria-invalid={!!show('cnpj')}
            aria-describedby={describedBy('cnpj')}
            className={inputClass(!!show('cnpj'))}
          />
        </Field>
        <Field id="whatsapp" label="WhatsApp com DDD" error={show('whatsapp')}>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={value.whatsapp}
            onChange={(e) => set('whatsapp', maskPhone(e.target.value))}
            onBlur={blur('whatsapp')}
            aria-invalid={!!show('whatsapp')}
            aria-describedby={describedBy('whatsapp')}
            className={inputClass(!!show('whatsapp'))}
          />
        </Field>
      </div>

      {failed && (
        <div role="alert" className="mt-6 rounded-2xl border border-gol-error/30 bg-[#fdf3f3] p-4">
          <p className="flex gap-2.5 text-sm leading-relaxed text-gol-ink">
            <AlertTriangle className="mt-0.5 size-[18px] shrink-0 text-gol-error" aria-hidden />
            <span>
              <strong className="font-semibold">Não conseguimos registrar seus dados agora.</strong> Verifique sua
              conexão e tente novamente
              {canContinueWithoutCrm && ', ou fale direto com a nossa equipe pelo WhatsApp'}.
            </span>
          </p>
          {canContinueWithoutCrm && (
            <button
              type="button"
              onClick={onContinueWithoutCrm}
              className="mt-3 inline-flex items-center gap-2 rounded-lg px-1 py-1 font-display text-sm font-semibold text-gol-navy underline underline-offset-4 hover:text-gol-navy-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gol-navy/20"
            >
              <MessageCircle className="size-4" aria-hidden />
              Falar direto pelo WhatsApp
            </button>
          )}
        </div>
      )}

      <StepActions>
        <BackButton onClick={onBack} />
        <PrimaryButton type="submit" loading={sending} loadingLabel="Enviando">
          {failed ? (
            <>
              <RotateCw className="size-5" aria-hidden />
              Tentar novamente
            </>
          ) : (
            <>
              <MessageCircle className="size-5 shrink-0" aria-hidden />
              <span className="leading-tight">Receber catálogo no WhatsApp</span>
            </>
          )}
        </PrimaryButton>
      </StepActions>

      <p className="mt-4 text-center text-xs leading-relaxed text-gol-muted">
        Ao enviar, você autoriza a GOL Distribuidora a entrar em contato com informações comerciais e a tratar seus
        dados pessoais para essa finalidade
        {config.privacyUrl ? (
          <>
            , conforme a{' '}
            <a
              href={config.privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gol-navy underline underline-offset-2"
            >
              Política de Privacidade
            </a>
            .
          </>
        ) : (
          '.'
        )}
      </p>
    </form>
  );
}
