import { IsDate, IsIn, IsNumber, IsOptional } from 'class-validator';

export type SortType = 'asc' | 'desc';

export class GetPostsDto {
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
