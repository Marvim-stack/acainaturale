import React from "react";

export function Tabs({ value, onValueChange, children, className = "" }: any) {
  const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <div className={className} data-role="tabs">
      {React.Children.map(children, (c: any) => React.cloneElement(c, { tabsCtx: ctx }))}
    </div>
  );
}

export function TabsList({ children, className = "" }: any) {
  return (
    <div className={`flex flex-wrap gap-2 bg-slate-100 p-1 rounded-2xl ${className}`}>{children}</div>
  );
}

export function TabsTrigger({ value, children, className = "", tabsCtx }: any) {
  const active = tabsCtx?.value === value;
  return (
    <button
      onClick={() => tabsCtx?.onValueChange?.(value)}
      className={
        (active
          ? "bg-white shadow-sm text-slate-900 "
          : "text-slate-600 hover:text-slate-900 hover:bg-white/60 ") +
        "px-4 h-10 rounded-xl transition-colors"
      + (className ? ` ${className}` : "")
      }
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", tabsCtx }: any) {
  if (tabsCtx?.value !== value) return null;
  return <div className={className}>{children}</div>;
}
