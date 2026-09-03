import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { requireDb } from "@/lib/auth";
import { makeInviteCode } from "@/lib/session";
import type { Household } from "@/types/models";

function mapHousehold(id: string, data: Record<string, unknown>): Household {
  return {
    id,
    name: String(data.name ?? ""),
    inviteCode: String(data.inviteCode ?? ""),
    memberIds: Array.isArray(data.memberIds)
      ? data.memberIds.map(String)
      : [],
    createdAt: String(data.createdAt ?? ""),
  };
}

function nextInviteCode() {
  return makeInviteCode();
}

export async function createHousehold(input: {
  uid: string;
  name: string;
}): Promise<Household> {
  const db = requireDb();
  const inviteCode = nextInviteCode();
  const ref = doc(collection(db, "households"));
  const createdAt = new Date().toISOString();
  const payload = {
    name: input.name.trim(),
    inviteCode,
    memberIds: [input.uid],
    createdBy: input.uid,
    createdAt,
  };
  await setDoc(ref, payload);
  await setDoc(doc(db, "inviteCodes", inviteCode), {
    householdId: ref.id,
    createdAt,
  });
  await updateDoc(doc(db, "users", input.uid), {
    householdId: ref.id,
  });
  return mapHousehold(ref.id, payload);
}

export async function joinHouseholdByCode(input: {
  uid: string;
  code: string;
}): Promise<Household> {
  const db = requireDb();
  const code = input.code.trim().toUpperCase();
  const inviteSnap = await getDoc(doc(db, "inviteCodes", code));
  if (!inviteSnap.exists()) {
    throw new Error("유효하지 않은 초대 코드입니다.");
  }
  const householdId = String(inviteSnap.data().householdId);
  const householdRef = doc(db, "households", householdId);
  const householdSnap = await getDoc(householdRef);
  if (!householdSnap.exists()) {
    throw new Error("가정을 찾을 수 없습니다.");
  }
  const data = householdSnap.data();
  const memberIds = Array.isArray(data.memberIds) ? data.memberIds.map(String) : [];
  if (!memberIds.includes(input.uid)) {
    if (memberIds.length >= 6) {
      throw new Error("이 가정은 멤버가 가득 찼습니다.");
    }
    await updateDoc(householdRef, {
      memberIds: arrayUnion(input.uid),
    });
  }
  await updateDoc(doc(db, "users", input.uid), {
    householdId,
  });
  const refreshed = await getDoc(householdRef);
  return mapHousehold(householdId, refreshed.data() as Record<string, unknown>);
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "households", householdId));
  if (!snap.exists()) return null;
  return mapHousehold(snap.id, snap.data() as Record<string, unknown>);
}

export async function findHouseholdIdForUser(uid: string): Promise<string | null> {
  const db = requireDb();
  const userSnap = await getDoc(doc(db, "users", uid));
  if (userSnap.exists()) {
    const hid = userSnap.data().householdId;
    if (typeof hid === "string" && hid) return hid;
  }
  // 예전 데이터 호환: memberIds로 검색
  const q = query(
    collection(db, "households"),
    where("memberIds", "array-contains", uid),
    limit(1),
  );
  const result = await getDocs(q);
  if (result.empty) return null;
  return result.docs[0]!.id;
}
