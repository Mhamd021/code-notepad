import { Module } from '@nestjs/common';
import { OTService } from './ot.service';

@Module({
  providers: [OTService],
  exports: [OTService],
})
export class OTModule {}