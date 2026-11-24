const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function convertToWesternDigits(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const arIdx = ARABIC_INDIC_DIGITS.indexOf(ch);
    if (arIdx !== -1) {
      out += String(arIdx);
      continue;
    }
    const faIdx = PERSIAN_DIGITS.indexOf(ch);
    if (faIdx !== -1) {
      out += String(faIdx);
      continue;
    }
    out += ch;
  }
  return out;
}

export function cleanVoiceTranscript(transcript: string): string {
  return convertToWesternDigits(transcript)
    .replace(/^[.,،؛:!؟"'`~\s]+|[.,،؛:!؟"'`~\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSearchText(input: string): string {
  return convertToWesternDigits(input)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[.,،؛:!؟"'`~/\\()[\]{}\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesSearchQuery(haystack: string, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const hay = normalizeSearchText(haystack);
  if (!hay) return false;

  if (hay.includes(q)) return true;

  const compactHay = hay.replace(/\s+/g, '');
  const compactQ = q.replace(/\s+/g, '');
  if (compactQ.length >= 2 && compactHay.includes(compactQ)) return true;

  const tokens = q.split(' ').filter(Boolean);
  if (tokens.length > 1 && tokens.every((tok) => hay.includes(tok) || compactHay.includes(tok))) {
    return true;
  }

  return false;
}
