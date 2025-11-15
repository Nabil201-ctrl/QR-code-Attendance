import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = 4000;
  const app = await NestFactory.create(AppModule);
   const serverUrl = process.env.SERVER_URL 
   
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? port);
  console.log(`🚀 Server running on port ${port}`);
    // Automatic health ping every 4 minutes
  setInterval(async () => {
    try {
      await fetch(`${serverUrl}/health`);
      console.log("🔄 Server pinged /health");
    } catch (err) {
      console.log("❌ Failed to ping /health:", err.message);
    }
  }, 4 * 60 * 1000); // every 4 minutes
}
bootstrap();