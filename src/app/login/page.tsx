"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { getUserHouseholdId, mapAuthError, signInWithEmail } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getDemoHousehold, setDemoUser } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const demoMode = !isFirebaseConfigured();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim() || password.length < 6) {
        setError("이메일과 비밀번호(6자 이상)를 입력해 주세요.");
        return;
      }

      if (demoMode) {
        setDemoUser({
          uid: `demo-${email.trim().toLowerCase()}`,
          email: email.trim(),
          displayName: email.split("@")[0] || "사용자",
        });
        const household = getDemoHousehold();
        router.push(household ? "/home" : "/onboarding");
        return;
      }

      const profile = await signInWithEmail({ email, password });
      const householdId = await getUserHouseholdId(profile.uid);
      router.push(householdId ? "/home" : "/onboarding");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="다시 왔어요"
      subtitle="계정으로 로그인하고 가정 가계부를 이어서 보세요."
      footer={
        <>
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="font-semibold text-[var(--accent)]">
            가입하기
          </Link>
          {demoMode ? (
            <p className="mt-3 text-xs leading-relaxed text-[var(--ink-faint)]">
              데모 모드: Firebase 키가 없어 로컬에서만 동작합니다.
            </p>
          ) : null}
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <TextField
          label="이메일"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="비밀번호"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "확인 중…" : "로그인"}
        </Button>
      </form>
    </AuthShell>
  );
}
