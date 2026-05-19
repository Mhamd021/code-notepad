import 'dotenv/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class DocumentsService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    create(language?: string): Promise<{
        roomId: string;
        language: string;
        url: string;
    }>;
    findOne(roomId: string): Promise<{
        roomId: string;
        content: string;
        language: string;
    }>;
    persist(roomId: string, content: string): Promise<void>;
    updateLanguage(roomId: string, language: string): Promise<{
        id: string;
        content: string;
        language: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
