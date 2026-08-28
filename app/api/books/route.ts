import { env } from "cloudflare:workers";

type StorageEnv = typeof env & { DB: D1Database; BOOKS: R2Bucket };

const createBooksTable = `CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  size INTEGER NOT NULL,
  format TEXT NOT NULL,
  content_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at INTEGER NOT NULL
)`;

const createCreatedIndex = "CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at)";

async function ensureStorage() {
  const bindings = env as StorageEnv;
  await bindings.DB.batch([
    bindings.DB.prepare(createBooksTable),
    bindings.DB.prepare(createCreatedIndex),
  ]);
  return bindings;
}

export async function GET() {
  const bindings = await ensureStorage();
  const result = await bindings.DB.prepare(
    "SELECT id, title, size, format, status, created_at AS createdAt FROM books ORDER BY created_at DESC LIMIT 50",
  ).all();
  return Response.json(result.results);
}

export async function POST(request: Request) {
  const bindings = await ensureStorage();
  const form = await request.formData();
  const file = form.get("book");
  if (!(file instanceof File)) return Response.json({ error: "Файл не найден" }, { status: 400 });
  if (file.size === 0 || file.size > 25 * 1024 * 1024) return Response.json({ error: "Допустимый размер — до 25 МБ" }, { status: 400 });

  const format = file.name.split(".").pop()?.toLowerCase() ?? "txt";
  const allowed = new Set(["txt", "md", "fb2", "epub"]);
  if (!allowed.has(format)) return Response.json({ error: "Поддерживаются TXT, MD, FB2 и EPUB" }, { status: 415 });

  const id = crypto.randomUUID();
  const title = file.name.replace(/\.[^.]+$/, "") || "Без названия";
  const objectKey = `books/${id}.${format}`;
  const status = format === "epub" ? "processing" : "ready";
  await bindings.BOOKS.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { originalName: file.name } });
  await bindings.DB.prepare(
    "INSERT INTO books (id, title, object_key, size, format, content_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(id, title, objectKey, file.size, format.toUpperCase(), file.type || "application/octet-stream", status, Date.now()).run();

  return Response.json({ id, title, size: file.size, format: format.toUpperCase(), status }, { status: 201 });
}
