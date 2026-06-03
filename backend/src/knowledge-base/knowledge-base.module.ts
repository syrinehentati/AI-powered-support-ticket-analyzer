import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { EmbeddingService } from './embedding.service';
import { KnowledgeBaseEntity } from './entities/knowledge-base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBaseEntity])],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, EmbeddingService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
