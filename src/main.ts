import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function main() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2');
   
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );

  app.enableCors({
    origin: 'http://localhost:5173', // Asegúrate de que este es el puerto correcto para tu aplicación React
  });

  await app.listen(process.env.PORT);

  console.log(`App running on port ${process.env.PORT}`);
}

main();