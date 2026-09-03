import type { Transaction } from "@/types/models";

const KEY_PREFIX = "sai_demo_tx_";

function canUseStorage() {
  return typeof window !== "undefined";
}

function storageKey(householdId: string) {
  return `${KEY_PREFIX}${householdId}`;
}

export function listTransactions(householdId: string): Transaction[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(storageKey(householdId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions(householdId: string, items: Transaction[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(storageKey(householdId), JSON.stringify(items));
}

export function addTransaction(
  householdId: string,
  input: Omit<Transaction, "id" | "householdId" | "createdAt">,
): Transaction {
  const tx: Transaction = {
    ...input,
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    householdId,
    createdAt: new Date().toISOString(),
  };
  const next = [tx, ...listTransactions(householdId)];
  saveTransactions(householdId, next);
  return tx;
}

export function deleteTransaction(householdId: string, id: string) {
  const next = listTransactions(householdId).filter((t) => t.id !== id);
  saveTransactions(householdId, next);
}
