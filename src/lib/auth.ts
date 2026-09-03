import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile } from "@/types/models";

export function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 설정되지 않았습니다. .env를 확인하세요.");
  return auth;
}

export function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore가 설정되지 않았습니다. .env를 확인하세요.");
  return db;
}

export function toUserProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName || user.email?.split("@")[0] || "사용자",
  };
}

export function mapAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: string }).code)
      : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다.";
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    case "auth/configuration-not-found":
      return "Firebase Authentication이 아직 설정되지 않았습니다. 콘솔에서 Authentication을 시작하고 이메일/비밀번호를 켜 주세요.";
    case "auth/operation-not-allowed":
      return "이메일/비밀번호 로그인이 비활성화되어 있습니다. Firebase 콘솔 > Authentication > Sign-in method에서 켜 주세요.";
    case "auth/unauthorized-domain":
      return "이 도메인이 Firebase에 허용되지 않았습니다. Authentication > Settings > Authorized domains에 localhost를 추가해 주세요.";
    case "unavailable":
    case "failed-precondition":
      return messageIncludesOffline(error)
        ? "Firestore에 연결하지 못했습니다. Firebase 콘솔에서 Firestore Database를 아직 만들지 않았다면 생성해 주세요. (보통 몇 초면 됩니다)"
        : "서버에 일시적으로 연결할 수 없습니다. 네트워크를 확인해 주세요.";
    default:
      if (messageIncludesOffline(error)) {
        return "Firestore에 연결하지 못했습니다. 콘솔에서 Firestore Database 생성을 완료했는지 확인해 주세요.";
      }
      if (error instanceof Error && error.message) return error.message;
      return "요청을 처리하지 못했습니다. 다시 시도해 주세요.";
  }
}

function messageIncludesOffline(error: unknown) {
  const msg =
    typeof error === "object" && error && "message" in error
      ? String((error as { message: string }).message)
      : error instanceof Error
        ? error.message
        : String(error ?? "");
  return /offline/i.test(msg);
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<UserProfile> {
  const auth = requireAuth();
  const db = requireDb();
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );
  await updateProfile(cred.user, { displayName: input.displayName.trim() });
  await setDoc(doc(db, "users", cred.user.uid), {
    email: input.email.trim(),
    displayName: input.displayName.trim(),
    householdId: null,
    createdAt: new Date().toISOString(),
  });
  return toUserProfile(cred.user);
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const auth = requireAuth();
  const cred = await signInWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );
  return toUserProfile(cred.user);
}

export async function signOutUser() {
  if (!isFirebaseConfigured()) return;
  const auth = requireAuth();
  await firebaseSignOut(auth);
}

export async function getUserHouseholdId(uid: string): Promise<string | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { householdId?: string | null };
  return data.householdId ?? null;
}

export function watchAuth(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
