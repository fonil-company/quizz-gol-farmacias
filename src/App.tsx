import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { LeadForm } from './components/LeadForm';
import { LocationStep } from './components/LocationStep';
import { QuestionStep } from './components/QuestionStep';
import { SuccessScreen } from './components/SuccessScreen';
import { Welcome } from './components/Welcome';
import { config, isDemoMode } from './config';
import { QUESTIONS } from './data/quiz';
import { buildLeadPayload, buildWhatsAppUrl, sendLead } from './lib/lead';
import { readSession, removeSession, writeSession } from './lib/storage';
import { captureAttribution, track } from './lib/tracking';
import type { ChoiceAnswers, Contact, LeadPayload, Location, QuestionId, SubmitResult } from './types';

// Etapas: 0 boas-vindas · 1..2 perguntas · 3 localização · 4 captura · 5 conclusão
const WELCOME = 0;
const LOCATION = QUESTIONS.length + 1;
const LEAD = LOCATION + 1;
const DONE = LEAD + 1;
const TOTAL_QUESTIONS = QUESTIONS.length + 1;

const DRAFT_KEY = 'gol_farmacia_quiz';

interface Draft {
  step: number;
  answers: ChoiceAnswers;
  location: Location;
  contact: Contact;
}

const emptyDraft: Draft = {
  step: WELCOME,
  answers: {},
  location: { cidade: '', estado: '' },
  contact: { nome_completo: '', nome_farmacia: '', cnpj: '', whatsapp: '' },
};

export default function App() {
  const [attribution] = useState(captureAttribution);
  const [draft, setDraft] = useState<Draft>(() => {
    const saved = readSession<Partial<Draft>>(DRAFT_KEY);
    // Mescla campo a campo, para rascunhos antigos sem algum campo novo não quebrarem o formulário
    return {
      ...emptyDraft,
      ...saved,
      location: { ...emptyDraft.location, ...saved?.location },
      contact: { ...emptyDraft.contact, ...saved?.contact },
    };
  });
  // Se a página recarregar no meio do quiz, retoma na mesma etapa (nunca na conclusão)
  const [step, setStep] = useState(() => (draft.step > WELCOME && draft.step < DONE ? draft.step : WELCOME));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<SubmitResult>('demo');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const payloadRef = useRef<LeadPayload | null>(null);
  const isFirstRender = useRef(true);

  // Preserva as respostas se a página for recarregada no meio do quiz
  useEffect(() => {
    if (step !== DONE) writeSession(DRAFT_KEY, { ...draft, step });
  }, [draft, step]);

  // A cada etapa: volta ao topo e move o foco para o título (leitores de tela anunciam a nova pergunta)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>('[data-step-heading]')?.focus({ preventScroll: true });
    track('QuizStep', { step });
  }, [step]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  const setAnswer = (id: QuestionId, value: string) =>
    setDraft((d) => ({ ...d, answers: { ...d.answers, [id]: value } }));

  function start() {
    track('QuizStart');
    goTo(1);
  }

  function finish(outcome: SubmitResult, payload: LeadPayload) {
    setResult(outcome);
    setWhatsappUrl(buildWhatsAppUrl(payload));
    removeSession(DRAFT_KEY);
    goTo(DONE);
  }

  async function submitLead() {
    const payload = buildLeadPayload(draft.answers, draft.location, draft.contact, attribution);
    payloadRef.current = payload;
    setSending(true);
    setFailed(false);
    try {
      const outcome = await sendLead(payload);
      track(
        'Lead',
        {
          comercializa_chinelos: payload.comercializa_chinelos,
          faixa_investimento: payload.faixa_investimento,
          classificacao_lead: payload.classificacao_lead,
        },
        {
          nome_completo: payload.nome_completo,
          whatsapp: payload.whatsapp,
          cnpj: payload.cnpj,
          cidade: payload.cidade,
          estado: payload.estado,
        },
      );
      finish(outcome, payload);
    } catch (error) {
      console.error('[GOL Quiz] Falha ao enviar lead ao webhook:', error);
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function continueWithoutCrm() {
    if (!payloadRef.current) return;
    track('LeadWebhookFailed', { classificacao_lead: payloadRef.current.classificacao_lead });
    finish('unsent', payloadRef.current);
  }

  // Q1 → 25%, Q2 → 50%, Q3 → 75%, captura → 100%
  const progress = step === WELCOME ? null : (Math.min(step, LEAD) / LEAD) * 100;

  function renderStep() {
    if (step === WELCOME) return <Welcome onStart={start} totalQuestions={TOTAL_QUESTIONS} />;

    if (step <= QUESTIONS.length) {
      const question = QUESTIONS[step - 1];
      return (
        <QuestionStep
          question={question}
          number={step}
          total={TOTAL_QUESTIONS}
          value={draft.answers[question.id]}
          onChange={(value) => setAnswer(question.id, value)}
          onNext={() => goTo(step + 1)}
          onBack={() => goTo(step - 1)}
        />
      );
    }

    if (step === LOCATION) {
      return (
        <LocationStep
          number={TOTAL_QUESTIONS}
          total={TOTAL_QUESTIONS}
          value={draft.location}
          onChange={(location) => setDraft((d) => ({ ...d, location }))}
          onNext={() => goTo(LEAD)}
          onBack={() => goTo(LOCATION - 1)}
        />
      );
    }

    if (step === LEAD) {
      return (
        <LeadForm
          value={draft.contact}
          onChange={(contact) => {
            setDraft((d) => ({ ...d, contact }));
            if (failed) setFailed(false);
          }}
          onSubmit={submitLead}
          onBack={() => goTo(LOCATION)}
          sending={sending}
          failed={failed}
          canContinueWithoutCrm={!!config.whatsappNumber}
          onContinueWithoutCrm={continueWithoutCrm}
        />
      );
    }

    return <SuccessScreen result={result} whatsappUrl={whatsappUrl} />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      {isDemoMode && (
        <div className="bg-gol-navy-deep px-4 py-2 text-center text-xs leading-snug text-white/90">
          <strong className="font-semibold text-white">Modo demonstração</strong> · webhook do CRM não configurado.
          Os dados preenchidos não são enviados.
        </div>
      )}

      <Header progress={progress} />

      <BackgroundShapes />

      <main className="relative mx-auto w-full max-w-xl flex-1 px-4 pt-8 pb-10 sm:pt-14">
        <div key={step} className={direction === 1 ? 'animate-step-forward' : 'animate-step-back'}>
          {renderStep()}
        </div>
      </main>

      <footer className="relative border-t border-gol-line px-4 py-6 text-center text-xs text-gol-muted">
        © {new Date().getFullYear()} GOL Distribuidora · Chinelos e sandálias para farmácias e drogarias
        {config.privacyUrl && (
          <>
            {' · '}
            <a href={config.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Política de Privacidade
            </a>
          </>
        )}
      </footer>
    </div>
  );
}

/** Detalhes geométricos sutis, no mesmo vocabulário da logo (anéis e círculos). */
function BackgroundShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-28 size-80 rounded-full border-[46px] border-gol-navy/[0.045] sm:-top-16 sm:-right-16" />
      <div className="absolute top-40 right-10 hidden size-5 rounded-full bg-gol-orange/70 sm:block" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full border-[56px] border-gol-navy/[0.035]" />
    </div>
  );
}
