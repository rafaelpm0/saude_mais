import { Module } from '@nestjs/common';
import { MedicoController } from './medico.controller';
import { MedicoService } from './medico.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedicoController],
  providers: [MedicoService],
  exports: [MedicoService]
})
export class MedicoModule {}
