// Plain-function validation rules shared by the browser form and the API (no dependencies).
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export const LIMITS = { name: [2, 80], address: [8, 300] };
export const PHONE_RE = /^01[3-9]\d{8}$/;

/** Strip control / invisible characters, collapse whitespace, trim. */
export function cleanText(value) {
  return String(value)
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "+8801712-345 678" / "০১৭১২৩৪৫৬৭৮" -> "01712345678" */
export function normalizePhone(value) {
  let p = String(value)
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[\s\-().]/g, "");
  if (p.startsWith("+88")) p = p.slice(3);
  else if (p.startsWith("88") && p.length === 13) p = p.slice(2);
  return p;
}

export const isValidName = (v) => {
  const n = cleanText(v).length;
  return n >= LIMITS.name[0] && n <= LIMITS.name[1];
};
export const isValidPhone = (v) => PHONE_RE.test(normalizePhone(v));
export const isValidAddress = (v) => {
  const n = cleanText(v).length;
  return n >= LIMITS.address[0] && n <= LIMITS.address[1];
};
