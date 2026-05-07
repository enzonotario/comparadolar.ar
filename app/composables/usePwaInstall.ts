export function usePwaInstall() {
  const canInstall = useState("pwa:can-install", () => false);
  const installPrompt = useState<any>("pwa:install-prompt", () => null);
  const isInstalled = useState("pwa:is-installed", () => false);
  const serviceWorkerReady = useState("pwa:service-worker-ready", () => false);

  const install = async () => {
    if (!installPrompt.value) return;

    await installPrompt.value.prompt();
    const choice = await installPrompt.value.userChoice;

    if (choice?.outcome === "accepted") {
      isInstalled.value = true;
    }

    canInstall.value = false;
    installPrompt.value = null;
  };

  return {
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    serviceWorkerReady: readonly(serviceWorkerReady),
    install,
  };
}
