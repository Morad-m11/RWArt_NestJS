import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @Transform(({ value }) => toStringArray(value))
    @IsString({ each: true })
    @IsOptional()
    tags!: string[];
}

function toStringArray(value: unknown): string[] {
    if (typeof value !== 'string') {
        throw new Error('tags must be a comma separated string of values');
    }

    return value
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
}
