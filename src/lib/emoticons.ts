import { createElement, type ReactNode } from "react";
import { Emoticon, type EmoticonId } from "@/components/Emoticon";

/** Catálogo de emoticonos propios: shortcodes ordenados de más a menos específico
 * (para que ":D" no sea capturado antes por otra regla, etc.) */
export const EMOTICONS: { id: EmoticonId; shortcodes: string[]; label: string }[] = [
  { id: "happy", shortcodes: [":)", ":-)"], label: "Feliz" },
  { id: "laugh", shortcodes: [":D", ":-D"], label: "Risa" },
  { id: "sad", shortcodes: [":(", ":-("], label: "Triste" },
  { id: "angry", shortcodes: [":@", ">:("], label: "Enfadado" },
  { id: "wink", shortcodes: [";)", ";-)"], label: "Guiño" },
  { id: "surprised", shortcodes: [":O", ":-O"], label: "Sorpresa" },
  { id: "tongue", shortcodes: [":P", ":-P"], label: "Lengua" },
  { id: "love", shortcodes: ["<3"], label: "Amor" },
];

const SHORTCODE_TO_ID = new Map<string, EmoticonId>();
for (const entry of EMOTICONS) {
  for (const code of entry.shortcodes) SHORTCODE_TO_ID.set(code, entry.id);
}

const SORTED_CODES = [...SHORTCODE_TO_ID.keys()].sort((a, b) => b.length - a.length);
const SPLIT_REGEX = new RegExp(
  `(${SORTED_CODES.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

/** Convierte texto plano con shortcodes (":)", "<3", ...) en nodos React con emoticonos intercalados. */
export function renderWithEmoticons(text: string): ReactNode[] {
  const parts = text.split(SPLIT_REGEX);
  return parts
    .filter((part) => part.length > 0)
    .map((part, i) => {
      const id = SHORTCODE_TO_ID.get(part);
      if (!id) return part;
      return createElement(Emoticon, { key: i, id, size: 16 });
    });
}
