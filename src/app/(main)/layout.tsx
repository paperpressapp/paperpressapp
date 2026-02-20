"use client";

// The (main) group layout — individual pages handle their own MainLayout
// because some pages (like create-paper) need dynamic showBottomNav prop.
export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
