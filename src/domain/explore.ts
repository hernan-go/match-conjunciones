import type { Catalog } from "./types";

export const normalizeSearch = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es").trim();
const collator = new Intl.Collator("es", {
  sensitivity: "base",
  numeric: true,
  ignorePunctuation: true,
});

export function exploreBooks(catalog: Catalog, topicId?: string, query = "") {
  const term = normalizeSearch(query);
  const isbnTerm = /^[\dx\s-]+$/i.test(term) ? term.replace(/[\s-]/g, "") : "";
  const authors = new Map(
    catalog.authors.map((author) => [author.id, author.name]),
  );
  const seen = new Set<string>();
  return catalog.books
    .filter((book) => {
      if (
        !book.verified ||
        !book.cover.reviewed ||
        (topicId && !book.topicIds.includes(topicId))
      )
        return false;
      if (seen.has(book.workId)) return false;
      seen.add(book.workId);
      return (
        !term ||
        [
          book.title,
          ...book.authorIds.map((id) => authors.get(id) || ""),
          book.isbn || "",
        ].some((value) => normalizeSearch(value).includes(term)) ||
        Boolean(
          isbnTerm &&
          book.isbn?.replace(/[\s-]/g, "").toLowerCase().includes(isbnTerm),
        )
      );
    })
    .sort(
      (a, b) => collator.compare(a.title, b.title) || a.id.localeCompare(b.id),
    );
}
