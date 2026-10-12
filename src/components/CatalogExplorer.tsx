import { useEffect, useMemo, useRef, useState } from "react";
import type { Catalog } from "../domain/types";
import { exploreBooks } from "../domain/explore";
import { BookCard } from "./BookCard";

export function CatalogExplorer({
  catalog,
  topicId,
  onBack,
}: {
  catalog: Catalog;
  topicId?: string;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const topic = catalog.topics.find((item) => item.id === topicId);
  const books = useMemo(
    () => exploreBooks(catalog, topicId, query),
    [catalog, topicId, query],
  );
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, []);
  return (
    <section className="catalog-explorer">
      <button className="catalog-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Volver al match
      </button>
      <h1 ref={heading} tabIndex={-1}>
        {topic?.shortLabel || "Lista completa"}
      </h1>
      {!topicId && (
        <div className="catalog-search">
          <label htmlFor="catalog-query">Buscar por título, autor o ISBN</label>
          <div className="search-controls">
            <input
              ref={input}
              id="catalog-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
      <p className="catalog-count" role="status">
        {books.length} {books.length === 1 ? "libro" : "libros"}
      </p>
      {books.length ? (
        <div className="book-list">
          {books.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              catalog={catalog}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="empty-catalog">
          No encontramos libros con esa búsqueda. Probá otro título, autor o
          ISBN.
        </p>
      )}
    </section>
  );
}
