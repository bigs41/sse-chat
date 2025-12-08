import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';

@Injectable()
export class ServerService {
  constructor(private readonly prisma: PrismaService) {}

  async createServer(dto: CreateServerDto, $server: string=null) {
    // ตรวจสอบว่า server name ซ้ำหรือไม่
    let cs: any = null
    let where: any = { name: dto.name }
    if ($server) {
      cs = await this.prisma.chat_servers.findFirst({
        where: { id: $server },
      });
      where['id'] = {
        not: $server,
      }
    }

    const existingServer = await this.prisma.chat_servers.findFirst({
      where: where,
    });

    if (existingServer) {
      throw new ConflictException(`Server name "${dto.name}" มีอยู่แล้ว`);
    }

    // สร้าง server ใหม่
    let server: any = null;
    if ($server) {
      server = await this.prisma.chat_servers.update({
        where: { id: $server },
        data: {
          name: dto.name,
          url: dto.url,
          isPublic: dto.isPublic ?? false,
          isActive: dto.isActive ?? true,
        },
      });
    } else {
      server = await this.prisma.chat_servers.create({
        data: {
          name: dto.name,
          url: dto.url,
          isPublic: dto.isPublic ?? false,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return server;
  }

  async getServer(serverIdentifier: string) {
    // ลองหา server จาก id ก่อน
    let server = await this.prisma.chat_servers.findUnique({
      where: { id: serverIdentifier },
      include: {
        rooms: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    // ถ้าไม่เจอ ลองหาจาก name
    if (!server) {
      server = await this.prisma.chat_servers.findFirst({
        where: { name: serverIdentifier },
        include: {
          rooms: {
            where: {
              isDeleted: false,
            },
          },
        },
      });
    }

    if (!server) {
      throw new NotFoundException(`ไม่พบ server: ${serverIdentifier}`);
    }

    return server;
  }

  async getAllServers() {
    const servers = await this.prisma.chat_servers.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            rooms: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return servers;
  }
}
