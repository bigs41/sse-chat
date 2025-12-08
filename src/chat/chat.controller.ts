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

  @Sse(':roomId/messages')
  streamMessages(
    @Param('roomId') roomId: string,
  ): Observable<MessageEvent> {
    return this.messageService.getMessageStream(roomId).pipe(
      map((message) => ({
        data: JSON.stringify({
          id: message.id,
          userId: message.userId,
          text: message.text,
          roomId: message.roomId,
          createdAt: message.createdAt,
        }),
      })),
    );
  }

  @Post(':roomId/messages')
  createMessage(
    @Param('roomId') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(createMessageDto, roomId);
  }
}

