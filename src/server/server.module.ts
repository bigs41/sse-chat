import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService, PrismaService],
  exports: [ServerService],
})
export class ServerModule {}
