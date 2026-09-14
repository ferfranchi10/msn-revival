import type { ButtonHTMLAttributes } from "react";

export function RetroButton({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base =
    "h-11 rounded-[4px] text-[15px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.25)] transition active:translate-y-px active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)] disabled:opacity-60";
  const variants = {
    primary:
      "border border-[#8a94a3] bg-gradient-to-b from-white via-[#f4f6fa] to-[#dfe4ec] text-[#1F2D3D]",
    secondary: "border border-[#A7B0BE] bg-[#F4F6FA] text-[#33445A]",
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className ?? ""}`} />;
}
