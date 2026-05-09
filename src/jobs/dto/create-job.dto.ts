import { IsObject, IsString } from "class-validator";

export class CreateJobDto {
    @IsString()
    type: string

    @IsObject()
    payload: object
}