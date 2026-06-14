import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser, CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@Controller("products/:slug/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getProductReviews(@Param("slug") slug: string) {
    return this.reviewsService.getProductReviews(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param("slug") slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, slug, dto);
  }
}
