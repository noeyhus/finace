import type { Household, UserProfile } from "@/types/models";

const USER_KEY = "sai_demo_user";
const HOUSEHOLD_KEY = "sai_demo_household";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getDemoUser(): UserProfile | null {
  if (!canUseStorage()) return null;
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export function setDemoUser(user: UserProfile | null) {
  if (!canUseStorage()) return;
  if (!user) {
    sessionStorage.removeItem(USER_KEY);
    return;
  }
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getDemoHousehold(): Household | null {
  if (!canUseStorage()) return null;
  const raw = sessionStorage.getItem(HOUSEHOLD_KEY);
  return raw ? (JSON.parse(raw) as Household) : null;
}

export function setDemoHousehold(household: Household | null) {
  if (!canUseStorage()) return;
  if (!household) {
    sessionStorage.removeItem(HOUSEHOLD_KEY);
    return;
  }
  sessionStorage.setItem(HOUSEHOLD_KEY, JSON.stringify(household));
}

export function makeInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
