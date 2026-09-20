import { describe, expect, it } from "vitest";
import { getStatus, getVisibleStatus, OFFLINE_STATUS, STATUS_OPTIONS } from "./status";

describe("getVisibleStatus", () => {
  it("sin conexión real siempre aparece desconectado, sea cual sea el estado manual", () => {
    for (const { id } of STATUS_OPTIONS) {
      expect(getVisibleStatus(id, false)).toBe("offline");
    }
  });

  it("invisible aparece desconectado aunque haya conexión", () => {
    expect(getVisibleStatus("invisible", true)).toBe("offline");
  });

  it("conectado muestra el estado manual elegido", () => {
    expect(getVisibleStatus("online", true)).toBe("online");
    expect(getVisibleStatus("away", true)).toBe("away");
    expect(getVisibleStatus("busy", true)).toBe("busy");
  });
});

describe("getStatus", () => {
  it("devuelve el estado de desconectado", () => {
    expect(getStatus("offline")).toBe(OFFLINE_STATUS);
  });

  it("devuelve la opción que corresponde al id", () => {
    expect(getStatus("busy").label).toBe("No molestar");
  });

  it("cae en Disponible si el id es desconocido", () => {
    expect(getStatus("inventado").id).toBe("online");
  });
});
