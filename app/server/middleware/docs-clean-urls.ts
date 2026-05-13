const HTML_EXT = /\.html$/
const HAS_EXT = /\.[a-zA-Z0-9]+$/

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const { pathname } = url

  if (!pathname.startsWith('/docs/') || pathname === '/docs/') return
  if (HTML_EXT.test(pathname)) return
  if (HAS_EXT.test(pathname)) return

  return sendRedirect(event, `${pathname}.html`, 301)
})
