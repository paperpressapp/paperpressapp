"use client";

/**
 * PasswordInput Component
 * 
 * Password input field with show/hide toggle.
 */

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  /** Input ID */
  id?: string;
  /** Input name */
  name?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Additional class names */
  className?: string;
}

export function PasswordInput({
  id = "password",
  name = "password",
  placeholder = "Enter password",
  value,
  onChange,
  error,
  required = false,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 h-12",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
