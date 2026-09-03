import { formatKRW } from "@/lib/format";

type Props = {
  income: number;
  expense: number;
  byCategory: { category: string; amount: number }[];
  periodLabel: string;
};

export function LedgerSummary({ income, expense, byCategory, periodLabel }: Props) {
  const balance = income - expense;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-medium text-[var(--ink-muted)]">{periodLabel}</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[var(--ink-faint)]">수입</p>
            <p className="mt-1 text-sm font-semibold text-[var(--accent)] sm:text-base">
              {formatKRW(income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-faint)]">지출</p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink)] sm:text-base">
              {formatKRW(expense)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-faint)]">잔액</p>
            <p
              className={`mt-1 text-sm font-semibold sm:text-base ${
                balance >= 0 ? "text-[var(--ink)]" : "text-red-700"
              }`}
            >
              {formatKRW(balance)}
            </p>
          </div>
        </div>
      </div>

      {byCategory.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-[var(--ink-muted)]">카테고리별 지출</p>
          <ul className="mt-2 space-y-2">
            {byCategory.map((row) => {
              const ratio = expense > 0 ? Math.round((row.amount / expense) * 100) : 0;
              return (
                <li key={row.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ink)]">{row.category}</span>
                    <span className="tabular-nums text-[var(--ink-muted)]">
                      {formatKRW(row.amount)} · {ratio}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
