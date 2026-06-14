import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { createTransport } from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendOtpEmail(email: string, code: string) {
    await this.sendCodeEmail({
      code,
      email,
      intro: "Votre code de verification est :",
      subject: "Votre code de verification Yakout Luxury",
      text: `Votre code de verification Yakout Luxury est ${code}. Il expire dans 10 minutes.`,
    });
  }

  async sendPasswordResetEmail(email: string, code: string) {
    await this.sendCodeEmail({
      code,
      email,
      intro: "Votre code de reinitialisation du mot de passe est :",
      subject: "Réinitialisation du mot de passe - Yakout Luxury",
      text: `Votre code de reinitialisation Yakout Luxury est ${code}. Il expire dans 10 minutes.`,
    });
  }

  async sendOrderNotificationEmail({
    html,
    subject,
    text,
    to,
  }: {
    html: string;
    subject: string;
    text: string;
    to: string;
  }) {
    await this.sendEmail({
      html,
      subject,
      text,
      to,
    });
  }

  private async sendCodeEmail({
    code,
    email,
    intro,
    subject,
    text,
  }: {
    code: string;
    email: string;
    intro: string;
    subject: string;
    text: string;
  }) {
    await this.sendEmail({
      html: `
        <p>${intro}</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p>Ce code expire dans 10 minutes.</p>
      `,
      subject,
      text,
      to: email,
    });
  }

  private async sendEmail({
    html,
    subject,
    text,
    to,
  }: {
    html: string;
    subject: string;
    text: string;
    to: string;
  }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.EMAIL_USER ?? process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS ?? process.env.SMTP_PASSWORD;
    const from =
      process.env.SMTP_FROM ?? "Yakout Luxury <no-reply@yakout-luxury.com>";
    const isProduction = process.env.NODE_ENV === "production";
    const isPlaceholderHost = host === "smtp.example.com";

    if (!host || !user || !pass || isPlaceholderHost) {
      if (isProduction) {
        throw new ServiceUnavailableException(
          "Le service email n'est pas configure.",
        );
      }

      this.logger.warn(
        "SMTP non configure pour le developpement. Email non envoye; aucune donnee sensible n'est loggee.",
      );
      return;
    }

    const transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0B0B0B;">
          <h1 style="font-family: Georgia, serif;">Yakout Luxury</h1>
          ${html}
        </div>
      `,
      subject,
      text,
      to,
    });
  }
}
