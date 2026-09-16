import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { buildWelcomeEmailHtml, buildWelcomeEmailText, SITE_URL } from "@/lib/welcomeEmail";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { email, displayName } = (body ?? {}) as { email?: unknown; displayName?: unknown };
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "email requerido" }, { status: 400 });
  }

  try {
    const verifyLink = await getAdminAuth().generateEmailVerificationLink(email.trim(), {
      url: `${SITE_URL}/login`,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const name = typeof displayName === "string" ? displayName : "";

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "MSN Revival <onboarding@resend.dev>",
      to: email.trim(),
      subject: "Bienvenido de vuelta a aquella época 💙",
      html: buildWelcomeEmailHtml({ displayName: name, verifyLink }),
      text: buildWelcomeEmailText({ displayName: name, verifyLink }),
    });

    if (error) {
      console.error("resend error", error);
      return NextResponse.json({ error: "No se pudo enviar el email" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-welcome-email error", err);
    return NextResponse.json({ error: "No se pudo enviar el email" }, { status: 500 });
  }
}
