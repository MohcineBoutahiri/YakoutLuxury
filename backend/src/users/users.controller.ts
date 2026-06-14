import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return { user };
  }
}
