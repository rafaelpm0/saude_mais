import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsultasService } from './consultas.service';

@Injectable()
export class ConsultasTaskService implements OnModuleInit {
  constructor(private consultasService: ConsultasService) {}

  // Executar na inicialização do módulo
  async onModuleInit() {
    console.log('🔄 Iniciando processamento de consultas vencidas...');
    await this.processarConsultasVencidas();
    
    // Configurar processamento periódico (a cada 1 hora)
    setInterval(() => {
      this.processarConsultasVencidas();
    }, 60 * 60 * 1000); // 1 hora em millisegundos
  }

  private async processarConsultasVencidas() {
    try {
      await this.consultasService.processarConsultasVencidas();
    } catch (error) {
      console.error('❌ Erro ao processar consultas vencidas:', error);
    }
  }
}