export default defineNuxtPlugin(() => {
  const { initialize } = useGtag();

  let started = false;
  const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

  const start = () => {
    if (started) return;
    started = true;
    initialize();
    for (const event of events) {
      window.removeEventListener(event, start);
    }
  };

  for (const event of events) {
    window.addEventListener(event, start, {
      once: true,
      passive: true,
    });
  }

  const idle =
    window.requestIdleCallback ??
    ((cb: () => void) => window.setTimeout(cb, 2500));

  idle(() => start());
});
