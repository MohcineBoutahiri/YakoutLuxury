import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { CartService } from "./cart.service";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: CurrentUserPayload) {
    return this.cartService.getCart(user.id);
  }

  @Post("add")
  addItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Put("items/:itemId")
  updateItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  @Delete("items/:itemId")
  removeItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param("itemId") itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete("clear")
  clear(@CurrentUser() user: CurrentUserPayload) {
    return this.cartService.clear(user.id);
  }
}
