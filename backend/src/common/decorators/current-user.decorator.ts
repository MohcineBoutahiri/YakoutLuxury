import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "@prisma/client";
import type { Request } from "express";

export type CurrentUserPayload = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: Role;
  phone?: string | null;
  address?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type RequestWithUser = Request & {
  user?: CurrentUserPayload;
};

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data && user ? user[data] : user;
  },
);
