package repository

import (
	"context"
	"go-sse-chat/ent"
	"go-sse-chat/ent/message"
)

type MessageRepository struct {
	client *ent.Client
}

func NewMessageRepository(client *ent.Client) *MessageRepository {
	return &MessageRepository{
		client: client,
	}
}

func (r *MessageRepository) Create(ctx context.Context, chatID, userID, text string) (*ent.Message, error) {
	return r.client.Message.
		Create().
		SetChatID(chatID).
		SetUserID(userID).
		SetText(text).
		Save(ctx)
}

func (r *MessageRepository) FindByChatID(ctx context.Context, chatID string) ([]*ent.Message, error) {
	return r.client.Message.
		Query().
		Where(message.ChatIDEQ(chatID)).
		Order(ent.Desc(message.FieldCreatedAt)).
		All(ctx)
}

