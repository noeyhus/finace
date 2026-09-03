import { Button } from "@/components/ui/Button";
import { FlowBackdrop } from "@/components/FlowBackdrop";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <FlowBackdrop />
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <div className="max-w-xl motion-safe:animate-[rise_0.7s_ease-out]">
          <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--ink)] sm:text-7xl">
            사이
          </p>
          <h1 className="mt-6 max-w-md text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
            둘 사이, 한 달의 돈을 함께 적어요
          </h1>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[var(--ink-muted)]">
            공용과 개인을 나눠 입력하고, 같이 보거나 따로 볼 수 있는 월별 가계부입니다.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup" className="sm:min-w-[160px]">
              시작하기
            </Button>
            <Button href="/login" variant="secondary" className="sm:min-w-[140px]">
              로그인
            </Button>
          </div>
        </div>

        <div className="mt-16 grid max-w-2xl gap-6 border-t border-[var(--line)] pt-8 text-sm text-[var(--ink-muted)] motion-safe:animate-[soft-in_1s_ease-out] sm:grid-cols-3">
          <div>
            <p className="font-semibold text-[var(--ink)]">공용 / 개인</p>
            <p className="mt-1 leading-relaxed">입력할 때 한 번만 고르면 됩니다.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)]">가정 초대</p>
            <p className="mt-1 leading-relaxed">코드로 배우자를 초대하고, 다른 부부는 각자 가정을 만듭니다.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)]">월별 보기</p>
            <p className="mt-1 leading-relaxed">필터로 전체·공용·나만 전환합니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
