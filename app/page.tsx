"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";

type ReadingText = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "Моя книга";
  time: string;
  title: string;
  genre: string;
  color: "mint" | "yellow" | "lavender" | "coral" | "sand" | "forest";
  mark: string;
  body: string[];
};

type UploadedBook = { id: string; title: string; size: number; format: string; status: "ready" | "processing" };
type ActiveWord = { original: string; translation: string; loading: boolean; cacheKey: string };

const readingTexts: ReadingText[] = [
  { id: "morning-walk", level: "A1", time: "2 мин", title: "A Morning Walk", genre: "Повседневность", color: "mint", mark: "◡", body: [
    "Mia wakes up early on Saturday. The sun is warm and the street is quiet.",
    "She puts on her blue shoes and walks to the small park near her home. A dog runs after a yellow ball. Mia smiles, sits on a bench, and drinks her tea.",
    "After twenty minutes, she walks home. She feels calm and ready for the day.",
  ] },
  { id: "new-classmate", level: "A1", time: "3 мин", title: "A New Classmate", genre: "Школа", color: "yellow", mark: "✦", body: [
    "On Monday, a new student comes to Leo's class. Her name is Nora and she is from Spain.",
    "Leo shows Nora the classroom, the library, and the cafeteria. At lunch, they talk about music and cats.",
    "Nora likes the same band as Leo. They decide to sit together tomorrow.",
  ] },
  { id: "letter-from-london", level: "A2", time: "4 мин", title: "A Letter from London", genre: "Путешествия", color: "lavender", mark: "⌁", body: [
    "Dear Anna, I have been in London for three days, and every street feels different.",
    "Yesterday I visited a market beside the river. There were old books, bright flowers, and food from many countries. I bought a small postcard with a red bus on it.",
    "Tomorrow I am going to see a play. I wish you were here to explore the city with me.",
  ] },
  { id: "lost-recipe", level: "A2", time: "5 мин", title: "The Lost Recipe", genre: "Семья", color: "coral", mark: "✎", body: [
    "Grandma's apple cake is famous in our family, but nobody can find the recipe.",
    "My brother looks in the kitchen drawers while I search through a box of old letters. At last, we find a yellow page inside a photo album.",
    "The recipe is written in Grandma's careful handwriting. We make the cake together, and the house soon smells like cinnamon.",
  ] },
  { id: "neighbour", level: "B1", time: "5 мин", title: "The New Neighbour", genre: "Рассказ", color: "forest", mark: "⌂", body: [
    "When Mr. Hale moved into the apartment upstairs, the building became quieter than usual. He never played music and rarely spoke to anyone.",
    "One evening, the lift stopped between floors while I was carrying groceries. Mr. Hale was inside too. Instead of looking worried, he told me a funny story about getting lost in a museum in Prague.",
    "By the time the lift began moving again, I had forgotten about the bags in my hands. After that evening, we always greeted each other in the hall.",
  ] },
  { id: "train-to-sea", level: "B1", time: "6 мин", title: "A Train to the Sea", genre: "Путешествия", color: "sand", mark: "≈", body: [
    "The train left before sunrise, carrying only a few sleepy passengers toward the coast. Elena had planned the trip for months, yet she still felt nervous when the city disappeared behind the fields.",
    "Across from her, an old man was drawing the changing view in a notebook. He explained that he travelled this route every spring because the light near the sea helped him paint.",
    "When Elena finally stepped onto the platform, the air was cold and salty. She understood why he returned every year.",
  ] },
  { id: "small-library", level: "B2", time: "7 мин", title: "The Small Library", genre: "Город", color: "lavender", mark: "▤", body: [
    "The smallest library in the city stood between a repair shop and a bakery, almost hidden by a chestnut tree. Its shelves were crowded, its carpet was worn, and its opening hours were inconveniently short.",
    "Nevertheless, people kept coming. Students worked beside retired engineers; parents exchanged recommendations while their children searched for adventure stories. The librarian knew most visitors by name and remembered what they had borrowed months earlier.",
    "When the council proposed closing the building, the neighbourhood responded with letters, photographs, and a weekend reading festival. The library remained open, not because it was efficient, but because it made the city feel less anonymous.",
  ] },
  { id: "useful-mistake", level: "B2", time: "8 мин", title: "A Useful Mistake", genre: "Идеи", color: "forest", mark: "↗", body: [
    "During a presentation, Daniel accidentally displayed an unfinished chart. It contained a strange pattern that had been hidden by his final calculations.",
    "At first he tried to close the slide, embarrassed by the interruption. Then a colleague asked whether the pattern might explain why customers were leaving after their first purchase. The question changed the discussion completely.",
    "Over the following weeks, the team investigated the error instead of ignoring it. Their revised service solved a problem they had not known existed. Daniel later kept the unfinished chart above his desk as a reminder that mistakes can reveal useful questions.",
  ] },
];

const fallbackTranslations: Record<string, string> = {
  "en-ru:morning": "утро", "en-ru:crisp": "свежий, бодрящий", "en-ru:library": "библиотека", "en-ru:journey": "путешествие", "en-ru:book": "книга", "en-ru:read": "читать",
  "ru-en:книга": "book", "ru-en:слово": "word", "ru-en:читать": "read",
};

function cleanWord(value: string) { return value.replace(/(^[^\p{L}'’-]+|[^\p{L}'’-]+$)/gu, ""); }
function splitText(value: string) { return value.split(/(\s+|[^\p{L}'’-]+)/gu).filter(Boolean); }

export default function Home() {
  const [activeText, setActiveText] = useState<ReadingText>(readingTexts[0]);
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [direction, setDirection] = useState<"en-ru" | "ru-en">("en-ru");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedBook[]>([]);
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const wordCount = useMemo(() => 18 + saved.length, [saved]);

  function scrollToReader() { document.getElementById("reader")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  function openText(text: ReadingText) { setActiveText(text); setActiveWord(null); window.setTimeout(scrollToReader, 0); }

  async function chooseWord(token: string) {
    const original = cleanWord(token);
    if (!original) return;
    const normalized = original.toLocaleLowerCase();
    const cacheKey = `${direction}:${normalized}`;
    const cached = translations[cacheKey] || fallbackTranslations[cacheKey];
    setActiveWord({ original, translation: cached || "", loading: !cached, cacheKey });
    if (!saved.includes(cacheKey)) setSaved((current) => [...current, cacheKey]);
    if (cached) return;
    try {
      const response = await fetch(`/api/translate?word=${encodeURIComponent(original)}&direction=${direction}`);
      const result = await response.json() as { translation?: string; error?: string };
      if (!response.ok || !result.translation) throw new Error(result.error || "translation");
      setTranslations((current) => ({ ...current, [cacheKey]: result.translation! }));
      setActiveWord((current) => current?.cacheKey === cacheKey ? { ...current, translation: result.translation!, loading: false } : current);
    } catch {
      setActiveWord((current) => current?.cacheKey === cacheKey ? { ...current, translation: "Перевод временно недоступен", loading: false } : current);
    }
  }

  function changeDirection(nextDirection: "en-ru" | "ru-en") { setDirection(nextDirection); setActiveWord(null); }

  async function uploadBook(file?: File) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setToast("Книга больше 25 МБ. Выберите файл поменьше."); return; }
    setUploading(true);
    try {
      const form = new FormData(); form.append("book", file);
      const response = await fetch("/api/books", { method: "POST", body: form });
      if (!response.ok) throw new Error("upload");
      const book = await response.json() as UploadedBook;
      setUploaded((current) => [book, ...current]); setToast(`«${book.title}» добавлена в библиотеку`); setUploadOpen(false);
    } catch {
      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
      setUploaded((current) => [{ id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, ""), size: file.size, format: ext.toUpperCase(), status: ext === "epub" ? "processing" : "ready" }, ...current]);
      setToast("Книга добавлена в локальную библиотеку"); setUploadOpen(false);
    } finally { setUploading(false); }
  }

  async function openUploadedBook(book: UploadedBook) {
    if (book.status !== "ready") { setToast("EPUB пока готовится. Попробуйте TXT, MD или FB2."); return; }
    try {
      const response = await fetch(`/api/books/${book.id}`);
      const result = await response.json() as { content?: string; error?: string };
      if (!response.ok || !result.content) throw new Error(result.error || "book");
      const paragraphs = result.content.split(/\n{2,}/).map((paragraph) => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 24);
      openText({ id: book.id, level: "Моя книга", time: "своя книга", title: book.title, genre: book.format, color: "forest", mark: "↑", body: paragraphs.length ? paragraphs : ["В книге пока нет текста для чтения."] });
    } catch { setToast("Не удалось открыть книгу. Попробуйте загрузить TXT, MD или FB2 ещё раз."); }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); void uploadBook(event.dataTransfer.files[0]); }
  function onFileChange(event: ChangeEvent<HTMLInputElement>) { void uploadBook(event.target.files?.[0]); }

  function renderParagraph(paragraph: string, paragraphIndex: number) {
    return <p key={`${activeText.id}-${paragraphIndex}`}>{splitText(paragraph).map((piece, index) => {
      const word = cleanWord(piece);
      if (!word) return <span key={`${piece}-${index}`}>{piece}</span>;
      const selected = activeWord?.original.toLocaleLowerCase() === word.toLocaleLowerCase();
      const savedWord = saved.includes(`${direction}:${word.toLocaleLowerCase()}`);
      return <button key={`${piece}-${index}`} className={`translatable ${selected ? "selected" : ""} ${savedWord ? "saved" : ""}`} onClick={() => void chooseWord(piece)} onDoubleClick={() => setActiveWord(null)} title="Клик — перевод, двойной клик — закрыть">{piece}</button>;
    })}</p>;
  }

  return <main>
    <header className="site-header"><a className="brand" href="#top" aria-label="Слово — на главную"><span className="brand-mark">С</span><span>слово</span></a><nav aria-label="Основная навигация"><a href="#how">Как это работает</a><a href="#library">Библиотека</a><a href="#cards">Словарь</a></nav><button className="button button-small button-ghost" onClick={() => setUploadOpen(true)}>Загрузить книгу</button></header>

    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><span /> ЧИТАЙТЕ · ПОНИМАЙТЕ · ЗАПОМИНАЙТЕ</div><h1>Английский,<br />который читается<br /><em>как любимая книга.</em></h1><p>Читайте реальные тексты, переводите слова одним касанием и собирайте личный словарь — без тарифов и ограничений.</p><div className="hero-actions"><button className="button button-primary" onClick={scrollToReader}>Начать читать <span>→</span></button><button className="text-button" onClick={() => setUploadOpen(true)}>Загрузить свою книгу <span>↗</span></button></div><div className="proof-row"><div className="avatar-stack"><span>А</span><span>М</span><span>К</span></div><p><strong>Без регистрации</strong><br />Всё работает прямо сейчас</p></div></div><div className="hero-visual" aria-label="Предпросмотр интерактивного чтения"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="word-card word-card-one"><small>СОХРАНЕНО</small><b>wander</b><span>бродить</span></div><div className="word-card word-card-two"><small>СЕРИЯ ЧТЕНИЯ</small><b>7 <i>дней</i></b><span>так держать ✦</span></div><div className="reader-preview"><div className="preview-bar"><i /><i /><i /><span>Тихое утро</span><b>•••</b></div><div className="preview-page"><span className="chapter">ГЛАВА ПЕРВАЯ</span><h2>The Path<br />Through the Pines</h2><div className="preview-rule" /><p>The morning air was <mark>crisp</mark> and clear, carrying the scent of pine from the hills.</p><div className="translation-pop"><small>ПРИЛАГАТЕЛЬНОЕ</small><strong>свежий, бодрящий</strong><span>“the morning air was crisp”</span></div></div></div></div></section>
    <section className="ticker" aria-label="Преимущества"><span>АНГЛИЙСКИЙ ↔ РУССКИЙ</span><i>✦</i><span>ПЕРЕВОД В ОДИН КЛИК</span><i>✦</i><span>ЗАГРУЗКА КНИГ</span><i>✦</i><span>ВСЕГДА БЕСПЛАТНО</span></section>
    <section className="how section" id="how"><div className="section-heading"><div><span className="kicker">КАК ЭТО РАБОТАЕТ</span><h2>Три простых шага<br />к свободному чтению</h2></div><p>Не отрывайтесь от истории ради словаря. Всё нужное появляется прямо в тексте и сохраняется автоматически.</p></div><div className="steps"><article><span className="step-number">01</span><div className="step-icon">Aa</div><h3>Выберите текст</h3><p>Откройте рассказ из библиотеки или загрузите свою книгу.</p></article><article className="featured-step"><span className="step-number">02</span><div className="step-icon cursor-icon">↖</div><h3>Нажмите на слово</h3><p>Любое слово в тексте подсветится и получит перевод прямо в ридере.</p></article><article><span className="step-number">03</span><div className="step-icon">✓</div><h3>Повторите позже</h3><p>Новые слова попадут в карточки, чтобы знания остались с вами.</p></article></div></section>
    <section className="upload-band" id="upload"><div><span className="kicker">ВАША БИБЛИОТЕКА</span><h2>Любая книга —<br /><em>учебник английского</em></h2><p>Загрузите книгу и читайте её с мгновенным переводом. TXT, MD и FB2 можно открыть сразу; EPUB появится после обработки.</p><button className="button button-primary" onClick={() => setUploadOpen(true)}>Загрузить книгу <span>↑</span></button></div><button className="drop-preview" onClick={() => setUploadOpen(true)}><span className="upload-arrow">↑</span><strong>Перетащите книгу сюда</strong><small>или нажмите, чтобы выбрать файл</small><i>TXT · MD · FB2 · EPUB</i></button></section>
    {uploaded.length > 0 && <section className="uploaded section"><div className="section-heading compact"><div><span className="kicker">МОИ КНИГИ</span><h2>Продолжить чтение</h2></div></div><div className="uploaded-grid">{uploaded.map((book) => <article key={book.id}><div className="file-cover"><b>{book.format}</b><span>моя<br />книга</span></div><div><h3>{book.title}</h3><p>{(book.size / 1024 / 1024).toFixed(1)} МБ · {book.status === "ready" ? "готова к чтению" : "обрабатывается"}</p><button onClick={() => void openUploadedBook(book)}>{book.status === "ready" ? "Открыть →" : "Скоро будет готова"}</button></div></article>)}</div></section>}
    <section className="reader-section section" id="reader"><div className="reader-info"><span className="kicker">ИНТЕРАКТИВНЫЙ РИДЕР</span><h2>Смысл всегда<br />под рукой</h2><p>Нажмите на любое слово — перевод появится сразу. Наведите курсор, чтобы подсветить слово зелёным. Двойной клик закрывает карточку.</p><div className="language-switch" aria-label="Направление перевода"><button className={direction === "en-ru" ? "active" : ""} onClick={() => changeDirection("en-ru")}>EN <span>→</span> RU</button><button className={direction === "ru-en" ? "active" : ""} onClick={() => changeDirection("ru-en")}>RU <span>→</span> EN</button></div><div className="mini-stat"><strong>{wordCount}</strong><span>слов уже<br />в вашем словаре</span></div></div><div className="reader-demo"><div className="reader-demo-head"><div><span>{activeText.level}</span><b>{activeText.genre}</b></div><span>{activeText.time}</span></div><div className="progress"><i /></div><div className="reader-text"><span className="chapter">{activeText.level === "Моя книга" ? "ВАША КНИГА" : `УРОВЕНЬ ${activeText.level}`}</span><h3>{activeText.title}</h3>{activeText.body.map(renderParagraph)}{activeWord && <div className="definition" role="status" aria-live="polite"><div><small>{direction === "en-ru" ? "АНГЛИЙСКИЙ → РУССКИЙ" : "РУССКИЙ → АНГЛИЙСКИЙ"}</small><strong>{activeWord.loading ? "Перевожу…" : activeWord.translation}</strong><span>{activeWord.original}</span></div><button onClick={() => setActiveWord(null)} aria-label="Закрыть перевод">×</button></div>}</div><div className="reader-footer"><button onClick={() => setToast("Выберите рассказ ниже")}>←</button><span>Клик — перевод · двойной клик — закрыть</span><button onClick={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })}>→</button></div></div></section>
    <section className="library section" id="library"><div className="section-heading compact"><div><span className="kicker">БИБЛИОТЕКА</span><h2>Выберите уровень<br />и начните читать</h2></div><p className="library-note">8 оригинальных историй от A1 до B2</p></div><div className="book-grid">{readingTexts.map((book) => <article className={`book-card ${book.color}`} key={book.id}><button className="book-open" onClick={() => openText(book)} aria-label={`Открыть ${book.title}`}><div className="book-art"><span>{book.genre}</span><i>{book.mark}</i></div><div className="book-meta"><div><span>{book.genre}</span><h3>{book.title}</h3></div><div><b>{book.level}</b><span>{book.time}</span></div></div><small>Открыть рассказ →</small></button></article>)}</div></section>
    <section className="cards-section section" id="cards"><div className="card-visual"><div className="flashcard back-card">pine <span>сосна</span></div><div className="flashcard front-card"><small>СЛОВО 12 ИЗ 20</small><b>crisp</b><span>/krɪsp/</span><i>свежий, бодрящий</i><button onClick={() => setToast("Слово отмечено как изученное")}>Знаю →</button></div></div><div className="cards-copy"><span className="kicker">ЛИЧНЫЙ СЛОВАРЬ</span><h2>Каждое новое слово<br />становится знакомым</h2><p>Слова из текстов превращаются в карточки с исходным контекстом. Повторяйте в своём ритме — без лимитов.</p><button className="button button-dark" onClick={() => setToast("Карточки готовы к повторению")}>Открыть карточки <span>→</span></button></div></section>
    <section className="final-cta"><span className="kicker">ВАША СЛЕДУЩАЯ ГЛАВА</span><h2>Откройте текст.<br /><em>Откройте язык.</em></h2><p>Русский и английский. Все функции. Никаких тарифов.</p><button className="button button-primary" onClick={scrollToReader}>Начать читать бесплатно <span>→</span></button></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">С</span><span>слово</span></a><p>Учить язык можно с удовольствием.</p><div><a href="#how">Как это работает</a><a href="#library">Библиотека</a><a href="#cards">Словарь</a></div><small>© 2026 Слово</small></footer>
    {uploadOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUploadOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setUploadOpen(false)} aria-label="Закрыть">×</button><span className="kicker">НОВАЯ КНИГА</span><h2 id="upload-title">Загрузить книгу</h2><p>Добавьте файл до 25 МБ. TXT, MD и FB2 можно читать сразу.</p><div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => fileInput.current?.click()}><span>↑</span><strong>{uploading ? "Загружаем…" : "Перетащите книгу сюда"}</strong><small>или нажмите, чтобы выбрать</small><i>TXT · MD · FB2 · EPUB</i></div><input ref={fileInput} type="file" accept=".txt,.md,.fb2,.epub,text/plain,application/epub+zip" onChange={onFileChange} hidden /></div></div>}
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Закрыть">×</button></div>}
  </main>;
}
