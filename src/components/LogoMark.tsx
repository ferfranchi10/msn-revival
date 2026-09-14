export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mr-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="mr-wing-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="mr-wing-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Ala abstracta propia (geometría y colores distintos a cualquier logo de terceros) */}
      <ellipse
        cx="88"
        cy="50"
        rx="24"
        ry="15"
        fill="url(#mr-wing-a)"
        opacity="0.9"
        transform="rotate(-18 88 50)"
      />
      <ellipse
        cx="90"
        cy="76"
        rx="19"
        ry="13"
        fill="url(#mr-wing-b)"
        opacity="0.9"
        transform="rotate(18 90 76)"
      />

      {/* Cuerpo */}
      <rect x="14" y="50" width="58" height="46" rx="25" fill="url(#mr-body)" />
      {/* Cabeza */}
      <circle cx="43" cy="33" r="20" fill="url(#mr-body)" />
      {/* Brillo */}
      <circle cx="36" cy="25" r="6" fill="white" opacity="0.35" />
      {/* Cara */}
      <circle cx="36" cy="32" r="2.4" fill="#0c1a3d" />
      <circle cx="50" cy="32" r="2.4" fill="#0c1a3d" />
      <path
        d="M35 40c3 2.6 12.5 2.6 15.5 0"
        stroke="#0c1a3d"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
