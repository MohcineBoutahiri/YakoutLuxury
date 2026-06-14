import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  imageUrl: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
