export const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Formata como (00) 0000-0000 ou (00) 00000-0000 enquanto o usuário digita. */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  // DDDs brasileiros não usam 0 em nenhum dos dois dígitos
  if (d[0] === '0' || d[1] === '0') return false;
  // Celular com 11 dígitos sempre começa com 9
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}
