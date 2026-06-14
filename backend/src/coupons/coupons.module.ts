import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { AdminCouponsController } from "./admin-coupons.controller";
import { CouponsController } from "./coupons.controller";
import { CouponsService } from "./coupons.service";

@Module({
  imports: [CommonModule],
  controllers: [CouponsController, AdminCouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
