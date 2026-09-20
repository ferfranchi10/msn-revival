import { describe, expect, it } from "vitest";
import { AVATARS, DEFAULT_AVATAR_ID, getAvatar } from "./avatars";

describe("getAvatar", () => {
  it("devuelve el avatar con ese id", () => {
    expect(getAvatar("cat").emoji).toBe("🐱");
  });

  it("cae en el avatar por defecto si el id no existe", () => {
    expect(getAvatar("no-existe").id).toBe(DEFAULT_AVATAR_ID);
  });

  it("no repite ids", () => {
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
  });
});
