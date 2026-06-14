import { Injectable } from "@nestjs/common";

@Injectable()
export class SanitizationService {
  trim(value: string) {
    return value.trim();
  }

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  stripTags(value: string) {
    return value.replace(/<[^>]*>/g, "").trim();
  }
}
