ระบบแชทที่ใช้ SSE และ EventEmitter

---

# ✅ **Message Context + MessageService (พร้อม EventEmitter + Stream)**

นี่คือตัวอย่างแบบสมบูรณ์ของ **MessageService**, **MessageModel**, และ **Context (DTO)** ที่คุณสามารถนำไปใช้ได้ทันที

---

## 📌 **message.model.ts**

```ts
export interface Message {
  id: string;
  chatId: string;
  text: string;
  createdAt: Date;
}
```

---

## 📌 **create-message.dto.ts**  (context สำหรับการสร้าง message)

```ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
```

---

## 📌 **message.service.ts** (สร้าง message + context stream)

```ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import { CreateMessageDto } from './create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  createMessage(dto: CreateMessageDto): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      chatId: dto.chatId,
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
```

---

## 📌 **chat.controller.ts** (SSE Endpoint)

```ts
import { Controller, Sse, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageService } from './message.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

  @Sse(':chatId/messages')
  streamMessages(@Param('chatId') chatId: string): Observable<any> {
    return this.messageService.getMessageStream(chatId).pipe(
      map((message) => ({
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
      })),
    );
  }
}
```

---

# 🎉 คุณได้ครบทั้ง:

✔ context สำหรับ create message
✔ MessageService + event emitter
✔ SSE streaming
✔ พร้อมใช้งานในระบบ chat real-time

