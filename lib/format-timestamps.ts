/**
 * Wraps clock-like fragments in square brackets, e.g. "meet at 3:30 PM" → "meet at [3:30 PM]".
 * Leaves segments already inside [...] unchanged.
 */
export function bracketTimesInText(input: string): string {
  if (!input) return input;

  const re =
    /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b|\b\d{1,2}:\d{2}\b/g;

  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  const s = input;
  const copy = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = copy.exec(s)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const before = start > 0 ? s[start - 1] : "";
    const after = end < s.length ? s[end] : "";
    result += s.slice(last, start);
    if (before === "[" && after === "]") {
      result += m[0];
    } else {
      result += `[${m[0].trim()}]`;
    }
    last = end;
  }
  result += s.slice(last);
  return result;
}
