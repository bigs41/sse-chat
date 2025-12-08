package repository

import (
	"context"
	"go-sse-chat/ent"
	"go-sse-chat/ent/user"
)

type UserRepository struct {
	client *ent.Client
}

func NewUserRepository(client *ent.Client) *UserRepository {
	return &UserRepository{
		client: client,
	}
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*ent.User, error) {
	return r.client.User.
		Query().
		Where(user.IDEQ(id)).
		Only(ctx)
}

func (r *UserRepository) CreateOrGet(ctx context.Context, userID, username, email string) (*ent.User, error) {
	// Try to find existing user by ID
	existingUser, err := r.client.User.
		Query().
		Where(user.IDEQ(userID)).
		Only(ctx)
	
	if err == nil {
		// User exists, return it
		return existingUser, nil
	}
	
	// User doesn't exist, create new one
	// If email is empty, generate one from userID (must be unique)
	if email == "" {
		email = userID + "@sse-chat.local"
	}
	
	// If username is empty, use userID
	if username == "" {
		username = userID
	}
	
	// Try to create user, handle unique constraint violation
	createdUser, err := r.client.User.
		Create().
		SetID(userID).
		SetUsername(username).
		SetEmail(email).
		SetPassword(""). // Empty password for now
		Save(ctx)
	
	// If email already exists, try to find by email instead
	if err != nil {
		// Try to find by email as fallback
		existingByEmail, findErr := r.client.User.
			Query().
			Where(user.EmailEQ(email)).
			Only(ctx)
		if findErr == nil {
			return existingByEmail, nil
		}
		return nil, err
	}
	
	return createdUser, nil
}

