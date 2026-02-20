"use client";

/**
 * PhoneInput Component
 * 
 * Phone input with +92 prefix for Pakistani numbers.
 */

import { useState } from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message */
  error?: string;
  /** Whether required */
  required?: boolean;
  /** Label text */
  label?: string;
}

export function PhoneInput({
  value,
  onChange,
  error,
  required = false,
  label = "Phone Number",
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const rawValue = e.target.value.replace(/\D/g, "");
    
    // Limit to 10 digits (without the +92)
    const limitedValue = rawValue.slice(0, 10);
    
    onChange(limitedValue);
  };

  // Format for display: 3XX-XXXXXXX
  const formatDisplay = (val: string) => {
    if (val.length <= 3) return val;
    return `${val.slice(0, 3)}-${val.slice(3)}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">
        {label}
        {!required && (
          <span className="text-muted-foreground ml-1">(Optional)</span>
        )}
      </Label>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
          <Phone className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="absolute left-10 top-0 bottom-0 flex items-center pointer-events-none">
          <span className="text-foreground font-medium">+92</span>
        </div>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="3XX-XXXXXXX"
          className={cn(
            "pl-[5.5rem] h-12",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          value={formatDisplay(value)}
          onChange={handleChange}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
