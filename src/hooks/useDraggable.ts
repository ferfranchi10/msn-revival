"use client";

import { useCallback, useRef, useState } from "react";

type Position = { x: number; y: number };

/**
 * Hace que un elemento se pueda arrastrar libremente por la pantalla desde un
 * "handle" (p. ej. la barra de título). Antes del primer arrastre, el elemento
 * sigue su posición normal en el flujo del documento (centrado por su
 * contenedor, apilado, etc.); al primer arrastre "se despega" a `position:
 * fixed` en el punto exacto donde ya estaba, y desde ahí sigue al puntero.
 * Usa Pointer Events (no mouse/touch por separado) para funcionar con mouse y
 * dedo por igual, y `setPointerCapture` en vez de listeners globales en
 * `document` para no tener que agregar/sacar listeners a mano.
 */
export function useDraggable() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; left: number; top: number } | null>(null);

  const onDragStart = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = elementRef.current;
    if (!el || e.button !== 0) return;
    const rect = el.getBoundingClientRect();
    dragOrigin.current = { pointerX: e.clientX, pointerY: e.clientY, left: rect.left, top: rect.top };
    setPosition({ x: rect.left, y: rect.top });
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const origin = dragOrigin.current;
    const el = elementRef.current;
    if (!origin || !el) return;
    const maxX = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - el.offsetHeight);
    const nextX = Math.min(Math.max(0, origin.left + (e.clientX - origin.pointerX)), maxX);
    const nextY = Math.min(Math.max(0, origin.top + (e.clientY - origin.pointerY)), maxY);
    setPosition({ x: nextX, y: nextY });
  }, []);

  const onDragEnd = useCallback((e: React.PointerEvent<HTMLElement>) => {
    dragOrigin.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return {
    elementRef,
    position,
    dragHandleProps: {
      onPointerDown: onDragStart,
      onPointerMove: onDragMove,
      onPointerUp: onDragEnd,
      onPointerCancel: onDragEnd,
    },
  };
}
