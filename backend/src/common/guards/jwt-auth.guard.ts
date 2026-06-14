import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(
    error: Error | null,
    user: TUser | false,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException("Token absent ou invalide.");
    }

    return user;
  }
}
