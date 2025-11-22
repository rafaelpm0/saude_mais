import { Module } from '@nestjs/common';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { ConsultasTaskService } from './task.service';

@Module({
  controllers: [ConsultasController],
  providers: [ConsultasService, ConsultasTaskService],
  exports: [ConsultasService],
})
export class ConsultasModule {}