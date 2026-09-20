import { describe, expect, it, vi } from "vitest";

// pushServer importa el Admin SDK (que exige credenciales al usarse); acá solo se prueban funciones puras.
vi.mock("@/lib/firebaseAdmin", () => ({ getAdminDb: vi.fn() }));

import { deviceIdFor, isAllowedEndpoint } from "./pushServer";

describe("isAllowedEndpoint (defensa contra SSRF: el servidor hace POST a esta URL)", () => {
  it.each([
    "https://fcm.googleapis.com/fcm/send/abc",
    "https://updates.push.services.mozilla.com/wpush/v2/abc",
    "https://web.push.apple.com/abc",
    "https://wns2-par02p.notify.windows.com/w/?token=abc",
  ])("acepta %s", (url) => {
    expect(isAllowedEndpoint(url)).toBe(true);
  });

  it.each([
    ["http en vez de https", "http://fcm.googleapis.com/fcm/send/abc"],
    ["localhost", "https://localhost/abc"],
    ["IP interna", "https://169.254.169.254/latest/meta-data"],
    ["host ajeno", "https://evil.com/abc"],
    ["dominio permitido como prefijo de otro", "https://fcm.googleapis.com.evil.com/abc"],
    ["dominio ajeno que solo termina igual que uno permitido", "https://evilfcm.googleapis.com/abc"],
    ["dominio permitido en el path", "https://evil.com/fcm.googleapis.com"],
    ["credenciales para engañar al parser", "https://fcm.googleapis.com@evil.com/abc"],
    ["no es una URL", "esto no es una url"],
    ["vacío", ""],
  ])("rechaza: %s", (_motivo, url) => {
    expect(isAllowedEndpoint(url)).toBe(false);
  });

  it("rechaza lo que no es string y las URLs demasiado largas", () => {
    expect(isAllowedEndpoint(undefined)).toBe(false);
    expect(isAllowedEndpoint(123)).toBe(false);
    expect(isAllowedEndpoint(`https://fcm.googleapis.com/${"a".repeat(1000)}`)).toBe(false);
  });
});

describe("deviceIdFor", () => {
  it("es determinístico y tiene forma de sha256 en hex", () => {
    const id = deviceIdFor("https://fcm.googleapis.com/fcm/send/abc");
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(deviceIdFor("https://fcm.googleapis.com/fcm/send/abc")).toBe(id);
  });

  it("endpoints distintos dan ids distintos", () => {
    expect(deviceIdFor("https://fcm.googleapis.com/a")).not.toBe(deviceIdFor("https://fcm.googleapis.com/b"));
  });
});
