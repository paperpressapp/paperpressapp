"use client";

/**
 * AuthDivider Component
 * 
 * Horizontal divider with "or continue with" text.
 */

interface AuthDividerProps {
  /** Custom text (defaults to "or continue with") */
  text?: string;
}

export function AuthDivider({ text = "or continue with" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-4 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
