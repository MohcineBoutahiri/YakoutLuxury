import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
