export function formatPhoneNumber(phoneNumber: string): string {
  // Remove todos os caracteres não numéricos
  let cleanedNumber = phoneNumber.replace(/\D/g, '');

  // Verifica se o número já começa com o código de país +55 (Brasil)
  if (!cleanedNumber.startsWith('55')) {
    // Se não, adiciona o código de país
    cleanedNumber = '55' + cleanedNumber;
  }

  // Retorna o número no formato +5511998765432
  return `+${cleanedNumber}`;
}
