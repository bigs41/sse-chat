import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ChatModule,
    MessageModule,
  ],
})
export class AppModule {}

