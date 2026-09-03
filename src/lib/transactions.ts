import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { requireDb } from "@/lib/auth";
import type { Transaction, TransactionType, Visibility } from "@/types/models";
import {
  addTransaction as addLocalTransaction,
  deleteTransaction as deleteLocalTransaction,
  listTransactions as listLocalTransactions,
} from "@/lib/transactions-local";

export type NewTransactionInput = {
  createdBy: string;
  createdByName: string;
  type: TransactionType;
  visibility: Visibility;
  category: string;
  amount: number;
  memo: string;
  date: string;
};

function mapTx(id: string, householdId: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    householdId,
    createdBy: String(data.createdBy ?? ""),
    createdByName: String(data.createdByName ?? ""),
    type: (data.type as TransactionType) ?? "expense",
    visibility: (data.visibility as Visibility) ?? "shared",
    category: String(data.category ?? "기타"),
    amount: Number(data.amount ?? 0),
    memo: String(data.memo ?? ""),
    date: String(data.date ?? ""),
    createdAt: String(data.createdAt ?? data.date ?? ""),
  };
}

export async function addTransaction(
  householdId: string,
  input: NewTransactionInput,
  options?: { remote?: boolean },
): Promise<Transaction> {
  if (!options?.remote) {
    return addLocalTransaction(householdId, input);
  }
  const db = requireDb();
  const ref = await addDoc(collection(db, "households", householdId, "transactions"), {
    ...input,
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
  return {
    id: ref.id,
    householdId,
    ...input,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteTransaction(
  householdId: string,
  id: string,
  options?: { remote?: boolean },
) {
  if (!options?.remote) {
    deleteLocalTransaction(householdId, id);
    return;
  }
  const db = requireDb();
  await deleteDoc(doc(db, "households", householdId, "transactions", id));
}

export function listTransactions(householdId: string): Transaction[] {
  return listLocalTransactions(householdId);
}

export function watchTransactions(
  householdId: string,
  onChange: (items: Transaction[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const db = requireDb();
  const q = query(
    collection(db, "households", householdId, "transactions"),
    orderBy("date", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) =>
        mapTx(d.id, householdId, d.data() as Record<string, unknown>),
      );
      onChange(items);
    },
    (err) => onError?.(err),
  );
}
