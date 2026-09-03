"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { categoriesFor } from "@/lib/categories";
import { todayISODate } from "@/lib/format";
import type { TransactionType, UserProfile, Visibility } from "@/types/models";

type Props = {
  user: UserProfile;
  onSubmit: (input: {
    type: TransactionType;
    visibility: Visibility;
    category: string;
    amount: number;
    memo: string;
    date: string;
  }) => void;
};

export function TransactionForm({ user, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>("expense");
  const [visibility, setVisibility] = useState<Visibility>("shared");
  const categories = useMemo(() => categoriesFor(type), [type]);
  const [category, setCategory] = useState<string>(categories[0] ?? "기타");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [error, setError] = useState("");

  useEffect(() => {
    setCategory(categories[0] ?? "기타");
  }, [categories]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      setError("금액을 올바르게 입력해 주세요.");
      return;
    }
    onSubmit({
      type,
      visibility,
      category,
      amount: Math.round(value),
      memo: memo.trim(),
      date,
    });
    setAmount("");
    setMemo("");
    setDate(todayISODate());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--ink)]">거래 입력</h2>
        <p className="text-xs text-[var(--ink-faint)]">{user.displayName}</p>
      </div>

      <div className="mt-4 flex gap-2">
        {(
          [
            ["expense", "지출"],
            ["income", "수입"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`h-10 flex-1 rounded-xl text-sm font-semibold transition ${
              type === value
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "bg-white/50 text-[var(--ink-muted)] ring-1 ring-[var(--line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        {(
          [
            ["shared", "공용"],
            ["private", "개인"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setVisibility(value)}
            className={`h-10 flex-1 rounded-xl text-sm font-semibold transition ${
              visibility === value
                ? "bg-[var(--ink)] text-white"
                : "bg-white/50 text-[var(--ink-muted)] ring-1 ring-[var(--line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--ink)]">카테고리</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 rounded-xl bg-[var(--surface-strong)] px-4 text-[15px] text-[var(--ink)] outline-none ring-1 ring-[var(--line)] focus:ring-2 focus:ring-[var(--accent)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="날짜"
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="mt-3">
        <TextField
          label="금액"
          name="amount"
          inputMode="numeric"
          placeholder="예: 12000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="mt-3">
        <TextField
          label="메모"
          name="memo"
          placeholder="선택 사항"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <Button type="submit" className="mt-4 w-full">
        저장하기
      </Button>
    </form>
  );
}
