import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit() {
   
    this.client = new Redis(process.env.REDIS_URL!);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async setDocument(roomId: string, content: string): Promise<void> {
    await this.client.setex(`doc:${roomId}`, 86400, content);
  }

  async getDocument(roomId: string): Promise<string | null> {
    return this.client.get(`doc:${roomId}`);
  }

  async setConnectedUsers(roomId: string, count: number): Promise<void> {
    await this.client.setex(`users:${roomId}`, 86400, count.toString());
  }

  async getConnectedUsers(roomId: string): Promise<number> {
    const count = await this.client.get(`users:${roomId}`);
    return count ? parseInt(count) : 0;
  }
}