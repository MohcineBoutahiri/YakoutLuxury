import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import type { JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { loadEnv } from "../common/config/load-env";
import { CommonModule } from "../common/common.module";
import { OtpModule } from "../otp/otp.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

loadEnv();

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ??
  "7d") as JwtSignOptions["expiresIn"];
const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret || (process.env.NODE_ENV === "production" && jwtSecret === "change-me")) {
  throw new Error("JWT_SECRET doit etre configure avec une valeur forte.");
}

@Module({
  imports: [
    CommonModule,
    OtpModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
