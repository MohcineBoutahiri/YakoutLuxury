import { IsBoolean } from "class-validator";

export class CouponStatusDto {
  @IsBoolean()
  isActive: boolean;
}
