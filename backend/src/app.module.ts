import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AnalysisModule } from './analysis/analysis.module';
import { TicketsModule } from './tickets/tickets.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:true}),
    AnalysisModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
