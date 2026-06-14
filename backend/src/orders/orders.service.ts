import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import * as QRCode from "qrcode";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";
import { MailService } from "../common/services/mail.service";
import { PaginationService } from "../common/services/pagination.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { CouponsService } from "../coupons/coupons.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminOrderQueryDto } from "./dto/admin-order-query.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

const orderInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
    },
  },
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
  coupon: true,
  lastStatusChangedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  statusHistory: {
    include: {
      changedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.OrderInclude;

const cartForOrderInclude = {
  items: {
    include: {
      product: {
        include: {
          variants: true,
        },
      },
      variant: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.CartInclude;

const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PROCESSING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.PROCESSING, OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.SHIPPED],
  [OrderStatus.CANCELLED]: [OrderStatus.PENDING],
};

const noteRequiredTransitions = new Set<string>([
  `${OrderStatus.CONFIRMED}:${OrderStatus.PENDING}`,
  `${OrderStatus.PROCESSING}:${OrderStatus.CONFIRMED}`,
  `${OrderStatus.SHIPPED}:${OrderStatus.PROCESSING}`,
  `${OrderStatus.DELIVERED}:${OrderStatus.SHIPPED}`,
  `${OrderStatus.CANCELLED}:${OrderStatus.PENDING}`,
]);

type StatusChangeSource = "ADMIN_DASHBOARD" | "QR_SCAN" | "SYSTEM";

type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly activityLogsService: ActivityLogsService,
    private readonly couponsService: CouponsService,
    private readonly mailService: MailService,
    private readonly paginationService: PaginationService,
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async createFromCart(userId: string, dto: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
        },
      });

      if (!user) {
        throw new NotFoundException("Utilisateur introuvable.");
      }

      const cart = await tx.cart.findUnique({
        where: { userId },
        include: cartForOrderInclude,
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException("Votre panier est vide.");
      }

      const shippingAddress = dto.shippingAddress
        ? this.sanitizationService.trim(dto.shippingAddress)
        : user.address;
      const phone = dto.phone
        ? this.sanitizationService.trim(dto.phone)
        : user.phone;

      if (!shippingAddress) {
        throw new BadRequestException("Adresse de livraison requise.");
      }

      if (!phone) {
        throw new BadRequestException("Telephone requis pour la commande.");
      }

      let totalAmount = 0;

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new BadRequestException(
            `Le produit ${item.product.name} n'est plus disponible.`,
          );
        }

        if (item.product.variants.length > 0 && !item.variant) {
          throw new BadRequestException(
            `Veuillez selectionner une variante pour ${item.product.name}.`,
          );
        }

        if (item.variant) {
          const stockUpdate = await tx.productVariant.updateMany({
            where: {
              id: item.variant.id,
              productId: item.product.id,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (stockUpdate.count !== 1) {
            throw new BadRequestException(
              `Stock insuffisant pour ${item.product.name}.`,
            );
          }
        }

        totalAmount += Number(item.product.price) * item.quantity;
      }

      let couponId: string | undefined;
      let discountAmount = 0;

      if (dto.couponCode) {
        const coupon = await this.couponsService.getValidCoupon(
          dto.couponCode,
          totalAmount,
          tx,
        );
        discountAmount = this.couponsService.calculateDiscount(
          coupon,
          totalAmount,
        );
        couponId = coupon.id;
      }

      const finalTotalAmount = Math.max(totalAmount - discountAmount, 0);
      const orderNumber = await this.generateOrderNumber(tx);
      const qrToken = randomUUID();
      const qrCodeUrl = await this.generateQrCodeUrl(qrToken);

      const order = await tx.order.create({
        data: {
          userId,
          couponId,
          orderNumber,
          qrToken,
          qrCodeUrl,
          totalAmount: finalTotalAmount,
          status: OrderStatus.PENDING,
          paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddress,
          phone,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.product.name,
              sku: item.variant?.sku,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          oldStatus: null,
          newStatus: OrderStatus.PENDING,
          source: "SYSTEM",
          note: "Commande creee depuis le checkout.",
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      if (couponId) {
        await tx.coupon.update({
          where: {
            id: couponId,
          },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: orderInclude,
      });
    });

    await this.activityLogsService.logActivity({
      action: "CREATE_ORDER",
      entity: "ORDER",
      entityId: order.id,
      description: `Nouvelle commande ${order.orderNumber} creee.`,
    });

    void this.sendNewOrderNotification(order);

    return order;
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findMyOrderById(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Commande introuvable.");
    }

    return order;
  }

  async findAllForAdmin(query: AdminOrderQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where = this.buildAdminWhere(query);

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  async findByIdForAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Commande introuvable.");
    }

    return order;
  }

  async findTicketByIdForAdmin(
    id: string,
    adminId?: string,
    meta?: RequestMeta,
  ) {
    const existingOrder = await this.findByIdForAdmin(id);
    const qrCodeUrl =
      existingOrder.qrCodeUrl ?? (await this.generateQrCodeUrl(existingOrder.qrToken));

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        qrCodeUrl,
        ticketPrintedAt: new Date(),
      },
      include: orderInclude,
    });

    await this.activityLogsService.logActivity({
      adminId,
      action: "PRINT_ORDER_TICKET",
      entity: "ORDER",
      entityId: order.id,
      description: `Ticket de la commande ${order.orderNumber} consulte ou imprime.`,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return order;
  }

  async findByQrTokenForAdmin(qrToken: string) {
    let order = await this.prisma.order.findUnique({
      where: { qrToken },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Commande introuvable pour ce QR code.");
    }

    if (!order.qrCodeUrl) {
      order = await this.prisma.order.update({
        where: { id: order.id },
        data: {
          qrCodeUrl: await this.generateQrCodeUrl(order.qrToken),
        },
        include: orderInclude,
      });
    }

    return order;
  }

  async regenerateQrCodeForAdmin(
    id: string,
    adminId?: string,
    meta?: RequestMeta,
  ) {
    const existingOrder = await this.findByIdForAdmin(id);
    const qrToken = existingOrder.qrToken || randomUUID();
    const qrCodeUrl = await this.generateQrCodeUrl(qrToken);

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        qrCodeUrl,
        qrToken,
      },
      include: orderInclude,
    });

    await this.activityLogsService.logActivity({
      adminId,
      action: "REGENERATE_ORDER_QR",
      entity: "ORDER",
      entityId: order.id,
      description: `QR code regenere pour la commande ${order.orderNumber}.`,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    changedById?: string,
    source: StatusChangeSource = "ADMIN_DASHBOARD",
    meta?: RequestMeta,
  ) {
    const currentOrder = await this.findByIdForAdmin(id);

    if (currentOrder.status === dto.status) {
      return currentOrder;
    }

    const note = dto.note
      ? this.sanitizationService.stripTags(dto.note).trim()
      : null;

    this.validateStatusTransition(currentOrder.status, dto.status, note);

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          oldStatus: currentOrder.status,
          newStatus: dto.status,
          changedById,
          note,
          source,
        },
      });

      return tx.order.update({
        where: { id },
        data: {
          lastStatusChangedAt: new Date(),
          lastStatusChangedById: changedById ?? null,
          status: dto.status,
        },
        include: orderInclude,
      });
    });

    await this.activityLogsService.logActivity({
      adminId: changedById,
      action: source === "QR_SCAN" ? "UPDATE_ORDER_STATUS_QR" : "UPDATE_ORDER_STATUS",
      entity: "ORDER",
      entityId: order.id,
      description: `Commande ${order.orderNumber} : ${currentOrder.status} vers ${order.status}.`,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return order;
  }

  async updateStatusByQrToken(
    qrToken: string,
    dto: UpdateOrderStatusDto,
    changedById: string,
    meta?: RequestMeta,
  ) {
    const order = await this.findByQrTokenForAdmin(qrToken);

    return this.updateStatus(order.id, dto, changedById, "QR_SCAN", meta);
  }

  private buildAdminWhere(query: AdminOrderQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }

    if (query.client) {
      const client = this.sanitizationService.trim(query.client);

      where.user = {
        OR: [
          {
            id: client,
          },
          {
            email: {
              contains: client,
              mode: "insensitive",
            },
          },
          {
            firstName: {
              contains: client,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: client,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    return where;
  }

  private async generateOrderNumber(tx: Prisma.TransactionClient) {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const nextYearStart = new Date(currentYear + 1, 0, 1);
    const count = await tx.order.count({
      where: {
        createdAt: {
          gte: yearStart,
          lt: nextYearStart,
        },
      },
    });

    return `YL-${currentYear}-${String(count + 1).padStart(5, "0")}`;
  }

  private async generateQrCodeUrl(qrToken: string) {
    try {
      if (!QRCode || typeof QRCode.toDataURL !== "function") {
        throw new Error(
          "QRCode library is not loaded correctly. Check qrcode import.",
        );
      }

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
      const scanUrl = `${frontendUrl.replace(/\/$/, "")}/admin/scan/order/${qrToken}`;

      this.logger.debug(`Generating QR code for URL: ${scanUrl}`);

      return QRCode.toDataURL(scanUrl, {
        margin: 1,
        width: 320,
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la generation du QR code: ${String(error)}`,
      );
      return null;
    }
  }

  private validateStatusTransition(
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
    note?: string | null,
  ) {
    const allowedStatuses = allowedStatusTransitions[oldStatus];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Transition invalide de ${oldStatus} vers ${newStatus}.`,
      );
    }

    if (noteRequiredTransitions.has(`${oldStatus}:${newStatus}`) && !note) {
      throw new BadRequestException(
        "Une note est obligatoire pour corriger le statut en arriere.",
      );
    }
  }

  private async sendNewOrderNotification(
    order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>,
  ) {
    const notifyEnabled = process.env.NOTIFY_NEW_ORDER !== "false";
    const notificationEmail = process.env.ORDERS_NOTIFICATION_EMAIL;

    if (!notifyEnabled || !notificationEmail) {
      return;
    }

    const dashboardUrl = `${(process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "")}/admin/orders/${order.id}`;
    const clientName = order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : "Client";
    const total = Number(order.totalAmount).toFixed(2);

    try {
      await this.mailService.sendOrderNotificationEmail({
        to: notificationEmail,
        subject: `Nouvelle commande - ${order.orderNumber}`,
        text: [
          `Nouvelle commande ${order.orderNumber}`,
          `Client: ${clientName}`,
          `Telephone: ${order.phone}`,
          `Adresse: ${order.shippingAddress}`,
          `Total: ${total}`,
          "Paiement: paiement a la livraison",
          `Dashboard: ${dashboardUrl}`,
        ].join("\n"),
        html: `
          <p>Une nouvelle commande a ete recue.</p>
          <ul>
            <li><strong>Commande:</strong> ${order.orderNumber}</li>
            <li><strong>Client:</strong> ${clientName}</li>
            <li><strong>Telephone:</strong> ${order.phone}</li>
            <li><strong>Adresse:</strong> ${order.shippingAddress}</li>
            <li><strong>Total:</strong> ${total}</li>
            <li><strong>Paiement:</strong> paiement a la livraison</li>
          </ul>
          <p><a href="${dashboardUrl}">Voir la commande dans le dashboard</a></p>
        `,
      });
    } catch (error) {
      this.logger.warn(`Notification nouvelle commande non envoyee: ${String(error)}`);
    }
  }
}
