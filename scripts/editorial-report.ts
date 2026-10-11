import { mkdir, writeFile } from "node:fs/promises";
import { catalog, questions } from "../src/data";
import { recommend } from "../src/domain/match";
const report = catalog.topics.map((topic) => {
  const bank = questions
    .filter((q) => q.topicIds.includes(topic.id))
    .slice(0, 10);
  return {
    topic: topic.label,
    eligibleBooks: catalog.books.filter((b) => b.topicIds.includes(topic.id))
      .length,
    profiles: topic.facets.map((facet, i) => ({
      interest: catalog.tags.find((t) => t.id === facet)?.label,
      results: recommend(
        catalog,
        bank,
        Object.fromEntries(bank.map((q) => [q.id, q.options[i].id])),
        topic.id,
      ).map((m) => ({
        title: m.book.title,
        sharedTags: m.matchedTags,
        score: m.score,
      })),
    })),
  };
});
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/editorial-report.json",
  JSON.stringify(report, null, 2),
);
for (const topic of report)
  console.log(
    topic.topic,
    topic.eligibleBooks,
    topic.profiles
      .map((p) => `${p.interest}: ${p.results[0].title}`)
      .join(" | "),
  );
