PROJECT_ID ?= ai-chat-487803
REGION ?= asia-northeast1
SERVICE_NAME ?= diary-system
PORT ?= 8080

.PHONY: install lint test ci prepare deploy

install:
	npm ci

lint:
	npm run lint

test:
	npm run test

ci: lint test

prepare:
	npm run prepare

deploy:
	gcloud run deploy $(SERVICE_NAME) \
		--source . \
		--project $(PROJECT_ID) \
		--region $(REGION) \
		--port $(PORT) \
		--allow-unauthenticated
