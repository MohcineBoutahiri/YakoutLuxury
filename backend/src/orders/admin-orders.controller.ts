import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import type { Request } from "express";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminOrderQueryDto } from "./dto/admin-order-query.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@Controller("admin/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.findAllForAdmin(query);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.ordersService.findByIdForAdmin(id);
  }

  @Get(":id/ticket")
  findTicketById(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    return this.ordersService.findTicketByIdForAdmin(id, user.id, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  @Post(":id/regenerate-qr")
  regenerateQrCode(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    return this.ordersService.regenerateQrCodeForAdmin(id, user.id, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  @Get("scan/:qrToken")
  findByQrToken(@Param("qrToken") qrToken: string) {
    return this.ordersService.findByQrTokenForAdmin(qrToken);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    return this.ordersService.updateStatus(id, dto, user.id, "ADMIN_DASHBOARD", {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  @Patch("scan/:qrToken/status")
  updateStatusByQrToken(
    @Param("qrToken") qrToken: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    return this.ordersService.updateStatusByQrToken(qrToken, dto, user.id, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }
}
