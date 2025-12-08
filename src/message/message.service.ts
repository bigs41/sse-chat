import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMessage(dto: CreateMessageDto, roomId: string): Promise<Message> {
    const message = await this.prisma.messages.create({
      data: {
        roomId: roomId,
        userId: dto.userId,
        text: dto.text,
      } as any,
    });

    // ส่ง event โดยระบุ roomId
    const eventKey = `messageCreated:room:${roomId}`;
    this.eventEmitter.emit('messageCreated', message);
    this.eventEmitter.emit(eventKey, message);

    return message;
  }

  getMessageStream(roomId: string): Observable<Message> {
    return new Observable((subscriber) => {
      const eventKey = `messageCreated:room:${roomId}`;

      const listener = (message: Message) => {
        // ตรวจสอบว่า message ตรงกับ roomId ที่ต้องการ
        if (message.roomId === roomId) {
          subscriber.next(message);
        }
      };
      
      // ฟังเฉพาะ event เฉพาะของ room นี้เท่านั้น เพื่อหลีกเลี่ยงการส่งซ้ำ
      this.eventEmitter.on(eventKey, listener);

      return () => {
        this.eventEmitter.off(eventKey, listener);
      };
    });
  }

  
}

