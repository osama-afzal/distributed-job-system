import { NestFactory } from "@nestjs/core";
import { WorkersModule } from "./workers/workers.module";

async function bootstrap() {
    await NestFactory.createApplicationContext(WorkersModule);

    console.log('Worker process started');
}

bootstrap();