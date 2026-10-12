import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { catalog, questions } from "./data";
import { selectQuestions } from "./domain/select";
import { recommend } from "./domain/match";
import { gameReducer, initialState } from "./state/game";
import { BookCard } from "./components/BookCard";
import { Chevron } from "./components/Chevron";
import { CatalogMenu } from "./components/CatalogMenu";
import { CatalogExplorer } from "./components/CatalogExplorer";
import { usePwa } from "./state/pwa";

export default function App() {
  const [game, dispatch] = useReducer(gameReducer, initialState);
  const [chooseTopic, setChooseTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [explorer, setExplorer] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const returnScroll = useRef(0);
  const pwa = usePwa();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const topic = catalog.topics.find((t) => t.id === game.topicId);
  const question = game.questions[game.index];
  const matches = useMemo(
    () =>
      game.screen === "results"
        ? recommend(catalog, game.questions, game.answers, game.topicId)
        : [],
    [game],
  );
  useEffect(() => {
    if (game.transition) {
      const timer = setTimeout(() => dispatch({ type: "unlock" }), 420);
      return () => clearTimeout(timer);
    }
  }, [game.transition]);
  useEffect(() => {
    if (game.screen !== "home") {
      titleRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [game.screen, game.index]);
  const start = (topicId?: string) =>
    dispatch({
      type: "start",
      questions: selectQuestions(catalog, questions, topicId),
      topicId,
    });
  const reset = () => {
    dispatch({ type: "reset" });
    setChooseTopic(false);
    setSelectedTopic("");
    setExplorer(null);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>
      <header className="masthead">
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            reset();
          }}
          aria-label="Match Noveduc, reiniciar y volver al inicio"
        >
          <img
            className="mark"
            src={`${import.meta.env.BASE_URL}covers/n_portada.svg`}
            alt=""
            width="44"
            height="48"
          />
          <span>
            NOVEDUC
            <span className="wordmark-sub">ROSARIO</span>
          </span>
        </a>
        <button
          ref={menuButton}
          className="icon-button"
          aria-label="Abrir menú del catálogo"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      {menuOpen && (
        <CatalogMenu
          catalog={catalog}
          onClose={() => {
            setMenuOpen(false);
            requestAnimationFrame(() => menuButton.current?.focus());
          }}
          onSelect={(id) => {
            if (!explorer) returnScroll.current = window.scrollY;
            setMenuOpen(false);
            setExplorer(id);
          }}
        />
      )}
      <main id="main">
        {explorer && (
          <CatalogExplorer
            key={explorer}
            catalog={catalog}
            topicId={explorer === "all" ? undefined : explorer}
            onBack={() => {
              setExplorer(null);
              requestAnimationFrame(() => {
                if (game.screen === "home")
                  menuButton.current?.focus({ preventScroll: true });
                else titleRef.current?.focus({ preventScroll: true });
                window.scrollTo({ top: returnScroll.current });
              });
            }}
          />
        )}
        {!explorer && game.screen === "home" && (
          <section className={`home ${chooseTopic ? "choosing" : ""}`}>
            <div className="hero">
              <div className="eyebrow">
                <span className="brand-dot" aria-hidden="true">
                  •
                </span>{" "}
                MATCH NOVEDUC
              </div>
              <h1>
                Tu próxima lectura empieza con <em>vos.</em>
              </h1>
              <p className="hero-description">
                Descubrí libros de Noveduc que conectan con tus intereses y
                abren nuevas preguntas.
              </p>
              <div className="game-facts">
                <span>10 preguntas</span>
                <i aria-hidden="true" />
                <span>3 a 5 libros para descubrir</span>
              </div>
            </div>
            <div className="entry-panel">
              <div className="panel-heading">
                <h2>¿Por dónde iniciamos?</h2>
              </div>
              <button
                className={`mode-button ${chooseTopic ? "active" : ""}`}
                onClick={() => setChooseTopic(!chooseTopic)}
                aria-expanded={chooseTopic}
                aria-controls="topic-picker"
              >
                <span className="mode-icon" aria-hidden="true">
                  <img
                    src={`${import.meta.env.BASE_URL}ui/book1.svg`}
                    alt=""
                    width="29"
                    height="36"
                  />
                </span>
                <span>
                  <strong>Elegir una temática</strong>
                  <small>Seguí una curiosidad que ya tenés.</small>
                </span>
                <span className="mode-action" aria-hidden="true">
                  <Chevron />
                </span>
              </button>
              {chooseTopic && (
                <div id="topic-picker" className="topic-picker">
                  <fieldset>
                    <legend>Elegí el área que te interesa</legend>
                    <div className="topic-grid">
                      {catalog.topics
                        .filter((t) => t.enabled)
                        .map((t) => (
                          <label
                            key={t.id}
                            className={`topic-tile ${selectedTopic === t.id ? "selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="topic"
                              aria-label={t.label}
                              value={t.id}
                              checked={selectedTopic === t.id}
                              onChange={() => setSelectedTopic(t.id)}
                            />
                            <span>
                              <strong>{t.shortLabel}</strong>
                              <small>{t.description}</small>
                            </span>
                          </label>
                        ))}
                    </div>
                  </fieldset>
                  <button
                    className="primary start-topic"
                    disabled={!selectedTopic}
                    onClick={() => start(selectedTopic)}
                  >
                    Empezar mi match <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
              <div className="mode-divider">
                <span>o dejate llevar</span>
              </div>
              <button className="mode-button surprise" onClick={() => start()}>
                <span className="mode-icon" aria-hidden="true">
                  <img
                    src={`${import.meta.env.BASE_URL}ui/book2.svg`}
                    alt=""
                    width="29"
                    height="36"
                  />
                </span>
                <span>
                  <strong>Sorprendeme</strong>
                  <small>Un recorrido por distintas miradas.</small>
                </span>
                <span className="mode-action" aria-hidden="true">
                  <Chevron />
                </span>
              </button>
              <p className="privacy-note">
                Sin registro. Sin respuestas incorrectas.
                <br />
                Solo tus intereses y nuevas lecturas.
              </p>
            </div>
            <p className="editorial-note">
              Psicología, educación, infancias y vida en comunidad.
              <br />
              <span>Muchas miradas. Un encuentro que puede ser tuyo.</span>
            </p>
          </section>
        )}
        {!explorer && game.screen === "quiz" && question && (
          <section className="quiz" aria-label="Cuestionario de intereses">
            <div className="quiz-meta">
              <span className="eyebrow">
                {topic?.shortLabel || "SORPRENDEME"}
              </span>
              <span className="step-label">
                {game.index + 1}
                <span> / 10</span>
              </span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Preguntas respondidas"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={Object.keys(game.answers).length}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={`${game.answers[game.questions[i].id] ? "filled" : ""} ${game.index === i ? "current" : ""}`}
                />
              ))}
            </div>
            <p className="sr-only">Pregunta {game.index + 1} de 10</p>
            <h1 tabIndex={-1} ref={titleRef}>
              {question.text}
            </h1>
            <p className="selection-help" id="selection-help">
              Elegí una opción. Podés cambiarla antes de continuar.
            </p>
            <fieldset className="answers" aria-describedby="selection-help">
              <legend className="sr-only">{question.text}</legend>
              {question.options.map((option, i) => (
                <label
                  className={`answer-tile ${game.answers[question.id] === option.id ? "selected" : ""}`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={game.answers[question.id] === option.id}
                    disabled={game.transition}
                    onChange={() =>
                      dispatch({
                        type: "answer",
                        questionId: question.id,
                        optionId: option.id,
                      })
                    }
                  />
                  <span className="option-letter" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="answer-text">{option.text}</span>
                  <span className="selection-indicator" aria-hidden="true">
                    {game.answers[question.id] === option.id ? "✓" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
            <nav
              className="quiz-navigation"
              aria-label="Navegación del cuestionario"
            >
              <button
                className="nav-button previous"
                disabled={game.index === 0 || game.transition}
                onClick={() => dispatch({ type: "previous" })}
              >
                <span className="circle" aria-hidden="true">
                  <Chevron direction="left" />
                </span>
                <span>Anterior</span>
              </button>
              <button
                className="nav-button next"
                disabled={!game.answers[question.id] || game.transition}
                onClick={() => dispatch({ type: "next" })}
              >
                <span>
                  {game.index === 9 ? "Ver mis resultados" : "Continuar"}
                </span>
                <span className="circle" aria-hidden="true">
                  <Chevron />
                </span>
              </button>
            </nav>
          </section>
        )}
        {!explorer && game.screen === "results" && (
          <section className="results">
            <div className="eyebrow">MATCH NOVEDUC · TU RECORRIDO</div>
            <h1 tabIndex={-1} ref={titleRef}>
              <span className="match-title">Tu match</span>{" "}
              <em className="match-ribbon">literario.</em>
            </h1>
            <p className="results-intro">
              Tus respuestas abrieron estas lecturas. Acercate, explorá y seguí
              la conversación.
            </p>
            {topic && <span className="topic-badge">{topic.label}</span>}
            <div className="book-list">
              {matches.map((match, i) => (
                <BookCard
                  key={match.book.id}
                  match={match}
                  catalog={catalog}
                  index={i}
                />
              ))}
            </div>
            <div className="restart-panel">
              <h2>Siempre hay otra pregunta.</h2>
              <p>Volvé a empezar y descubrí un nuevo recorrido.</p>
              <button className="primary" onClick={reset}>
                Hacer otro match <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        )}
      </main>
      {game.screen !== "quiz" && (
        <aside className="pwa-actions" aria-label="Aplicación">
          {pwa.canInstall && (
            <button onClick={pwa.install}>Instalar aplicación</button>
          )}
          {pwa.waiting && (
            <button onClick={pwa.update}>Actualizar y volver al inicio</button>
          )}
        </aside>
      )}
      {(explorer || game.screen !== "quiz") && (
        <footer>
          <span>
            MATCH NOVEDUC <span aria-hidden="true">·</span> NOVEDUC ROSARIO
          </span>
        </footer>
      )}
    </div>
  );
}
