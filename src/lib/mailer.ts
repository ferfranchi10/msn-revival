import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

/** Server-only. Envía por el relay SMTP de Gmail con la cuenta de GMAIL_USER (gratis, sin dominio propio). */
export function getMailTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return cachedTransporter;
}

/** Gmail reescribe/rechaza el remitente si no coincide con la cuenta autenticada. */
export function getMailFrom(): string {
  return `MSN Revival <${process.env.GMAIL_USER}>`;
}
