"use client";

/**
 * Admin Group Layout
 * 
 * Admin login is handled in the page itself using simple token auth.
 * This layout just provides a clean wrapper.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
