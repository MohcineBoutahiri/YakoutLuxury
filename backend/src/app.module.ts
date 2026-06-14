import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AdminModule } from "./admin/admin.module";
import { ActivityLogsModule } from "./activity-logs/activity-logs.module";
import { AuthModule } from "./auth/auth.module";
import { BannersModule } from "./banners/banners.module";
import { CartModule } from "./cart/cart.module";
import { CategoriesModule } from "./categories/categories.module";
import { CommonModule } from "./common/common.module";
import { CouponsModule } from "./coupons/coupons.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { OtpModule } from "./otp/otp.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    CommonModule,
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    OtpModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    ReviewsModule,
    CouponsModule,
    BannersModule,
    OrdersModule,
    AdminModule,
    ActivityLogsModule,
    UploadModule,
  ],
})
export class AppModule {}
