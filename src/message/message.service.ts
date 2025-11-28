import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  createMessage(dto: CreateMessageDto, chatId: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      chatId: chatId,
      userId: dto.userId,
      text: dto.text,
      createdAt: new Date(),
    };

    // ส่ง event
    this.eventEmitter.emit('messageCreated', message);

    return message;
  }

  getMessageStream(chatId: string): Observable<Message> {
    return new Observable((subscriber) => {
      const listener = (message: Message) => {
        if (message.chatId === chatId) {
          subscriber.next(message);
        }
      };
      
      this.eventEmitter.on('messageCreated', listener);

      return () => {
        this.eventEmitter.off('messageCreated', listener);
      };
    });
  }
}

