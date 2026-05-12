import { IsEnum, IsObject, IsString } from 'class-validator';
import { JobType } from '../jobs.types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    enum: JobType,
    example: JobType.Report,
  })
  @IsEnum(JobType)
  type: string;

  @ApiProperty()
  @IsObject()
  payload: object;
}
