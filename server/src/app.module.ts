import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { OTModule } from './ot/ot.module';
import { GatewayModule } from './gateway/gateway.module';


@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }), PrismaModule, RedisModule, DocumentsModule,OTModule,GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
