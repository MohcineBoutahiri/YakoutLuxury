import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const OTP_EXPIRATION_MINUTES = 10;

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: string, email: string) {
    await this.prisma.otp.updateMany({
      where: {
        userId,
        email,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    return this.prisma.otp.create({
      data: {
        userId,
        email,
        code: this.generateCode(),
        expiresAt: this.getExpirationDate(),
      },
    });
  }

  async verify(userId: string, email: string, code: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        userId,
        email,
        code,
        isUsed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException("Code de verification invalide ou expire.");
    }

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    return otp;
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getExpirationDate() {
    return new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
  }
}
