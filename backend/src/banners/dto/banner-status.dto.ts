import { IsBoolean } from "class-validator";

export class BannerStatusDto {
  @IsBoolean()
  isActive: boolean;
}
