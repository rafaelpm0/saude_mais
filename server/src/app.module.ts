import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConsultasModule } from './consultas/consultas.module';

@Module({
  imports: [PrismaModule, AuthModule, ConsultasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}