import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { SanitizationService } from "../common/services/sanitization.service";
import { PrismaService } from "../prisma/prisma.service";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { CouponStatusDto } from "./dto/coupon-status.dto";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async findAllForAdmin() {
    return this.prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async applyToCart(userId: string, dto: ApplyCouponDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Votre panier est vide.");
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
    const coupon = await this.getValidCoupon(dto.code, subtotal);
    const discountAmount = this.calculateDiscount(coupon, subtotal);

    return {
      coupon,
      subtotal,
      discountAmount,
      totalAmount: Math.max(subtotal - discountAmount, 0),
    };
  }

  async create(dto: CreateCouponDto) {
    this.ensureDiscountShape(dto.discountAmount, dto.discountRate);
    this.ensureValidDates(dto.startsAt, dto.expiresAt);

    try {
      return await this.prisma.coupon.create({
        data: {
          code: this.normalizeCode(dto.code),
          discountAmount: dto.discountAmount,
          discountRate: dto.discountRate,
          minOrderAmount: dto.minOrderAmount,
          usageLimit: dto.usageLimit,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findByIdOrThrow(id);

    if (dto.discountAmount !== undefined || dto.discountRate !== undefined) {
      this.ensureDiscountShape(dto.discountAmount, dto.discountRate);
    }

    this.ensureValidDates(dto.startsAt, dto.expiresAt);

    try {
      return await this.prisma.coupon.update({
        where: { id },
        data: {
          ...(dto.code !== undefined ? { code: this.normalizeCode(dto.code) } : {}),
          ...(dto.discountAmount !== undefined
            ? { discountAmount: dto.discountAmount, discountRate: null }
            : {}),
          ...(dto.discountRate !== undefined
            ? { discountRate: dto.discountRate, discountAmount: null }
            : {}),
          ...(dto.minOrderAmount !== undefined
            ? { minOrderAmount: dto.minOrderAmount }
            : {}),
          ...(dto.usageLimit !== undefined ? { usageLimit: dto.usageLimit } : {}),
          ...(dto.startsAt !== undefined
            ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
            : {}),
          ...(dto.expiresAt !== undefined
            ? { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }
            : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);
    await this.prisma.coupon.delete({ where: { id } });

    return {
      message: "Coupon supprime avec succes.",
    };
  }

  async updateStatus(id: string, dto: CouponStatusDto) {
    await this.findByIdOrThrow(id);

    return this.prisma.coupon.update({
      where: { id },
      data: {
        isActive: dto.isActive,
      },
    });
  }

  async getValidCoupon(code: string, subtotal: number, tx: Prisma.TransactionClient = this.prisma) {
    const coupon = await tx.coupon.findUnique({
      where: {
        code: this.normalizeCode(code),
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException("Coupon invalide ou inactif.");
    }

    const now = new Date();

    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException("Ce coupon n'est pas encore disponible.");
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException("Ce coupon a expire.");
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Ce coupon a atteint sa limite d'utilisation.");
    }

    if (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Montant minimum requis: ${Number(coupon.minOrderAmount).toFixed(2)}.`,
      );
    }

    return coupon;
  }

  calculateDiscount(coupon: Awaited<ReturnType<CouponsService["getValidCoupon"]>>, subtotal: number) {
    if (coupon.discountRate !== null) {
      return Math.min((subtotal * Number(coupon.discountRate)) / 100, subtotal);
    }

    if (coupon.discountAmount !== null) {
      return Math.min(Number(coupon.discountAmount), subtotal);
    }

    return 0;
  }

  private async findByIdOrThrow(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon introuvable.");
    }

    return coupon;
  }

  private normalizeCode(code: string) {
    const normalized = this.sanitizationService.trim(code).toUpperCase();

    if (!normalized) {
      throw new BadRequestException("Le code coupon est requis.");
    }

    return normalized;
  }

  private ensureDiscountShape(discountAmount?: number, discountRate?: number) {
    if (discountAmount !== undefined && discountRate !== undefined) {
      throw new BadRequestException(
        "Choisissez soit un montant fixe, soit un pourcentage.",
      );
    }

    if (discountAmount === undefined && discountRate === undefined) {
      throw new BadRequestException("Une reduction est requise.");
    }
  }

  private ensureValidDates(startsAt?: string, expiresAt?: string) {
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      throw new BadRequestException(
        "La date de debut doit etre avant la date d'expiration.",
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Ce code coupon existe deja.");
      }
    }

    throw error;
  }
}
