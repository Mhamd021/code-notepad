import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Post()
  create(@Body('language') language?: string) {
    return this.service.create(language);
  }

  @Get(':roomId')
  findOne(@Param('roomId') roomId: string) {
    return this.service.findOne(roomId);
  }
}