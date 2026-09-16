export type EmoticonId = "happy" | "laugh" | "sad" | "angry" | "wink" | "surprised" | "love" | "tongue";

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

/** Emoticono propio (cara dibujada, no emoji nativo del SO) para el chat retro. */
export function Emoticon({ id, size = 18 }: { id: EmoticonId; size?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className="inline-block align-text-bottom"
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
          <circle cx="13.2" cy="8.3" r="1.1" fill={LINE} />
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
    </svg>
  );
}
