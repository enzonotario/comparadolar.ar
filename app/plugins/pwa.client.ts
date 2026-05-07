interface AppVersionPayload {
  version: string;
  commit?: string;
  builtAt?: string;
}

const APP_VERSION_STORAGE_KEY = "comparadolar:app-version";

export default defineNuxtPlugin(() => {
  const canInstall = useState("pwa:can-install", () => false);
  const installPrompt = useState<any>("pwa:install-prompt", () => null);
  const isInstalled = useState("pwa:is-installed", () => false);
  const serviceWorkerReady = useState("pwa:service-worker-ready", () => false);
  const updateAvailable = useState("pwa:update-available", () => false);
  const currentVersion = useState<string | null>(
    "pwa:current-version",
    () => null,
  );
  const latestVersion = useState<string | null>(
    "pwa:latest-version",
    () => null,
  );

  let refreshingForUpdate = false;

  const updateInstalledState = () => {
    isInstalled.value =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
  };

  const rememberWaitingWorker = (registration: ServiceWorkerRegistration) => {
    if (!registration.waiting) return;
    (window as any).__comparadolarWaitingWorker = registration.waiting;
    updateAvailable.value = true;
  };

  const checkAppVersion = async () => {
    try {
      const response = await fetch(`/app-version.json?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return;

      const payload = (await response.json()) as AppVersionPayload;
      if (!payload.version) return;

      const storedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
      currentVersion.value = storedVersion || payload.version;
      latestVersion.value = payload.version;

      if (!storedVersion) {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, payload.version);
        return;
      }

      if (storedVersion !== payload.version) {
        updateAvailable.value = true;
      }
    } catch (error) {
      console.warn("No se pudo chequear la versión de la PWA", error);
    }
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
    if (registration) rememberWaitingWorker(registration);
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

      rememberWaitingWorker(registration);

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            (window as any).__comparadolarWaitingWorker = registration.waiting;
            updateAvailable.value = true;
          }
        });
      });

      void registration.update().catch(() => {});

      void navigator.serviceWorker.ready.then((readyRegistration) => {
        serviceWorkerReady.value = true;
        rememberWaitingWorker(readyRegistration);
        void registerPeriodicSync(readyRegistration);
      });

      await registerPeriodicSync(registration);
    } catch (error) {
      console.error("Error registering service worker", error);
    }
  };

  updateInstalledState();
  void markReadyFromExistingRegistration();
  void checkAppVersion();

  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", updateInstalledState);

  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (!refreshingForUpdate) return;
    window.location.reload();
  });

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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void checkAppVersion();
      void navigator.serviceWorker?.getRegistration().then((registration) => {
        void registration?.update();
        if (registration) rememberWaitingWorker(registration);
      });
    }
  });

  setInterval(
    () => {
      void checkAppVersion();
      void navigator.serviceWorker?.getRegistration().then((registration) => {
        void registration?.update();
        if (registration) rememberWaitingWorker(registration);
      });
    },
    5 * 60 * 1000,
  );

  (window as any).__comparadolarApplyUpdate = async () => {
    refreshingForUpdate = true;
    if (latestVersion.value) {
      localStorage.setItem(APP_VERSION_STORAGE_KEY, latestVersion.value);
    }

    const waitingWorker = (window as any).__comparadolarWaitingWorker as
      | ServiceWorker
      | undefined;

    if (waitingWorker) {
      waitingWorker.postMessage({ type: "COMPARADOLAR_SKIP_WAITING" });
      setTimeout(() => window.location.reload(), 1500);
      return;
    }

    window.location.reload();
  };

  if (document.readyState === "complete") {
    void registerServiceWorker();
  } else {
    window.addEventListener("load", () => void registerServiceWorker(), {
      once: true,
    });
  }
});
