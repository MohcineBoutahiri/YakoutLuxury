import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAllForAdmin();
  }

  @Post()
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const category = await this.categoriesService.create(dto);
    await this.activityLogsService.logActivity({
      adminId: user.id,
      action: "CREATE_CATEGORY",
      entity: "Category",
      entityId: category.id,
      description: `Creation de la categorie ${category.name}.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return category;
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const category = await this.categoriesService.update(id, dto);
    await this.activityLogsService.logActivity({
      adminId: user.id,
      action: "UPDATE_CATEGORY",
      entity: "Category",
      entityId: category.id,
      description: `Modification de la categorie ${category.name}.`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return category;
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const result = await this.categoriesService.remove(id);
    await this.activityLogsService.logActivity({
      adminId: user.id,
      action: "DELETE_CATEGORY",
      entity: "Category",
      entityId: id,
      description: "Suppression d'une categorie.",
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });

    return result;
  }
}
