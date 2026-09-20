import { describe, expect, it } from "vitest";
import { buildWelcomeEmailHtml, escapeHtml } from "./welcomeEmail";

describe("escapeHtml", () => {
  it("escapa los cuatro caracteres peligrosos", () => {
    expect(escapeHtml(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("escapa & primero, sin doble escape", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});

describe("buildWelcomeEmailHtml", () => {
  it("no deja pasar HTML del nombre de usuario", () => {
    const html = buildWelcomeEmailHtml({ displayName: `<script>alert(1)</script>`, verifyLink: "https://x.test/v" });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("saluda de forma genérica si no hay nombre", () => {
    const html = buildWelcomeEmailHtml({ displayName: "   ", verifyLink: "https://x.test/v" });
    expect(html).toContain("Hola,");
  });
});
