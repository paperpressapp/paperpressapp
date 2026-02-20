"use client";

/**
 * Admin Group Layout - Protected Admin Routes
 * 
 * Only accessible to users with admin role.
 * Redirects non-admin users to home page.
 */

import { AuthGuard } from "@/components/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth requireAdmin>
      {children}
    </AuthGuard>
  );
}
