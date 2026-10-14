import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { UFS } from '../data/quiz';
import { cn } from '../lib/cn';
import type { Location } from '../types';
import { BackButton, Field, PrimaryButton, StepActions, StepHeader, inputClass } from './ui';

interface LocationStepProps {
  number: number;
  total: number;
  value: Location;
  onChange: (value: Location) => void;
  onNext: () => void;
  onBack: () => void;
}

function validate(value: Location) {
  return {
    cidade: value.cidade.trim().length < 2 ? 'Informe a cidade da farmácia.' : '',
    estado: !value.estado ? 'Selecione o estado.' : '',
  };
}

export function LocationStep({ number, total, value, onChange, onNext, onBack }: LocationStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(value);
  const show = (field: keyof Location) => (submitted ? errors[field] : '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.cidade) return document.getElementById('cidade')?.focus();
    if (errors.estado) return document.getElementById('estado')?.focus();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeader
        eyebrow={`Pergunta ${number} de ${total}`}
        title="Em qual cidade e estado sua farmácia está localizada?"
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <Field id="cidade" label="Cidade" error={show('cidade')}>
          <input
            id="cidade"
            type="text"
            autoComplete="address-level2"
            placeholder="Nome da cidade"
            value={value.cidade}
            onChange={(e) => onChange({ ...value, cidade: e.target.value })}
            aria-invalid={!!show('cidade')}
            aria-describedby={show('cidade') ? 'cidade-error' : undefined}
            className={inputClass(!!show('cidade'))}
          />
        </Field>
        <Field id="estado" label="Estado" error={show('estado')}>
          <div className="relative">
            <select
              id="estado"
              autoComplete="address-level1"
              value={value.estado}
              onChange={(e) => onChange({ ...value, estado: e.target.value })}
              aria-invalid={!!show('estado')}
              aria-describedby={show('estado') ? 'estado-error' : undefined}
              className={cn(inputClass(!!show('estado')), 'appearance-none pr-11', !value.estado && 'text-[#9aa0ae]')}
            >
              <option value="">Selecione</option>
              {UFS.map((uf) => (
                <option key={uf.sigla} value={uf.sigla} className="text-gol-ink">
                  {uf.nome} ({uf.sigla})
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              viewBox="0 0 12 8"
              className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2 text-gol-navy"
            >
              <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Field>
      </div>

      <StepActions>
        <BackButton onClick={onBack} />
        <PrimaryButton type="submit">
          Continuar
          <ArrowRight className="size-5" aria-hidden />
        </PrimaryButton>
      </StepActions>
    </form>
  );
}
