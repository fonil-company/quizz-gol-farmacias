import { ArrowRight, PackageCheck, Store, Truck } from 'lucide-react';
import { PrimaryButton } from './ui';

const HIGHLIGHTS = [
  { icon: PackageCheck, label: 'Pronta entrega' },
  { icon: Truck, label: 'Frete incluso' },
  { icon: Store, label: 'Condições para lojistas' },
];

export function Welcome({ onStart, totalQuestions }: { onStart: () => void; totalQuestions: number }) {
  return (
    <section className="text-center" aria-labelledby="welcome-title">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-gol-mist px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide text-gol-navy">
        <span className="size-2 rounded-full bg-gol-orange" aria-hidden />
        Exclusivo para farmácias e drogarias
      </p>

      <h1
        id="welcome-title"
        tabIndex={-1}
        data-step-heading
        className="mx-auto max-w-[18ch] font-display text-[2rem] leading-[1.12] font-extrabold tracking-tight text-gol-navy outline-none sm:text-[2.9rem]"
      >
        Abasteça sua farmácia com chinelos e sandálias de marcas conhecidas!
      </h1>

      <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-gol-ink sm:text-lg">
        A GOL Distribuidora oferece opções de chinelos e sandálias para complementar o mix da sua farmácia, com pronta
        entrega, frete incluso e condições especiais para lojistas.
      </p>

      <ul className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-gol-line bg-white px-2 py-4 transition-colors hover:border-gol-line-strong"
          >
            <span className="grid size-11 place-items-center rounded-full bg-gol-navy text-white">
              <Icon className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="font-display text-[13px] leading-tight font-semibold text-gol-navy sm:text-sm">
              {label}
            </span>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-8 max-w-[40ch] text-[15px] leading-relaxed text-gol-muted">
        Responda algumas perguntas rápidas e conheça nossas condições de fornecimento.
      </p>

      <div className="mt-5">
        <PrimaryButton onClick={onStart}>
          Conhecer as condições
          <ArrowRight className="size-5" aria-hidden />
        </PrimaryButton>
        <p className="mt-3 text-[13px] text-gol-muted">{totalQuestions} perguntas rápidas</p>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-gol-muted">
        Frete incluso nas regiões atendidas. Produtos à pronta entrega, conforme disponibilidade.
      </p>
    </section>
  );
}
