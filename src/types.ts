export type QuestionId = 'comercializa_chinelos' | 'faixa_investimento';

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  helper?: string;
  options: Option[];
}

export type ChoiceAnswers = Partial<Record<QuestionId, string>>;

export interface Location {
  cidade: string;
  estado: string;
}

export interface Contact {
  nome_completo: string;
  nome_farmacia: string;
  cnpj: string;
  whatsapp: string;
}

export type LeadClass = 'prioritario' | 'acompanhamento';

export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  gclid: string;
  referrer: string;
  landing_page: string;
}

export interface LeadPayload {
  nome_completo: string;
  nome_farmacia: string;
  cnpj: string;
  whatsapp: string;
  comercializa_chinelos: string;
  faixa_investimento: string;
  cidade: string;
  estado: string;
  classificacao_lead: LeadClass;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  data_cadastro: string;
  // Campos extras de atribuição, úteis para análise de campanha
  origem_campanha: string;
  fbclid: string;
  gclid: string;
  landing_page: string;
}

export type SubmitResult = 'sent' | 'demo' | 'unsent';
