import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { parseJSONString, TagDto } from './tag.dto';

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
