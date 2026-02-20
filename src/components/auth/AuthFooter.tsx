"use client";

/**
 * AuthFooter Component
 * 
 * Footer with sign in/up link for auth pages.
 */

import { useRouter } from "next/navigation";

interface AuthFooterProps {
  /** Current mode */
  mode: "signin" | "signup";
}

export function AuthFooter({ mode }: AuthFooterProps) {
  const router = useRouter();

  if (mode === "signin") {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-[#1E88E5] font-medium hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/auth/signin")}
          className="text-[#1E88E5] font-medium hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
