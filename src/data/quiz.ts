import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'comercializa_chinelos',
    title: 'Sua farmácia já comercializa chinelos ou sandálias?',
    options: [
      { value: 'sim', label: 'Sim, já vendemos esses produtos.' },
      { value: 'nao_interesse', label: 'Ainda não, mas temos interesse em incluir.' },
      { value: 'parou', label: 'Já vendemos anteriormente, mas paramos.' },
    ],
  },
  {
    id: 'faixa_investimento',
    title: 'Qual valor sua farmácia considera investir em um primeiro pedido?',
    options: [
      { value: 'menos_1050', label: 'Menos de R$ 1.050.' },
      { value: '1050_1500', label: 'De R$ 1.050 a R$ 1.500.' },
      { value: '1501_3000', label: 'De R$ 1.501 a R$ 3.000.' },
      { value: 'acima_3000', label: 'Acima de R$ 3.000.' },
    ],
  },
];

export const UFS: { sigla: string; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

export function labelFor(questionId: string, value: string | undefined): string {
  const q = QUESTIONS.find((item) => item.id === questionId);
  return q?.options.find((o) => o.value === value)?.label ?? '';
}
