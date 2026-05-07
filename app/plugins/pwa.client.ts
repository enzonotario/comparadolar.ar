export default defineNuxtPlugin(() => {
  const canInstall = useState("pwa:can-install", () => false);
  const installPrompt = useState<any>("pwa:install-prompt", () => null);
  const isInstalled = useState("pwa:is-installed", () => false);
  const serviceWorkerReady = useState("pwa:service-worker-ready", () => false);

  const updateInstalledState = () => {
    isInstalled.value =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
  };

  const registerPeriodicSync = async (
    registration: ServiceWorkerRegistration,
  ) => {
    if (!("periodicSync" in registration)) return;

    try {
      await (registration as any).periodicSync.register("comparadolar-top3", {
        minInterval: 5 * 60 * 1000,
      });
    } catch {
      // Periodic Background Sync no está disponible o aún no fue concedido.
    }
  };

  const markReadyFromExistingRegistration = async () => {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.active || navigator.serviceWorker.controller) {
      serviceWorkerReady.value = true;
    }
  };

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      await markReadyFromExistingRegistration();

      const registration = await navigator.serviceWorker.register("/sw.js");
      if (
        registration.active ||
        registration.installing ||
        registration.waiting
      ) {
        serviceWorkerReady.value = true;
      }

      void navigator.serviceWorker.ready.then((readyRegistration) => {
        serviceWorkerReady.value = true;
        void registerPeriodicSync(readyRegistration);
      });

      await registerPeriodicSync(registration);
    } catch (error) {
      console.error("Error registering service worker", error);
    }
  };

  updateInstalledState();
  void markReadyFromExistingRegistration();

  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", updateInstalledState);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    window.__comparadolarInstallPrompt = event as any;
    installPrompt.value = markRaw(event);
    canInstall.value = true;
  });

  window.addEventListener("appinstalled", () => {
    canInstall.value = false;
    installPrompt.value = null;
    window.__comparadolarInstallPrompt = undefined;
    isInstalled.value = true;
  });

  if (document.readyState === "complete") {
    void registerServiceWorker();
  } else {
    window.addEventListener("load", () => void registerServiceWorker(), {
      once: true,
    });
  }
});
