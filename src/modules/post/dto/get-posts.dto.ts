import { Transform, Type } from 'class-transformer';
import {
    IsDate,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import { parseJSONString, TagDto } from './tag.dto';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @Transform(({ value }) => parseJSONString(value))
    @ValidateNested({ each: true })
    @Type(() => TagDto)
    tags?: TagDto[];

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
