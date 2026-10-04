export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = String(config.public.opinaUrl || '').replace(/\/$/, '')
  const key = String(config.public.opinaKey || '')
  if (!base || !key) return

  useHead({
    link: [
      { rel: 'dns-prefetch', href: base },
      { rel: 'preconnect', href: base, crossorigin: '' },
    ],
    script: [
      {
        key: 'opina-widget',
        src: `${base}/widget.js`,
        defer: true,
        tagPosition: 'bodyClose',
        'data-key': key,
      },
    ],
  })
})
