export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s　・･.,、。!！?？「」『』（）()\-]/g, "");
}

export async function hashAnswer(value: string): Promise<string> {
  const data = new TextEncoder().encode(normalizeAnswer(value));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
