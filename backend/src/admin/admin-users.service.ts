import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Prisma, Role } from "@prisma/client";
import { EmailValidationService } from "../common/services/email-validation.service";
import { MailService } from "../common/services/mail.service";
import { PaginationService } from "../common/services/pagination.service";
import { SanitizationService } from "../common/services/sanitization.service";
import { OtpService } from "../otp/otp.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminUserQueryDto } from "./dto/admin-user-query.dto";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly emailValidationService: EmailValidationService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async findAll(query: AdminUserQueryDto) {
    const { page, limit, skip, take } = this.paginationService.normalize(query);
    const where = this.buildWhere(query);

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: this.paginationService.meta(total, page, limit),
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable.");
    }

    return user;
  }

  async createAdmin(dto: CreateAdminUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Les mots de passe ne correspondent pas.");
    }

    const email = this.emailValidationService.normalizeAndValidate(dto.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Cet email est deja utilise.");
    }

    const password = await bcrypt.hash(dto.password, 12);

    const admin = await this.prisma.user.create({
      data: {
        firstName: this.cleanRequired(dto.firstName, "Le prenom est requis."),
        lastName: this.cleanRequired(dto.lastName, "Le nom est requis."),
        email,
        phone: dto.phone ? this.sanitizationService.stripTags(dto.phone) : null,
        address: dto.address ? this.sanitizationService.stripTags(dto.address) : null,
        password,
        role: Role.ADMIN,
        isVerified: false,
        isActive: true,
      },
      select: safeUserSelect,
    });

    const otp = await this.otpService.createForUser(admin.id, admin.email);
    await this.mailService.sendOtpEmail(admin.email, otp.code);

    return admin;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, currentAdminId: string) {
    const user = await this.findById(id);

    if (id === currentAdminId && dto.isActive === false) {
      throw new BadRequestException("Vous ne pouvez pas desactiver votre propre compte.");
    }

    if (user.role === Role.ADMIN && dto.isActive === false) {
      const activeAdmins = await this.prisma.user.count({
        where: {
          role: Role.ADMIN,
          isActive: true,
          id: { not: id },
        },
      });

      if (activeAdmins === 0) {
        throw new BadRequestException(
          "Impossible de desactiver le dernier admin actif.",
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: safeUserSelect,
    });
  }

  private buildWhere(query: AdminUserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    if (query.search) {
      const search = this.sanitizationService.trim(query.search);
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private cleanRequired(value: string, message: string) {
    const cleaned = this.sanitizationService.stripTags(value);

    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }
}
