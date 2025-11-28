import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMessage(dto: CreateMessageDto, chatId: string): Promise<Message> {
    const message = await this.prisma['messages'].create({
      data: {
        chatId,
        userId: dto.userId,
        text: dto.text,
      },
    });

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

