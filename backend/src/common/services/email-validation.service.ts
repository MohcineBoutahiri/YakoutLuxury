import { BadRequestException, Injectable } from "@nestjs/common";
import { SanitizationService } from "./sanitization.service";

const blockedDomains = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "lnovic.com",
  "bltiwd.com",
  "wnbaldwy.com",
  "bwmyga.com",
  "ozsaip.com",
  "yzcalo.com",
  "lnovic.com",
  "ruutukf.com",
  "gmeenramy.com"
]);

@Injectable()
export class EmailValidationService {
  constructor(private readonly sanitizationService: SanitizationService) {}

  normalizeAndValidate(email: string) {
    const normalizedEmail = this.sanitizationService.normalizeEmail(email);
    const domain = normalizedEmail.split("@")[1]?.toLowerCase();

    if (!domain || blockedDomains.has(domain)) {
      throw new BadRequestException("Veuillez utiliser une adresse email valide.");
    }

    return normalizedEmail;
  }
}
