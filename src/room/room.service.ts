import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async findServerByIdOrName(serverIdentifier: string) {
    // ลองหา server จาก id ก่อน
    let server = await this.prisma.chat_servers.findUnique({
      where: { id: serverIdentifier },
    }); 

    // ถ้าไม่เจอ ลองหาจาก name
    if (!server) {
      server = await this.prisma.chat_servers.findFirst({
        where: { name: serverIdentifier },
      });
    }

    return server;
  }

  async createRoom(serverIdentifier: string, dto: CreateRoomDto, $roomId: string = null) {
    // หา server จาก id หรือ name
    const server = await this.findServerByIdOrName(serverIdentifier);

    if (!server) {
      throw new NotFoundException(`ไม่พบ server: ${serverIdentifier}`);
    }

    if (!server.isActive || server.isDeleted) {
      throw new BadRequestException(`Server ${serverIdentifier} ไม่สามารถใช้งานได้`);
    }

    // สร้างห้องใหม่
    const room = await this.prisma.room.upsert({
      where: { id: $roomId },
      update: {
        name: dto.name,
        serverId: server.id,
        type: dto.type,
        description: dto.description,
        avatar: dto.avatar,
        isPublic: dto.isPublic ?? false,
        isActive: dto.isActive ?? true,
        isPinned: dto.isPinned ?? false,
      },
      create: {
        name: dto.name,
        serverId: server.id,
        type: dto.type,
        description: dto.description,
        avatar: dto.avatar,
        isPublic: dto.isPublic ?? false,
        isActive: dto.isActive ?? true,
        isPinned: dto.isPinned ?? false,
      },
    });

    // เพิ่มผู้สร้างห้องเข้าไปใน room_users


    try {
      await this.prisma.updateOrCreate(
        this.prisma.room_users,
        { roomId: room.id, userId: dto.userId },
        {
          roomId: room.id,
          userId: dto.userId,
        },
      );
    } catch (error) {
      // ถ้า updateOrCreate ไม่สำเร็จ ให้ลอง create ใหม่
      try {
        await this.prisma.room_users.create({
          data: {
            roomId: room.id,
            userId: dto.userId,
          },
        });
      } catch (createError) {
        // ถ้า create ไม่สำเร็จ อาจเป็นเพราะมีอยู่แล้ว (unique constraint)
        // ไม่ต้องทำอะไร
      }
    }

    return room;
  }

  async joinRoom(serverIdentifier: string, roomId: string, dto: JoinRoomDto) {
    // หา server จาก id หรือ name
    const server = await this.findServerByIdOrName(serverIdentifier);

    if (!server) {
      throw new NotFoundException(`ไม่พบ server: ${serverIdentifier}`);
    }

    // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่ และอยู่ใน server ที่ระบุ
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        serverId: server.id,
      },
    });

    if (!room) {
      throw new NotFoundException(`ไม่พบห้องที่มี ID: ${roomId} ใน server: ${serverIdentifier}`);
    }

    if (!room.isActive || room.isDeleted) {
      throw new BadRequestException(`ห้องนี้ไม่สามารถเข้าร่วมได้`);
    }

    if (room.isLocked) {
      throw new BadRequestException(`ห้องนี้ถูกล็อค ไม่สามารถเข้าร่วมได้`);
    }

    // ตรวจสอบว่าผู้ใช้อยู่ในห้องแล้วหรือยัง
    const existingRoomUser = await this.prisma.room_users.findUnique({
      where: {
        roomId_userId: {
          roomId: roomId,
          userId: dto.userId,
        },
      },
    });

    if (existingRoomUser) {
      throw new ConflictException('ผู้ใช้อยู่ในห้องนี้แล้ว');
    }

    // เพิ่มผู้ใช้เข้าไปในห้อง
    const roomUser = await this.prisma.room_users.create({
      data: {
        roomId: roomId,
        userId: dto.userId,
      },
      include: {
        room: true,
        user: true,
      },
    });

    return roomUser;
  }

  async getRoom(serverIdentifier: string, roomId: string) {
    // หา server จาก id หรือ name
    const server = await this.findServerByIdOrName(serverIdentifier);

    if (!server) {
      throw new NotFoundException(`ไม่พบ server: ${serverIdentifier}`);
    }

    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        serverId: server.id,
      },
      include: {
        roomUsers: {
          include: {
            user: true,
          },
        },
        server: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`ไม่พบห้องที่มี ID: ${roomId} ใน server: ${serverIdentifier}`);
    }

    return room;
  }
}
