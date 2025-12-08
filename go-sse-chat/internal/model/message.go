package model

import (
	"time"
)

type Message struct {
	ID        string    `json:"id"`
	ChatID    string    `json:"chatId"`
	UserID    string    `json:"userId"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateMessageRequest struct {
	UserID string `json:"userId" validate:"required"`
	Text   string `json:"text" validate:"required"`
}

