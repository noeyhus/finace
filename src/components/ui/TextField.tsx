import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, className = "", ...props }: Props) {
  const fieldId = id ?? props.name ?? label;
  return (
    <label className="flex flex-col gap-2" htmlFor={fieldId}>
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      <input
        id={fieldId}
        className={`h-12 rounded-xl bg-[var(--surface)] px-4 text-[15px] text-[var(--ink)] outline-none ring-1 ring-[var(--line)] transition placeholder:text-[var(--ink-faint)] focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        {...props}
      />
      {hint ? <span className="text-xs text-[var(--ink-muted)]">{hint}</span> : null}
    </label>
  );
}
