import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { JobProcessor } from './jobs.processor';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [JobsController],
  providers: [JobsService, JobProcessor]
})
export class JobsModule {}
