interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __comparadolarInstallPrompt?: BeforeInstallPromptEvent;
    __comparadolarApplyUpdate?: () => Promise<void>;
  }
}

export function usePwaInstall() {
  const canInstall = useState("pwa:can-install", () => false);
  const installPrompt = useState<BeforeInstallPromptEvent | null>(
    "pwa:install-prompt",
    () => null,
  );
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
  const serviceWorkerSupported = computed(
    () => import.meta.client && "serviceWorker" in navigator,
  );

  if (import.meta.client) {
    onMounted(async () => {
      isInstalled.value =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      if (!serviceWorkerSupported.value) return;

      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active || navigator.serviceWorker.controller) {
        serviceWorkerReady.value = true;
      }

      void navigator.serviceWorker.ready.then(() => {
        serviceWorkerReady.value = true;
      });
    });
  }

  const install = async () => {
    if (!import.meta.client) return false;

    const prompt = installPrompt.value || window.__comparadolarInstallPrompt;
    if (!prompt) return false;

    await prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice?.outcome === "accepted") {
      isInstalled.value = true;
    }

    canInstall.value = false;
    installPrompt.value = null;
    window.__comparadolarInstallPrompt = undefined;

    return true;
  };

  const applyUpdate = async () => {
    if (!import.meta.client) return;

    if (window.__comparadolarApplyUpdate) {
      await window.__comparadolarApplyUpdate();
      return;
    }

    window.location.reload();
  };

  const checkForUpdate = async () => {
    if (!import.meta.client) return;

    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.update();
  };

  return {
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    serviceWorkerReady: readonly(serviceWorkerReady),
    serviceWorkerSupported,
    updateAvailable: readonly(updateAvailable),
    currentVersion: readonly(currentVersion),
    latestVersion: readonly(latestVersion),
    install,
    applyUpdate,
    checkForUpdate,
  };
}
