import { Controller, Post, Get, Body } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class AddEntryDto {
  @IsString() @IsNotEmpty()
  ticket_id!: string;

  @IsString() @IsNotEmpty()
  title!: string;

  @IsString() @IsNotEmpty()
  description!: string;

  @IsArray()
  logs!: string[];

  @IsArray()
  resolution!: string[];

  @IsString() @IsNotEmpty()
  category!: string;

  @IsString() @IsNotEmpty()
  severity!: string;

  @IsString() @IsNotEmpty()
  detected_language!: string;
}

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(
    private readonly knowledgeBaseService: KnowledgeBaseService
  ) {}

  @Post()
  addEntry(@Body() dto: AddEntryDto) {
    return this.knowledgeBaseService.addEntry(
      dto.ticket_id,
      dto.title,
      dto.description,
      dto.logs,
      dto.resolution,
      dto.category,
      dto.severity,
      dto.detected_language,
    );
  }

  @Get()
  getAll() {
    return this.knowledgeBaseService.getAll();
  }

  @Get('count')
  getCount() {
    return { count: this.knowledgeBaseService.getCount() };
  }
}