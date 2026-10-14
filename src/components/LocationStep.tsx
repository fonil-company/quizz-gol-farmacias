import { cloneElement, useState, type FormEvent, type ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { CIDADES, UFS, type Uf } from '../data/cidades';
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

const citiesOf = (estado: string): readonly string[] => CIDADES[estado as Uf] ?? [];

function validate(value: Location) {
  const cities = citiesOf(value.estado);
  return {
    estado: !cities.length ? 'Selecione o estado.' : '',
    cidade: !cities.includes(value.cidade) ? 'Selecione a cidade da farmácia.' : '',
  };
}

export function LocationStep({ number, total, value, onChange, onNext, onBack }: LocationStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(value);
  const show = (field: keyof Location) => (submitted ? errors[field] : '');
  const cities = citiesOf(value.estado);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.estado) return document.getElementById('estado')?.focus();
    if (errors.cidade) return document.getElementById('cidade')?.focus();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeader
        eyebrow={`Pergunta ${number} de ${total}`}
        title="Em qual estado e cidade sua farmácia está localizada?"
        description="Atendemos farmácias e drogarias do Maranhão e do Piauí."
      />

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <Field id="estado" label="Estado" error={show('estado')}>
          <SelectBox invalid={!!show('estado')} empty={!value.estado}>
            <select
              id="estado"
              autoComplete="address-level1"
              value={value.estado}
              // Trocar o estado limpa a cidade, que pertence à lista do estado anterior
              onChange={(e) => onChange({ estado: e.target.value, cidade: '' })}
              aria-invalid={!!show('estado')}
              aria-describedby={show('estado') ? 'estado-error' : undefined}
            >
              <option value="">Selecione</option>
              {UFS.map((uf) => (
                <option key={uf.sigla} value={uf.sigla} className="text-gol-ink">
                  {uf.nome} ({uf.sigla})
                </option>
              ))}
            </select>
          </SelectBox>
        </Field>
        <Field id="cidade" label="Cidade" error={show('cidade')}>
          <SelectBox invalid={!!show('cidade')} empty={!value.cidade}>
            <select
              id="cidade"
              autoComplete="address-level2"
              value={cities.includes(value.cidade) ? value.cidade : ''}
              onChange={(e) => onChange({ ...value, cidade: e.target.value })}
              disabled={!cities.length}
              aria-invalid={!!show('cidade')}
              aria-describedby={show('cidade') ? 'cidade-error' : undefined}
            >
              <option value="">{cities.length ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
              {cities.map((cidade) => (
                <option key={cidade} value={cidade} className="text-gol-ink">
                  {cidade}
                </option>
              ))}
            </select>
          </SelectBox>
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

/** Select nativo com a seta da marca (a lista nativa é a mais prática no celular). */
function SelectBox({ invalid, empty, children }: { invalid: boolean; empty: boolean; children: ReactElement<{ className?: string }> }) {
  return (
    <div className="relative">
      {cloneElement(children, {
        className: cn(inputClass(invalid), 'appearance-none pr-11 disabled:cursor-not-allowed disabled:opacity-60', empty && 'text-[#9aa0ae]'),
      })}
      <svg
        aria-hidden
        viewBox="0 0 12 8"
        className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2 text-gol-navy"
      >
        <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
