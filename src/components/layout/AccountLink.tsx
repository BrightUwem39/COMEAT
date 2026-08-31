"use client";

import Link from "next/link";

import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { useSession } from "@/lib/auth-client";

type AccountLinkProps = { mobile?: boolean };

export function AccountLink({ mobile = false }: AccountLinkProps) {
  const { data: session } = useSession();
  const isEligibleSession = Boolean(
    session?.user.active && session.user.emailVerified,
  );
  const href = isEligibleSession ? "/profile" : "/login?returnTo=%2Fprofile";
  const label = isEligibleSession
    ? `View ${session?.user.firstName}'s profile`
    : "Sign in to your profile";

  return (
    <Link
      aria-label={label}
      className="group/profile rounded-full p-2 text-foreground transition-[background-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-gold/10 hover:text-gold active:scale-90 motion-reduce:transform-none"
      href={href}
    >
      <ProfileIcon className={`${mobile ? "size-[22px]" : "size-[23px]"} transition-transform duration-200 ease-out group-hover/profile:scale-105 motion-reduce:transform-none`} />
    </Link>
  );
}
