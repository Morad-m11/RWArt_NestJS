import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => coerceArray(value))
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsNumber()
    @IsOptional()
    offset?: number;

    @IsIn(['asc', 'desc'])
    @IsOptional()
    sort?: 'asc' | 'desc';

    @IsDate()
    @IsOptional()
    from?: Date;
}

const coerceArray = (value: unknown) => {
    return Array.isArray(value) ? value : [value];
};
