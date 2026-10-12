import { useEffect, useRef } from "react";
import type { Catalog } from "../domain/types";

export function CatalogMenu({
  catalog,
  onSelect,
  onClose,
}: {
  catalog: Catalog;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="catalog-menu"
      aria-label="Menú del catálogo"
      onCancel={onClose}
    >
      <div className="menu-header">
        <div className="wordmark">
          <img
            className="mark"
            src={`${import.meta.env.BASE_URL}covers/n_portada.svg`}
            alt=""
            width="44"
            height="48"
          />
          <span>
            NOVEDUC<span className="wordmark-sub">ROSARIO</span>
          </span>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <nav aria-label="Explorar libros">
        {catalog.topics
          .filter((topic) => topic.enabled)
          .map((topic) => (
            <button
              className="menu-option"
              key={topic.id}
              onClick={() => onSelect(topic.id)}
            >
              <span>{topic.shortLabel}</span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        <button
          className="menu-option menu-all"
          onClick={() => onSelect("all")}
        >
          <span>
            <span aria-hidden="true">☷ </span>Lista completa
          </span>
          <span aria-hidden="true">›</span>
        </button>
      </nav>
    </dialog>
  );
}
