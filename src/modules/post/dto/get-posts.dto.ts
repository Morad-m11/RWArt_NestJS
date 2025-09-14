import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
    @IsString()
    @IsOptional()
    author?: string;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sort?: 'asc' | 'desc';

    @IsOptional()
    @IsDate()
    from?: Date;
}
