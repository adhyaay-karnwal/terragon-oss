FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update -qq && apt-get install -y -qq git

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/www/package.json apps/www/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/broadcast/package.json apps/broadcast/package.json
COPY apps/isanthropicdown/package.json apps/isanthropicdown/package.json
COPY packages/agent/package.json packages/agent/package.json
COPY packages/bundled/package.json packages/bundled/package.json
COPY packages/cli-api-contract/package.json packages/cli-api-contract/package.json
COPY packages/daemon/package.json packages/daemon/package.json
COPY packages/debug-scripts/package.json packages/debug-scripts/package.json
COPY packages/dev-env/package.json packages/dev-env/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/mcp-server/package.json packages/mcp-server/package.json
COPY packages/one-time-token-signin/package.json packages/one-time-token-signin/package.json
COPY packages/r2/package.json packages/r2/package.json
COPY packages/sandbox/package.json packages/sandbox/package.json
COPY packages/sandbox-image/package.json packages/sandbox-image/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/transactional/package.json packages/transactional/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Replace @vercel/functions with a local shim (fire-and-forget waitUntil)
# since Vercel's waitUntil is not available outside the Vercel runtime.
RUN rm -rf node_modules/@vercel/functions && \
    rm -rf node_modules/.pnpm/*vercel*functions* && \
    mkdir -p node_modules/@vercel/functions && \
    echo 'export function waitUntil(promise) { promise.catch(err => console.error("[vercel-shim]", err)); }' > node_modules/@vercel/functions/index.js && \
    echo '{"type":"module","name":"@vercel/functions","version":"2.1.0","main":"index.js","exports":{".":{"import":"./index.js","types":"./index.d.ts"}}}' > node_modules/@vercel/functions/package.json && \
    echo 'export declare function waitUntil<T>(promise: Promise<T>): void;' > node_modules/@vercel/functions/index.d.ts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/turbo.json /app/turbo.json
COPY . .
ENV DOCKER_BUILD=true
RUN pnpm --filter @terragon/daemon build && \
    pnpm --filter @terragon/mcp-server build && \
    pnpm --filter @terragon/bundled build
RUN pnpm --filter @terragon/www build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

RUN apt-get update -qq && apt-get install -y -qq curl openssl

COPY --from=builder /app/apps/www/.next/standalone ./
COPY --from=builder /app/apps/www/.next/static ./.next/static
COPY --from=builder /app/apps/www/public ./public

COPY scripts/cron-worker.mjs ./cron-worker.mjs
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
