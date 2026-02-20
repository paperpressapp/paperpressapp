"use client";

/**
 * SettingsSection Component
 * 
 * Grouped settings section with header.
 */

interface SettingsSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="bg-card rounded-xl border overflow-hidden">
        {children}
      </div>
    </div>
  );
}
