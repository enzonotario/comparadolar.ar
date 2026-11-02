# syntax=docker/dockerfile:1
# Multi-stage Bun image for Nuxt SSR on Coolify (NITRO_PRESET=bun).
# Use Debian slim (glibc) so @nuxt/image sharp matches the Nitro linux-x64 binary.

FROM oven/bun:1.3-slim AS deps
WORKDIR /app

COPY package.json bun.lock bunfig.toml pnpm-workspace.yaml ./
COPY docs/package.json ./docs/
COPY packages/cli/package.json ./packages/cli/

RUN bun install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=bun
ENV HOST=0.0.0.0
ENV PORT=3000

# Invoke steps with Bun (package.json scripts still use pnpm for CF Pages).
RUN bun run pwa:version \
  && bun run --cwd docs docs:build \
  && bunx --bun nuxi build

FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PRESET=bun
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD bun -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", ".output/server/index.mjs"]
