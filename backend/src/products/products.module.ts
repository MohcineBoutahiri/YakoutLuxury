import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";
import { CommonModule } from "../common/common.module";
import { AdminProductsController } from "./admin-products.controller";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { SkuService } from "./sku.service";

@Module({
  imports: [CommonModule, ActivityLogsModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, SkuService],
  exports: [ProductsService],
})
export class ProductsModule {}
