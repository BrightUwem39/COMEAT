"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { authClient } from "@/lib/auth-client";
import { menuControlVariants } from "@/lib/animations";

export function ProfileActions() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const response = await authClient.signOut();
      if (response.error) {
        setError("We could not sign you out. Please try again.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("The connection was interrupted. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <motion.button
        className="min-h-12 rounded-xl border border-border px-5 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-wait disabled:text-muted"
        disabled={pending}
        onClick={handleSignOut}
        type="button"
        variants={reduceMotion ? undefined : menuControlVariants}
        whileHover={reduceMotion || pending ? undefined : "hover"}
        whileTap={reduceMotion || pending ? undefined : "tap"}
      >
        {pending ? "Signing out…" : "Sign out"}
      </motion.button>
      {error ? <p className="mt-3 text-xs leading-5 text-orange" role="alert">{error}</p> : null}
    </div>
  );
}
