#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Generating Ent code..."
go run entgo.io/ent/cmd/ent@latest generate ./ent/schema

echo "Ent code generated successfully!"
ls -la ent/ | grep -E "message|user|client" || echo "Checking generated files..."

