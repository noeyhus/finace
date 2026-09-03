export type Visibility = "shared" | "private";

export type TransactionType = "expense" | "income";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
};

export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: string;
};

export type Membership = {
  householdId: string;
  role: "owner" | "member";
};

export type Transaction = {
  id: string;
  householdId: string;
  createdBy: string;
  createdByName: string;
  type: TransactionType;
  visibility: Visibility;
  category: string;
  amount: number;
  memo: string;
  /** YYYY-MM-DD */
  date: string;
  createdAt: string;
};
