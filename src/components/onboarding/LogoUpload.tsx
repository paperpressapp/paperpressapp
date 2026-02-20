"use client";

/**
 * LogoUpload Component
 * 
 * Custom logo upload for institute branding.
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  /** Current logo URL or null */
  value: string | null;
  /** Change handler */
  onChange: (url: string | null) => void;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Additional class names */
  className?: string;
}

export function LogoUpload({
  value,
  onChange,
  maxSizeMB = 2,
  className = "",
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG or PNG)");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <motion.div
          className="relative w-full aspect-video max-w-[200px] mx-auto rounded-xl overflow-hidden border bg-muted"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img
            src={value}
            alt="Institute Logo"
            className="w-full h-full object-contain p-4"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          onClick={handleClick}
          className={cn(
            "w-full max-w-[200px] mx-auto aspect-square rounded-xl border-2 border-dashed",
            "flex flex-col items-center justify-center gap-2",
            "text-muted-foreground hover:text-foreground",
            "hover:border-primary/50 hover:bg-primary/5",
            "transition-colors"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">Upload Logo</span>
          <span className="text-xs text-muted-foreground">
            Max {maxSizeMB}MB
          </span>
        </motion.button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
