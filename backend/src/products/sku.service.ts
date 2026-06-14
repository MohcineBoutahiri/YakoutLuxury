import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SkuService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUniqueSku({
    categoryName,
    color,
    productName,
    reservedSkus,
    size,
  }: {
    categoryName: string;
    color: string;
    productName: string;
    reservedSkus: Set<string>;
    size: string;
  }) {
    const baseSku = [
      "YL",
      this.segment(categoryName),
      this.segment(productName),
      this.normalizeToken(size),
      this.segment(color),
    ].join("-");

    let counter = 1;
    let sku = `${baseSku}-${String(counter).padStart(3, "0")}`;

    while (reservedSkus.has(sku) || (await this.skuExists(sku))) {
      counter += 1;
      sku = `${baseSku}-${String(counter).padStart(3, "0")}`;
    }

    reservedSkus.add(sku);
    return sku;
  }

  normalizeManualSku(value: string) {
    return this.normalizeToken(value).replace(/_{2,}/g, "_");
  }

  private async skuExists(sku: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    return Boolean(variant);
  }

  private segment(value: string) {
    return this.normalizeToken(value).replace(/-/g, "").slice(0, 3).padEnd(3, "X");
  }

  private normalizeToken(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase();
  }
}
