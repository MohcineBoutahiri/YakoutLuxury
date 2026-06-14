import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class ProductImageDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
