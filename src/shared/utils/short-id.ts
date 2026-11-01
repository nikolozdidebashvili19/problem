// No 0/o/1/l to keep ids readable when shared by hand
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

export const SHORT_ID_LENGTH = 8;

export function generateShortId(length = SHORT_ID_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}
