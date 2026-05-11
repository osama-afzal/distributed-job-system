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

@UseGuards(AuthGuard('jwt'))
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @Post('create')
  async createJob(@Body() data: CreateJobDto, @GetUser('id') userId: string) {
    return await this.jobService.createJob(userId, data);
  }

  @Get(':id')
  async getJob(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.jobService.getJob(userId, id);
  }

  @Get()
  async getJobs(@GetUser('id') userId: string, @Query() data: GetJobsDto): Promise<any> {
    return await this.jobService.getJobs(
      userId,
      data.status,
      data.type,
    );
  }
}
