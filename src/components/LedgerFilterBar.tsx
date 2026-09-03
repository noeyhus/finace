"use client";

import { allCategories } from "@/lib/categories";

export type LedgerFilters = {
  year: number;
  /** 0 = 전체 월 */
  month: number;
  category: string;
  scope: "all" | "shared" | "private";
};

type Props = {
  value: LedgerFilters;
  years: number[];
  onChange: (next: LedgerFilters) => void;
};

const MONTHS = [
  { value: 0, label: "전체" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}월`,
  })),
];

export function LedgerFilterBar({ value, years, onChange }: Props) {
  const categories = ["전체", ...allCategories()];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "전체"],
            ["shared", "공용"],
            ["private", "개인"],
          ] as const
        ).map(([scope, label]) => (
          <button
            key={scope}
            type="button"
            onClick={() => onChange({ ...value, scope })}
            className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${
              value.scope === scope
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "bg-[var(--surface)] text-[var(--ink-muted)] ring-1 ring-[var(--line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-muted)]">연도</span>
          <select
            value={value.year}
            onChange={(e) =>
              onChange({ ...value, year: Number(e.target.value) })
            }
            className="h-11 rounded-xl bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none ring-1 ring-[var(--line)] focus:ring-2 focus:ring-[var(--accent)]"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-muted)]">월</span>
          <select
            value={value.month}
            onChange={(e) =>
              onChange({ ...value, month: Number(e.target.value) })
            }
            className="h-11 rounded-xl bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none ring-1 ring-[var(--line)] focus:ring-2 focus:ring-[var(--accent)]"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-muted)]">카테고리</span>
          <select
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value })}
            className="h-11 rounded-xl bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none ring-1 ring-[var(--line)] focus:ring-2 focus:ring-[var(--accent)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
