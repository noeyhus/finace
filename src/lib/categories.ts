import type { TransactionType } from "@/types/models";

export const EXPENSE_CATEGORIES = [
  "식비",
  "교통",
  "주거",
  "생활",
  "의료",
  "문화/여가",
  "쇼핑",
  "교육",
  "경조사",
  "기타",
] as const;

export const INCOME_CATEGORIES = ["급여", "용돈", "부수입", "기타수입"] as const;

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function allCategories(): string[] {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
}
