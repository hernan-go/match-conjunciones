import { useState } from "react";
import type { Book, Catalog, Match } from "../domain/types";
import { justification } from "../domain/match";
const url = (file: string) => `${import.meta.env.BASE_URL}covers/${file}`;
export function BookCard({
  match,
  book: catalogBook,
  catalog,
  index,
}: ({ match: Match; book?: never } | { book: Book; match?: never }) & {
  catalog: Catalog;
  index: number;
}) {
  const book = match?.book || catalogBook!;
  const [fallback, setFallback] = useState(false);
  const institutional = fallback || book.cover.kind === "institucional";
  const coordinator = book.contributors.find((c) =>
    /compilación|coordinación/.test(c.role),
  );
  const authors =
    book.authorIds.length > 3
      ? coordinator
        ? `${catalog.authors.find((a) => a.id === coordinator.authorId)?.name} · Obra colectiva`
        : "Obra colectiva"
      : book.authorIds
          .map((id) => catalog.authors.find((a) => a.id === id)?.name)
          .filter(Boolean)
          .join(" · ");
  return (
    <article className="book-card" aria-labelledby={`title-${book.id}`}>
      <div className={`book-image ${institutional ? "institutional" : ""}`}>
        <img
          src={url(institutional ? "n_portada.svg" : book.cover.file)}
          alt={
            institutional
              ? "Imagen institucional de Noveduc"
              : `Portada de ${book.title}`
          }
          onError={() => setFallback(true)}
          width="120"
          height="176"
        />
        {book.cover.kind === "otra_edicion" && !fallback && (
          <span className="edition-note">Portada de otra edición</span>
        )}
      </div>
      <div className="book-copy">
        <div className="book-kicker">
          <span className="result-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>
            {catalog.topics.find((t) => t.id === book.topicIds[0])?.shortLabel}
          </span>
        </div>
        <h2 id={`title-${book.id}`}>{book.title}</h2>
        <p className="author">{authors}</p>
        <p className="summary">{book.summary}</p>
        {match && <p className="reason">{justification(match, catalog)}</p>}
      </div>
    </article>
  );
}
