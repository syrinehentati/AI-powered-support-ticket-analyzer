import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisModule } from './analysis/analysis.module';
import { TicketsModule } from './tickets/tickets.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { TicketEntity } from './tickets/entites/ticket.entity';
import { KnowledgeBaseEntity } from './knowledge-base/entities/knowledge-base.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [TicketEntity, KnowledgeBaseEntity],
        synchronize: true,
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    AnalysisModule,
    TicketsModule,
    KnowledgeBaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
