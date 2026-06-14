import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { CouponsService } from "./coupons.service";

@Controller("coupons")
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post("apply")
  apply(@CurrentUser() user: CurrentUserPayload, @Body() dto: ApplyCouponDto) {
    return this.couponsService.applyToCart(user.id, dto);
  }
}
