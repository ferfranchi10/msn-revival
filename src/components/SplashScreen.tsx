import { LogoMark } from "./LogoMark";

/** Pantalla de carga a pantalla completa (mismo fondo que `background_color` del manifest, para que el paso del splash del SO a la app sea continuo). */
export function SplashScreen({ label = "Cargando..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-3 bg-[#0b1220]"
    >
      <div className="animate-pulse">
        <LogoMark size={72} />
      </div>
      <p className="text-[13px] text-white/60">{label}</p>
    </div>
  );
}
