import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from './jobs.types';

@Injectable()
export class JobProcessor implements OnModuleInit {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume(
      'report_jobs',
      this.processJob.bind(this),
    );
    await this.rabbitMQService.consume(
      'email_jobs',
      this.processJob.bind(this),
    );
    await this.rabbitMQService.consume(
      'analytics_jobs',
      this.processJob.bind(this),
    );
  }

  async processJob(job: any) {
    switch (job.type) {
      case 'report':
        return this.processReportJob(job);

      case 'email':
        return this.processEmailJob(job);

      case 'analytics':
        return this.processAnalyticsJob(job);

      default:
        throw new BadRequestException(`Unknown job type: ${job.type}`);
    }
  }

  async processReportJob(job: any) {
    this.logger.log(`Processing ${job.type} job`, job);

    await this.setProcessing(job.id);

    await this.sleep(3000);

    if (Math.random() < 0.3) {
      await this.handleFailure(job);
    }

    await this.completeJob(job.id, {
      reportId: crypto.randomUUID(),
      generatedRows: Math.floor(Math.random() * (3000 - 1000) + 1000),
      format: 'pdf',
    });
  }

  async processEmailJob(job: any) {
    this.logger.log(`Processing ${job.type} job`, job);

    await this.setProcessing(job.id);

    await this.sleep(1000);

    if (Math.random() < 0.1) {
      await this.handleFailure(job);
    }

    await this.completeJob(job.id, {
      recipient: job.payload.email,
      delivered: true,
      provider: 'sendgrid',
    });
  }

  async processAnalyticsJob(job: any) {
    this.logger.log(`Processing ${job.type} job`, job);

    await this.setProcessing(job.id);

    await this.sleep(5000);

    if (Math.random() < 0.4) {
      await this.handleFailure(job);
    }

    await this.completeJob(job.id, {
      processedRecords: Math.floor(Math.random() * (5000 - 1000) + 1000),
      executionTimeMs: Math.floor(Math.random() * 100),
    });
  }

  // Helpers
  private async setProcessing(jobId: string) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.Processing,
      },
    });
  }

  private async completeJob(jobId: string, result: any) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.Completed,
        processedAt: new Date(),
        result,
      },
    });
  }

  private async failJob(jobId: string) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.Failed,
        errorMessage: 'Max retries exceeded',
      },
    });

    this.logger.error('Simulated error');
  }

  private async retryJob(job: any) {
    const updatedJob = await this.prismaService.job.update({
      where: { id: job.id },
      data: {
        retryCount: {
          increment: 1,
        },
        status: JobStatus.Pending,
      },
    });

    await this.rabbitMQService.publish(`${job.type}_jobs`, updatedJob);
  }

  private async handleFailure(job: any) {
    const currentJob = await this.prismaService.job.findUnique({
      where: { id: job.id },
    });

    if (!currentJob) {
      throw new NotFoundException('Job not found');
    }

    if (currentJob.retryCount < currentJob.maxRetries) {
      await this.retryJob(job);
    } else {
      await this.failJob(job.id);

      const queue = `${job.type}_jobs`;
      const dlq = this.rabbitMQService.getDeadLetterQueue(queue);

      await this.rabbitMQService.publish(dlq, {
        ...job,
        failedAt: new Date(),
        reason: 'Max retries exceeded'
      });

      this.logger.warn(
        `Job ${job.id} moved to DLQ after exceeding max retries`,
      );
    }

    throw new InternalServerErrorException('Simulated error');
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
