import { Injectable } from "@nestjs/common";

@Injectable()
export class SecurityConfigService {
  getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    const isProduction = process.env.NODE_ENV === "production";

    if (!secret || (isProduction && secret === "change-me")) {
      throw new Error("JWT_SECRET doit etre configure avec une valeur forte.");
    }

    return secret;
  }

  getCorsOrigins() {
    const configuredOrigins = process.env.FRONTEND_URL ?? "http://localhost:3000";

    return configuredOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
}
