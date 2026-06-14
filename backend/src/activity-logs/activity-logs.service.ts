import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationService } from "../common/services/pagination.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityLogQueryDto } from "./dto/activity-log-query.dto";

export type LogActivityInput = {
  adminId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

const activityLogInclude = {
  admin: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.ActivityLogInclude;

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async logActivity(input: LogActivityInput) {
    try {
      await this.prisma.activityLog.create({
        data: {
          adminId: input.adminId ?? null,
          action: this.clean(input.action),
          entity: this.clean(input.entity),
          entityId: input.entityId ?? null,
          description: input.description ? this.clean(input.description) : null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ? this.clean(input.userAgent).slice(0, 500) : null,
        },
      });
    } catch (error) {
      this.logger.warn(`Activity log skipped: ${String(error)}`);
    }
  }

  async findAll(query: ActivityLogQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where: Prisma.ActivityLogWhereInput = {};

    if (query.adminId) {
      where.adminId = this.sanitizationService.trim(query.adminId);
    }

    if (query.entity) {
      where.entity = {
        contains: this.sanitizationService.trim(query.entity),
        mode: "insensitive",
      };
    }

    if (query.action) {
      where.action = {
        contains: this.sanitizationService.trim(query.action),
        mode: "insensitive",
      };
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        include: activityLogInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  private clean(value: string) {
    return this.sanitizationService.stripTags(value).trim();
  }
}
