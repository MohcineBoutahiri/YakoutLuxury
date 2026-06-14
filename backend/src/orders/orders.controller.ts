import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(user.id, dto);
  }

  @Get("my-orders")
  findMyOrders(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findMyOrders(user.id);
  }

  @Get(":id")
  findMyOrderById(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
  ) {
    return this.ordersService.findMyOrderById(user.id, id);
  }
}
