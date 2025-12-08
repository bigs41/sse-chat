import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService, private readonly prisma: PrismaService) {}

  @Post(':server?')
  @HttpCode(HttpStatus.CREATED)
  async createServer(@Body() createServerDto: CreateServerDto, @Param('server') server: string) {
    // console.log(this.prisma.chat_servers['name']);
    // try {
    //   console.log(this.prisma.getModelMeta('chat_servers'));
    //   // validate createServerDto
    //   const modelMeta = this.prisma.getModelMeta('chat_servers');
    //   const fields = modelMeta.fields;
    //   for (const field of fields) {
    //     if (field.name === createServerDto[field.name]) {
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
    return this.serverService.createServer(createServerDto, server);
  }
}

