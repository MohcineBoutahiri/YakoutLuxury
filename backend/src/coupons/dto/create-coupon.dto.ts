import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @ValidateIf((dto: CreateCouponDto) => dto.discountRate === undefined)
  @IsNumber()
  @Min(0.01)
  discountAmount?: number;

  @ValidateIf((dto: CreateCouponDto) => dto.discountAmount === undefined)
  @IsNumber()
  @Min(0.01)
  @Max(100)
  discountRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
