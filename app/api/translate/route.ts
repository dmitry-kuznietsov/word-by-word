const allowedDirections = new Set(["en-ru", "ru-en"]);

type TranslationResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
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
  const endpoint = new URL("https://api.mymemory.translated.net/get");
  endpoint.searchParams.set("q", word);
  endpoint.searchParams.set("langpair", `${source}|${target}`);

  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    const result = await response.json() as TranslationResponse;
    const translation = result.responseData?.translatedText?.trim();
    if (!response.ok || !translation || result.responseStatus !== 200) {
      return Response.json({ error: "Перевод пока недоступен" }, { status: 502 });
    }
    return Response.json({ translation }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    return Response.json({ error: "Перевод пока недоступен" }, { status: 502 });
  }
}
