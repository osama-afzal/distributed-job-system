import { IsEnum, IsOptional } from "class-validator";
import { JobStatus, JobType } from "../jobs.types";

export class GetJobsDto {
    @IsOptional()
    @IsEnum(JobStatus)
    status?: string

    @IsOptional()
    @IsEnum(JobType)
    type?: string
}