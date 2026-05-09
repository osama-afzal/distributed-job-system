import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

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

        await this.rabbitMQService.publish(job);

        return job;
    }
}
