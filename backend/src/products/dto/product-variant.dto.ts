import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  sku?: string;
}
