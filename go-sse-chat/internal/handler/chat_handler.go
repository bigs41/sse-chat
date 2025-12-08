package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go-sse-chat/internal/model"
	"go-sse-chat/internal/service"

	"github.com/go-chi/chi/v5"
)

type ChatHandler struct {
	messageService *service.MessageService
}

func NewChatHandler(messageService *service.MessageService) *ChatHandler {
	return &ChatHandler{
		messageService: messageService,
	}
}

// StreamMessages จัดการ SSE endpoint สำหรับ stream messages
func (h *ChatHandler) StreamMessages(w http.ResponseWriter, r *http.Request) {
	chatID := chi.URLParam(r, "chatId")
	if chatID == "" {
		http.Error(w, "chatId is required", http.StatusBadRequest)
		return
	}

	// ตั้งค่า headers สำหรับ SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("X-Accel-Buffering", "no") // Disable buffering for nginx

	// Note: WriteTimeout is disabled at server level (WriteTimeout: 0)
	// This prevents automatic disconnection of SSE streams

	// สร้าง channel สำหรับรับ messages
	messageChan := h.messageService.Subscribe(chatID)
	defer h.messageService.Unsubscribe(chatID, messageChan)

	// สร้าง context ที่จะ cancel เมื่อ client disconnect
	ctx := r.Context()

	// ส่ง keep-alive ping ทุก 15 วินาที (ลดจาก 30 เพื่อป้องกัน timeout)
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	// สร้าง channel สำหรับ flush
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	// ส่ง initial connection message
	fmt.Fprintf(w, ": connected\n\n")
	flusher.Flush()

	for {
		select {
		case <-ctx.Done():
			// Client disconnected
			return
		case message, ok := <-messageChan:
			if !ok {
				// Channel closed
				return
			}
			if err := h.sendSSEMessage(w, message); err != nil {
				return
			}
			flusher.Flush()
		case <-ticker.C:
			// Send keep-alive comment
			if _, err := fmt.Fprintf(w, ": keep-alive\n\n"); err != nil {
				return
			}
			flusher.Flush()
		}
	}
}

// sendSSEMessage ส่ง message ในรูปแบบ SSE
func (h *ChatHandler) sendSSEMessage(w http.ResponseWriter, message *model.Message) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(w, "data: %s\n\n", data)
	return err
}

// CreateMessage จัดการ POST endpoint สำหรับสร้าง message
func (h *ChatHandler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	chatID := chi.URLParam(r, "chatId")
	if chatID == "" {
		http.Error(w, "chatId is required", http.StatusBadRequest)
		return
	}

	var req model.CreateMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate
	if req.UserID == "" || req.Text == "" {
		http.Error(w, "userId and text are required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	message, err := h.messageService.CreateMessage(ctx, chatID, &req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create message: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(message)
}
