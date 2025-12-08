import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { ServerModule } from './server/server.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    ChatModule,
    MessageModule,
    RoomModule,
    ServerModule,
  ],
})
export class AppModule {}

