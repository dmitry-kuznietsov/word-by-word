import { env } from "cloudflare:workers";

type StorageEnv = typeof env & { DB: D1Database; BOOKS: R2Bucket };

type BookRecord = {
  id: string;
  title: string;
  objectKey: string;
  format: string;
  status: string;
};

function textFromFb2(source: string) {
  return source
    .replace(/<binary[\s\S]*?<\/binary>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bindings = env as StorageEnv;
  const record = await bindings.DB.prepare(
    "SELECT id, title, object_key AS objectKey, format, status FROM books WHERE id = ? LIMIT 1",
  ).bind(id).first<BookRecord>();

  if (!record) return Response.json({ error: "Книга не найдена" }, { status: 404 });
  if (record.format.toUpperCase() === "EPUB") {
    return Response.json({ error: "EPUB ещё обрабатывается" }, { status: 422 });
  }

  const object = await bindings.BOOKS.get(record.objectKey);
  if (!object) return Response.json({ error: "Файл книги не найден" }, { status: 404 });

  const source = await object.text();
  const content = record.format.toUpperCase() === "FB2" ? textFromFb2(source) : source;
  return Response.json({ id: record.id, title: record.title, content });
}
