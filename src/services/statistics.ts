export interface Totals {
  visitors: number;
  matchComplete: number;
}
type Event = { type: "visit" | "complete"; id: string; created: number };
const prefix = "match-noveduc-stats-v1:";
const endpoint = `${import.meta.env.BASE_URL}stats.php`;
const attempts = new Map<string, number>();
let busy = false;
let queuedDuringFlush = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export function newMatchId() {
  return crypto.randomUUID();
}

export function validTotals(value: unknown): value is Totals {
  if (!value || typeof value !== "object") return false;
  const v = value as Totals;
  return (
    Number.isSafeInteger(v.visitors) &&
    v.visitors >= 0 &&
    Number.isSafeInteger(v.matchComplete) &&
    v.matchComplete >= 0
  );
}

export async function readTotals(): Promise<Totals> {
  const response = await fetch(endpoint, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  const totals: unknown = await response.json();
  if (!response.ok || !validTotals(totals))
    throw new Error("Estadísticas no disponibles");
  return totals;
}

function enqueue(type: Event["type"], id: string) {
  const key = prefix + type + ":" + id;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(
      key,
      JSON.stringify({ type, id, created: Date.now() }),
    );
    if (busy) queuedDuringFlush = true;
  }
}

export function registerVisitor() {
  try {
    let id = localStorage.getItem(prefix + "browser");
    if (!id) {
      id = newMatchId();
      localStorage.setItem(prefix + "browser", id);
    }
    if (localStorage.getItem(prefix + "visited") !== id) enqueue("visit", id);
  } catch {
    /* Almacenamiento bloqueado: el juego continúa. */
  }
  void flushStatistics();
}

export function registerComplete(id: string) {
  try {
    enqueue("complete", id);
  } catch {
    /* El juego nunca depende del contador. */
  }
  void flushStatistics();
}

// Claves independientes: dos pestañas no sobrescriben la cola de la otra.
// Máximo cinco intentos por evento y carga; pendientes durante siete días.
export async function flushStatistics() {
  if (busy) return;
  busy = true;
  let retry = false;
  try {
    const keys = Object.keys(localStorage).filter(
      (k) =>
        k.startsWith(prefix + "visit:") || k.startsWith(prefix + "complete:"),
    );
    for (const key of keys) {
      let event: Event | null;
      try {
        event = JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        localStorage.removeItem(key);
        continue;
      }
      if (!event || Date.now() - event.created > 7 * 86400000) {
        localStorage.removeItem(key);
        continue;
      }
      const count = attempts.get(key) || 0;
      if (count >= 5) continue;
      attempts.set(key, count + 1);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: event.type, id: event.id }),
          signal: AbortSignal.timeout(5000),
        });
        const totals: unknown = await response.json();
        if (!response.ok || !validTotals(totals))
          throw new Error("Registro pendiente");
        if (event.type === "visit")
          localStorage.setItem(prefix + "visited", event.id);
        localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent("match-statistics", { detail: totals }),
        );
      } catch {
        retry ||= count + 1 < 5;
      }
    }
  } catch {
    /* localStorage o red no disponibles. */
  } finally {
    busy = false;
    // Una finalización puede encolarse mientras se confirma la visita.
    // Procesar esas claves nuevas sin esperar otra navegación o reconexión.
    const fresh = queuedDuringFlush;
    queuedDuringFlush = false;
    if (fresh && timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if ((fresh || retry) && !timer)
      timer = setTimeout(
        () => {
          timer = undefined;
          void flushStatistics();
        },
        fresh ? 0 : 15000,
      );
  }
}
