import 'dotenv/config';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    setDocument(roomId: string, content: string): Promise<void>;
    getDocument(roomId: string): Promise<string | null>;
    setConnectedUsers(roomId: string, count: number): Promise<void>;
    getConnectedUsers(roomId: string): Promise<number>;
}
