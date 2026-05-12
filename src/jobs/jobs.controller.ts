import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateJobDto } from './dto/create-job.dto';
import { GetJobsDto } from './dto/get-jobs.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    schema: {
      example: {
        id: '0d7c5d2a',
        type: 'email',
        status: 'pending',
        createdAt: '2026-05-12T10:00:00Z',
      },
    },
  })
  @Post('create')
  async createJob(@Body() data: CreateJobDto, @GetUser('id') userId: string) {
    return await this.jobService.createJob(userId, data);
  }

  @ApiResponse({
    status: 201,
    description: 'Single job by id',
    schema: {
      example: {
        id: '0d7c5d2a',
        type: 'email',
        status: 'pending',
        createdAt: '2026-05-12T10:00:00Z',
      },
    },
  })
  @Get(':id')
  async getJob(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.jobService.getJob(userId, id);
  }

  @ApiResponse({
    status: 201,
    description: 'List of (filtered) jobs',
    schema: {
      example: [
        {
          id: '0d7c5d2a',
          type: 'email',
          status: 'pending',
          createdAt: '2026-05-12T10:00:00Z',
        },
      ],
    },
  })
  @Get()
  async getJobs(
    @GetUser('id') userId: string,
    @Query() data: GetJobsDto,
  ): Promise<any> {
    return await this.jobService.getJobs(userId, data.status, data.type);
  }
}
