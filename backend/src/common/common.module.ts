import { Module } from "@nestjs/common";
import { EmailValidationService } from "./services/email-validation.service";
import { MailService } from "./services/mail.service";
import { PaginationService } from "./services/pagination.service";
import { SanitizationService } from "./services/sanitization.service";
import { SecurityConfigService } from "./services/security-config.service";
import { SlugService } from "./services/slug.service";

@Module({
  providers: [
    MailService,
    EmailValidationService,
    PaginationService,
    SanitizationService,
    SecurityConfigService,
    SlugService,
  ],
  exports: [
    MailService,
    EmailValidationService,
    PaginationService,
    SanitizationService,
    SecurityConfigService,
    SlugService,
  ],
})
export class CommonModule {}
