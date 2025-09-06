import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsUrl()
    @IsNotEmpty()
    imageUrl!: string;
}
