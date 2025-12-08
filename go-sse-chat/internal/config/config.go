package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
}

func Load() (*Config, error) {
	// Load .env file (ignore error if file doesn't exist)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	// Clean up connection string:
	// 1. Remove "schema" parameter (not supported by PostgreSQL driver)
	// 2. Ensure sslmode=disable is set if not already present
	dbURL = cleanDatabaseURL(dbURL)

	// Ensure sslmode=disable is set if not already present
	// This fixes the "SSL is not enabled on the server" error
	if !strings.Contains(dbURL, "sslmode=") {
		separator := "?"
		if strings.Contains(dbURL, "?") {
			separator = "&"
		}
		dbURL = dbURL + separator + "sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	return &Config{
		DatabaseURL: dbURL,
		Port:        port,
	}, nil
}

// cleanDatabaseURL removes unsupported parameters from PostgreSQL connection string
func cleanDatabaseURL(url string) string {
	// Parse URL to remove "schema" and "schemas" parameters
	// These parameters come from Prisma schema but are not supported by PostgreSQL driver
	parts := strings.Split(url, "?")
	if len(parts) < 2 {
		return url
	}

	baseURL := parts[0]
	queryParams := parts[1]

	// Split query parameters
	params := strings.Split(queryParams, "&")
	var cleanedParams []string

	for _, param := range params {
		// Skip schema and schemas parameters
		if strings.HasPrefix(param, "schema=") || strings.HasPrefix(param, "schemas=") {
			continue
		}
		cleanedParams = append(cleanedParams, param)
	}

	// Reconstruct URL
	if len(cleanedParams) > 0 {
		return baseURL + "?" + strings.Join(cleanedParams, "&")
	}
	return baseURL
}
