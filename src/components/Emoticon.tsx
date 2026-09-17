export type EmoticonId =
  | "happy"
  | "laugh"
  | "sad"
  | "angry"
  | "wink"
  | "surprised"
  | "love"
  | "tongue"
  | "confused"
  | "blush"
  | "crying"
  | "neutral"
  | "angel"
  | "cool"
  | "nerd"
  | "sick"
  | "party"
  | "sleepy"
  | "thinking"
  | "tonguetied"
  | "kiss"
  | "skeptical";

const FACE_FILL = "#FFCF40";
const FACE_STROKE = "#8a6a10";
const LINE = "#4a3a0a";

function Face({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx="10" cy="10" r="8.5" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1" />
      {children}
    </>
  );
}

/** Emoticono propio (cara dibujada, no emoji nativo del SO) para el chat retro.
 * Cada uno tiene una animación en loop propia (ver `.emoticon-*` en globals.css). */
export function Emoticon({ id, size = 18 }: { id: EmoticonId; size?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={`inline-block align-text-bottom emoticon-${id}`}
      aria-label={id}
    >
      {id === "happy" && (
        <Face>
          <circle cx="6.8" cy="8.3" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <path d="M6 12c1.2 1.6 6.8 1.6 8 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "laugh" && (
        <Face>
          <path d="M5.8 7.6l2 2M7.8 7.6l-2 2" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M12.2 7.6l2 2M14.2 7.6l-2 2" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M5.8 11.5c1.6 2.4 6.8 2.4 8.4 0z" fill={LINE} />
        </Face>
      )}
      {id === "sad" && (
        <Face>
          <circle cx="6.8" cy="8.6" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.6" r="1.1" fill={LINE} />
          <path d="M6 13.4c1.2-1.6 6.8-1.6 8 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "angry" && (
        <Face>
          <path d="M5.4 7.4l3 1.2M14.6 7.4l-3 1.2" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6.8" cy="9.4" r="1" fill={LINE} />
          <circle cx="13.2" cy="9.4" r="1" fill={LINE} />
          <path d="M6.2 13.2c1.2-1 6.4-1 7.6 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "wink" && (
        <Face>
          <path d="M5.6 8.4h2.6" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} className="emoticon-eye-blink" />
          <path d="M6 12c1.2 1.6 6.8 1.6 8 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "surprised" && (
        <Face>
          <circle cx="6.8" cy="8.4" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.4" r="1.1" fill={LINE} />
          <circle cx="10" cy="12.6" r="1.8" fill={LINE} />
        </Face>
      )}
      {id === "tongue" && (
        <Face>
          <path d="M5.8 7.6l2 2M7.8 7.6l-2 2" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <path d="M6.2 11.8c1.4 1.6 6.6 1.6 7.8 0z" fill={LINE} />
          <path d="M9 13.6c0 1.6 .6 2.6 1.4 2.6s1.4-1 1.4-2.6" fill="#e05a6b" stroke={LINE} strokeWidth="0.6" />
        </Face>
      )}
      {id === "love" && (
        <path
          d="M10 16.2 3.6 10c-2-2-1.6-5.4.9-6.6 1.7-.8 3.6-.2 4.6 1.3l.9 1.3.9-1.3c1-1.5 2.9-2.1 4.6-1.3 2.5 1.2 2.9 4.6.9 6.6z"
          fill="#e14a5f"
          stroke="#7a1f2c"
          strokeWidth="0.8"
        />
      )}
      {id === "confused" && (
        <Face>
          <path d="M5.2 7.4l3-0.6" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <circle cx="6.8" cy="8.6" r="1.1" fill={LINE} />
          <path d="M6 13c1-0.9 2-0.9 3 0s2 0.9 3 0 2-0.9 3 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "blush" && (
        <Face>
          <path d="M5.6 8.3q1.3-1.3 2.6 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M11.8 8.3q1.3-1.3 2.6 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="5.6" cy="11.2" r="1.3" fill="#f2879e" opacity="0.8" />
          <circle cx="14.4" cy="11.2" r="1.3" fill="#f2879e" opacity="0.8" />
          <path d="M7 12.6c1 1 4 1 6 0" stroke={LINE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "crying" && (
        <Face>
          <circle cx="6.8" cy="8.6" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.6" r="1.1" fill={LINE} />
          <path d="M6 13.4c1.2-1.6 6.8-1.6 8 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M6.4 10c-0.5 1.5 0.1 2.6 1 2.6s1.3-1.5 0.6-2.8z" fill="#5AA9E6" stroke="#2E5F9E" strokeWidth="0.5" />
        </Face>
      )}
      {id === "neutral" && (
        <Face>
          <circle cx="6.8" cy="8.6" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.6" r="1.1" fill={LINE} />
          <path d="M6.5 13h7" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" />
        </Face>
      )}
      {id === "angel" && (
        <>
          <Face>
            <path d="M5.8 8.3q1.2-1.1 2.4 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M11.8 8.3q1.2-1.1 2.4 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M7 12.4c1 1.2 5 1.2 6 0" stroke={LINE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </Face>
          <ellipse cx="10" cy="1.7" rx="3.4" ry="1.3" fill="none" stroke="#d8b23a" strokeWidth="1.1" />
        </>
      )}
      {id === "cool" && (
        <Face>
          <path d="M4.6 7.8h-1.4M15.4 7.8h1.4" stroke="#1a1a1a" strokeWidth="0.9" strokeLinecap="round" />
          <rect x="4.6" y="7" width="4.6" height="3.2" rx="1.4" fill="#1a1a1a" />
          <rect x="10.8" y="7" width="4.6" height="3.2" rx="1.4" fill="#1a1a1a" />
          <rect x="9.2" y="7.9" width="1.6" height="1" fill="#1a1a1a" />
          <rect x="5.6" y="7.5" width="1.3" height="0.8" rx="0.3" fill="#9fb6d9" opacity="0.8" />
          <rect x="11.8" y="7.5" width="1.3" height="0.8" rx="0.3" fill="#9fb6d9" opacity="0.8" />
          <path d="M6 12.4c1.2 1.4 6.8 1.4 8 0" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "nerd" && (
        <Face>
          <circle cx="6.8" cy="8.4" r="2" fill="none" stroke={LINE} strokeWidth="1" />
          <circle cx="13.2" cy="8.4" r="2" fill="none" stroke={LINE} strokeWidth="1" />
          <path d="M8.8 8.4h2.4" stroke={LINE} strokeWidth="1" />
          <circle cx="6.8" cy="8.4" r="0.6" fill={LINE} />
          <circle cx="13.2" cy="8.4" r="0.6" fill={LINE} />
          <path d="M6.5 13h7" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
        </Face>
      )}
      {id === "sick" && (
        <>
          <circle cx="10" cy="10" r="8.5" fill="#c7dd7a" stroke="#6b7a2e" strokeWidth="1" />
          <path d="M5.4 7l2.8 2.4M8.2 7l-2.8 2.4" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M11.8 7l2.8 2.4M14.6 7l-2.8 2.4" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M6 13c1-1.2 2-0.4 3 0.4s2 0.8 3-0.2 2-1 3 0.2"
            stroke={LINE}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "party" && (
        <>
          <Face>
            <circle cx="6.8" cy="8.3" r="1.1" fill={LINE} />
            <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
            <path d="M6 11.6c1.2 1.8 6.8 1.8 8 0z" fill={LINE} />
          </Face>
          <g transform="rotate(18 10 6)">
            <path d="M10 0.4l2.2 5.8h-4.4z" fill="#e14a8f" stroke="#8a2a5a" strokeWidth="0.5" />
            <path d="M8.3 4.6h3.4" stroke="#ffd94a" strokeWidth="0.6" />
            <circle cx="9.3" cy="3.1" r="0.5" fill="#ffd94a" />
            <circle cx="10.7" cy="2.2" r="0.4" fill="#5AA9E6" />
            <circle cx="10" cy="0.4" r="0.8" fill="#ffd94a" />
          </g>
        </>
      )}
      {id === "sleepy" && (
        <Face>
          <path d="M5.4 8.6q1.4 0.8 2.8 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M11.8 8.6q1.4 0.8 2.8 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M7.4 13c1.6 0.6 3.6 0.6 5.2 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "thinking" && (
        <Face>
          <circle cx="7.2" cy="7.6" r="1" fill={LINE} />
          <circle cx="13.6" cy="7.6" r="1" fill={LINE} />
          <path d="M7 12.6q2-1 5.4 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </Face>
      )}
      {id === "tonguetied" && (
        <Face>
          <circle cx="6.8" cy="8.3" r="1.1" fill={LINE} />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <path d="M6 12.6h8" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M7 11.8v1.6M8.6 11.8v1.6M10.2 11.8v1.6M11.8 11.8v1.6M13.4 11.8v1.6"
            stroke={LINE}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </Face>
      )}
      {id === "kiss" && (
        <Face>
          <path d="M5.6 8.3h2.6" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <path
            d="M5.6 12.6q1.4-1.4 2.6-0.3 0.8-0.9 1.8-0.9t1.8 0.9q1.2-1.1 2.6 0.3-1.2 2.4-4.4 2.4t-4.4-2.4z"
            fill="#d81159"
            stroke="#6e0c33"
            strokeWidth="0.4"
          />
          <path d="M6 12.7c1.6 0.6 6.4 0.6 8 0" stroke="#6e0c33" strokeWidth="0.35" fill="none" />
        </Face>
      )}
      {id === "skeptical" && (
        <Face>
          <path d="M5.2 7l3-1.2" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
          <circle cx="6.8" cy="8.6" r="1.1" fill={LINE} />
          <ellipse cx="10.6" cy="12.6" rx="1.2" ry="1" fill="none" stroke={LINE} strokeWidth="1.1" />
        </Face>
      )}
    </svg>
  );
}
