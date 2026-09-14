import { LogoMark } from "./LogoMark";

export function HeroLogoBox({ size = 140 }: { size?: number }) {
  return (
    <div
      className="mx-auto flex items-center justify-center rounded-[10px] border border-[#C4CBD5] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
      style={{ width: size, height: size }}
    >
      <LogoMark size={size * 0.72} />
    </div>
  );
}
