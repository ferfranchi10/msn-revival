import { describe, expect, it } from "vitest";
import { getFriendshipId, getOtherUid, type Friendship } from "./friendships";

describe("getFriendshipId", () => {
  it("es el par ordenado unido por guion bajo", () => {
    expect(getFriendshipId("aaa", "bbb")).toBe("aaa_bbb");
  });

  it("da el mismo id sin importar el orden de los uids", () => {
    expect(getFriendshipId("zed", "abc")).toBe(getFriendshipId("abc", "zed"));
    expect(getFriendshipId("zed", "abc")).toBe("abc_zed");
  });
});

describe("getOtherUid", () => {
  const friendship = { userId: "yo", friendId: "otro" } as Friendship;

  it("devuelve el friendId si yo soy quien envió la solicitud", () => {
    expect(getOtherUid(friendship, "yo")).toBe("otro");
  });

  it("devuelve el userId si yo soy quien la recibió", () => {
    expect(getOtherUid(friendship, "otro")).toBe("yo");
  });
});
