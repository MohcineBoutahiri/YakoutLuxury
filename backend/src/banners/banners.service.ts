import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { SanitizationService } from "../common/services/sanitization.service";
import { PrismaService } from "../prisma/prisma.service";
import { BannerStatusDto } from "./dto/banner-status.dto";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async findActive() {
    const now = new Date();

    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  }

  async findAllForAdmin() {
    return this.prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  }

  async create(dto: CreateBannerDto) {
    this.ensureValidDates(dto.startsAt, dto.endsAt);

    return this.prisma.banner.create({
      data: {
        title: this.cleanRequiredText(dto.title, "Le titre est requis."),
        subtitle: dto.subtitle
          ? this.sanitizationService.stripTags(dto.subtitle)
          : null,
        imageUrl: this.sanitizationService.trim(dto.imageUrl),
        linkUrl: dto.linkUrl ? this.sanitizationService.trim(dto.linkUrl) : null,
        position: dto.position ?? 0,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findByIdOrThrow(id);
    this.ensureValidDates(dto.startsAt, dto.endsAt);

    return this.prisma.banner.update({
      where: { id },
      data: this.toData(dto),
    });
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);
    await this.prisma.banner.delete({ where: { id } });

    return {
      message: "Banniere supprimee avec succes.",
    };
  }

  async updateStatus(id: string, dto: BannerStatusDto) {
    await this.findByIdOrThrow(id);

    return this.prisma.banner.update({
      where: { id },
      data: {
        isActive: dto.isActive,
      },
    });
  }

  private async findByIdOrThrow(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      throw new NotFoundException("Banniere introuvable.");
    }

    return banner;
  }

  private toData(dto: UpdateBannerDto): Prisma.BannerUncheckedUpdateInput {
    return {
      ...(dto.title !== undefined
        ? { title: this.cleanRequiredText(dto.title, "Le titre est requis.") }
        : {}),
      ...(dto.subtitle !== undefined
        ? { subtitle: dto.subtitle ? this.sanitizationService.stripTags(dto.subtitle) : null }
        : {}),
      ...(dto.imageUrl !== undefined
        ? { imageUrl: this.sanitizationService.trim(dto.imageUrl) }
        : {}),
      ...(dto.linkUrl !== undefined
        ? { linkUrl: dto.linkUrl ? this.sanitizationService.trim(dto.linkUrl) : null }
        : {}),
      ...(dto.position !== undefined ? { position: dto.position } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.startsAt !== undefined
        ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
        : {}),
      ...(dto.endsAt !== undefined
        ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
        : {}),
    };
  }

  private cleanRequiredText(value: string, message: string) {
    const cleaned = this.sanitizationService.stripTags(value);

    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }

  private ensureValidDates(startsAt?: string, endsAt?: string) {
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new BadRequestException(
        "La date de debut doit etre avant la date de fin.",
      );
    }
  }
}
