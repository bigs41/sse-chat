import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Sse, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';

interface MessageEvent {
  data: string | object;
}

@Controller(':server/rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @Post(':roomId?')
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Param('server') server: string,
    @Param('roomId') roomId: string = null,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(server, createRoomDto, roomId);
  }

  @Post(':roomId/join')
  @HttpCode(HttpStatus.CREATED)
  async joinRoom(
    @Param('server') server: string,
    @Param('roomId') roomId: string,
    @Body() joinRoomDto: JoinRoomDto,
  ) {
    return this.roomService.joinRoom(server, roomId, joinRoomDto);
  }

  @Get(':roomId')
  async getRoom(
    @Param('server') server: string,
    @Param('roomId') roomId: string,
  ) {
    return this.roomService.getRoom(server, roomId);
  }

  @Sse(':roomId/messages')
  streamRoomMessages(
    @Param('server') server: string,
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
  @HttpCode(HttpStatus.CREATED)
  async createRoomMessage(
    @Param('server') server: string,
    @Param('roomId') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(createMessageDto, roomId);
  }
}
