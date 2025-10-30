import React from "react";

export function Dialog({ open, onOpenChange, children }: any) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => onOpenChange?.(false)} />}
      {open ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4">{children}</div> : null}
    </>
  );
}
export function DialogContent({ children, className = "" }: any) {
  return (
    <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg ${className}`}>
      {children}
    </div>
  );
}
export function DialogHeader({ children }: any) {
  return <div className="p-4 border-b border-slate-100">{children}</div>;
}
export function DialogFooter({ children, className = "" }: any) {
  return <div className={`p-4 border-t border-slate-100 flex gap-2 justify-end ${className}`}>{children}</div>;
}
export function DialogTitle({ children }: any) {
  return <h3 className="text-base font-semibold">{children}</h3>;
}
