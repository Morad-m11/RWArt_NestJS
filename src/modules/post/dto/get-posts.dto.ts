import { IsIn, IsNumber, IsOptional } from 'class-validator';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
    @IsNumber()
    @IsOptional()
    limit: number = 10;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sort: 'asc' | 'desc' = 'desc';
}
