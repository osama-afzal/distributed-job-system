import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobService: JobsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    async createJob(
        @Body() data: CreateJobDto,
        @Request() req: any
    ) {
        return await this.jobService.createJob(req.user.userId, data);
    }
}
