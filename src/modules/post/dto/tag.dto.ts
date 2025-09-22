import { plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class TagDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsIn(['type', 'character', 'style'])
    @IsNotEmpty()
    category!: string;
}

export function parseJSONString(value: unknown): TagDto[] {
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
