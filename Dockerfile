# syntax=docker/dockerfile:1

# The UI, built first so the Go build can embed it.
FROM node:24-alpine AS ui

WORKDIR /src/ui

COPY ui/package.json ui/package-lock.json ./

RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm ci

COPY ui/ ./

RUN npm run build

FROM golang:1.27-alpine AS builder

RUN apk add --no-cache git

WORKDIR /src

ENV CGO_ENABLED=0

COPY go.mod go.sum ./

RUN --mount=type=cache,id=gomod,target=/go/pkg/mod \
    go mod download

COPY . .
COPY --from=ui /src/ui/dist ui/dist

ARG VERSION=dev

RUN --mount=type=cache,id=gomod,target=/go/pkg/mod \
    --mount=type=cache,id=gobuild,target=/root/.cache/go-build \
    go install -trimpath -ldflags "-s -w -X main.version=${VERSION}" ./cmd/docket

FROM alpine:3.24 AS runner

RUN apk add --no-cache ca-certificates \
 && adduser -S -D -H -u 10001 appuser

COPY --from=builder /go/bin/docket /usr/local/bin/docket

# Where the server keeps its SQLite database, on a volume in Compose.
RUN mkdir -p /var/lib/docket && chown 10001 /var/lib/docket

# A writable working directory for the non-root user, for any relative paths
# docket resolves.
RUN mkdir -p /app && chown 10001 /app
WORKDIR /app

USER 10001

EXPOSE 8080

CMD ["docket", "serve"]
