import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './exception/custom-exception.filter';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new CustomExceptionFilter());
  const globalPrefix = 'medi/api';
  app.setGlobalPrefix(globalPrefix);
  app.use(bodyParser.json({ limit: '60mb' }));
  app.use(bodyParser.urlencoded({ limit: '60mb', extended: true }));
  await app.listen(3000);
}
bootstrap();
