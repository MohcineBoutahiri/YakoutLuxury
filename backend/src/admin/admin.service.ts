import { Injectable } from "@nestjs/common";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type MonthlyRevenueRow = {
  month: Date;
  revenue: Prisma.Decimal | number | string | null;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueAggregate,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: {
          status: {
            not: OrderStatus.CANCELLED,
          },
          paymentStatus: {
            not: PaymentStatus.FAILED,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.getRecentOrders(),
      this.getLowStockProducts(),
      this.getOrdersByStatus(),
      this.getMonthlyRevenue(),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueAggregate._sum.totalAmount ?? 0),
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      monthlyRevenue,
    };
  }

  private getRecentOrders() {
    return this.prisma.order.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
  }

  private getLowStockProducts() {
    return this.prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      take: 12,
      orderBy: {
        stock: "asc",
      },
      select: {
        id: true,
        size: true,
        color: true,
        stock: true,
        sku: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            images: {
              take: 1,
              orderBy: {
                position: "asc",
              },
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });
  }

  private async getOrdersByStatus() {
    const grouped = await this.prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      orderBy: {
        status: "asc",
      },
    });

    return Object.values(OrderStatus).map((status) => ({
      status,
      count: grouped.find((item) => item.status === status)?._count.status ?? 0,
    }));
  }

  private async getMonthlyRevenue() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const rows = await this.prisma.$queryRaw<MonthlyRevenueRow[]>`
      SELECT
        date_trunc('month', "createdAt") AS month,
        COALESCE(SUM("totalAmount"), 0) AS revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND "status" != ${OrderStatus.CANCELLED}::"OrderStatus"
        AND "paymentStatus" != ${PaymentStatus.FAILED}::"PaymentStatus"
      GROUP BY month
      ORDER BY month ASC
    `;

    return rows.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue ?? 0),
    }));
  }
}
