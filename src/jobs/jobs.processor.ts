import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

@Injectable()
export class JobProcessor implements OnModuleInit {
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
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  async processReportJob(job: any) {
    console.log('Processing job:', job);

    await this.setProcessing(job.id);

    await this.sleep(3000);

    if (Math.random() < 0.3) {
      const currentJob = await this.prismaService.job.findUnique({
        where: { id: job.id },
      });

      if (!currentJob) {
        throw new Error('Job not found');
      }

      if (currentJob.retryCount < currentJob.maxRetries) {
        await this.retryJob(job);
      } else {
        await this.failJob(job.id);
      }

      throw new Error('Simulated failure');
    }

    await this.completeJob(job.id, {
      reportId: crypto.randomUUID(),
      generatedRows: Math.random() * (3000 - 1000) + 1000,
      format: 'pdf'
    });
  }

  async processEmailJob(job: any) {
    console.log('Processing job: ', job);

    await this.setProcessing(job.id);

    await this.sleep(1000);

    if (Math.random() < 0.1) {
      const currentJob = await this.prismaService.job.findUnique({
        where: { id: job.id },
      });

      if (!currentJob) {
        throw new Error('Job not found');
      }

      if (currentJob.retryCount < currentJob.maxRetries) {
        await this.retryJob(job);
      } else {
        await this.failJob(job.id);
      }

      throw new Error('Simulated failure');
    }

    await this.completeJob(job.id, {
      recipient: job.payload.email,
      delivered: true,
      provider: 'sendgrid'
    });
  }

  async processAnalyticsJob(job: any) {
    console.log('Processing job: ', job);

    await this.setProcessing(job.id);

    await this.sleep(5000);

    if (Math.random() < 0.4) {
      const currentJob = await this.prismaService.job.findUnique({
        where: { id: job.id },
      });

      if (!currentJob) {
        throw new Error('Job not found');
      }

      if (currentJob.retryCount < currentJob.maxRetries) {
        await this.retryJob(job);
      } else {
        await this.failJob(job.id);
      }

      throw new Error('Simulated failure');
    }

    await this.completeJob(job.id, {
      processedRecords: (Math.random() * (5000 - 1000) + 1000).toFixed(0),
      executionTimeMs: Math.random() * 100
    });
  }

  // Helpers
  private async setProcessing(jobId: string) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: 'processing',
      },
    });
  }

  private async completeJob(jobId: string, result: any) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: 'complete',
        processedAt: new Date(),
        result
      },
    });
  }

  private async failJob(jobId: string) {
    await this.prismaService.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage: 'Max retries exceeded',
      },
    });
  }

  private async retryJob(job: any) {
    const updatedJob = await this.prismaService.job.update({
      where: { id: job.id },
      data: {
        retryCount: {
          increment: 1,
        },
        status: 'pending',
      },
    });

    await this.rabbitMQService.publish(`${job.type}_jobs`, updatedJob);
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
