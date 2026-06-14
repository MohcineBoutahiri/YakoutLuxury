import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { BannersService } from "./banners.service";
import { BannerStatusDto } from "./dto/banner-status.dto";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";

@Controller("admin/banners")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll() {
    return this.bannersService.findAllForAdmin();
  }

  @Post()
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bannersService.remove(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: BannerStatusDto) {
    return this.bannersService.updateStatus(id, dto);
  }
}
