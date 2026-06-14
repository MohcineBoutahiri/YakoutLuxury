import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { AdminBannersController } from "./admin-banners.controller";
import { BannersController } from "./banners.controller";
import { BannersService } from "./banners.service";

@Module({
  imports: [CommonModule],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
})
export class BannersModule {}
