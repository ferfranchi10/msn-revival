import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { EMOTICONS, renderWithEmoticons } from "./emoticons";

function idOf(node: unknown): string | null {
  return isValidElement(node) ? (node as ReactElement<{ id: string }>).props.id : null;
}

describe("catálogo de emoticonos", () => {
  it("no repite ids ni shortcodes (un shortcode repetido pisaría a otro emoticono)", () => {
    const ids = EMOTICONS.map((e) => e.id);
    const codes = EMOTICONS.flatMap((e) => e.shortcodes);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("renderWithEmoticons", () => {
  it("texto sin shortcodes queda igual", () => {
    expect(renderWithEmoticons("hola que tal")).toEqual(["hola que tal"]);
  });

  it("texto vacío no genera nodos", () => {
    expect(renderWithEmoticons("")).toEqual([]);
  });

  it("reemplaza un shortcode intercalado en el texto", () => {
    const nodes = renderWithEmoticons("hola :) chau");
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toBe("hola ");
    expect(idOf(nodes[1])).toBe("happy");
    expect(nodes[2]).toBe(" chau");
  });

  it("acepta la variante con guion y varios emoticonos seguidos", () => {
    const nodes = renderWithEmoticons(":-D<3");
    expect(nodes.map(idOf)).toEqual(["laugh", "love"]);
  });

  it("prioriza el shortcode más largo (llorando y fiesta no se parten en otros)", () => {
    expect(renderWithEmoticons(":'(").map(idOf)).toEqual(["crying"]);
    expect(renderWithEmoticons("<:o)").map(idOf)).toEqual(["party"]);
  });

  it("no interpreta HTML: se devuelve como texto plano", () => {
    expect(renderWithEmoticons("<b>hola</b>")).toEqual(["<b>hola</b>"]);
  });
});
