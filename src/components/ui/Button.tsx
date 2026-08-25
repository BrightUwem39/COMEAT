import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedProps & {
  href: string;
};

const baseStyles =
  "inline-flex min-h-12 items-center justify-center border px-6 text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-200";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-gold bg-gold text-background hover:border-gold-light hover:bg-gold-light",
  secondary:
    "border-border bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const { children, className = "", variant = "primary" } = props;
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link className={styles} href={props.href}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonProps;

  return (
    <button className={styles} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
