import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { EmailValidationService } from "../common/services/email-validation.service";
import { MailService } from "../common/services/mail.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { OtpService } from "../otp/otp.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

type SafeUser = Omit<User, "password">;
const PASSWORD_RESET_MESSAGE =
  "Si cet email existe, un code de réinitialisation a été envoyé.";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailValidationService: EmailValidationService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Les mots de passe ne correspondent pas.");
    }

    const email = this.emailValidationService.normalizeAndValidate(dto.email);
    const firstName = this.sanitizationService.trim(dto.firstName);
    const lastName = this.sanitizationService.trim(dto.lastName);
    const phone = dto.phone ? this.sanitizationService.trim(dto.phone) : null;
    const address = dto.address
      ? this.sanitizationService.trim(dto.address)
      : null;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Un compte existe deja avec cet email.");
    }

    const password = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        password,
        role: Role.CLIENT,
        isVerified: false,
        isActive: true,
      },
    });

    const otp = await this.otpService.createForUser(user.id, user.email);
    await this.mailService.sendOtpEmail(user.email, otp.code);

    return {
      message: "Compte cree. Un code de verification a ete envoye par email.",
      user: this.toSafeUser(user),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = this.sanitizationService.normalizeEmail(dto.email);
    const code = this.sanitizationService.trim(dto.code);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException("Code de verification invalide.");
    }

    await this.otpService.verify(user.id, email, code);

    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    return {
      message: "Compte verifie avec succes.",
      user: this.toSafeUser(verifiedUser),
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const email = this.sanitizationService.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException("Aucun compte ne correspond a cet email.");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Ce compte est desactive.");
    }

    if (user.isVerified) {
      throw new BadRequestException("Ce compte est deja verifie.");
    }

    const otp = await this.otpService.createForUser(user.id, user.email);
    await this.mailService.sendOtpEmail(user.email, otp.code);

    return {
      message: "Un nouveau code de verification a ete envoye.",
    };
  }

  async login(dto: LoginDto) {
    const email = this.sanitizationService.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("Email ou mot de passe incorrect.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect.");
    }

    if (!user.isVerified) {
      throw new ForbiddenException({
        code: "OTP_REQUIRED",
        email: user.email,
        message: "Veuillez verifier votre email avant d'acceder au dashboard.",
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException("Ce compte est desactive.");
    }

    const safeUser = this.toSafeUser(user);

    return {
      accessToken: await this.signAccessToken(user),
      user: safeUser,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = this.sanitizationService.normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user?.isActive) {
      const otp = await this.otpService.createForUser(user.id, user.email);
      await this.mailService.sendPasswordResetEmail(user.email, otp.code);
    }

    return {
      message: PASSWORD_RESET_MESSAGE,
    };
  }

  async resendPasswordOtp(dto: ForgotPasswordDto) {
    return this.forgotPassword(dto);
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Les mots de passe ne correspondent pas.");
    }

    const email = this.sanitizationService.normalizeEmail(dto.email);
    const code = this.sanitizationService.trim(dto.otp);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new BadRequestException("Code de réinitialisation invalide ou expiré.");
    }

    await this.otpService.verify(user.id, email, code);

    const password = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password },
    });

    return {
      message: "Mot de passe réinitialisé avec succès.",
    };
  }

  async validateJwtUser(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.isActive || !user.isVerified) {
      return null;
    }

    return this.toSafeUser(user);
  }

  private async signAccessToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private toSafeUser(user: User): SafeUser {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
