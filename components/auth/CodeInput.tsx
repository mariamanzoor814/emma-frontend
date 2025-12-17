"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  length?: number; // default 6
  value: string; // code string, e.g. "123456"
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string; // single digit placeholder like "0"
};

/**
 * 6-box verification input with paste support and keyboard navigation.
 * visually shows a dash between 3rd and 4th box to match your screenshot.
 */
export default function CodeInput({
  length = 6,
  value,
  onChange,
  className = "",
  placeholder = "0",
}: Props) {
  const digits = value.split("").slice(0, length);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // keep refs array length in sync
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const focusAt = (idx: number) => {
    const el = refs.current[idx];
    if (el) el.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const raw = e.target.value || "";
    const filtered = raw.replace(/\D/g, ""); // digits only
    if (!filtered) {
      // clear position
      const next = value.split("");
      next[idx] = "";
      onChange(next.join("").slice(0, length));
      return;
    }
    // take first digit from filtered
    const digit = filtered[0];
    const nextArr = Array.from({ length }, (_, i) => digits[i] ?? "");
    nextArr[idx] = digit;
    const nextVal = nextArr.join("").slice(0, length);
    onChange(nextVal);

    // move focus to next
    if (idx < length - 1) {
      focusAt(idx + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    const key = e.key;
    if (key === "Backspace") {
      if ((value[idx] ?? "") === "") {
        // move to previous if this is empty
        if (idx > 0) {
          focusAt(idx - 1);
          e.preventDefault();
        }
      } else {
        // clear this char
        const next = value.split("");
        next[idx] = "";
        onChange(next.join("").slice(0, length));
        e.preventDefault();
      }
    } else if (key === "ArrowLeft") {
      if (idx > 0) focusAt(idx - 1);
      e.preventDefault();
    } else if (key === "ArrowRight") {
      if (idx < length - 1) focusAt(idx + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text") || "";
    const digitsOnly = pasted.replace(/\D/g, "");
    if (!digitsOnly) return;
    // fill up to length
    const next = digitsOnly.slice(0, length).split("");
    // pad with existing digits if shorter
    const outArr = Array.from({ length }, (_, i) => next[i] ?? digits[i] ?? "");
    onChange(outArr.join("").slice(0, length));
    // focus at end
    const nextIdx = Math.min(digitsOnly.length, length - 1);
    setTimeout(() => focusAt(nextIdx), 0);
    e.preventDefault();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length }).map((_, i) => {
        const showDash = i === Math.floor(length / 2) - 1; // after 3rd for length 6
        return (
          <React.Fragment key={i}>
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[i] ?? ""}
              onChange={(e) => handleChange(e as any, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              aria-label={`Digit ${i + 1}`}
              className="h-12 w-12 flex-shrink-0 rounded-lg border border-slate-200 bg-white text-center text-2xl font-semibold leading-none text-slate-700 shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/40 outline-none"
              placeholder={placeholder}
            />
            {showDash && (
              <div aria-hidden className="px-2 text-slate-400 select-none">
                -
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
