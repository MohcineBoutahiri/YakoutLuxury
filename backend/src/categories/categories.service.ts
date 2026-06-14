import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { SanitizationService } from "../common/services/sanitization.service";
import { SlugService } from "../common/services/slug.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
    private readonly slugService: SlugService,
  ) {}

  findActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        slug: this.slugService.generate(slug),
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Categorie introuvable.");
    }

    return category;
  }

  findAllForAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
  }

  async create(dto: CreateCategoryDto) {
    const name = this.cleanRequiredText(dto.name, "Le nom de la categorie est requis.");
    const slug = await this.generateUniqueSlug(name);

    try {
      return await this.prisma.category.create({
        data: {
          name,
          slug,
          description: dto.description
            ? this.sanitizationService.stripTags(dto.description)
            : null,
          imageUrl: dto.imageUrl ? this.sanitizationService.trim(dto.imageUrl) : null,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findByIdOrThrow(id);

    const data: Prisma.CategoryUpdateInput = {};

    if (dto.name !== undefined) {
      const name = this.cleanRequiredText(
        dto.name,
        "Le nom de la categorie est requis.",
      );
      data.name = name;
      data.slug = await this.generateUniqueSlug(name, id);
    }

    if (dto.description !== undefined) {
      data.description = dto.description
        ? this.sanitizationService.stripTags(dto.description)
        : null;
    }

    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl ? this.sanitizationService.trim(dto.imageUrl) : null;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);

    try {
      await this.prisma.category.delete({ where: { id } });

      return {
        message: "Categorie supprimee avec succes.",
      };
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  private async findByIdOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException("Categorie introuvable.");
    }

    return category;
  }

  private cleanRequiredText(value: string, message: string) {
    const cleaned = this.sanitizationService.stripTags(value);

    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }

  private async generateUniqueSlug(name: string, ignoredCategoryId?: string) {
    const baseSlug = this.slugService.generate(name);

    if (!baseSlug) {
      throw new BadRequestException("Impossible de generer le slug de la categorie.");
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await this.slugExists(slug, ignoredCategoryId)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  private async slugExists(slug: string, ignoredCategoryId?: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    return Boolean(category && category.id !== ignoredCategoryId);
  }

  private handlePrismaWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Une categorie existe deja avec ce nom.");
      }

      if (error.code === "P2003") {
        throw new BadRequestException(
          "Cette categorie est liee a d'autres donnees.",
        );
      }
    }

    throw error;
  }
}
