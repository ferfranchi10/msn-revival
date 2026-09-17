import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { getMailFrom, getMailTransporter } from "@/lib/mailer";
import { buildWelcomeEmailHtml, buildWelcomeEmailText, SITE_URL } from "@/lib/welcomeEmail";

/** Requiere un ID token de Firebase Auth válido: sin esto, cualquiera podía
 * mandar un POST con cualquier email y disparar un envío (usando la cuota de
 * Gmail del proyecto), además de servir de oráculo para saber qué emails
 * tienen cuenta. El email se toma del token verificado, nunca del body. */
async function requireCallerEmail(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!idToken) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const email = await requireCallerEmail(request);
  if (!email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { displayName } = (body ?? {}) as { displayName?: unknown };

  try {
    const verifyLink = await getAdminAuth().generateEmailVerificationLink(email, {
      url: `${SITE_URL}/login`,
    });

    const name = typeof displayName === "string" ? displayName : "";

    await getMailTransporter().sendMail({
      from: getMailFrom(),
      to: email,
      subject: "Bienvenido de vuelta a aquella época 💙",
      html: buildWelcomeEmailHtml({ displayName: name, verifyLink }),
      text: buildWelcomeEmailText({ displayName: name, verifyLink }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-welcome-email error", err);
    return NextResponse.json({ error: "No se pudo enviar el email" }, { status: 500 });
  }
}
