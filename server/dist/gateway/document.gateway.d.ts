import 'dotenv/config';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OTService, Operation } from '../ot/ot.service';
import { RedisService } from '../redis/redis.service';
import { DocumentsService } from '../documents/documents.service';
export declare class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private ot;
    private redis;
    private documents;
    server: Server;
    private rooms;
    constructor(ot: OTService, redis: RedisService, documents: DocumentsService);
    private roomSockets;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(data: {
        roomId: string;
        clientId: string;
    }, client: Socket): Promise<void>;
    handleOperation(data: {
        roomId: string;
        operation: Operation;
    }, client: Socket): Promise<void>;
    handleChangeLanguage(data: {
        roomId: string;
        language: string;
    }, client: Socket): Promise<void>;
}
