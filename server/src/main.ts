import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração do CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Configuração da validação global
  app.useGlobalPipes(new ValidationPipe());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Clínica Saúde+ API')
    .setDescription('API do sistema de gestão da Clínica Saúde+')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Escuta em todas as interfaces na porta 5000
  await app.listen(5000, '0.0.0.0');
  console.log('🚀 Servidor rodando na porta 5000');
  console.log('📚 Swagger disponível em: http://localhost:5000/api');
}
bootstrap();