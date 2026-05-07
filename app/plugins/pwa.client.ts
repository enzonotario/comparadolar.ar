export default defineNuxtPlugin(() => {
  const canInstall = useState("pwa:can-install", () => false);
  const installPrompt = useState<any>("pwa:install-prompt", () => null);
  const isInstalled = useState("pwa:is-installed", () => false);
  const serviceWorkerReady = useState("pwa:service-worker-ready", () => false);

  isInstalled.value = window.matchMedia("(display-mode: standalone)").matches;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt.value = event;
    canInstall.value = true;
  });

  window.addEventListener("appinstalled", () => {
    canInstall.value = false;
    installPrompt.value = null;
    isInstalled.value = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          serviceWorkerReady.value = true;

          if ("periodicSync" in registration) {
            try {
              await (registration as any).periodicSync.register(
                "comparadolar-top3",
                {
                  minInterval: 5 * 60 * 1000,
                },
              );
            } catch {
              // Periodic Background Sync no está disponible o aún no fue concedido.
            }
          }
        })
        .catch((error) => {
          console.error("Error registering service worker", error);
        });
    });
  }
});
