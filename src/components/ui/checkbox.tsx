import React from "react";
import { Check } from "lucide-react";

type Props = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className = "",
  id,
  ...rest
}: Props) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isCtrl = typeof checked === "boolean";
  const isChecked = isCtrl ? checked! : internal;

  function toggle() {
    if (disabled) return;
    const next = !isChecked;
    if (!isCtrl) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      type="button"
      id={id}
      onClick={toggle}
      disabled={disabled}
      className={[
        "inline-flex h-5 w-5 items-center justify-center rounded-md border transition",
        isChecked
          ? "bg-purple-600 border-purple-600 text-white"
          : "bg-white border-slate-300 text-transparent hover:border-slate-400",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      aria-checked={isChecked}
      role="checkbox"
      {...rest}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}
