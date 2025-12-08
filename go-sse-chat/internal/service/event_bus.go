package service

import (
	"go-sse-chat/internal/model"
	"sync"
)

// EventBus จัดการ event สำหรับ SSE
type EventBus struct {
	subscribers map[string][]chan *model.Message
	channelMap  map[<-chan *model.Message]chan *model.Message
	mu          sync.RWMutex
}

func NewEventBus() *EventBus {
	return &EventBus{
		subscribers: make(map[string][]chan *model.Message),
		channelMap:  make(map[<-chan *model.Message]chan *model.Message),
	}
}

func (eb *EventBus) Subscribe(chatID string) <-chan *model.Message {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	ch := make(chan *model.Message, 10)
	eb.subscribers[chatID] = append(eb.subscribers[chatID], ch)

	// Store mapping from receive-only to bidirectional channel
	receiveOnly := (<-chan *model.Message)(ch)
	eb.channelMap[receiveOnly] = ch

	return receiveOnly
}

func (eb *EventBus) Unsubscribe(chatID string, ch <-chan *model.Message) {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	// Get bidirectional channel from map
	bidirectionalCh, exists := eb.channelMap[ch]
	if !exists {
		return
	}

	// Remove from subscribers
	subs := eb.subscribers[chatID]
	for i, sub := range subs {
		if sub == bidirectionalCh {
			eb.subscribers[chatID] = append(subs[:i], subs[i+1:]...)
			close(sub)
			break
		}
	}

	// Remove from channel map
	delete(eb.channelMap, ch)
}

func (eb *EventBus) Publish(chatID string, message *model.Message) {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	for _, ch := range eb.subscribers[chatID] {
		select {
		case ch <- message:
		default:
			// ถ้า channel เต็ม ให้ skip
		}
	}
}
