// src/components/ui/sheet.tsx
import React from "react";
import { createPortal } from "react-dom";

type SheetCtx = { open: boolean; onOpenChange: (v: boolean) => void };
const SheetContext = React.createContext<SheetCtx | null>(null);
function useSheetCtx() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used inside <Sheet>.");
  return ctx;
}

// --- Scroll lock com referência (suporta múltiplos sheets) ---
let lockCount = 0;
function lockScroll() {
  lockCount++;
  if (lockCount > 1) return;
  const docEl = document.documentElement;
  const body = document.body;
  const scrollBarW = window.innerWidth - docEl.clientWidth;
  body.dataset._sheet_pr = body.style.paddingRight || "";
  docEl.dataset._sheet_pr = docEl.style.paddingRight || "";
  if (scrollBarW > 0) {
    body.style.paddingRight = `${scrollBarW}px`;
    docEl.style.paddingRight = `${scrollBarW}px`;
  }
  body.dataset._sheet_of = body.style.overflow || "";
  docEl.dataset._sheet_of = docEl.style.overflow || "";
  body.style.overflow = "hidden";
  docEl.style.overflow = "hidden";
}
function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  const docEl = document.documentElement;
  const body = document.body;
  body.style.overflow = body.dataset._sheet_of || "";
  docEl.style.overflow = docEl.dataset._sheet_of || "";
  body.style.paddingRight = body.dataset._sheet_pr || "";
  docEl.style.paddingRight = docEl.dataset._sheet_pr || "";
}

type SheetProps = { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode };

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  // ESC fecha
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Lock/unlock de scroll
  React.useEffect(() => {
    if (open) lockScroll();
    return () => { if (open) unlockScroll(); };
  }, [open]);

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[1000]"
            onClick={() => onOpenChange(false)}
          />,
          document.body
        )}
    </SheetContext.Provider>
  );
}

type TriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children?: React.ReactNode };
export function SheetTrigger({ asChild, children, onClick, ...rest }: TriggerProps) {
  const { onOpenChange } = useSheetCtx();
  const Comp: any = asChild ? "span" : "button";
  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => { onClick?.(e); onOpenChange(true); };
  return <Comp onClick={handleClick} {...rest}>{children}</Comp>;
}

/** Tamanhos: sm, md, lg, xl, full (default: xl) */
type ContentProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: React.ReactNode; className?: string; size?: "sm"|"md"|"lg"|"xl"|"full";
};
export function SheetContent({ children, className = "", size = "xl", ...rest }: ContentProps) {
  const { open } = useSheetCtx();
  const sizeMap: Record<NonNullable<ContentProps["size"]>, string> = {
    sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-3xl", full: "sm:max-w-full",
  };
  return createPortal(
    <div
      role="dialog" aria-modal="true"
      className={
        "fixed top-0 right-0 h-full w-full " + sizeMap[size] +
        " bg-white shadow-xl border-l border-slate-200 p-4 sm:p-6 transition-transform duration-300 will-change-transform " +
        (open ? "translate-x-0" : "translate-x-full") + (className ? ` ${className}` : "") + " z-[1001]"
      }
      {...rest}
    >
      {children}
    </div>,
    document.body
  );
}

type CloseProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children?: React.ReactNode };
export function SheetClose({ asChild, children, onClick, ...rest }: CloseProps) {
  const { onOpenChange } = useSheetCtx();
  const Comp: any = asChild ? "span" : "button";
  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => { onClick?.(e); onOpenChange(false); };
  return <Comp onClick={handleClick} {...rest}>{children}</Comp>;
}

export function SheetHeader({ children }: { children?: React.ReactNode }) {
  return <div className="pb-2 border-b border-slate-100">{children}</div>;
}
export function SheetTitle({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold ${className}`}>{children}</h3>;
}
export function SheetFooter({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={`pt-3 ${className}`}>{children}</div>;
}
