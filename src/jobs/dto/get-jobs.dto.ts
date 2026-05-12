import { IsEnum, IsOptional } from 'class-validator';
import { JobStatus, JobType } from '../jobs.types';
import { ApiProperty } from '@nestjs/swagger';

export class GetJobsDto {
  @ApiProperty({
    enum: JobStatus,
    example: JobStatus.Pending,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: string;

  @ApiProperty({
    enum: JobType,
    example: JobType.Report,
  })
  @IsOptional()
  @IsEnum(JobType)
  type?: string;
}
