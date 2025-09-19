import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
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
