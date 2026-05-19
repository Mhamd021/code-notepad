"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
require("dotenv/config");
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    client;
    onModuleInit() {
        this.client = new ioredis_1.default(process.env.REDIS_URL);
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async setDocument(roomId, content) {
        await this.client.setex(`doc:${roomId}`, 86400, content);
    }
    async getDocument(roomId) {
        return this.client.get(`doc:${roomId}`);
    }
    async setConnectedUsers(roomId, count) {
        await this.client.setex(`users:${roomId}`, 86400, count.toString());
    }
    async getConnectedUsers(roomId) {
        const count = await this.client.get(`users:${roomId}`);
        return count ? parseInt(count) : 0;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map