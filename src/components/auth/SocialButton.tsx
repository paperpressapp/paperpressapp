"use client";

/**
 * SocialButton Component
 * 
 * Social login button (Google, Apple, etc.).
 */

import { Chrome, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared";
import { cn } from "@/lib/utils";

interface SocialButtonProps {
  /** Social provider */
  provider: "google" | "apple";
  /** Click handler */
  onClick: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const providerConfig = {
  google: {
    icon: Chrome,
    label: "Continue with Google",
  },
  apple: {
    icon: Apple,
    label: "Continue with Apple",
  },
};

export function SocialButton({
  provider,
  onClick,
  isLoading = false,
  className = "",
}: SocialButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full h-[52px] text-base font-medium border-2 hover:bg-gray-50 relative",
        className
      )}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          <Icon className="w-5 h-5 mr-3" />
          {config.label}
        </>
      )}
    </Button>
  );
}
