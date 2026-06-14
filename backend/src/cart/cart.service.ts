import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: {
            orderBy: {
              position: "asc",
            },
            take: 1,
          },
          category: true,
        },
      },
      variant: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.formatCart(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    this.ensurePositiveQuantity(dto.quantity);

    const [cart, product] = await Promise.all([
      this.getOrCreateCart(userId),
      this.getActiveProduct(dto.productId),
    ]);

    const variant = dto.variantId
      ? await this.getVariant(dto.productId, dto.variantId)
      : null;

    if (!variant && product.variants.length > 0) {
      throw new BadRequestException("Veuillez selectionner une variante.");
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    const nextQuantity = (existingItem?.quantity ?? 0) + dto.quantity;
    this.ensureStockAvailable(product.name, variant?.stock, nextQuantity);

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant?.id,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    this.ensurePositiveQuantity(dto.quantity);

    const item = await this.getUserCartItem(userId, itemId);
    this.ensureStockAvailable(
      item.product.name,
      item.variant?.stock,
      dto.quantity,
    );

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.getUserCartItem(userId, itemId);

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  private async getOrCreateCart(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: cartInclude,
    });

    return cart;
  }

  private async getActiveProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Produit introuvable.");
    }

    return product;
  }

  private async getVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
      },
    });

    if (!variant) {
      throw new NotFoundException("Variante introuvable.");
    }

    return variant;
  }

  private async getUserCartItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Article panier introuvable.");
    }

    return item;
  }

  private ensurePositiveQuantity(quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException("La quantite doit etre superieure a 0.");
    }
  }

  private ensureStockAvailable(
    productName: string,
    stock: number | undefined,
    quantity: number,
  ) {
    if (stock === undefined) {
      return;
    }

    if (quantity > stock) {
      throw new BadRequestException(
        `Stock insuffisant pour ${productName}. Stock disponible: ${stock}.`,
      );
    }
  }

  private formatCart(cart: CartWithItems) {
    const items = cart.items.map((item) => {
      const unitPrice = Number(item.product.price);
      const subtotal = unitPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        product: item.product,
        variant: item.variant,
      };
    });

    const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);
    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalAmount,
      totalQuantity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
