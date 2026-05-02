import { useEffect, useMemo, useState } from "react";
import { env } from "@/lib/env";

const loadingMessages = [
  "Estamos arrancando el servidor...",
  "Cargando tu espacio...",
  "Conectando con Render...",
  "Casi listo...",
  "Preparando el acceso seguro...",
];

function healthUrl() {
  return new URL("../health", `${env.apiUrl}/`).toString();
}

export function useBackendReadiness() {
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      try {
        const response = await fetch(healthUrl(), { method: "GET" });
        if (cancelled) return;

        if (response.ok) {
          setIsReady(true);
          setIsChecking(false);
          return;
        }
      } catch {
        // Render free puede tardar en despertar; seguimos reintentando.
      }

      if (!cancelled) {
        setIsReady(false);
        setIsChecking(true);
      }
    }

    void checkBackend();
    const healthInterval = window.setInterval(() => {
      void checkBackend();
    }, 4000);
    const messageInterval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 1800);

    return () => {
      cancelled = true;
      window.clearInterval(healthInterval);
      window.clearInterval(messageInterval);
    };
  }, []);

  return useMemo(
    () => ({
      isReady,
      isChecking,
      message: loadingMessages[messageIndex],
    }),
    [isChecking, isReady, messageIndex],
  );
}
