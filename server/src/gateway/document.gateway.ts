import 'dotenv/config';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OTService, Operation } from '../ot/ot.service';
import { DocumentState } from '../ot/ot.types';
import { RedisService } from '../redis/redis.service';
import { DocumentsService } from '../documents/documents.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000' },
})
export class DocumentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private rooms = new Map<string, DocumentState>();

  constructor(
    private ot: OTService,
    private redis: RedisService,
    private documents: DocumentsService,
  ) {}

  private roomSockets = new Map<string, Set<string>>();


  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
  for (const [roomId, sockets] of this.roomSockets) {
    if (sockets.has(client.id)) {
      sockets.delete(client.id);
      this.server.to(roomId).emit('users-count', { 
        count: sockets.size 
      });
    }
  }
}

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; clientId: string },
    @ConnectedSocket() client: Socket,
  ) {
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
  this.roomSockets.get(roomId)!.add(client.id);

    const state = this.rooms.get(roomId)!;

    client.emit('room-joined', {
      content: state.content,
      version: state.version,
      language: (await this.documents.findOne(roomId)).language,
    });
    
    this.server.to(roomId).emit('users-count', { 
    count: this.roomSockets.get(roomId)!.size 
  });
    client.to(roomId).emit('user-joined', { clientId });
  }

  @SubscribeMessage('operation')
  async handleOperation(
    @MessageBody() data: {
      roomId: string;
      operation: Operation;
    },
    @ConnectedSocket() client: Socket,
  ) {
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

  @SubscribeMessage('change-language')
  async handleChangeLanguage(
    @MessageBody() data: { roomId: string; language: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, language } = data;

   
    await this.documents.updateLanguage(roomId, language);

    this.server.to(roomId).emit('language-changed', { language });
  }
}