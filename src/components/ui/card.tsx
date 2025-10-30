import React from "react";

export function Card({ children, className = "" }: any) {
  return <div className={`bg-white border border-slate-200 shadow-sm ${className} rounded-3xl`}>{children}</div>;
}
export function CardHeader({ children, className = "" }: any) {
  return <div className={`p-5 border-b border-slate-100 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = "" }: any) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
export function CardDescription({ children, className = "" }: any) {
  return <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;
}
export function CardContent({ children, className = "" }: any) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
