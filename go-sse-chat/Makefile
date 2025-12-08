.PHONY: generate build run docker-up docker-down clean

# Generate Ent code
generate:
	go generate ./ent

# Build the application
build: generate
	go build -o bin/go-sse-chat ./cmd/server

# Run the application
run: generate
	go run ./cmd/server

# Run with Docker Compose
docker-up:
	docker-compose up --build

# Stop Docker Compose
docker-down:
	docker-compose down

# Clean generated files
clean:
	rm -rf bin/
	rm -rf ent/gen

