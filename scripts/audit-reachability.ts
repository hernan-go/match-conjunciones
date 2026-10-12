import { writeFile, mkdir } from "node:fs/promises";
import { catalog, questions } from "../src/data";
import { selectQuestions } from "../src/domain/select";
import { recommend, similarity } from "../src/domain/match";
const witnesses: Record<string, unknown> = {};
const counts: Record<string, number> = {};
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
let games = 0;
for (const topic of catalog.topics) {
  for (let seed = 1; seed <= 1000; seed++) {
    const random = rng(seed),
      bank = selectQuestions(catalog, questions, topic.id, random);
    const profiles = [
      Object.fromEntries(
        bank.map((q) => [
          q.id,
          q.options[Math.floor(random() * q.options.length)].id,
        ]),
      ),
    ];
    // Perfiles orientados a cada obra usando exclusivamente opciones reales.
    for (const b of catalog.books.filter((b) => b.topicIds.includes(topic.id)))
      profiles.push(
        Object.fromEntries(
          bank.map((q) => [
            q.id,
            [...q.options].sort(
              (a, z) =>
                similarity(z.weights, b.weights) -
                similarity(a.weights, b.weights),
            )[0].id,
          ]),
        ),
      );
    for (const answers of profiles) {
      games++;
      for (const m of recommend(catalog, bank, answers, topic.id)) {
        counts[m.book.id] = (counts[m.book.id] || 0) + 1;
        witnesses[m.book.id] ??= {
          topicId: topic.id,
          questionIds: bank.map((q) => q.id),
          answers,
        };
      }
    }
  }
}
const unseen = catalog.books
  .filter((b) => !witnesses[b.id])
  .map((b) => ({ id: b.id, title: b.title, topics: b.topicIds }));
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/reachability.json",
  JSON.stringify(
    {
      games,
      reachable: Object.keys(witnesses).length,
      total: catalog.books.length,
      unseen,
      counts,
      witnesses,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      games,
      reachable: Object.keys(witnesses).length,
      total: catalog.books.length,
      unseen,
    },
    null,
    2,
  ),
);
if (unseen.length) process.exitCode = 1;
