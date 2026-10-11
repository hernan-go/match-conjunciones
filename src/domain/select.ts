import type { Catalog, Question } from "./types";
export function shuffled<T>(
  items: T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function selectQuestions(
  catalog: Catalog,
  bank: Question[],
  topicId?: string,
  random: () => number = Math.random,
): Question[] {
  const active = catalog.topics.filter((t) => t.enabled);
  if (topicId && !active.some((t) => t.id === topicId))
    throw new Error("Temática no habilitada");
  let selected: Question[] = [];
  if (topicId)
    selected = shuffled(
      bank.filter((q) => q.topicIds.includes(topicId)),
      random,
    ).slice(0, 10);
  else {
    const buckets = shuffled(active, random).map((t) =>
      shuffled(
        bank.filter((q) => q.topicIds.includes(t.id)),
        random,
      ),
    );
    while (selected.length < 10) {
      let added = false;
      for (const bucket of buckets) {
        const approachCount = (approach: string) =>
          selected.filter((q) => q.approach === approach).length;
        const q = bucket
          .filter((q) => !selected.some((s) => s.id === q.id))
          .sort(
            (a, b) => approachCount(a.approach) - approachCount(b.approach),
          )[0];
        if (q && selected.length < 10) {
          selected.push(q);
          added = true;
        }
      }
      if (!added) break;
    }
  }
  if (selected.length !== 10) throw new Error("Preguntas insuficientes");
  return selected.map((q) => ({ ...q, options: shuffled(q.options, random) }));
}
