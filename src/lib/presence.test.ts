import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// presence.ts importa el cliente de Firebase, que inicializa la app con variables de entorno que no existen en los tests.
vi.mock("./firebase", () => ({ db: {}, rtdb: {}, auth: {} }));

import { formatLastSeen } from "./presence";

const NOW = new Date("2026-09-20T12:00:00Z").getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatLastSeen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("sin dato, dice que se desconoce", () => {
    expect(formatLastSeen(null)).toBe("Última conexión desconocida");
  });

  it("menos de un minuto: hace un momento", () => {
    expect(formatLastSeen(NOW - 30_000)).toBe("Últ. vez hace un momento");
  });

  it("minutos, con el límite exacto de cada tramo", () => {
    expect(formatLastSeen(NOW - MIN)).toBe("Últ. vez hace 1 min");
    expect(formatLastSeen(NOW - 59 * MIN)).toBe("Últ. vez hace 59 min");
    expect(formatLastSeen(NOW - 60 * MIN)).toBe("Últ. vez hace 1 h");
  });

  it("horas y días", () => {
    expect(formatLastSeen(NOW - 23 * HOUR)).toBe("Últ. vez hace 23 h");
    expect(formatLastSeen(NOW - 24 * HOUR)).toBe("Últ. vez hace 1 d");
    expect(formatLastSeen(NOW - 6 * DAY)).toBe("Últ. vez hace 6 d");
  });

  it("a partir de una semana muestra la fecha", () => {
    expect(formatLastSeen(NOW - 7 * DAY)).toMatch(/^Últ\. vez el /);
  });
});
