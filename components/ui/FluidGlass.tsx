import type { ReactNode } from "react";

type FluidGlassProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Lightweight fluid glass backdrop using animated blur blobs.
 * No WebGL/Three dependencies; safe to render anywhere.
 */
export function FluidGlass({ children, className = "" }: FluidGlassProps) {
  return (
    <div className={`relative glass-hero glass-surface ${className}`}>
      <div className="absolute inset-0 overflow-hidden">
        <span className="glass-blob" />
        <span className="glass-blob" />
        <span className="glass-blob" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
