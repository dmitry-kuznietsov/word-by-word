import { env } from "cloudflare:workers";
import { glossary } from "../../../lib/glossary";

const allowedDirections = new Set(["en-uk", "uk-en"]);

type TranslationResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
  matches?: Array<{ translation?: string; quality?: string | number; match?: string | number }>;
};

type DeepLResponse = { translations?: Array<{ text?: string }> };
type TranslationEnv = typeof env & { DEEPL_API_KEY?: string };
type TranslationInput = { word?: string; direction?: string; context?: string };

function cleanedContext(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 4_000) : "";
}

async function translateWithDeepL(word: string, source: string, target: string, context: string) {
  const apiKey = (env as TranslationEnv).DEEPL_API_KEY?.trim();
  if (!apiKey) return null;

  const apiBase = apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const response = await fetch(`${apiBase}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text: [word],
      source_lang: source.toUpperCase(),
      target_lang: target.toUpperCase(),
      ...(context ? { context } : {}),
    }),
  });
  const result = await response.json().catch(() => null) as DeepLResponse | null;
  const translation = result?.translations?.[0]?.text?.trim();
  if (!response.ok || !translation || translation.toLocaleLowerCase() === word.toLocaleLowerCase()) return null;
  return translation;
}

async function getTranslation(input: TranslationInput) {
  const word = input.word?.trim();
  const direction = input.direction;

  if (!word || word.length > 80) {
    return Response.json({ error: "Виберіть одне слово до 80 символів" }, { status: 400 });
  }
  if (!direction || !allowedDirections.has(direction)) {
    return Response.json({ error: "Невідомий напрямок перекладу" }, { status: 400 });
  }

  const [source, target] = direction.split("-");
  const glossaryKey = `${direction}:${word.toLocaleLowerCase()}`;
  const curated = glossary[glossaryKey];
  if (curated) return Response.json({ translation: curated, source: "dictionary" }, { headers: { "Cache-Control": "public, max-age=86400" } });

  try {
    const deeplTranslation = await translateWithDeepL(word, source, target, cleanedContext(input.context));
    if (deeplTranslation) return Response.json({ translation: deeplTranslation, source: "deepl" }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    // A temporary DeepL problem should not stop the reader; use the fallback below.
  }

  const endpoint = new URL("https://api.mymemory.translated.net/get");
  endpoint.searchParams.set("q", word);
  endpoint.searchParams.set("langpair", `${source}|${target}`);

  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    const result = await response.json() as TranslationResponse;
    const bestMatch = result.matches
      ?.map((item) => ({ translation: item.translation?.trim(), confidence: Number(item.quality ?? item.match ?? 0) }))
      .filter((item): item is { translation: string; confidence: number } => Boolean(item.translation))
      .sort((a, b) => b.confidence - a.confidence)[0];
    const translation = (bestMatch?.confidence && bestMatch.confidence >= 70 ? bestMatch.translation : result.responseData?.translatedText)?.trim();
    if (!response.ok || !translation || translation.toLocaleLowerCase() === word.toLocaleLowerCase() || result.responseStatus !== 200) {
      return Response.json({ error: "Переклад тимчасово недоступний" }, { status: 502 });
    }
    return Response.json({ translation }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    return Response.json({ error: "Переклад тимчасово недоступний" }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return getTranslation({
    word: url.searchParams.get("word") ?? undefined,
    direction: url.searchParams.get("direction") ?? undefined,
  });
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as TranslationInput | null;
  if (!input) return Response.json({ error: "Некоректний запит" }, { status: 400 });
  return getTranslation(input);
}
