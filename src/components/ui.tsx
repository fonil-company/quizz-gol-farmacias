import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
}

export function PrimaryButton({
  loading,
  loadingLabel = 'Enviando...',
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-gol-orange px-6 py-4',
        'font-display text-[15px] font-bold uppercase tracking-wide text-white',
        'shadow-[0_10px_24px_-10px_rgba(245,141,67,0.75)] transition-[background-color,transform,box-shadow] duration-200',
        'hover:bg-gol-orange-dark active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gol-orange/40',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:active:scale-100',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="size-5 animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-14 shrink-0 items-center gap-1.5 rounded-xl px-4 font-display text-[15px] font-semibold text-gol-navy transition-colors hover:bg-gol-mist focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gol-navy/20"
    >
      <ArrowLeft className="size-[18px]" aria-hidden />
      Voltar
    </button>
  );
}

/** Barra de ações: fixa no rodapé em telas pequenas, para o botão ficar sempre ao alcance do polegar. */
export function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center gap-2 border-t border-gol-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      {children}
    </div>
  );
}

interface StepHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  id?: string;
}

export function StepHeader({ eyebrow, title, description, id }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-display text-[13px] font-semibold tracking-wide text-gol-orange-dark">{eyebrow}</p>
      <h1
        id={id}
        tabIndex={-1}
        data-step-heading
        className="font-display text-[1.6rem] leading-[1.2] font-bold tracking-tight text-gol-navy outline-none sm:text-[2rem]"
      >
        {title}
      </h1>
      {description && <div className="mt-3 text-[15px] leading-relaxed text-gol-muted sm:text-base">{description}</div>}
    </div>
  );
}

export function inputClass(invalid: boolean) {
  return cn(
    'block w-full rounded-xl border-2 bg-white px-4 py-3.5 text-base text-gol-ink transition-colors',
    'placeholder:text-[#9aa0ae] focus:outline-none focus:ring-4',
    invalid
      ? 'border-gol-error focus:border-gol-error focus:ring-gol-error/10'
      : 'border-gol-line hover:border-gol-line-strong focus:border-gol-navy focus:ring-gol-navy/10',
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-sm font-semibold text-gol-navy">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-gol-error">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** Símbolo derivado do "o" da logo: anel azul com núcleo laranja. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#354779" strokeWidth="12" />
      <circle cx="32" cy="32" r="8" fill="#F58D43" />
    </svg>
  );
}
