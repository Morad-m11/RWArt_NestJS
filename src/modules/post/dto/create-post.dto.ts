import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description!: string;

    @Transform(({ value }) => parseJSONString(value))
    @ValidateNested({ each: true })
    @Type(() => TagDto)
    tags!: TagDto[];
}

class TagDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsIn(['type', 'character', 'style'])
    @IsNotEmpty()
    category!: string;
}

function parseJSONString(value: unknown): TagDto[] {
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value) as TagDto;
            const tags = plainToInstance(TagDto, parsed);
            return Array.isArray(tags) ? tags : [];
        } catch {
            return [];
        }
    }

    throw new Error('tags must be a stringified object');
}
