import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    title!: string;

    @IsIn(['feature', 'bug', 'question', 'other'])
    category!: 'feature' | 'bug' | 'question' | 'other';

    @IsString()
    @MaxLength(500)
    message!: string;
}
