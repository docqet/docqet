.PHONY: help build up down nuke logs run ui ui-build fix fmt lint vet check test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

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

run: ## Run the server locally, outside Docker, on localhost:8080
	go run ./cmd/docket serve

## --- UI ---

ui: ## Run the UI's dev server, over examples/
	cd ui && npm install && npm run dev

ui-build: ## Build the UI into ui/dist, for go build to embed
	cd ui && npm ci && npm run build

## --- Quality ---

fix:
	go fix ./...

fmt:
	go fmt ./...

lint:
	golangci-lint run

vet:
	go vet ./...

check: fix fmt vet lint ## Everything to check before committing

## --- Tests ---

test: ## Run tests
	go test ./...
