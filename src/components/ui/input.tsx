import React from "react";
export function Input(props: any) {
  return (
    <input
      {...props}
      className={
        "border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 rounded-xl px-3 py-2 w-full text-sm " +
        (props.className || "")
      }
    />
  );
}
