import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';
import type { Option, Question } from '../types';
import { BackButton, PrimaryButton, StepActions, StepHeader } from './ui';

interface QuestionStepProps {
  question: Question;
  number: number;
  total: number;
  value?: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuestionStep({ question, number, total, value, onChange, onNext, onBack }: QuestionStepProps) {
  const headingId = `q-${question.id}`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (value) onNext();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepHeader
        id={headingId}
        eyebrow={`Pergunta ${number} de ${total}`}
        title={question.title}
        description={question.helper}
      />

      <div role="radiogroup" aria-labelledby={headingId} className="grid gap-3">
        {question.options.map((option) => (
          <OptionCard
            key={option.value}
            name={question.id}
            option={option}
            selected={value === option.value}
            onSelect={onChange}
          />
        ))}
      </div>

      <StepActions>
        <BackButton onClick={onBack} />
        <PrimaryButton type="submit" disabled={!value} aria-describedby={!value ? `${headingId}-hint` : undefined}>
          Continuar
          <ArrowRight className="size-5" aria-hidden />
        </PrimaryButton>
      </StepActions>
      {!value && (
        <p id={`${headingId}-hint`} className="sr-only">
          Selecione uma alternativa para continuar.
        </p>
      )}
    </form>
  );
}

interface OptionCardProps {
  name: string;
  option: Option;
  selected: boolean;
  onSelect: (value: string) => void;
}

function OptionCard({ name, option, selected, onSelect }: OptionCardProps) {
  return (
    <label
      className={cn(
        'flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-4 transition-[border-color,background-color,box-shadow] duration-150',
        'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gol-navy/20',
        selected
          ? 'border-gol-navy bg-gol-selected shadow-[0_6px_18px_-12px_rgba(53,71,121,0.6)]'
          : 'border-gol-line bg-white hover:border-gol-line-strong',
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={selected}
        onChange={() => onSelect(option.value)}
        className="sr-only"
      />
      {/* Indicador no formato do "o" da logo: anel azul e centro laranja quando selecionado */}
      <span
        aria-hidden
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
          selected ? 'border-gol-navy bg-white' : 'border-gol-line-strong bg-white',
        )}
      >
        <span
          className={cn(
            'size-2.5 rounded-full bg-gol-orange transition-transform duration-150',
            selected ? 'scale-100' : 'scale-0',
          )}
        />
      </span>
      <span
        className={cn(
          'text-[15px] leading-snug sm:text-base',
          selected ? 'font-semibold text-gol-navy' : 'font-medium text-gol-ink',
        )}
      >
        {option.label}
      </span>
    </label>
  );
}
