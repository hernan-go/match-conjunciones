import { describe, it, expect } from "vitest";
import { catalog } from "../src/data";
import { exploreBooks, normalizeSearch } from "../src/domain/explore";

describe("Explorador editorial", () => {
  it("lista las 80 obras únicas A–Z y respeta todas las categorías", () => {
    const all = exploreBooks(catalog);
    expect(all).toHaveLength(80);
    expect(new Set(all.map((book) => book.workId)).size).toBe(all.length);
    expect(all.map((book) => book.title)).toEqual(
      all
        .map((book) => book.title)
        .sort(
          new Intl.Collator("es", {
            sensitivity: "base",
            numeric: true,
            ignorePunctuation: true,
          }).compare,
        ),
    );
    expect(all[0].title).toMatch(/^Abordajes/);
    for (const topic of catalog.topics.filter((topic) => topic.enabled)) {
      const books = exploreBooks(catalog, topic.id);
      expect(books.length).toBe(
        catalog.books.filter((book) => book.topicIds.includes(topic.id)).length,
      );
      expect(books.every((book) => book.topicIds.includes(topic.id))).toBe(
        true,
      );
    }
  });
  it("busca título parcial, mayúsculas, tildes, autores e ISBN con o sin guiones", () => {
    expect(normalizeSearch("  PRÁCTICAS  ")).toBe("practicas");
    expect(
      exploreBooks(catalog, undefined, "PRACTICAS").map((book) => book.id),
    ).toEqual(
      exploreBooks(catalog, undefined, "prácticas").map((book) => book.id),
    );
    expect(
      exploreBooks(catalog, undefined, "STOLKINER").length,
    ).toBeGreaterThan(0);
    const book = catalog.books.find((book) => book.isbn)!;
    expect(exploreBooks(catalog, undefined, book.isbn!)).toContainEqual(book);
    expect(
      exploreBooks(catalog, undefined, book.isbn!.replace(/[\s-]/g, "")),
    ).toContainEqual(book);
    expect(exploreBooks(catalog, undefined, "xxxxx-sin-coincidencia")).toEqual(
      [],
    );
    expect(exploreBooks(catalog, undefined, " ")).toHaveLength(80);
  });
  it("incluye todos los autores de obras colectivas y crece sin límites fijos", () => {
    const collective = catalog.books.find((book) => book.authorIds.length > 3)!;
    const author = catalog.authors.find(
      (author) => author.id === collective.authorIds.at(-1),
    )!;
    expect(exploreBooks(catalog, undefined, author.name)).toContainEqual(
      collective,
    );
    const extra = {
      ...catalog.books[0],
      id: "extra",
      workId: "extra",
      title: "ZZ prueba de ampliación",
    };
    expect(
      exploreBooks({ ...catalog, books: [...catalog.books, extra] }),
    ).toHaveLength(81);
    expect(
      exploreBooks({ ...catalog, books: [...catalog.books, catalog.books[0]] }),
    ).toHaveLength(80);
  });
});
