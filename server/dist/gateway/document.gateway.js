"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGateway = void 0;
require("dotenv/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ot_service_1 = require("../ot/ot.service");
const redis_service_1 = require("../redis/redis.service");
const documents_service_1 = require("../documents/documents.service");
let DocumentGateway = class DocumentGateway {
    ot;
    redis;
    documents;
    server;
    rooms = new Map();
    constructor(ot, redis, documents) {
        this.ot = ot;
        this.redis = redis;
        this.documents = documents;
    }
    roomSockets = new Map();
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        for (const [roomId, sockets] of this.roomSockets) {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);
                this.server.to(roomId).emit('users-count', {
                    count: sockets.size
                });
            }
        }
    }
    async handleJoinRoom(data, client) {
        const { roomId, clientId } = data;
        client.join(roomId);
        if (!this.rooms.has(roomId)) {
            const doc = await this.documents.findOne(roomId);
            this.rooms.set(roomId, {
                content: doc.content,
                version: 0,
                history: [],
            });
        }
        if (!this.roomSockets.has(roomId)) {
            this.roomSockets.set(roomId, new Set());
        }
        this.roomSockets.get(roomId).add(client.id);
        const state = this.rooms.get(roomId);
        client.emit('room-joined', {
            content: state.content,
            version: state.version,
            language: (await this.documents.findOne(roomId)).language,
        });
        this.server.to(roomId).emit('users-count', {
            count: this.roomSockets.get(roomId).size
        });
        client.to(roomId).emit('user-joined', { clientId });
    }
    async handleOperation(data, client) {
        const { roomId, operation } = data;
        const state = this.rooms.get(roomId);
        if (!state) {
            client.emit('error', { message: 'Room not found' });
            return;
        }
        let transformedOp = operation;
        if (operation.version < state.version) {
            const missedOps = state.history.slice(operation.version);
            transformedOp = this.ot.transformAgainstMany(operation, missedOps);
        }
        if (transformedOp.position === -1) {
            client.emit('operation-ack', { version: state.version });
            return;
        }
        state.content = this.ot.applyOperation(state.content, transformedOp);
        state.version += 1;
        state.history.push(transformedOp);
        await this.redis.setDocument(roomId, state.content);
        if (state.version % 10 === 0) {
            await this.documents.persist(roomId, state.content);
        }
        this.server.to(roomId).emit('operation', {
            operation: transformedOp,
            version: state.version,
            clientId: operation.clientId,
        });
        client.emit('operation-ack', { version: state.version });
    }
    async handleChangeLanguage(data, client) {
        const { roomId, language } = data;
        await this.documents.updateLanguage(roomId, language);
        this.server.to(roomId).emit('language-changed', { language });
    }
};
exports.DocumentGateway = DocumentGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], DocumentGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], DocumentGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('operation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], DocumentGateway.prototype, "handleOperation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('change-language'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], DocumentGateway.prototype, "handleChangeLanguage", null);
exports.DocumentGateway = DocumentGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: 'http://localhost:3000' },
    }),
    __metadata("design:paramtypes", [ot_service_1.OTService,
        redis_service_1.RedisService,
        documents_service_1.DocumentsService])
], DocumentGateway);
//# sourceMappingURL=document.gateway.js.map