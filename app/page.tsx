"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { glossary } from "../lib/glossary";

type ReadingText = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "Моя книжка";
  time: string;
  title: string;
  genre: string;
  color: "mint" | "yellow" | "lavender" | "coral" | "sand" | "forest" | "graphite";
  mark: string;
  body: string[];
};

type UploadedBook = { id: string; title: string; size: number; format: string; status: "ready" | "processing" };
type ActiveWord = { original: string; translation: string; loading: boolean; cacheKey: string; position: { top: number; left: number } };

const baseReadingTexts: ReadingText[] = [
  { id: "morning-walk", level: "A1", time: "4 мин", title: "A Morning Walk", genre: "Повседневность", color: "mint", mark: "◡", body: ["Mia wakes up early on Saturday. The sun is warm, and the street outside her window is quiet.", "She puts on her blue shoes, takes a small bottle of water, and walks to the park near her home. A dog runs after a yellow ball while its owner laughs.", "Mia sits on a bench with her tea. She watches two children feed the birds and listens to the leaves moving in the wind.", "After a long, calm walk, she goes home with a smile. She still has many things to do, but the day already feels good."] },
  { id: "new-classmate", level: "A1", time: "4 мин", title: "A New Classmate", genre: "Школа", color: "yellow", mark: "✦", body: ["On Monday, a new student comes to Leo's class. Her name is Nora, and she is from Spain.", "At first, Nora looks a little nervous because she does not know anyone. Leo says hello and shows her the classroom, the library, and the cafeteria.", "At lunch, they talk about music, cats, and their favourite food. Nora likes the same band as Leo, so they have a lot to say.", "Before the bell rings, Leo asks Nora to sit with him tomorrow. She smiles and says that she would like that."] },
  { id: "rainy-afternoon", level: "A1", time: "4 мин", title: "A Rainy Afternoon", genre: "Дом", color: "coral", mark: "☂", body: ["It starts to rain after school, so Sam cannot play football outside. He feels disappointed when he looks at the grey sky.", "His sister Maya has an idea. She brings paper, colours, and an old box from the cupboard.", "Together they make a small city with houses, roads, trees, and a bright blue bus. Their cat walks through the paper streets and becomes a giant in the city.", "When their mother comes home, the rain has stopped. Sam does not mind because the afternoon was more fun than he expected."] },
  { id: "green-bicycle", level: "A1", time: "4 мин", title: "The Green Bicycle", genre: "Город", color: "forest", mark: "◉", body: ["Eva sees a green bicycle near the old station every morning. It has a small brown basket and a bell that makes a clear sound.", "One day, she finds a note on the basket. It says, Please use this bicycle if you need it today.", "Eva rides it to the bakery for her father. On the way back, she puts fresh bread in the basket and rings the bell for a little boy.", "In the evening, she returns the bicycle with a new note: Thank you for helping me have a good day."] },
  { id: "market-list", level: "A1", time: "4 мин", title: "The Market List", genre: "Еда", color: "sand", mark: "◌", body: ["Dad gives Lina a short list before they go to the market: apples, carrots, bread, cheese, and tea.", "The market is busy, and every stall has different colours and smells. Lina carefully reads the list and helps Dad choose the best apples.", "At the bread stall, an old woman gives Lina a small warm roll. Lina says thank you and puts it in her bag for later.", "At home, they make soup together. Lina checks the list again and feels proud because they did not forget anything."] },
  { id: "birthday-note", level: "A1", time: "4 мин", title: "A Birthday Note", genre: "Дружба", color: "lavender", mark: "✉", body: ["It is Ben's birthday, but he does not want a big party. He only wants a quiet day with his best friends.", "In the morning, he finds a note under his door. It says, Meet us at the small bridge at four o'clock.", "Ben walks there after school and sees his friends with sandwiches, juice, and a tiny cake. They made a picnic because they know he loves the river.", "The note is now on Ben's desk. He keeps it because simple surprises can feel very special."] },
  { id: "letter-from-london", level: "A2", time: "5 мин", title: "A Letter from London", genre: "Путешествия", color: "lavender", mark: "⌁", body: ["Dear Anna, I have been in London for three days, and every street feels different. The city is larger and louder than I imagined.", "Yesterday I visited a market beside the river. There were old books, bright flowers, and food from many countries. I bought a small postcard with a red bus on it.", "Later, I walked across a bridge and watched boats move slowly below me. A musician was playing the violin, and people stopped to listen.", "Tomorrow I am going to see a play. I wish you were here to explore the city with me, but I will tell you everything when I return."] },
  { id: "lost-recipe", level: "A2", time: "5 мин", title: "The Lost Recipe", genre: "Семья", color: "coral", mark: "✎", body: ["Grandma's apple cake is famous in our family, but nobody can find the recipe. We usually make it together every autumn.", "My brother looks in the kitchen drawers while I search through a box of old letters. Dad checks the shelves above the fridge, but there is nothing there.", "At last, we find a yellow page inside a photo album. The recipe is written in Grandma's careful handwriting, with a small drawing of an apple in the corner.", "We make the cake together, and the house soon smells like cinnamon. Grandma says that the secret ingredient is not sugar but patience."] },
  { id: "friendly-dog", level: "A2", time: "5 мин", title: "The Friendly Dog", genre: "Рассказ", color: "mint", mark: "🐾", body: ["Every afternoon, a brown dog waits outside the corner shop. It wears a red collar, but there is no name on it.", "At first, people think the dog is lost. Then the shop owner explains that its name is Toby and that it belongs to a woman who lives nearby.", "Toby waits for her because she buys groceries at the same time each day. He never goes inside, but everyone at the shop knows him.", "One rainy afternoon, the woman is late. Toby stays under the shop roof until she arrives, and the whole street seems happy to see them together."] },
  { id: "saturday-museum", level: "A2", time: "5 мин", title: "Saturday at the Museum", genre: "Искусство", color: "graphite", mark: "▣", body: ["Mila plans to spend Saturday at home, but her cousin invites her to a small museum near the square.", "The first room has old maps and models of ships. In the second room, there are paintings of the town from one hundred years ago.", "Mila likes a picture of a woman reading by a window. The guide says that nobody knows the woman's name, but the painting is famous because of its quiet light.", "Before leaving, Mila buys a postcard of the painting. At home, she puts it above her desk and begins looking at art in a new way."] },
  { id: "blue-umbrella", level: "A2", time: "5 мин", title: "The Blue Umbrella", genre: "Город", color: "forest", mark: "☂", body: ["Nadia leaves her blue umbrella on the bus during a storm. She notices it only when she reaches the door of her building.", "The next morning, she goes to the bus office, but the worker cannot find it. He tells her to come back after the drivers finish their routes.", "In the afternoon, Nadia sees her umbrella hanging near the office window. Someone has attached a paper star to its handle.", "The driver says a child found it and wanted to make sure it looked cheerful. Nadia goes home through the rain, smiling under her blue umbrella."] },
  { id: "garden-project", level: "A2", time: "5 мин", title: "A Garden Project", genre: "Природа", color: "sand", mark: "✿", body: ["The empty space behind our apartment building used to be full of broken chairs and old boxes. Nobody wanted to spend time there.", "One spring, Mrs. Petrova asked the neighbours if they would help make a garden. Some people brought soil, some brought seeds, and the children painted small signs.", "For several weeks, everyone worked after dinner. The space slowly changed into a place with flowers, herbs, and two wooden benches.", "Now people drink coffee there in the mornings. The garden did not solve every problem in the building, but it gave the neighbours a reason to know one another."] },
  { id: "neighbour", level: "B1", time: "6 мин", title: "The New Neighbour", genre: "Рассказ", color: "forest", mark: "⌂", body: ["When Mr. Hale moved into the apartment upstairs, the building became quieter than usual. He never played music and rarely spoke to anyone.", "One evening, the lift stopped between floors while I was carrying groceries. Mr. Hale was inside too. Instead of looking worried, he told me a funny story about getting lost in a museum in Prague.", "By the time the lift began moving again, I had forgotten about the bags in my hands. He helped me carry them to my door and noticed the books on my table.", "After that evening, we always greeted each other in the hall. A few months later, he gave me a postcard from Prague and wrote, For the next unexpected journey."] },
  { id: "train-to-sea", level: "B1", time: "6 мин", title: "A Train to the Sea", genre: "Путешествия", color: "sand", mark: "≈", body: ["The train left before sunrise, carrying only a few sleepy passengers toward the coast. Elena had planned the trip for months, yet she still felt nervous when the city disappeared behind the fields.", "Across from her, an old man was drawing the changing view in a notebook. He explained that he travelled this route every spring because the light near the sea helped him paint.", "They spoke about places they wanted to see and places they had left behind. The man said that travelling was not always about finding something new; sometimes it helped people hear their own thoughts.", "When Elena finally stepped onto the platform, the air was cold and salty. She understood why he returned every year and felt ready to begin her own walk along the shore."] },
  { id: "open-window", level: "B1", time: "6 мин", title: "An Open Window", genre: "Город", color: "mint", mark: "▱", body: ["Every evening, a warm light appeared in the window across from my kitchen. A woman sat there with an old radio and a large notebook.", "For weeks, I wondered what she was writing. Then one windy night, a page flew from her window and landed on my balcony.", "It was a short poem about the sound of trains after midnight. The next day, I returned it with a note saying that I liked the last line.", "She wrote back, and soon we began exchanging pages through the open windows. We never spoke for long, but the small notes made the building feel less anonymous."] },
  { id: "old-camera", level: "B1", time: "6 мин", title: "The Old Camera", genre: "Семья", color: "yellow", mark: "◫", body: ["While cleaning the attic, Amir found his grandfather's camera in a wooden case. It was heavy, scratched, and still had a roll of film inside.", "His grandfather taught him how to hold it steady and wait before pressing the button. Unlike a phone, the camera could not show the picture immediately.", "They spent a weekend taking photographs of ordinary things: a bicycle in the rain, a market stall, and their neighbour's sleepy cat.", "When the film was developed, several pictures were blurry. Amir liked them anyway because each one held a small memory that could not be repeated exactly."] },
  { id: "quiet-cafe", level: "B1", time: "6 мин", title: "The Quiet Café", genre: "Работа", color: "coral", mark: "☕", body: ["A small café opened beside the station, and at first it was almost empty. The owner, Rosa, refused to play loud music or fill every table.", "She placed a shelf of second-hand books near the door and wrote a sign that said, Stay as long as you need.", "Students began coming to study there. Later, people who worked from home discovered the café, and the morning tables slowly filled with quiet conversations.", "Rosa said that she did not want to create the busiest place in town. She wanted to create a place where people could breathe before continuing their day."] },
  { id: "first-hike", level: "B1", time: "6 мин", title: "The First Hike", genre: "Природа", color: "forest", mark: "△", body: ["I agreed to join the hike because my friends promised that the path was easy. They forgot to mention the steep hill at the beginning.", "After twenty minutes, I was already tired, but turning back felt more difficult than continuing. A guide named Clara walked beside me and pointed out birds I had never noticed before.", "At the top, we ate sandwiches and watched clouds move over the valley. The view was not a reward for being fast; it was a reward for not stopping.", "On the way down, I was still tired, but I was also planning my next hike. Some new things become enjoyable only after the first difficult step."] },
  { id: "small-library", level: "B2", time: "8 мин", title: "The Small Library", genre: "Город", color: "lavender", mark: "▤", body: ["The smallest library in the city stood between a repair shop and a bakery, almost hidden by a chestnut tree. Its shelves were crowded, its carpet was worn, and its opening hours were inconveniently short.", "Nevertheless, people kept coming. Students worked beside retired engineers; parents exchanged recommendations while their children searched for adventure stories. The librarian knew most visitors by name and remembered what they had borrowed months earlier.", "When the council proposed closing the building, the neighbourhood responded with letters, photographs, and a weekend reading festival. People explained that the library was not simply a room with books; it was a place where they had learned to belong.", "The library remained open, not because it was efficient, but because it made the city feel less anonymous. A new sign now hangs above the door: Small rooms can hold large communities."] },
  { id: "useful-mistake", level: "B2", time: "8 мин", title: "A Useful Mistake", genre: "Идеи", color: "forest", mark: "↗", body: ["During a presentation, Daniel accidentally displayed an unfinished chart. It contained a strange pattern that had been hidden by his final calculations.", "At first he tried to close the slide, embarrassed by the interruption. Then a colleague asked whether the pattern might explain why customers were leaving after their first purchase. The question changed the discussion completely.", "Over the following weeks, the team investigated the error instead of ignoring it. They spoke to customers, compared different services, and discovered a problem they had not known existed.", "Their revised service improved because Daniel's mistake made them curious. He later kept the unfinished chart above his desk as a reminder that errors can reveal useful questions."] },
  { id: "last-bus", level: "B2", time: "8 мин", title: "The Last Bus", genre: "Рассказ", color: "graphite", mark: "▰", body: ["The last bus from the airport was nearly empty, which suited Maria after a long day of delayed flights. She chose a seat near the back and watched unfamiliar streets pass by.", "At the next stop, an elderly man entered carrying a suitcase that seemed too large for him. The driver waited while he found a seat, then asked where he was going.", "The man named a district that the bus no longer served at night. Rather than leaving him at a distant stop, the driver changed the route slightly and asked the remaining passengers whether they minded.", "Nobody did. Maria arrived home twenty minutes late but with an unexpected sense of comfort. The city had briefly become a place where strangers could make room for one another."] },
  { id: "map-of-voices", level: "B2", time: "8 мин", title: "A Map of Voices", genre: "Идеи", color: "coral", mark: "⌘", body: ["For her university project, Irina recorded the sounds of her neighbourhood: the baker opening his shutters, children leaving school, and the evening tram turning at the corner.", "At first, her professor asked why she was not making a traditional map. Irina replied that streets alone could not explain how a place felt to the people who lived there.", "She built a website where visitors could click on a street and hear a short recording with a memory from a resident. The project attracted stories from people who had never met.", "By the end of the year, Irina's map was less about directions than attention. It reminded visitors that every ordinary street contained many private worlds."] },
  { id: "repair-workshop", level: "B2", time: "8 мин", title: "The Repair Workshop", genre: "Город", color: "sand", mark: "⚙", body: ["The repair workshop had survived three decades on a street where almost every other shop had become a coffee bar or a chain store. Its owner, Pavel, fixed radios, lamps, clocks, and anything else people brought through the door.", "He often spent an hour repairing an object that could be replaced for less money. When customers apologised for the trouble, he would say that objects deserved a second question before a final answer.", "A group of teenagers began visiting after school to watch him work. Pavel gave them small tasks and explained why a loose wire could silence an entire radio.", "The workshop did not make anyone rich, but it taught a useful habit: before throwing something away, look closely enough to understand what has failed."] },
  { id: "empty-chair", level: "B2", time: "8 мин", title: "The Empty Chair", genre: "Люди", color: "mint", mark: "◌", body: ["In the community centre, one chair always remained empty during the weekly writing group. Nobody knew who had placed it there, and eventually it became part of the room.", "New members sometimes asked about it. The group leader would simply say that it was for the story that had not arrived yet.", "One winter evening, a quiet man came in late and sat in the empty chair. He listened for several weeks before reading a paragraph about caring for his brother after an illness.", "The room was silent when he finished, then everyone began to speak. The chair had not been waiting for a person in particular; it had been waiting for someone to feel welcome enough to begin."] },
];

const storyExtensions: Record<string, string> = {
  "morning-walk": "Before lunch, Mia writes a small list for the afternoon. She notices that the walk has given her energy, so she calls her friend and suggests another visit to the park next week.",
  "new-classmate": "The next day, Nora brings a picture of her old school. Leo shows it to the class, and the teacher asks everyone to write one kind sentence for their new classmate.",
  "rainy-afternoon": "They give their paper city a name and make a tiny cinema from the old box. When the sun comes out, Maya puts the city on a shelf so they can add new streets tomorrow.",
  "green-bicycle": "A week later, Eva sees another note in the basket. Someone has written that the bicycle is for small helpful journeys, and Eva understands that a good idea can travel from person to person.",
  "market-list": "After dinner, Lina asks Dad if she can make the next shopping list. She writes each item clearly and adds a picture beside difficult words, ready for their next busy market day.",
  "birthday-note": "Before they leave, Ben's friends take a photograph beside the bridge. Ben decides that next year he will plan a quiet surprise for them, because the best presents are often shared moments.",
  "letter-from-london": "On her final evening, Anna's friend sits beside the river with the postcard she bought. She writes down three new English words and promises herself that this will not be her last journey.",
  "lost-recipe": "Grandma tells them where she learned the recipe: from her own mother on a rainy day. The family copies it into a new notebook, so the cake will never be lost again.",
  "friendly-dog": "The next day, Toby wears a small tag with his name and address. The shop owner says that the whole street helped choose it, and Toby proudly shows it to every visitor.",
  "saturday-museum": "Mila reads about the painter online and discovers that he also loved quiet mornings. She starts a small sketchbook, not to become famous, but to pay closer attention to ordinary light.",
  "blue-umbrella": "At home, Nadia places the paper star near her window. Whenever it rains, she remembers the child on the bus and feels that the city is full of kind people she has not met yet.",
  "garden-project": "By summer, the neighbours organise a picnic in the garden. Everyone brings one dish, and the children explain which flowers they planted. The once-empty space has become their favourite meeting place.",
  "neighbour": "The postcard made me laugh because Mr. Hale had drawn a tiny lift on the back. I placed it beside my books, where it reminds me that a short conversation can change a whole building.",
  "train-to-sea": "Elena spent the day walking slowly along the shore and collecting smooth stones. In the evening, she opened her notebook and wrote down the colours of the water before they faded from memory.",
  "open-window": "One morning, the woman finally invited me for tea. We talked about poems, trains, and the value of silence. After that, the two windows no longer felt like separate worlds.",
  "old-camera": "Amir chose his favourite photograph and gave it to his grandfather in a simple frame. His grandfather said that the imperfect picture was the best one because it showed the moment honestly.",
  "quiet-cafe": "Rosa began leaving a blank notebook near the books. Visitors wrote short notes about a song, a journey, or a difficult day. Soon the café had its own quiet collection of stories.",
  "first-hike": "A few days later, Clara sent everyone a map of another trail. I felt nervous when I saw the distance, but I also remembered the valley and wrote my name beside the plan.",
  "small-library": "After the festival, volunteers repaired the carpet and painted the old sign. The library still opened for only a few hours each day, but those hours became more valuable to everyone who entered.",
  "useful-mistake": "Daniel later changed the way the team reviewed unfinished work. Instead of hiding early ideas, they held short meetings to discuss what looked strange, incomplete, or unexpectedly interesting.",
  "last-bus": "When Maria left the bus, the driver wished her a good night and the other passengers waved. She kept thinking about that small detour and how easily a routine journey had become a shared decision.",
  "map-of-voices": "Irina continued adding recordings after the project ended. A visitor could now hear the first snow, a late-night conversation, or a shop bell, each sound making the map feel more alive.",
  "repair-workshop": "One teenager eventually repaired an old lamp at home instead of replacing it. The next day, she brought it to Pavel, who nodded and said that careful attention was the most useful tool.",
  "empty-chair": "The following week, the group placed a small notebook on the empty chair. Anyone could leave a first line there, and the quiet man wrote one too: There is still a story I want to tell.",
};

const genreTranslations: Record<string, string> = {
  "Повседневность": "Повсякденність", "Школа": "Школа", "Дом": "Дім", "Город": "Місто", "Еда": "Їжа", "Дружба": "Дружба",
  "Путешествия": "Подорожі", "Семья": "Родина", "Рассказ": "Оповідання", "Искусство": "Мистецтво", "Природа": "Природа",
  "Работа": "Робота", "Идеи": "Ідеї", "Люди": "Люди",
};

const readingTexts = baseReadingTexts.map((text) => ({
  ...text,
  genre: genreTranslations[text.genre] ?? text.genre,
  time: text.level === "A1" ? "5 хв" : text.level === "A2" ? "6 хв" : text.level === "B1" ? "8 хв" : "10 хв",
  body: [...text.body, storyExtensions[text.id]],
}));

function cleanWord(value: string) { return value.replace(/(^[^\p{L}'’-]+|[^\p{L}'’-]+$)/gu, ""); }
function splitText(value: string) { return value.split(/(\s+|[^\p{L}'’-]+)/gu).filter(Boolean); }

export default function Home() {
  const [activeText, setActiveText] = useState<ReadingText>(readingTexts[0]);
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [direction, setDirection] = useState<"en-uk" | "uk-en">("en-uk");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedBook[]>([]);
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const wordCount = useMemo(() => 18 + saved.length, [saved]);

  function scrollToReader() { document.getElementById("reader")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  function openText(text: ReadingText) { setActiveText(text); setActiveWord(null); window.setTimeout(scrollToReader, 0); }

  function getPopoverPosition(anchor: HTMLButtonElement) {
    const rect = anchor.getBoundingClientRect();
    const gap = 14;
    const width = 270;
    const height = 125;
    const padding = 16;
    let left = rect.right + gap;
    if (left + width > window.innerWidth - padding) left = rect.left - width - gap;
    if (left < padding) left = Math.max(padding, Math.min(rect.left, window.innerWidth - width - padding));
    const top = Math.max(padding, Math.min(rect.top - 18, window.innerHeight - height - padding));
    return { top, left };
  }

  async function chooseWord(token: string, anchor: HTMLButtonElement, context: string) {
    const original = cleanWord(token);
    if (!original) return;
    const normalized = original.toLocaleLowerCase();
    const cacheKey = `${direction}:${normalized}`;
    if (activeWord?.cacheKey === cacheKey) {
      setActiveWord(null);
      return;
    }
    const cached = translations[cacheKey] || glossary[cacheKey];
    setActiveWord({ original, translation: cached || "", loading: !cached, cacheKey, position: getPopoverPosition(anchor) });
    if (!saved.includes(cacheKey)) setSaved((current) => [...current, cacheKey]);
    if (cached) return;
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: original, direction, context }),
      });
      const result = await response.json() as { translation?: string; error?: string };
      if (!response.ok || !result.translation) throw new Error(result.error || "translation");
      setTranslations((current) => ({ ...current, [cacheKey]: result.translation! }));
      setActiveWord((current) => current?.cacheKey === cacheKey ? { ...current, translation: result.translation!, loading: false } : current);
    } catch {
      setActiveWord((current) => current?.cacheKey === cacheKey ? { ...current, translation: "Переклад тимчасово недоступний", loading: false } : current);
    }
  }

  function changeDirection(nextDirection: "en-uk" | "uk-en") { setDirection(nextDirection); setActiveWord(null); }

  async function uploadBook(file?: File) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setToast("Книжка більша за 25 МБ. Оберіть файл меншого розміру."); return; }
    setUploading(true);
    try {
      const form = new FormData(); form.append("book", file);
      const response = await fetch("/api/books", { method: "POST", body: form });
      if (!response.ok) throw new Error("upload");
      const book = await response.json() as UploadedBook;
      setUploaded((current) => [book, ...current]); setToast(`«${book.title}» додано до бібліотеки`); setUploadOpen(false);
    } catch {
      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
      setUploaded((current) => [{ id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, ""), size: file.size, format: ext.toUpperCase(), status: ext === "epub" ? "processing" : "ready" }, ...current]);
      setToast("Книжку додано до локальної бібліотеки"); setUploadOpen(false);
    } finally { setUploading(false); }
  }

  async function openUploadedBook(book: UploadedBook) {
    if (book.status !== "ready") { setToast("EPUB ще обробляється. Спробуйте TXT, MD або FB2."); return; }
    try {
      const response = await fetch(`/api/books/${book.id}`);
      const result = await response.json() as { content?: string; error?: string };
      if (!response.ok || !result.content) throw new Error(result.error || "book");
      const paragraphs = result.content.split(/\n{2,}/).map((paragraph) => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 24);
      openText({ id: book.id, level: "Моя книжка", time: "власна книжка", title: book.title, genre: book.format, color: "forest", mark: "↑", body: paragraphs.length ? paragraphs : ["У книжці поки немає тексту для читання."] });
    } catch { setToast("Не вдалося відкрити книжку. Спробуйте ще раз завантажити TXT, MD або FB2."); }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); void uploadBook(event.dataTransfer.files[0]); }
  function onFileChange(event: ChangeEvent<HTMLInputElement>) { void uploadBook(event.target.files?.[0]); }

  function renderTranslatableText(value: string, keyPrefix: string, context: string) {
    return splitText(value).map((piece, index) => {
      const word = cleanWord(piece);
      if (!word) return <span key={`${keyPrefix}-${index}`}>{piece}</span>;
      const selected = activeWord?.original.toLocaleLowerCase() === word.toLocaleLowerCase();
      const savedWord = saved.includes(`${direction}:${word.toLocaleLowerCase()}`);
      return <button key={`${keyPrefix}-${index}`} className={`translatable ${selected ? "selected" : ""} ${savedWord ? "saved" : ""}`} onClick={(event) => void chooseWord(piece, event.currentTarget, context)} onDoubleClick={() => setActiveWord(null)} title="Клік — переклад, подвійний клік — закрити">{piece}</button>;
    });
  }

  function renderParagraph(paragraph: string, paragraphIndex: number) {
    return <p key={`${activeText.id}-${paragraphIndex}`}>{renderTranslatableText(paragraph, `${activeText.id}-${paragraphIndex}`, paragraph)}</p>;
  }

  return <main onClick={(event) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".translatable") && !target.closest(".definition")) setActiveWord(null);
  }}>
    <header className="site-header"><a className="brand" href="#top" aria-label="Word by Word — на головну"><span className="brand-mark"><img src="/word-by-word-mark.png" alt="" /></span><span>Word by Word</span></a><nav aria-label="Основна навігація"><a href="#how">Як це працює</a><a href="#library">Бібліотека</a><a href="#cards">Словник</a></nav><button className="button button-small button-ghost" onClick={() => setUploadOpen(true)}>Завантажити книжку</button></header>

    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><span /> ЧИТАЙТЕ · РОЗУМІЙТЕ · ЗАПАМ’ЯТОВУЙТЕ</div><h1>Англійська,<br />яка читається<br /><em>як улюблена книжка.</em></h1><p>Читайте справжні тексти, перекладайте слова одним дотиком і збирайте власний словник — без тарифів та обмежень.</p><div className="hero-actions"><button className="button button-primary" onClick={scrollToReader}>Почати читати <span>→</span></button><button className="text-button" onClick={() => setUploadOpen(true)}>Завантажити власну книжку <span>↗</span></button></div><div className="proof-row"><div className="avatar-stack"><span>А</span><span>М</span><span>К</span></div><p><strong>Без реєстрації</strong><br />Усе працює просто зараз</p></div></div><div className="hero-visual" aria-label="Попередній перегляд інтерактивного читання"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="word-card word-card-one"><small>ЗБЕРЕЖЕНО</small><b>wander</b><span>бродити</span></div><div className="word-card word-card-two"><small>СЕРІЯ ЧИТАННЯ</small><b>7 <i>днів</i></b><span>так тримати ✦</span></div><div className="reader-preview"><div className="preview-bar"><i /><i /><i /><span>Тихий ранок</span><b>•••</b></div><div className="preview-page"><span className="chapter">РОЗДІЛ ПЕРШИЙ</span><h2>The Path<br />Through the Pines</h2><div className="preview-rule" /><p>The morning air was <mark>crisp</mark> and clear, carrying the scent of pine from the hills.</p><div className="translation-pop"><small>ПРИКМЕТНИК</small><strong>свіжий, бадьорий</strong><span>“the morning air was crisp”</span></div></div></div></div></section>
    <section className="ticker" aria-label="Переваги"><span>АНГЛІЙСЬКА ↔ УКРАЇНСЬКА</span><i>✦</i><span>ПЕРЕКЛАД В ОДИН КЛІК</span><i>✦</i><span>ЗАВАНТАЖЕННЯ КНИЖОК</span><i>✦</i><span>ЗАВЖДИ БЕЗКОШТОВНО</span></section>
    <section className="how section" id="how"><div className="section-heading"><div><span className="kicker">ЯК ЦЕ ПРАЦЮЄ</span><h2>Три прості кроки<br />до вільного читання</h2></div><p>Не відривайтеся від історії заради словника. Усе потрібне з’являється просто в тексті й зберігається автоматично.</p></div><div className="steps"><article><span className="step-number">01</span><div className="step-icon">Aa</div><h3>Оберіть текст</h3><p>Відкрийте оповідання з бібліотеки або завантажте власну книжку.</p></article><article className="featured-step"><span className="step-number">02</span><div className="step-icon cursor-icon">↖</div><h3>Натисніть на слово</h3><p>Будь-яке слово в тексті підсвітиться й отримає переклад просто в рідері.</p></article><article><span className="step-number">03</span><div className="step-icon">✓</div><h3>Повторіть пізніше</h3><p>Нові слова потраплять до карток, щоб знання залишалися з вами.</p></article></div></section>
    <section className="upload-band" id="upload"><div><span className="kicker">ВАША БІБЛІОТЕКА</span><h2>Будь-яка книжка —<br /><em>підручник англійської</em></h2><p>Завантажте книжку та читайте її з миттєвим перекладом. TXT, MD і FB2 можна відкрити одразу; EPUB з’явиться після обробки.</p><button className="button button-primary" onClick={() => setUploadOpen(true)}>Завантажити книжку <span>↑</span></button></div><button className="drop-preview" onClick={() => setUploadOpen(true)}><span className="upload-arrow">↑</span><strong>Перетягніть книжку сюди</strong><small>або натисніть, щоб обрати файл</small><i>TXT · MD · FB2 · EPUB</i></button></section>
    {uploaded.length > 0 && <section className="uploaded section"><div className="section-heading compact"><div><span className="kicker">МОЇ КНИЖКИ</span><h2>Продовжити читання</h2></div></div><div className="uploaded-grid">{uploaded.map((book) => <article key={book.id}><div className="file-cover"><b>{book.format}</b><span>моя<br />книжка</span></div><div><h3>{book.title}</h3><p>{(book.size / 1024 / 1024).toFixed(1)} МБ · {book.status === "ready" ? "готова до читання" : "обробляється"}</p><button onClick={() => void openUploadedBook(book)}>{book.status === "ready" ? "Відкрити →" : "Незабаром буде готова"}</button></div></article>)}</div></section>}
    <section className="reader-section section" id="reader"><div className="reader-info"><span className="kicker">ІНТЕРАКТИВНИЙ РІДЕР</span><h2>Сенс завжди<br />поруч</h2><p>Натисніть на будь-яке слово, включно із заголовком оповідання — переклад з’явиться поряд і не закриє текст. Наведіть курсор, щоб підсвітити слово зеленим. Подвійний клік закриває картку.</p><div className="language-switch" aria-label="Напрямок перекладу"><button className={direction === "en-uk" ? "active" : ""} onClick={() => changeDirection("en-uk")}>EN <span>→</span> UK</button><button className={direction === "uk-en" ? "active" : ""} onClick={() => changeDirection("uk-en")}>UK <span>→</span> EN</button></div><div className="mini-stat"><strong>{wordCount}</strong><span>слів уже<br />у вашому словнику</span></div></div><div className="reader-demo"><div className="reader-demo-head"><div><span>{activeText.level}</span><b>{activeText.genre}</b></div><span>{activeText.time}</span></div><div className="progress"><i /></div><div className="reader-text"><span className="chapter">{activeText.level === "Моя книжка" ? "ВАША КНИЖКА" : `РІВЕНЬ ${activeText.level}`}</span><h3 className="reader-title">{renderTranslatableText(activeText.title, `${activeText.id}-title`, activeText.body.join(" "))}</h3>{activeText.body.map(renderParagraph)}{activeWord && <div className="definition" role="status" aria-live="polite" style={activeWord.position}><div><small>{direction === "en-uk" ? "АНГЛІЙСЬКА → УКРАЇНСЬКА" : "УКРАЇНСЬКА → АНГЛІЙСЬКА"}</small><strong>{activeWord.loading ? "Перекладаємо…" : activeWord.translation}</strong><span>{activeWord.original}</span></div><button onClick={() => setActiveWord(null)} aria-label="Закрити переклад">×</button></div>}</div><div className="reader-footer"><button onClick={() => setToast("Оберіть оповідання нижче")}>←</button><span>Клік — переклад · подвійний клік — закрити</span><button onClick={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })}>→</button></div></div></section>
    <section className="library section" id="library"><div className="section-heading compact"><div><span className="kicker">БІБЛІОТЕКА</span><h2>Оберіть рівень<br />і почніть читати</h2></div><p className="library-note">24 оригінальні історії від A1 до B2 — із довшими текстами для спокійного читання.</p></div><div className="book-grid">{readingTexts.map((book) => <article className={`book-card ${book.color}`} key={book.id}><button className="book-open" onClick={() => openText(book)} aria-label={`Відкрити ${book.title}`}><div className="book-art"><span>{book.genre}</span><i>{book.mark}</i></div><div className="book-meta"><div><span>{book.genre}</span><h3>{book.title}</h3></div><div><b>{book.level}</b><span>{book.time}</span></div></div><small>Відкрити оповідання →</small></button></article>)}</div></section>
    <section className="cards-section section" id="cards"><div className="card-visual"><div className="flashcard back-card">pine <span>сосна</span></div><div className="flashcard front-card"><small>СЛОВО 12 ІЗ 20</small><b>crisp</b><span>/krɪsp/</span><i>свіжий, бадьорий</i><button onClick={() => setToast("Слово позначено як вивчене")}>Знаю →</button></div></div><div className="cards-copy"><span className="kicker">ОСОБИСТИЙ СЛОВНИК</span><h2>Кожне нове слово<br />стає знайомим</h2><p>Слова з текстів перетворюються на картки з початковим контекстом. Повторюйте у власному ритмі — без обмежень.</p><button className="button button-dark" onClick={() => setToast("Картки готові до повторення")}>Відкрити картки <span>→</span></button></div></section>
    <section className="final-cta"><span className="kicker">ВАШ НАСТУПНИЙ РОЗДІЛ</span><h2>Відкрийте текст.<br /><em>Відкрийте мову.</em></h2><p>Українська й англійська. Усі функції. Жодних тарифів.</p><button className="button button-primary" onClick={scrollToReader}>Почати читати безкоштовно <span>→</span></button></section>
    <footer><a className="brand" href="#top"><span className="brand-mark"><img src="/word-by-word-mark.png" alt="" /></span><span>Word by Word</span></a><p>Вивчати мову можна із задоволенням.</p><div><a href="#how">Як це працює</a><a href="#library">Бібліотека</a><a href="#cards">Словник</a></div><small>© 2026 Word by Word</small></footer>
    {uploadOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setUploadOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setUploadOpen(false)} aria-label="Закрити">×</button><span className="kicker">НОВА КНИЖКА</span><h2 id="upload-title">Завантажити книжку</h2><p>Додайте файл до 25 МБ. TXT, MD і FB2 можна читати одразу.</p><div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => fileInput.current?.click()}><span>↑</span><strong>{uploading ? "Завантажуємо…" : "Перетягніть книжку сюди"}</strong><small>або натисніть, щоб обрати</small><i>TXT · MD · FB2 · EPUB</i></div><input ref={fileInput} type="file" accept=".txt,.md,.fb2,.epub,text/plain,application/epub+zip" onChange={onFileChange} hidden /></div></div>}
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Закрити">×</button></div>}
  </main>;
}
