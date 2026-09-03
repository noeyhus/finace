"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowBackdrop } from "@/components/FlowBackdrop";
import { LedgerFilterBar, type LedgerFilters } from "@/components/LedgerFilterBar";
import { LedgerSummary } from "@/components/LedgerSummary";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { mapAuthError, signOutUser, toUserProfile, watchAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { findHouseholdIdForUser, getHousehold } from "@/lib/households";
import { parseYearMonth } from "@/lib/format";
import {
  getDemoHousehold,
  getDemoUser,
  setDemoHousehold,
  setDemoUser,
} from "@/lib/session";
import {
  addTransaction,
  deleteTransaction,
  listTransactions,
  watchTransactions,
} from "@/lib/transactions";
import type { Household, Transaction, UserProfile } from "@/types/models";

function buildPeriodLabel(filters: LedgerFilters) {
  if (filters.month === 0) return `${filters.year}년 전체`;
  return `${filters.year}년 ${filters.month}월`;
}

export default function HomePage() {
  const router = useRouter();
  const demoMode = !isFirebaseConfigured();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bootError, setBootError] = useState("");
  const [filters, setFilters] = useState<LedgerFilters>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      category: "전체",
      scope: "all",
    };
  });

  useEffect(() => {
    if (demoMode) {
      const u = getDemoUser();
      const h = getDemoHousehold();
      if (!u) {
        router.replace("/login");
        return;
      }
      if (!h) {
        router.replace("/onboarding");
        return;
      }
      setUser(u);
      setHousehold(h);
      setTransactions(listTransactions(h.id));
      return;
    }

    let unsubTx: (() => void) | undefined;
    const unsubAuth = watchAuth(async (firebaseUser) => {
      unsubTx?.();
      unsubTx = undefined;
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      const profile = toUserProfile(firebaseUser);
      setUser(profile);
      try {
        const householdId = await findHouseholdIdForUser(profile.uid);
        if (!householdId) {
          router.replace("/onboarding");
          return;
        }
        const hh = await getHousehold(householdId);
        if (!hh) {
          router.replace("/onboarding");
          return;
        }
        setHousehold(hh);
        unsubTx = watchTransactions(
          hh.id,
          (items) => setTransactions(items),
          (err) => setBootError(mapAuthError(err)),
        );
      } catch (err) {
        setBootError(mapAuthError(err));
      }
    });

    return () => {
      unsubAuth();
      unsubTx?.();
    };
  }, [demoMode, router]);

  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const tx of transactions) {
      set.add(parseYearMonth(tx.date).year);
    }
    return [...set].sort((a, b) => b - a);
  }, [transactions]);

  const filtered = useMemo(() => {
    if (!user) return [];
    return transactions.filter((tx) => {
      const { year, month } = parseYearMonth(tx.date);
      if (year !== filters.year) return false;
      if (filters.month !== 0 && month !== filters.month) return false;
      if (filters.category !== "전체" && tx.category !== filters.category) return false;
      if (filters.scope === "shared" && tx.visibility !== "shared") return false;
      if (filters.scope === "private") {
        if (tx.visibility !== "private" || tx.createdBy !== user.uid) return false;
      }
      if (filters.scope === "all") {
        if (tx.visibility === "private" && tx.createdBy !== user.uid) return false;
      }
      return true;
    });
  }, [transactions, filters, user]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap = new Map<string, number>();
    for (const tx of filtered) {
      if (tx.type === "income") income += tx.amount;
      else {
        expense += tx.amount;
        catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount);
      }
    }
    const byCategory = [...catMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { income, expense, byCategory };
  }, [filtered]);

  async function signOut() {
    if (demoMode) {
      setDemoUser(null);
      setDemoHousehold(null);
    } else {
      await signOutUser();
    }
    router.push("/");
  }

  if (!user || !household) {
    return (
      <div className="relative flex min-h-full flex-1 items-center justify-center text-[var(--ink-muted)]">
        <FlowBackdrop />
        <p className="relative z-10">
          {bootError || "불러오는 중…"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <FlowBackdrop />
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            사이
          </p>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{household.name}</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          로그아웃
        </button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 pb-20 motion-safe:animate-[rise_0.45s_ease-out]">
        {bootError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {bootError}
          </p>
        ) : null}

        {!demoMode ? (
          <p className="text-xs text-[var(--ink-faint)]">Firebase 동기화 연결됨 · 실시간 반영</p>
        ) : null}

        <TransactionForm
          user={user}
          onSubmit={(input) => {
            void (async () => {
              try {
                await addTransaction(
                  household.id,
                  {
                    ...input,
                    createdBy: user.uid,
                    createdByName: user.displayName,
                  },
                  { remote: !demoMode },
                );
                if (demoMode) {
                  setTransactions(listTransactions(household.id));
                }
              } catch (err) {
                setBootError(mapAuthError(err));
              }
            })();
          }}
        />

        <section className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--ink)]">내역 · 집계</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              연도·월·카테고리·공용/개인으로 나눠 볼 수 있어요.
            </p>
          </div>

          <LedgerFilterBar value={filters} years={years} onChange={setFilters} />

          <div className="rounded-2xl bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
            <LedgerSummary
              income={summary.income}
              expense={summary.expense}
              byCategory={summary.byCategory}
              periodLabel={buildPeriodLabel(filters)}
            />
          </div>

          <div className="rounded-2xl bg-[var(--surface)] px-5 ring-1 ring-[var(--line)]">
            <TransactionList
              items={filtered}
              currentUid={user.uid}
              onDelete={(id) => {
                void (async () => {
                  try {
                    await deleteTransaction(household.id, id, { remote: !demoMode });
                    if (demoMode) {
                      setTransactions(listTransactions(household.id));
                    }
                  } catch (err) {
                    setBootError(mapAuthError(err));
                  }
                })();
              }}
            />
          </div>

          <details className="text-sm text-[var(--ink-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--ink)]">
              배우자 초대 코드
            </summary>
            <p className="mt-2 font-mono text-xl tracking-[0.25em] text-[var(--accent)]">
              {household.inviteCode}
            </p>
          </details>
        </section>
      </main>
    </div>
  );
}
