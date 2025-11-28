import { Controller, Sse, Param, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';

interface MessageEvent {
  data: string | object;
}

@Controller('chats')
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

  @Sse(':chatId/messages')
  streamMessages(@Param('chatId') chatId: string): Observable<MessageEvent> {
    
    return this.messageService.getMessageStream(chatId).pipe(
      map((message) => ({
        data: {
          id: message.id,
          userId: message.userId,
          text: message.text,
          createdAt: message.createdAt,
        },
      })),
    );
  }

  @Post(':chatId/messages')
  createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(createMessageDto, chatId);
  }
}

