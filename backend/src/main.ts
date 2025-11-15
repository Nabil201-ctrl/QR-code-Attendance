import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const port = 4000;
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? port);
  console.log(`running on port ${port}`)
}
bootstrap();
