"use client";

import { EMOTICONS } from "@/lib/emoticons";
import { Emoticon } from "./Emoticon";

/** Panel clásico de selección de emoticonos (no un selector de emojis moderno). */
export function EmoticonPicker({ onPick }: { onPick: (shortcode: string) => void }) {
  return (
    <div className="absolute bottom-full left-0 z-10 mb-1 grid grid-cols-4 gap-1 rounded-[3px] border border-[#8a94a3] bg-white p-2 shadow-[2px_2px_6px_rgba(0,0,0,0.35)]">
      {EMOTICONS.map((e) => (
        <button
          key={e.id}
          type="button"
          title={e.label}
          onClick={() => onPick(e.shortcodes[0])}
          className="flex h-7 w-7 items-center justify-center rounded-[2px] hover:bg-[#E8F1FC]"
        >
          <Emoticon id={e.id} size={18} />
        </button>
      ))}
    </div>
  );
}
