FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY package.json /app/package.json
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV BASE_URL=https://auth.inpt.fr
ENV CLIENT_ID=invalid
ENV CLIENT_SECRET=invalid
ENV REDIRECT_URL=http://localhost:3000/auth/callback
ENV LOGOUT_URL=https://auth.inpt.fr/application/o/b00chat/end-session/
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
EXPOSE 3000
CMD [ "pnpm", "start" ]
