import type { ChoiceAnswers, LeadClass } from '../types';

/**
 * Classificação interna pela faixa de investimento — nunca exibida ao visitante.
 * - prioritario: a partir de R$ 1.050 (pedido mínimo)
 * - acompanhamento: abaixo de R$ 1.050
 */
export function classifyLead(answers: ChoiceAnswers): LeadClass {
  return answers.faixa_investimento === 'menos_1050' ? 'acompanhamento' : 'prioritario';
}
