import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageService } from '../message/message.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule],
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
  exports: [RoomService],
})  
export class RoomModule {}
