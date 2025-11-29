import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConsultasModule } from './consultas/consultas.module';
import { AdminModule } from './admin/admin.module';
import { MedicoModule } from './medico/medico.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    ConsultasModule, 
    AdminModule, 
    MedicoModule,
    RelatoriosModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}