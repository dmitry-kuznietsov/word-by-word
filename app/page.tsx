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

const strictBodies: Record<string, string[]> = {
  "morning-walk": [
    "Mia wakes up early on Saturday. The sun is up, but her street is still quiet. She looks out of the window and sees blue sky. It is a good morning for a walk.",
    "She puts on her blue shoes and takes a small bottle of water. Her mum says, “Have a nice time.” Mia smiles and walks to the park near her home.",
    "At the park, a brown dog runs after a yellow ball. A man throws the ball again and again. Mia sits on a bench and drinks some water.",
    "She can see birds in a tall tree. She can hear the leaves move in the wind. Near the lake, two children feed small fish with bread.",
    "After one hour, Mia walks home. She feels happy and tired. At home, she makes tea and tells her mum about the dog, the birds, and the lake. She smiles again."
  ],
  "new-classmate": [
    "On Monday, a new girl comes to Leo’s class. Her name is Nora. She is from Spain. She has a small red bag and a book in her hand. Her family has a new home in this town. This is her first day there.",
    "At first, Nora is quiet. She does not know the room, the teacher, or the other children. Leo says hello and shows her the classroom. He gives her a pen and a clean page.",
    "Before lunch, Leo takes Nora to the library. Then he shows her the place for lunch and the school yard. Nora asks many simple questions.",
    "At lunch, Leo and Nora sit at one table. They talk about music, cats, and their families. Nora likes the same song as Leo.",
    "After school, Nora says, “Thank you for your help today.” Leo is happy. The next morning, he sees Nora at the door. They go to class together."
  ],
  "rainy-afternoon": [
    "After school, it starts to rain. Sam takes off his wet coat and looks out of the window. He wants to play football, but the grass is very wet.",
    "Sam feels sad. His sister Maya comes into the room with paper, colours, and an old box. The box is big and brown. She has an idea for a game.",
    "They make small houses, roads, and trees from the paper. Sam makes a school. Maya makes a shop with a red door. They use a blue pen for the roads. Their city is on the floor.",
    "Their cat comes into the room. It walks slowly through the paper streets. Sam laughs. The cat is very big in their little city.",
    "Later, Mum makes hot tea and puts small cakes on a plate. The rain is still on the window, but Sam is happy. He wants to make more houses tomorrow. They are happy."
  ],
  "green-bicycle": [
    "Every morning, Eva sees a green bicycle by the old train station. It has a brown basket, a small bell, and a clean white seat. Eva walks past it when she goes to school.",
    "One day, there is a note on the basket. It says, “Please use this bike if you need it today.” There is no name on the note. Eva smiles and looks at the bike.",
    "She needs bread for her mum, so she rides to the small shop near the park. She has no car today. The bike is fast, and the morning air is warm.",
    "Eva puts fresh bread in the basket. Then she rides back to the station and puts the bicycle in the same place.",
    "She leaves a new note with the bread bag. It says, “Thank you for the bike.” The next day, the bike is there again for someone else. She is happy."
  ],
  "market-list": [
    "On Saturday morning, Dad gives Lina a small list. It says apples, carrots, bread, cheese, milk, and tea. Mum is at home, so Dad and Lina go alone. They walk to the market together.",
    "The market is busy. Lina can see red apples, green vegetables, and yellow flowers. She can smell warm bread near the big door. People talk and laugh.",
    "Dad buys the food and puts it in a big bag. Lina looks at the list after every stop. She says, “We have apples. We have carrots. We need milk.”",
    "At the last shop, Lina sees a big cake. It is red and has white cream. She wants it, but Dad says they have cake at home. Lina laughs and takes the milk.",
    "At home, they make soup and eat bread with cheese. Lina puts the list on the table. They have all the food, and Lina feels proud."
  ],
  "birthday-note": [
    "Today is Ben’s birthday. He does not want a big party or many gifts. He wants a quiet day with his two best friends. They know Ben likes small things.",
    "In the morning, he finds a small white note under his door. It says, “Meet us at the bridge at four.” There is no name on it.",
    "Ben reads the note again. At four, he walks to the small bridge near the river. He can see his friends from far away. The sun is low and the water is bright.",
    "They have a blue blanket, juice, fruit, and a small cake. One friend plays a birthday song on a phone. Ben is very happy.",
    "They sit by the water and talk until the sky is dark. Before he goes home, Ben puts the note in his pocket. He wants to keep it for a long time. It is a good memory."
  ],
  "letter-from-london": [
    "Dear Anna, I arrived in London three days ago with my aunt. We are staying in a small hotel near a busy street. Our room has two small beds and a clean table. The city is much bigger than our town.",
    "Yesterday, we walked to a market by the river. There were old books, bright flowers, and food from many places. I bought a postcard for you.",
    "In the afternoon, we crossed a long bridge. A man played the violin near the water. We stopped to listen, then we took photos of the city.",
    "Tomorrow, we are going to see a play. My aunt says the theatre is old and beautiful. After the play, we will have dinner in a small restaurant.",
    "I miss you and our class. I will come home on Friday. I hope we can meet next week, and I will show you all my pictures. I feel happy."
  ],
  "lost-recipe": [
    "Every autumn, our family makes Grandma’s apple cake. It is sweet and warm, and we eat it after Sunday lunch. She makes it with red apples from the market. Grandma has a special recipe.",
    "This year, nobody can find the recipe. My brother looks in the kitchen drawers. I search a box with old letters and cards. The box is under the old table.",
    "Dad checks the shelf above the fridge. Mum looks in the book where she keeps phone numbers. We look in every room.",
    "At last, I open a photo album. Between two old pictures, there is a yellow page. It has a little brown mark on it. The recipe is there, with Grandma’s small writing.",
    "We make the cake together. The house soon smells of apples and cinnamon. Grandma smiles when she tastes it. She says it is as good as her cake. Everyone feels happy today."
  ],
  "friendly-dog": [
    "Every afternoon, a brown dog waits outside the small shop near my house. It has a red collar, but there is no name on it. The dog has big brown eyes and a long tail.",
    "The dog is Mrs Green’s dog. His name is Toby. Mrs Green lives in the next street. He waits by the door when she goes inside to buy milk, bread, and fruit.",
    "People in the street know Toby. Children say hello to him. They touch his head and say, “Good dog.” He sits quietly and watches the cars. He never goes into the road.",
    "One rainy afternoon, Mrs Green is late. Toby sits under the shop roof. The shop worker gives him a bowl of water.",
    "At last, Mrs Green comes out with two bags. Toby jumps up and moves his tail. She thanks the worker, and they walk home together. The dog is happy."
  ],
  "saturday-museum": [
    "On Saturday, Mila plans to stay at home and watch a film. Then her cousin calls and asks her to visit a small museum near the square. The weather is warm, so they do not take the bus.",
    "They walk there after lunch. The first room has maps of the old town and small models of ships. Mila looks at every model. Her cousin reads the words under each one.",
    "In the next room, there are paintings of the town one hundred years ago. Mila sees the same bridge, but there are no cars on it.",
    "Her cousin likes a picture of a woman in a blue dress. Mila likes a woman who is reading by a window. They talk about the pictures.",
    "Before they go home, Mila buys a postcard of the reading woman. She puts it above her desk. Now she wants to draw a picture too. They are happy."
  ],
  "blue-umbrella": [
    "One afternoon, Nadia takes the bus home in heavy rain. She has a blue umbrella with a black handle. It has a small mark near the end. She uses it every day in bad weather.",
    "When she gets to her building, she sees only her bag. The umbrella is not with her. She left it on the bus. Nadia feels sad because it is her favourite umbrella.",
    "The next morning, Nadia goes to the bus office. A worker writes down the bus number and asks her to come back later. She writes her phone number on a piece of paper.",
    "After school, Nadia returns to the office. Her umbrella is near the window. A small paper star is on the handle.",
    "The worker says a child found it and wanted to make it happy. Nadia smiles. On her way home, she keeps the blue umbrella very close. She feels warm again."
  ],
  "garden-project": [
    "Behind our building, there is an empty space. It has old boxes, broken chairs, and plastic bags. The space is behind a wall and is not nice. Nobody sits or plays there.",
    "One spring day, some neighbours meet outside. They want to make a small garden. They bring soil, seeds, water, and simple tools. Some people bring food for lunch.",
    "On Saturday, children help to clean the ground. Adults make long boxes for the flowers. A man brings water in a big blue bottle. Everyone has dirty hands, but they are happy.",
    "After a few weeks, green plants come up. There are red flowers, small herbs, and two benches. People can sit there after work.",
    "Now the garden is a good place for the street. Neighbours talk while children play. We know more names than before, and we want to make it bigger next year. They are happy with it."
  ],
  "neighbour": [
    "When Mr Hale moved into the flat above mine, most people in our building knew very little about him. He left early, returned late, and never stayed long in the hall.",
    "One Saturday, the lift stopped just as I carried bags of food upstairs. Mr Hale was there with a box of books, so we waited together for help.",
    "At first we spoke only about the broken lift. Then he noticed a guidebook in my bag and asked whether I planned a trip. He also showed me a small café near the old bridge.",
    "He told me about Prague, where he once took the wrong tram and spent an afternoon walking beside the river. His story made us both laugh.",
    "The lift soon worked again, but our conversation did not end there. After that day, we often shared news in the hall and sometimes helped each other with shopping. They were friendly."
  ],
  "train-to-sea": [
    "Elena booked a train ticket to the coast after a busy month at work. She wanted a short break, fresh air, and time away from her phone.",
    "The train left before sunrise. Across from her, an older man drew fields, small stations, and the first light in a notebook.",
    "He said he travelled this route every spring, but he was returning home after visiting his daughter. Elena asked about the places on his page.",
    "They talked quietly about favourite journeys, missed trains, and towns they hoped to see one day. The hours passed more quickly than Elena expected.",
    "Before leaving, he showed her a small beach near the station and marked it on her map. He wished her a pleasant day. When the train reached the sea, she thanked him and stepped onto the platform. The cold wind and salty smell made her feel calm and ready to explore. She smiled."
  ],
  "open-window": [
    "Every evening, I saw a warm light in the flat opposite my kitchen. A woman sat by an open window and wrote in a notebook.",
    "I often wondered what she wrote, but I never asked. We only smiled when we met near the letter boxes downstairs. She explained that she wrote after work because the quiet room helped her think. I told her about the books I enjoyed.",
    "One windy night, a page flew from her window and landed on my balcony. I picked it up before the rain reached it.",
    "It was a short poem about a late train and a person who missed home. The words sounded very kind. I placed the page in an envelope with a note.",
    "The next morning, she thanked me and gave me a new page to read. After that, we exchanged small poems and talked about writing over tea. They smiled again."
  ],
  "old-camera": [
    "While he cleaned the attic, Amir found his grandfather's old camera in a wooden case. It was heavy, dusty, and still had film inside.",
    "His grandfather smiled when he saw it. He said that it belonged to him when he was young. He took many family pictures with it.",
    "On Sunday, he showed Amir how to hold it steady, choose a view, and wait before pressing the button. Amir liked the slow process.",
    "They walked through the market and took pictures of a flower stall, an old bicycle, and a cat asleep near a door.",
    "A week later, they collected the photographs from a small shop. Some were not clear, but they laughed at every mistake and kept the best ones. Amir put one picture of his grandfather by his desk at home, and it reminded him of their day. They gave one photograph to his grandmother. They laughed again."
  ],
  "quiet-cafe": [
    "A small café opened beside the station, but few people noticed it at first. It had plain tables, soft lights, and no loud music.",
    "Rosa, the owner, wanted to make a place where people could rest between work and home. She placed second-hand books beside the door.",
    "She wrote a simple sign: Stay as long as you need. Some customers came for coffee, while others brought laptops or notebooks.",
    "After several weeks, students began to meet there after class. People who worked from home chose a table near the window. On Friday evenings, a local musician played gentle songs for an hour. Visitors listened, spoke softly, and did not hurry away.",
    "Rosa learned their names and asked about their days. The café stayed quiet, but it became a friendly part of the neighbourhood for everyone there, including people who sometimes felt lonely after work. It gave people a quiet place."
  ],
  "first-hike": [
    "I joined the hike because my friends said the path was easy. They did not mention the long hill near the beginning. I brought water, a jacket, and a lunch box.",
    "After twenty minutes, I felt tired and wanted to stop. A guide named Clara walked beside me and asked me to breathe slowly. The others waited at each turn and gave me time.",
    "She pointed out small flowers, birds above the trees, and a stream below us. Looking at these things helped me forget my tired legs.",
    "At the top, our group ate sandwiches and watched clouds move across the valley. Everyone was quiet for a few minutes. The view seemed worth the effort.",
    "On the way down, I felt stronger than before. I still found the hill difficult, but I planned another walk for the following month. I wanted to see another view. The next walk felt good."
  ],
  "small-library": [
    "The smallest library in the city stood between a repair shop and a bakery, almost hidden by a chestnut tree. Its rooms were narrow, its shelves were old, and the heating often failed in winter.",
    "However, the library did more than lend books. Students prepared for exams beside retired engineers, parents found quiet time with their children, and the librarian greeted most visitors by name. For many people, it was a place to think without being expected to buy anything.",
    "When the council announced plans to close it, the neighbourhood organised a reading festival. Local writers came, children read short stories aloud, and shop owners gave food for the event. The protest was calm, but it showed how strongly people valued the building.",
    "The council finally agreed to keep the library open for another year. The decision did not solve every problem, yet it made one point clear: a small public space can make a large city feel less distant."
  ],
  "useful-mistake": [
    "During a presentation, Daniel accidentally displayed an unfinished chart. A group of numbers formed an unusual pattern, although he had planned to hide the slide until it was checked.",
    "Embarrassed, he tried to move on. Then a colleague asked whether the pattern might explain why some customers stopped using the service. Instead of dismissing the question, the team decided to examine the data.",
    "Over the next week, they compared comments, orders, and support requests. They discovered that a recent change had confused people who used the service on small screens. The mistake had exposed a problem that normal reports had missed.",
    "Daniel later used the chart in a meeting about the project. He explained that errors should not be celebrated, but they can be useful if a team reacts with curiosity rather than blame. The group changed its review process as a result. It also encouraged them to discuss early mistakes before they became expensive."
  ],
  "last-bus": [
    "After a day of delayed flights, Maria boarded the last bus from the airport. It was almost empty, and she welcomed the silence after hours of announcements and crowded waiting areas.",
    "At the next stop, an elderly man entered with a heavy suitcase. He asked the driver for a district that the bus no longer served at night. He looked tired and was clearly unsure how he would get home.",
    "The driver explained the situation, then asked the other passengers whether they minded a short change of route. Maria expected complaints, since everyone had their own reasons for being late. Instead, several people said yes at once.",
    "The detour added only ten minutes, but the man was left near his street. When Maria finally got off, the driver wished her good night and two passengers waved. The journey reminded her that public transport can become personal when people make room for one another."
  ],
  "map-of-voices": [
    "For her university project, Irina recorded the everyday sounds of her neighbourhood: shutters opening, children in a courtyard, a tram turning at the corner, and voices from small shops.",
    "Her professor asked why she was not making a traditional map. Irina replied that streets and buildings could show where people lived, but not what made the area feel familiar to them.",
    "She invited residents to choose a place and share a short memory. Visitors could then click on a street and hear a shop bell, an old song, or a story about the first snow.",
    "Some people thought the project was too personal to be useful. Yet Irina argued that a map does not only give directions; it can also help us notice whose experiences shape a place. By the end of the exhibition, many visitors said they listened to their own streets more carefully. The project also encouraged local people to contribute recordings after the exhibition closed."
  ],
  "repair-workshop": [
    "The repair workshop remained open on a street where most small shops had become cafes or phone stores. Its owner, Pavel, repaired radios, clocks, lamps, and other objects that seemed too old to matter.",
    "People sometimes asked why he fixed things that could be replaced for less money. Pavel replied that the price was not the only question. A familiar object could hold a memory, and a repair could prevent unnecessary waste.",
    "After school, several teenagers began visiting to watch him work. At first, they only wanted to see the tools. Gradually, they learned to test a wire, clean a small part, and follow instructions without rushing.",
    "The workshop did not promise that every object could be saved. However, Pavel believed it offered a useful habit: before throwing something away, look closely and ask whether it still has a purpose. This approach influenced the teenagers more than any formal lesson."
  ],
  "empty-chair": [
    "In the community centre, one chair always remained empty during the weekly writing group. It stood near the window, although nobody was ever asked to sit there.",
    "New members often wondered about it. The group leader explained that the chair was kept for a story that had not arrived yet. It was a simple idea, but it made the room feel open rather than complete.",
    "One winter evening, a quiet man came in late and chose the empty chair. He listened for several weeks before reading a short piece about his brother, whom he had not spoken to for years.",
    "The writing was not perfect, and he stopped twice to find the right words. Still, the group understood what he meant. For the others, his courage changed the meaning of the meeting. Afterwards, the chair no longer seemed empty; it represented the moment when someone decides that a difficult story deserves to be heard."
  ]
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
  body: strictBodies[text.id] ?? [...text.body, storyExtensions[text.id]],
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
