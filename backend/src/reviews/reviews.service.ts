import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ReviewStatus } from "@prisma/client";
import { PaginationService } from "../common/services/pagination.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminReviewQueryDto } from "./dto/admin-review-query.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  status: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.ReviewSelect;

const adminReviewInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async getProductReviews(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    const [reviews, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: {
          productId: product.id,
          status: ReviewStatus.APPROVED,
        },
        select: reviewSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.review.aggregate({
        where: {
          productId: product.id,
          status: ReviewStatus.APPROVED,
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    return {
      productId: product.id,
      averageRating: Number((aggregate._avg.rating ?? 0).toFixed(1)),
      totalReviews: aggregate._count.rating,
      reviews,
    };
  }

  async create(userId: string, slug: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    const comment = dto.comment
      ? this.sanitizationService.stripTags(dto.comment)
      : null;

    if (dto.comment !== undefined && !comment) {
      throw new BadRequestException("Le commentaire ne peut pas etre vide.");
    }

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          productId: product.id,
          rating: dto.rating,
          comment,
          isApproved: false,
          status: ReviewStatus.PENDING,
        },
        select: reviewSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Vous avez deja donne un avis sur ce produit.");
      }

      throw error;
    }
  }

  async findAllForAdmin(query: AdminReviewQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where = this.buildAdminWhere(query);

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: adminReviewInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    await this.ensureReviewExists(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        isApproved: dto.status === ReviewStatus.APPROVED,
        status: dto.status,
      },
      include: adminReviewInclude,
    });
  }

  async remove(id: string) {
    await this.ensureReviewExists(id);
    await this.prisma.review.delete({ where: { id } });

    return {
      message: "Avis supprime avec succes.",
    };
  }

  private buildAdminWhere(query: AdminReviewQueryDto): Prisma.ReviewWhereInput {
    const where: Prisma.ReviewWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const search = this.sanitizationService.trim(query.search);
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  private async ensureReviewExists(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException("Avis introuvable.");
    }
  }
}
