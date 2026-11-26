.PHONY: help install build up down nuke logs migrate run apply examples ui ui-build ui-lint fix fmt lint vet docs-lint check test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

## --- The docqet command ---

VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)

install: ## Install docqet into your Go bin, to use it in any project (the UI is embedded only if ui/dist is built)
	go install -ldflags "-X main.version=$(VERSION)" ./cmd/docqet

## --- Local stack ---

build: ## Build and start the local stack
	docker compose up -d --build

up: ## Start the local stack
	docker compose up -d

down: ## Stop the local stack
	docker compose down

nuke: ## Stop the local stack and destroy its volumes
	docker compose down -v

logs: ## Follow the server's logs
	docker compose logs -f app

migrate: ## Bring the local server's database, data/docqet.db, up to date
	go run ./cmd/docqet migrate

run: migrate ## Run the server locally, outside Docker, on localhost:8080, with its API docs at /docs/api
	go run ./cmd/docqet serve

DOCQET_SERVER ?= http://localhost:8080

apply: ## Send Docqet's own new commits to the local server: DOCQET_SERVER=http://localhost:8090 for Docker's
	DOCQET_SERVER=$(DOCQET_SERVER) go run ./cmd/docqet apply

# The examples are folders in this repository, not repositories of their own,
# so each one's state is sent as it is, at this repository's HEAD, rather
# than by docqet apply. Needs jq.
examples: ## Load the examples into the local server, for the UI to show
	@sha=$$(git rev-parse HEAD); at=$$(git show -s --format=%cI HEAD); \
	for state in $$(find examples -path '*/.docqet/state.json' | sort); do \
		id=$$(jq -r .project.id $$state); \
		jq -c --arg at "$$at" '{parents: [], committedAt: $$at, trailers: [], state: .}' $$state | \
			curl -sf -o /dev/null -w "$$id %{http_code}\n" -X PUT -H 'Content-Type: application/json' \
				--data-binary @- $(DOCQET_SERVER)/api/v1/projects/$$id/commits/$$sha || exit 1; \
	done

## --- UI ---

ui: ## Run the UI's dev server, over the local server's API: make run, then make apply or make examples

	cd ui && npm install && npm run dev

ui-build: ## Build the UI into ui/dist, for go build to embed
	cd ui && npm ci && npm run build

ui-lint: ## Lint the UI and check its formatting: cd ui && npm run format fixes it
	cd ui && npm run lint && npm run format:check

## --- Quality ---

fix:
	go fix ./...

fmt:
	go fmt ./...

lint:
	golangci-lint run

vet:
	go vet ./...

docs-lint:
	npx redocly lint

check: fix fmt vet lint docs-lint ui-lint ## Everything to check before committing

## --- Tests ---

test: ## Run tests
	go test ./...
