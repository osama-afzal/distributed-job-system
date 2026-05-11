import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { GetJobsDto } from './dto/get-jobs.dto';

@Injectable()
export class JobsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly rabbitMQService: RabbitMQService
    ) {}

    async createJob(userId: string, data: CreateJobDto) {
        const job = await this.prismaService.job.create({
            data: {
                userId,
                type: data.type,
                payload: data.payload
            }
        });

        await this.rabbitMQService.publish(`${job.type}_jobs`, job);

        return job;
    }

    async getJob(userId: string, id: string) {
        const job = await this.prismaService.job.findUnique({ 
            where: { 
                id,
                userId
            }
        });

        if (!job) throw new NotFoundException('Job not found');

        return {
            id: job.id,
            status: job.status
        }
    }

    async getJobs(userId: string, status?: string, type?: string) {
        return await this.prismaService.job.findMany({
            where: {
                userId,
                status,
                type
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
