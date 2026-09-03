import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_10px_24px_rgba(45,106,79,0.22)] hover:brightness-105 active:translate-y-px",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-[var(--surface-strong)]",
  ghost: "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `inline-flex h-12 items-center justify-center rounded-xl px-5 text-[15px] font-semibold tracking-tight transition duration-200 ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = props as ButtonAsButton;
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
