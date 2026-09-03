"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { mapAuthError, toUserProfile, watchAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createHousehold, joinHouseholdByCode } from "@/lib/households";
import {
  getDemoUser,
  makeInviteCode,
  setDemoHousehold,
} from "@/lib/session";
import type { UserProfile } from "@/types/models";

type Mode = "choose" | "create" | "join";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [householdName, setHouseholdName] = useState("우리 집");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const demoMode = !isFirebaseConfigured();

  useEffect(() => {
    if (demoMode) {
      const demo = getDemoUser();
      if (!demo) {
        router.replace("/signup");
        return;
      }
      setUser(demo);
      setReady(true);
      return;
    }

    const unsub = watchAuth((firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      setUser(toUserProfile(firebaseUser));
      setReady(true);
    });
    return unsub;
  }, [demoMode, router]);

  async function createHouseholdSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!user) {
        router.replace("/signup");
        return;
      }
      if (!householdName.trim()) {
        setError("가정 이름을 입력해 주세요.");
        return;
      }

      if (demoMode) {
        const code = makeInviteCode();
        setDemoHousehold({
          id: `hh-${Date.now()}`,
          name: householdName.trim(),
          inviteCode: code,
          memberIds: [user.uid],
          createdAt: new Date().toISOString(),
        });
        router.push("/home");
        return;
      }

      await createHousehold({ uid: user.uid, name: householdName });
      router.push("/home");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function joinHouseholdSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!user) {
        router.replace("/signup");
        return;
      }
      const code = inviteCode.trim().toUpperCase();
      if (code.length < 4) {
        setError("초대 코드를 입력해 주세요.");
        return;
      }

      if (demoMode) {
        setDemoHousehold({
          id: `hh-join-${code}`,
          name: "초대받은 가정",
          inviteCode: code,
          memberIds: [user.uid],
          createdAt: new Date().toISOString(),
        });
        router.push("/home");
        return;
      }

      await joinHouseholdByCode({ uid: user.uid, code });
      router.push("/home");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return (
      <AuthShell title="불러오는 중…" subtitle="계정 정보를 확인하고 있어요.">
        <p className="text-sm text-[var(--ink-muted)]">잠시만 기다려 주세요.</p>
      </AuthShell>
    );
  }

  if (mode === "create") {
    return (
      <AuthShell
        title="새 가정 만들기"
        subtitle="가정은 가계부의 공간입니다. 만든 뒤 초대 코드로 배우자를 부르면 됩니다."
        footer={
          <button
            type="button"
            className="font-semibold text-[var(--accent)]"
            onClick={() => setMode("choose")}
          >
            ← 뒤로
          </button>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={createHouseholdSubmit}>
          <TextField
            label="가정 이름"
            name="householdName"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            hint="예: 민지·준호 집"
            required
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "만드는 중…" : "가정 만들고 시작"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (mode === "join") {
    return (
      <AuthShell
        title="초대 코드로 합류"
        subtitle="배우자가 만든 6자리 코드를 입력하면 같은 가정 가계부를 씁니다."
        footer={
          <button
            type="button"
            className="font-semibold text-[var(--accent)]"
            onClick={() => setMode("choose")}
          >
            ← 뒤로
          </button>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={joinHouseholdSubmit}>
          <TextField
            label="초대 코드"
            name="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="예: A3K9MP"
            className="tracking-[0.2em]"
            required
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "확인 중…" : "합류하기"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="가정을 연결해요"
      subtitle="가계부는 가정 단위로 열립니다. 새로 만들거나, 초대 코드로 들어갈 수 있어요."
    >
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setMode("create")}
          className="rounded-2xl bg-[var(--surface)] p-5 text-left ring-1 ring-[var(--line)] transition hover:bg-[var(--surface-strong)] hover:ring-[var(--accent)]"
        >
          <p className="font-semibold text-[var(--ink)]">새 가정 만들기</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
            처음이라면 이쪽. 나중에 초대 코드를 공유하세요.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className="rounded-2xl bg-[var(--surface)] p-5 text-left ring-1 ring-[var(--line)] transition hover:bg-[var(--surface-strong)] hover:ring-[var(--accent)]"
        >
          <p className="font-semibold text-[var(--ink)]">초대 코드로 합류</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
            배우자가 이미 가정을 만들었다면 코드를 입력하세요.
          </p>
        </button>
      </div>
    </AuthShell>
  );
}
