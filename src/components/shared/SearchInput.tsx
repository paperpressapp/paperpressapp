"use client";

/**
 * SearchInput Component
 * 
 * Search input with icon and clear button.
 */

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Search value change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Clear button click handler */
  onClear?: () => void;
  /** Optional additional class names */
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Search Icon */}
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

      {/* Input */}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 w-full"
      />

      {/* Clear Button */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-8 w-8"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
