const allowedDirections = new Set(["en-ru", "ru-en"]);

type TranslationResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
  matches?: Array<{ translation?: string; quality?: string | number; match?: string | number }>;
};

// Частотные слова и слова с неоднозначным переводом не отправляем во внешний
// сервис: так избегаем случайных вариантов вроде «жмых → cake».
const curatedGlossary: Record<string, string> = {
  "en-ru:cake": "торт, пирог",
  "en-ru:oilcake": "жмых",
  "en-ru:quiet": "тихий, спокойный",
  "en-ru:crisp": "свежий, бодрящий",
  "en-ru:walk": "прогулка; гулять",
  "en-ru:recipe": "рецепт",
  "en-ru:neighbour": "сосед",
  "en-ru:story": "история, рассказ",
  "en-ru:mistake": "ошибка",
  "en-ru:library": "библиотека",
  "en-ru:book": "книга",
  "en-ru:read": "читать",
  "ru-en:жмых": "oilcake; press cake",
  "ru-en:пирог": "pie; cake",
  "ru-en:торт": "cake",
  "ru-en:прогулка": "walk",
  "ru-en:спокойный": "calm; quiet",
  "ru-en:сосед": "neighbour",
  "ru-en:рассказ": "story",
  "ru-en:ошибка": "mistake",
  "ru-en:книга": "book",
  "ru-en:читать": "read",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const word = url.searchParams.get("word")?.trim();
  const direction = url.searchParams.get("direction");

  if (!word || word.length > 80) {
    return Response.json({ error: "Выберите одно слово короче 80 символов" }, { status: 400 });
  }
  if (!direction || !allowedDirections.has(direction)) {
    return Response.json({ error: "Неизвестное направление перевода" }, { status: 400 });
  }

  const [source, target] = direction.split("-");
  const glossaryKey = `${direction}:${word.toLocaleLowerCase()}`;
  const curated = curatedGlossary[glossaryKey];
  if (curated) return Response.json({ translation: curated, source: "dictionary" }, { headers: { "Cache-Control": "public, max-age=86400" } });
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
    if (!response.ok || !translation || result.responseStatus !== 200) {
      return Response.json({ error: "Перевод пока недоступен" }, { status: 502 });
    }
    return Response.json({ translation }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    return Response.json({ error: "Перевод пока недоступен" }, { status: 502 });
  }
}
