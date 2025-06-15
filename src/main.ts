import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
   const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
      abortOnError: false,
   });

   await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
   console.error(`Failed to start application. ${err}`);
});
