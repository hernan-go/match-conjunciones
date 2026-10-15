import { useEffect, useState } from "react";
import {
  flushStatistics,
  readTotals,
  type Totals,
} from "../services/statistics";

export function Statistics() {
  const [totals, setTotals] = useState<Totals | null>(null);
  useEffect(() => {
    let active = true;
    // Una lectura iniciada antes de un POST no debe reemplazar cifras más nuevas.
    const receive = (value: Totals) => {
      if (active)
        setTotals((previous) => ({
          visitors: Math.max(previous?.visitors ?? 0, value.visitors),
          matchComplete: Math.max(
            previous?.matchComplete ?? 0,
            value.matchComplete,
          ),
        }));
    };
    const updated = (event: Event) =>
      receive((event as CustomEvent<Totals>).detail);
    window.addEventListener("match-statistics", updated);
    void readTotals()
      .then(receive)
      .catch(() => {});
    void flushStatistics();
    return () => {
      active = false;
      window.removeEventListener("match-statistics", updated);
    };
  }, []);
  return (
    <dl className="statistics" aria-label="Estadísticas de participación">
      <div>
        <dt>VISITORS</dt>
        <dd>{totals?.visitors ?? "—"}</dd>
      </div>
      <div>
        <dt>MATCH COMPLETE</dt>
        <dd>{totals?.matchComplete ?? "—"}</dd>
      </div>
    </dl>
  );
}
