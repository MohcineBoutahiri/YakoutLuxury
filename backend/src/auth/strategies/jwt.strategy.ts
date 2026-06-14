import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { SecurityConfigService } from "../../common/services/security-config.service";
import { AuthService } from "../auth.service";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    securityConfigService: SecurityConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfigService.getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException("Session invalide.");
    }

    return user;
  }
}
