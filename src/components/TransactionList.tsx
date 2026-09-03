"use client";

import { formatKRW } from "@/lib/format";
import type { Transaction } from "@/types/models";

type Props = {
  items: Transaction[];
  currentUid: string;
  onDelete: (id: string) => void;
};

export function TransactionList({ items, currentUid, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--ink-muted)]">
        조건에 맞는 거래가 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--line)]">
      {items.map((tx) => {
        const isMine = tx.createdBy === currentUid;
        const sign = tx.type === "income" ? "+" : "-";
        return (
          <li key={tx.id} className="flex items-start justify-between gap-3 py-3.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--ink)]">{tx.category}</span>
                <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
                  {tx.visibility === "shared" ? "공용" : "개인"}
                </span>
                <span className="text-[11px] text-[var(--ink-faint)]">{tx.date}</span>
              </div>
              <p className="mt-1 truncate text-sm text-[var(--ink-muted)]">
                {tx.memo || (isMine ? "메모 없음" : `${tx.createdByName} 작성`)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`font-semibold tabular-nums ${
                  tx.type === "income" ? "text-[var(--accent)]" : "text-[var(--ink)]"
                }`}
              >
                {sign}
                {formatKRW(tx.amount)}
              </p>
              {isMine ? (
                <button
                  type="button"
                  onClick={() => onDelete(tx.id)}
                  className="mt-1 text-xs text-[var(--ink-faint)] hover:text-red-700"
                >
                  삭제
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
