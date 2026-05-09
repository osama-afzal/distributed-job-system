import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

@Injectable()
export class JobProcessor implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly prismaService: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume('jobs', this.processJob.bind(this));
  }

  async processJob(job: any) {
    console.log('Processing job:', job);

    await this.prismaService.job.update({
      where: { id: job.id },
      data: {
        status: 'processing',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (Math.random() < 0.3) {
      await this.prismaService.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errorMessage: 'Simulated failure',
        },
      });

      throw new Error('Simulated failure');
    }

    await this.prismaService.job.update({
      where: { id: job.id },
      data: {
        status: 'complete',
        processedAt: new Date(),
        result: {
          success: true,
        },
      },
    });
  }
}
