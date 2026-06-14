import { Module } from "@nestjs/common";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";
import { CommonModule } from "../common/common.module";
import { OtpModule } from "../otp/otp.module";
import { AdminController } from "./admin.controller";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";
import { AdminService } from "./admin.service";

@Module({
  imports: [ActivityLogsModule, CommonModule, OtpModule],
  controllers: [AdminController, AdminUsersController],
  providers: [AdminService, AdminUsersService],
})
export class AdminModule {}
