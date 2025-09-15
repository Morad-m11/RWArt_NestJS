import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
    @IsString()
    @IsOptional()
    author?: string;

    @IsNumber()
    @IsOptional()
    limit?: number = 10;

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
