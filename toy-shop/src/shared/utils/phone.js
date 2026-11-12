const PHONE_CHARACTERS_PATTERN = /^\+?[\d()\s-]+$/;
const UKRAINIAN_PHONE_PATTERN = /^(?:0\d{9}|380\d{9})$/;

export function isValidUkrainianPhone(value) {
  const phone = String(value ?? '').trim();
  if (!phone || !PHONE_CHARACTERS_PATTERN.test(phone)) return false;

  const digits = phone.replace(/\D/g, '');
  return UKRAINIAN_PHONE_PATTERN.test(digits);
}
