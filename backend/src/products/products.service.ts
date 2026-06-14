import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationService } from "../common/services/pagination.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { SlugService } from "../common/services/slug.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductImageDto } from "./dto/product-image.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductStatusDto } from "./dto/product-status.dto";
import { ProductVariantDto } from "./dto/product-variant.dto";
import { SkuService } from "./sku.service";
import { UpdateProductDto } from "./dto/update-product.dto";

const productInclude = {
  category: true,
  images: {
    orderBy: {
      position: "asc",
    },
  },
  variants: {
    orderBy: [{ size: "asc" }, { color: "asc" }],
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
    private readonly skuService: SkuService,
    private readonly slugService: SlugService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where = this.buildPublicWhere(query);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  async findAllForAdmin(query: ProductQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where = this.buildProductWhere(query);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ isActive: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  async findByIdForAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    return product;
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: productInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });
  }

  async findBySlug(slug: string) {
    const normalizedSlug = this.slugService.generate(slug);
    const product = await this.prisma.product.findFirst({
      where: {
        slug: normalizedSlug,
        isActive: true,
      },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    this.ensureValidPrices(dto.price, dto.oldPrice);
    this.ensureValidVariants(dto.variants);
    const category = await this.ensureCategoryExists(dto.categoryId);

    const name = this.cleanRequiredText(
      dto.name,
      "Le nom du produit est requis.",
    );
    const slug = await this.generateUniqueSlug(name);
    const variants = await this.cleanVariants(dto.variants, {
      categoryName: category.name,
      productName: name,
    });

    try {
      return await this.prisma.product.create({
        data: {
          name,
          slug,
          description: this.cleanRequiredText(
            dto.description,
            "La description du produit est requise.",
          ),
          price: dto.price,
          oldPrice: dto.oldPrice,
          categoryId: dto.categoryId,
          isFeatured: dto.isFeatured ?? false,
          isActive: dto.isActive ?? true,
          images: {
            create: this.cleanImages(dto.images),
          },
          variants: {
            create: variants,
          },
        },
        include: productInclude,
      });
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.ensureProductExists(id);

    if (dto.price !== undefined || dto.oldPrice !== undefined) {
      this.ensureValidPrices(dto.price, dto.oldPrice);
    }

    this.ensureValidVariants(dto.variants);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const data: Prisma.ProductUpdateInput = {};

    if (dto.name !== undefined) {
      const name = this.cleanRequiredText(
        dto.name,
        "Le nom du produit est requis.",
      );
      data.name = name;
      data.slug = await this.generateUniqueSlug(name, id);
    }

    if (dto.description !== undefined) {
      data.description = this.cleanRequiredText(
        dto.description,
        "La description du produit est requise.",
      );
    }

    if (dto.price !== undefined) {
      data.price = dto.price;
    }

    if (dto.oldPrice !== undefined) {
      data.oldPrice = dto.oldPrice;
    }

    if (dto.categoryId !== undefined) {
      data.category = {
        connect: {
          id: dto.categoryId,
        },
      };
    }

    if (dto.isFeatured !== undefined) {
      data.isFeatured = dto.isFeatured;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (dto.images !== undefined) {
      data.images = {
        deleteMany: {},
        create: this.cleanImages(dto.images),
      };
    }

    if (dto.variants !== undefined) {
      const category =
        dto.categoryId !== undefined
          ? await this.ensureCategoryExists(dto.categoryId)
          : existingProduct.category;
      const productName =
        dto.name !== undefined
          ? this.cleanRequiredText(dto.name, "Le nom du produit est requis.")
          : existingProduct.name;

      data.variants = {
        deleteMany: {},
        create: await this.cleanVariants(dto.variants, {
          categoryName: category.name,
          productName,
        }),
      };
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
        include: productInclude,
      });
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async remove(id: string) {
    await this.ensureProductExists(id);

    try {
      await this.prisma.product.delete({
        where: { id },
      });

      return {
        message: "Produit supprime avec succes.",
      };
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async updateStatus(id: string, dto: ProductStatusDto) {
    await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: dto.isActive,
      },
      include: productInclude,
    });
  }

  private buildPublicWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };
    const filters = this.buildProductWhere(query);

    if (filters.AND) {
      where.AND = filters.AND;
    }

    return where;
  }

  private buildProductWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};
    const andFilters: Prisma.ProductWhereInput[] = [];

    if (query.category) {
      const category = this.sanitizationService.trim(query.category);
      andFilters.push({
        OR: [
          { categoryId: category },
          {
            category: {
              slug: this.slugService.generate(category),
            },
          },
        ],
      });
    }

    if (query.size || query.color) {
      andFilters.push({
        variants: {
          some: {
            ...(query.size
              ? {
                  size: {
                    equals: this.sanitizationService.trim(query.size),
                    mode: "insensitive",
                  },
                }
              : {}),
            ...(query.color
              ? {
                  color: {
                    equals: this.sanitizationService.trim(query.color),
                    mode: "insensitive",
                  },
                }
              : {}),
          },
        },
      });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      andFilters.push({
        price: {
          ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
          ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
        },
      });
    }

    if (query.search) {
      const search = this.sanitizationService.trim(query.search);
      andFilters.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    return where;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    });

    if (!category) {
      throw new BadRequestException("Categorie introuvable.");
    }

    return category;
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    return product;
  }

  private ensureValidPrices(price?: number, oldPrice?: number) {
    if (price !== undefined && price <= 0) {
      throw new BadRequestException("Le prix doit etre positif.");
    }

    if (oldPrice !== undefined && oldPrice <= 0) {
      throw new BadRequestException("L'ancien prix doit etre positif.");
    }
  }

  private ensureValidVariants(variants?: ProductVariantDto[]) {
    const keys = new Set<string>();

    for (const variant of variants ?? []) {
      if (variant.stock < 0) {
        throw new BadRequestException(
          "Le stock doit etre superieur ou egal a 0.",
        );
      }

      const size = this.normalizeSize(variant.size);
      const color = this.normalizeColor(variant.color);
      const key = `${size}:${color}`.toLowerCase();

      if (keys.has(key)) {
        throw new ConflictException(
          `La variante ${size} / ${color} existe deja pour ce produit.`,
        );
      }

      keys.add(key);
    }
  }

  private cleanImages(images: ProductImageDto[] = []) {
    return images.map((image, index) => ({
      url: this.sanitizationService.trim(image.url),
      alt: image.alt ? this.sanitizationService.trim(image.alt) : null,
      position: image.position ?? index,
    }));
  }

  private async cleanVariants(
    variants: ProductVariantDto[] = [],
    context: { categoryName: string; productName: string },
  ) {
    const reservedSkus = new Set<string>();
    const cleanedVariants: Array<{
      color: string;
      size: string;
      sku: string;
      stock: number;
    }> = [];

    for (const variant of variants) {
      const size = this.normalizeSize(variant.size);
      const color = this.normalizeColor(variant.color);
      const manualSku = variant.sku?.trim();
      const sku = manualSku
        ? this.skuService.normalizeManualSku(manualSku)
        : await this.skuService.generateUniqueSku({
            categoryName: context.categoryName,
            color,
            productName: context.productName,
            reservedSkus,
            size,
          });

      reservedSkus.add(sku);

      cleanedVariants.push({
        size,
        color,
        stock: variant.stock,
        sku,
      });
    }

    return cleanedVariants;
  }

  private cleanRequiredText(value: string, message: string) {
    const cleaned = this.sanitizationService.stripTags(value);

    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }

  private normalizeSize(value: string) {
    return this.collapseSpaces(this.sanitizationService.stripTags(value)).toUpperCase();
  }

  private normalizeColor(value: string) {
    const cleaned = this.collapseSpaces(this.sanitizationService.stripTags(value));

    return cleaned
      .toLowerCase()
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  private collapseSpaces(value: string) {
    return value.replace(/\s+/g, " ").trim();
  }

  private async generateUniqueSlug(name: string, ignoredProductId?: string) {
    const baseSlug = this.slugService.generate(name);

    if (!baseSlug) {
      throw new BadRequestException(
        "Impossible de generer le slug du produit.",
      );
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await this.slugExists(slug, ignoredProductId)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  private async slugExists(slug: string, ignoredProductId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    return Boolean(product && product.id !== ignoredProductId);
  }

  private handlePrismaWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Une valeur unique existe deja.");
      }

      if (error.code === "P2003") {
        throw new BadRequestException(
          "Cette operation est impossible a cause de donnees liees.",
        );
      }
    }

    throw error;
  }
}
