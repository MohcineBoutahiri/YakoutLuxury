import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ActivityLogsService } from "./activity-logs.service";
import { ActivityLogQueryDto } from "./dto/activity-log-query.dto";

@Controller("admin/activity-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll(@Query() query: ActivityLogQueryDto) {
    return this.activityLogsService.findAll(query);
  }
}
