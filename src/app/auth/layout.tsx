"use client";

/**
 * Auth Group Layout - Guest-Only Routes
 * 
 * Prevents authenticated users from accessing login/signup pages.
 * Redirects authenticated users to home or admin dashboard.
 */

import { GuestGuard } from "@/components/auth";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}
