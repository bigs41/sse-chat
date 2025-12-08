package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go-sse-chat/ent"
	"go-sse-chat/internal/config"
	"go-sse-chat/internal/handler"
	"go-sse-chat/internal/repository"
	"go-sse-chat/internal/service"

	"entgo.io/ent/dialect"
	_ "github.com/lib/pq"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	client, err := ent.Open(dialect.Postgres, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	// Run auto migration
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("Failed creating schema resources: %v", err)
	}

	// Initialize dependencies
	messageRepo := repository.NewMessageRepository(client)
	userRepo := repository.NewUserRepository(client)
	eventBus := service.NewEventBus()
	messageService := service.NewMessageService(messageRepo, userRepo, eventBus)
	chatHandler := handler.NewChatHandler(messageService)
	router := handler.NewRouter(chatHandler)

	// Create HTTP server
	// Note: WriteTimeout should be 0 for SSE connections to prevent disconnection
	// Individual handlers will manage their own timeouts
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0,                 // Disable write timeout for SSE (0 = no timeout)
		IdleTimeout:  120 * time.Second, // Increase idle timeout for long-lived connections
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Server is running on http://localhost:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
