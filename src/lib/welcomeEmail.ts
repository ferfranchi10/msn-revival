import { RETRO_FONT, retro } from "@/lib/theme";

export const SITE_URL = "https://msn-revival.vercel.app";

/** Logo servido por la ruta dinámica `src/app/icon.tsx` (32x32, mismo dibujo que `LogoMark`). */
const LOGO_URL = `${SITE_URL}/icon`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildWelcomeEmailHtml({
  displayName,
  verifyLink,
}: {
  displayName: string;
  verifyLink: string;
}): string {
  const safeName = escapeHtml(displayName.trim());
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>MSN Revival</title>
    <style>
      :root { color-scheme: light only; supported-color-scheme: light only; }
      /* Gmail (app y web) reoscurece/reclarea colores en modo oscuro aunque el
         email sea de fondo claro; [data-ogsc] es el hook que usa Gmail para
         marcar "este cliente está en modo oscuro" y reforzamos acá los mismos
         colores del diseño original para que no quede texto claro sobre fondo
         claro (lo que pasó en la primera prueba). */
      [data-ogsc] .msn-titlebar { background: ${retro.titleBarTo} !important; }
      [data-ogsc] .msn-titlebar, [data-ogsc] .msn-titlebar * { color: #ffffff !important; }
      [data-ogsc] .msn-menubar { background: ${retro.menuBg} !important; color: ${retro.textMuted} !important; }
      [data-ogsc] .msn-panel { background: #ffffff !important; }
      [data-ogsc] .msn-panel, [data-ogsc] .msn-panel p { color: ${retro.textDark} !important; }
      [data-ogsc] .msn-panel .msn-highlight { color: ${retro.titleBarTo} !important; }
      [data-ogsc] .msn-panel .msn-muted { color: ${retro.textMuted} !important; }
      [data-ogsc] .msn-button { background: #f4f6fa !important; }
      [data-ogsc] .msn-button-text { color: ${retro.textDark} !important; }
    </style>
  </head>
  <body style="margin:0; padding:32px 16px; background-color:#000000; font-family:${RETRO_FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; margin:0 auto; border-collapse:collapse; border:1px solid ${retro.windowBorder}; border-radius:6px; overflow:hidden;">
      <tr>
        <td class="msn-titlebar" bgcolor="${retro.titleBarTo}" style="background-color:${retro.titleBarTo}; background-image:linear-gradient(180deg, ${retro.titleBarFrom} 0%, ${retro.titleBarVia} 55%, ${retro.titleBarTo} 100%); border-bottom:1px solid ${retro.titleBarBorder}; padding:10px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle; padding-right:8px;">
                <img src="${LOGO_URL}" width="18" height="18" alt="" style="display:block; border-radius:3px;" />
              </td>
              <td style="vertical-align:middle; font-size:13px; font-weight:bold; color:#ffffff;">
                MSN Revival
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="msn-menubar" bgcolor="${retro.menuBg}" style="background-color:${retro.menuBg}; border-bottom:1px solid ${retro.menuBorder}; padding:6px 12px; font-size:11px; color:${retro.textMuted};">
          Archivo&nbsp;&nbsp;&nbsp;Contactos&nbsp;&nbsp;&nbsp;Acciones&nbsp;&nbsp;&nbsp;Herramientas&nbsp;&nbsp;&nbsp;Ayuda
        </td>
      </tr>
      <tr>
        <td class="msn-panel" bgcolor="#ffffff" style="background-color:${retro.panelTo}; background-image:linear-gradient(180deg, ${retro.panelFrom} 0%, ${retro.panelTo} 100%); padding:28px 26px; font-size:15px; line-height:1.6; color:${retro.textDark};">
          <p style="margin:0 0 16px;">${greeting}</p>

          <p style="margin:0 0 16px;">¿Te acuerdas de aquella época?</p>

          <p style="margin:0 0 4px;">De llegar a casa, encender el ordenador y conectarte casi sin pensarlo.</p>
          <p style="margin:0 0 4px;">De mirar la lista de contactos y buscar ese nombre.</p>
          <p style="margin:0 0 16px;">Ese pequeño punto verde que podía cambiarte el ánimo.</p>

          <p style="margin:0 0 4px;">A veces era un amigo que hacía meses que no veías.</p>
          <p style="margin:0 0 4px;">A veces alguien con quien hablábamos durante horas.</p>
          <p style="margin:0 0 16px;">Y otras veces&hellip; era <em>esa persona</em>.</p>

          <p style="margin:0 0 16px;">La que esperábamos encontrar conectada.</p>

          <p style="margin:0 0 6px;">La que nos hacía entrar &ldquo;un ratito&rdquo; y terminar hablando hasta que alguien decía:</p>
          <p style="margin:0 0 20px; font-weight:bold;">&ldquo;Bueno&hellip; me tengo que ir.&rdquo;</p>

          <p style="margin:0 0 16px;">Antes de las historias, los likes y las notificaciones constantes, había algo diferente.</p>

          <p style="margin:0 0 4px;">Había que esperar.</p>
          <p style="margin:0 0 4px;">Había que coincidir.</p>
          <p style="margin:0 0 16px;">Había que estar ahí.</p>

          <p style="margin:0 0 16px;">Y quizá por eso aquellas conversaciones significaban tanto.</p>

          <p style="margin:0 0 24px;">Porque cuando alguien aparecía conectado, sabíamos que había elegido estar ahí también.</p>

          <p style="margin:0 0 16px;">Hoy volvemos a abrir esa puerta.</p>

          <p style="margin:0 0 24px;">No para vivir en el pasado, sino para recuperar una pequeña parte de lo que sentimos entonces.</p>

          <p style="margin:0 0 8px; font-weight:bold; font-size:16px;">Bienvenido de vuelta.</p>

          <p style="margin:0 0 24px;">Tu cuenta ya está casi lista. Solo necesitamos confirmar que esta dirección de correo es tuya.</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td class="msn-button" bgcolor="#f4f6fa" style="background-color:#f4f6fa; background-image:linear-gradient(180deg, #ffffff 0%, #f4f6fa 55%, #dfe4ec 100%); border:1px solid ${retro.buttonBorder}; border-radius:4px;">
                <a href="${verifyLink}" target="_blank" rel="noopener" class="msn-button-text" style="display:block; padding:12px 28px; font-size:14px; font-weight:bold; color:${retro.textDark}; text-decoration:none;">
                  VERIFICAR MI CUENTA
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 4px;">Nos vemos al otro lado.</p>
          <p style="margin:0 0 4px;">Y quién sabe&hellip;</p>
          <p style="margin:0 0 24px;">Quizás alguien que llevabas mucho tiempo esperando también esté conectado.</p>

          <p style="margin:0 0 20px; font-size:18px;">&#128153;</p>

          <p class="msn-highlight" style="margin:0 0 2px; font-weight:bold; color:${retro.titleBarTo};">MSN Revival</p>
          <p class="msn-muted" style="margin:0; font-style:italic; color:${retro.textMuted};">El lugar donde volver a coincidir.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWelcomeEmailText({
  displayName,
  verifyLink,
}: {
  displayName: string;
  verifyLink: string;
}): string {
  const greeting = displayName.trim() ? `Hola ${displayName.trim()},` : "Hola,";
  return [
    greeting,
    "",
    "¿Te acuerdas de aquella época?",
    "",
    "De llegar a casa, encender el ordenador y conectarte casi sin pensarlo.",
    "De mirar la lista de contactos y buscar ese nombre.",
    "Ese pequeño punto verde que podía cambiarte el ánimo.",
    "",
    "A veces era un amigo que hacía meses que no veías.",
    "A veces alguien con quien hablábamos durante horas.",
    "Y otras veces... era esa persona.",
    "",
    "La que esperábamos encontrar conectada.",
    "",
    'La que nos hacía entrar "un ratito" y terminar hablando hasta que alguien decía:',
    '"Bueno... me tengo que ir."',
    "",
    "Antes de las historias, los likes y las notificaciones constantes, había algo diferente.",
    "",
    "Había que esperar.",
    "Había que coincidir.",
    "Había que estar ahí.",
    "",
    "Y quizá por eso aquellas conversaciones significaban tanto.",
    "Porque cuando alguien aparecía conectado, sabíamos que había elegido estar ahí también.",
    "",
    "Hoy volvemos a abrir esa puerta.",
    "No para vivir en el pasado, sino para recuperar una pequeña parte de lo que sentimos entonces.",
    "",
    "Bienvenido de vuelta.",
    "",
    "Tu cuenta ya está casi lista. Solo necesitamos confirmar que esta dirección de correo es tuya.",
    "",
    `Verificar mi cuenta: ${verifyLink}`,
    "",
    "Nos vemos al otro lado.",
    "Y quién sabe...",
    "Quizás alguien que llevabas mucho tiempo esperando también esté conectado.",
    "",
    "MSN Revival",
    "El lugar donde volver a coincidir.",
  ].join("\n");
}
