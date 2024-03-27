FROM node:20.11.1-slim as build

RUN corepack enable

WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY pnpm-workspace.yaml /app/

COPY ./packages/probing-eservice-registry-updater/package.json /app/packages/probing-eservice-registry-updater/package.json
COPY ./packages/commons/package.json /app/packages/commons/package.json
COPY ./packages/models/package.json /app/packages/models/package.json
COPY ./packages/clients/eservice-operations/package.json /app/packages/clients/eservice-operations/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json /app/
COPY turbo.json /app/
COPY ./packages/probing-eservice-registry-updater /app/packages/probing-eservice-registry-updater
COPY ./packages/probing-eservice-operations/open-api /app/packages/probing-eservice-operations/open-api
COPY ./packages/commons /app/packages/commons
COPY ./packages/models /app/packages/models
COPY ./packages/clients/eservice-operations /app/packages/clients/eservice-operations

RUN pnpm build

WORKDIR /app/packages/probing-eservice-registry-updater
EXPOSE 3000

CMD [ "node", "." ]