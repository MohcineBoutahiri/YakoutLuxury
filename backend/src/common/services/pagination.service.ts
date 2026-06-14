import { Injectable } from "@nestjs/common";

type PaginationInput = {
  page?: number;
  limit?: number;
};

@Injectable()
export class PaginationService {
  normalize(input: PaginationInput = {}) {
    const page = Math.max(Number(input.page) || 1, 1);
    const limit = Math.min(Math.max(Number(input.limit) || 12, 1), 100);

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  meta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
