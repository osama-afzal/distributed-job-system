import { Module } from '@nestjs/common';

import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { PrismaModule } from '../prisma/prisma.module'; 
import { JobsModule } from '../jobs/jobs.module';

import { JobProcessor } from '../jobs/jobs.processor';

@Module({
    imports: [
        RabbitMQModule,
        PrismaModule,
        JobsModule,
    ],
    providers: [JobProcessor]
})
export class WorkersModule {}
