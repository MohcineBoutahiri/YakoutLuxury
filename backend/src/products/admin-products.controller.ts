import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
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
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductStatusDto } from "./dto/product-status.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("admin/products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAllForAdmin(query);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.productsService.findByIdForAdmin(id);
  }

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const product = await this.productsService.create(dto);
    await this.log(user, request, "CREATE_PRODUCT", product.id, `Creation du produit ${product.name}.`);

    return product;
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const product = await this.productsService.update(id, dto);
    await this.log(user, request, "UPDATE_PRODUCT", product.id, `Modification du produit ${product.name}.`);

    return product;
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const result = await this.productsService.remove(id);
    await this.log(user, request, "DELETE_PRODUCT", id, "Suppression d'un produit.");

    return result;
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: ProductStatusDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() request: Request,
  ) {
    const product = await this.productsService.updateStatus(id, dto);
    await this.log(
      user,
      request,
      dto.isActive ? "REACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT",
      product.id,
      `${dto.isActive ? "Reactivation" : "Desactivation"} du produit ${product.name}.`,
    );

    return product;
  }

  private log(
    user: CurrentUserPayload,
    request: Request,
    action: string,
    entityId: string,
    description: string,
  ) {
    return this.activityLogsService.logActivity({
      adminId: user.id,
      action,
      entity: "Product",
      entityId,
      description,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }
}
