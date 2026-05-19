import { Module } from '@nestjs/common';
import { DocumentGateway } from './document.gateway';
import { OTModule } from '../ot/ot.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [OTModule, DocumentsModule],
  providers: [DocumentGateway],
})
export class GatewayModule {}