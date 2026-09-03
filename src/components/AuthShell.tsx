import Link from "next/link";
import type { ReactNode } from "react";
import { FlowBackdrop } from "@/components/FlowBackdrop";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <FlowBackdrop />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 sm:py-12">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] transition hover:text-[var(--accent)]"
        >
          사이
        </Link>
        <div className="mt-10 motion-safe:animate-[rise_0.55s_ease-out]">
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight text-[var(--ink)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-muted)]">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-[var(--ink-muted)]">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
