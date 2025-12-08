package service

import (
	"context"
	"go-sse-chat/internal/model"
	"go-sse-chat/internal/repository"
)

type MessageService struct {
	messageRepo *repository.MessageRepository
	userRepo    *repository.UserRepository
	eventBus    *EventBus
}

func NewMessageService(messageRepo *repository.MessageRepository, userRepo *repository.UserRepository, eventBus *EventBus) *MessageService {
	return &MessageService{
		messageRepo: messageRepo,
		userRepo:    userRepo,
		eventBus:    eventBus,
	}
}

func (s *MessageService) CreateMessage(ctx context.Context, chatID string, req *model.CreateMessageRequest) (*model.Message, error) {
	// Ensure user exists before creating message
	_, err := s.userRepo.CreateOrGet(ctx, req.UserID, "", "")
	if err != nil {
		return nil, err
	}
	
	entMessage, err := s.messageRepo.Create(ctx, chatID, req.UserID, req.Text)
	if err != nil {
		return nil, err
	}

	message := &model.Message{
		ID:        entMessage.ID,
		ChatID:    entMessage.ChatID,
		UserID:    entMessage.UserID,
		Text:      entMessage.Text,
		CreatedAt: entMessage.CreatedAt,
	}

	// ส่ง event ไปยัง event bus
	s.eventBus.Publish(chatID, message)

	return message, nil
}

func (s *MessageService) Subscribe(chatID string) <-chan *model.Message {
	return s.eventBus.Subscribe(chatID)
}

func (s *MessageService) Unsubscribe(chatID string, ch <-chan *model.Message) {
	s.eventBus.Unsubscribe(chatID, ch)
}

