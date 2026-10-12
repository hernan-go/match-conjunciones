import { useEffect, useRef, useState } from "react";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwa() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const updating = useRef(false);
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const inspect = () => {
      if (!disposed && registration?.waiting) setWaiting(registration.waiting);
    };
    const found = () => {
      const worker = registration?.installing;
      worker?.addEventListener("statechange", inspect);
    };
    const controllerChanged = () => {
      // Una nueva versión solo recarga esta pestaña tras la acción explícita.
      if (updating.current) window.location.reload();
    };
    const offerInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const installed = () => setInstallEvent(null);
    const refresh = () => {
      registration?.update().catch(() => undefined);
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      controllerChanged,
    );
    window.addEventListener("beforeinstallprompt", offerInstall);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("online", refresh);
    const scope = new URL(import.meta.env.BASE_URL, window.location.href);
    navigator.serviceWorker
      .register(new URL("sw.js", scope), {
        scope: scope.pathname,
        updateViaCache: "none",
      })
      .then((result) => {
        if (disposed) return;
        registration = result;
        result.addEventListener("updatefound", found);
        inspect();
        found();
      })
      .catch(() => {
        // El juego permanece disponible si el navegador no admite instalación.
      });
    return () => {
      disposed = true;
      registration?.removeEventListener("updatefound", found);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        controllerChanged,
      );
      window.removeEventListener("beforeinstallprompt", offerInstall);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("online", refresh);
    };
  }, []);
  return {
    waiting,
    canInstall: Boolean(installEvent),
    install: async () => {
      if (!installEvent) return;
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    },
    update: () => {
      if (!waiting) return;
      updating.current = true;
      waiting.postMessage({ type: "SKIP_WAITING" });
    },
  };
}
