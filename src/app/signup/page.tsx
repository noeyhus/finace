"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { mapAuthError, signUpWithEmail } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { setDemoUser } from "@/lib/session";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
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
      if (!displayName.trim() || !email.trim() || password.length < 6) {
        setError("이름, 이메일, 비밀번호(6자 이상)를 입력해 주세요.");
        return;
      }

      if (demoMode) {
        setDemoUser({
          uid: `demo-${email.trim().toLowerCase()}`,
          email: email.trim(),
          displayName: displayName.trim(),
        });
        router.push("/onboarding");
        return;
      }

      await signUpWithEmail({
        email,
        password,
        displayName,
      });
      router.push("/onboarding");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="사이 시작하기"
      subtitle="개인 계정을 만든 다음, 가정을 만들거나 초대 코드로 합류합니다."
      footer={
        <>
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)]">
            로그인
          </Link>
          {demoMode ? (
            <p className="mt-3 text-xs leading-relaxed text-[var(--ink-faint)]">
              데모 모드: Firebase 키가 없어 로컬에서만 동작합니다.
            </p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-[var(--ink-faint)]">
              Firebase에 계정이 저장되고, 가정에 합류하면 거래가 동기화됩니다.
            </p>
          )}
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <TextField
          label="이름"
          name="displayName"
          autoComplete="name"
          placeholder="예: 민지"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
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
          autoComplete="new-password"
          placeholder="6자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "만드는 중…" : "계정 만들기"}
        </Button>
      </form>
    </AuthShell>
  );
}
