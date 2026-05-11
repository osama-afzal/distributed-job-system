import { IsEnum, IsObject, IsString } from "class-validator";
import { JobType } from "../jobs.types";

export class CreateJobDto {
    @IsEnum(JobType)
    type: string

    @IsObject()
    payload: object
}