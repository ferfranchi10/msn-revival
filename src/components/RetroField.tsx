import type { InputHTMLAttributes } from "react";

type RetroFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function RetroField({ label, className, ...inputProps }: RetroFieldProps) {
  return (
    <label className="mb-4 block text-[15px] text-[#1F2D3D]">
      {label}
      <input
        {...inputProps}
        className={`mt-1 w-full rounded-[3px] border border-[#A7B0BE] bg-white px-3 py-2.5 text-[15px] text-[#1F2D3D] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus:border-[#3E73B8] focus:outline-none disabled:bg-[#F4F6FA] disabled:text-[#33445A]/60 ${
          className ?? ""
        }`}
      />
    </label>
  );
}
