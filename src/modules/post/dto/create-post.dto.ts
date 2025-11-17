import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { parseJSONString } from './parse-json-string';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title!: string;

    @IsString()
    @MaxLength(200)
    description!: string;

    @IsOptional()
    @Transform(({ value }) => parseJSONString(value))
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
