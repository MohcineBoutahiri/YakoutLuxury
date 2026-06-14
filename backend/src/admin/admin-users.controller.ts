import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import type { Request } from "express";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminUsersService } from "./admin-users.service";
import { AdminUserQueryDto } from "./dto/admin-user-query.dto";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll(@Query() query: AdminUserQueryDto) {
    return this.adminUsersService.findAll(query);
  }

  @Post("create-admin")
  async createAdmin(
    @Body() dto: CreateAdminUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const admin = await this.adminUsersService.createAdmin(dto);
    await this.activityLogsService.logActivity({
      adminId: currentUser.id,
      action: "CREATE_ADMIN",
      entity: "User",
      entityId: admin.id,
      description: `Creation du compte admin ${admin.email}.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return admin;
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.adminUsersService.findById(id);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const user = await this.adminUsersService.updateStatus(id, dto, currentUser.id);
    await this.activityLogsService.logActivity({
      adminId: currentUser.id,
      action: dto.isActive ? "REACTIVATE_USER" : "DEACTIVATE_USER",
      entity: "User",
      entityId: user.id,
      description: `${dto.isActive ? "Reactivation" : "Desactivation"} du compte ${user.email}.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return user;
  }
}
