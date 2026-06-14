import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
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
import { AdminReviewQueryDto } from "./dto/admin-review-query.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";
import { ReviewsService } from "./reviews.service";

@Controller("admin/reviews")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminReviewsController {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  findAll(@Query() query: AdminReviewQueryDto) {
    return this.reviewsService.findAllForAdmin(query);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const review = await this.reviewsService.updateStatus(id, dto);
    await this.activityLogsService.logActivity({
      adminId: user.id,
      action: `UPDATE_REVIEW_${review.status}`,
      entity: "REVIEW",
      entityId: review.id,
      description: `Avis ${review.id} passe en ${review.status}.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return review;
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const response = await this.reviewsService.remove(id);
    await this.activityLogsService.logActivity({
      adminId: user.id,
      action: "DELETE_REVIEW",
      entity: "REVIEW",
      entityId: id,
      description: `Avis ${id} supprime.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return response;
  }
}
