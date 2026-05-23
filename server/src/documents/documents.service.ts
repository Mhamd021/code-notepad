import 'dotenv/config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(language: string = 'javascript') {
    const doc = await this.prisma.document.create({
      data: { language },
    });

    await this.redis.setDocument(doc.id, '');

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    return {
      roomId: doc.id,
      language: doc.language,
      url: `${frontendUrl}/room/${doc.id}`,
    };
  }

  async findOne(roomId: string) {
    const cached = await this.redis.getDocument(roomId);

    const doc = await this.prisma.document.findUnique({
      where: { id: roomId },
    });
    if (!doc) throw new NotFoundException('Room not found');

    return {
      roomId: doc.id,
      content: cached ?? doc.content,
      language: doc.language,
    };
  }

  async persist(roomId: string, content: string) {
    await Promise.all([
      this.redis.setDocument(roomId, content),
      this.prisma.document.update({
        where: { id: roomId },
        data: { content },
      }),
    ]);
  }

  async updateLanguage(roomId: string, language: string) {
    return this.prisma.document.update({
      where: { id: roomId },
      data: { language },
    });
  }
}
