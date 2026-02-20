"use client";

/**
 * McqOptions Component
 * 
 * Renders MCQ options in compact format.
 */

interface McqOptionsProps {
  /** Array of 4 options */
  options: string[];
}

export function McqOptions({ options }: McqOptionsProps) {
  const labels = ["a", "b", "c", "d"];

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
      {options.slice(0, 4).map((option, index) => (
        <span key={index} className="truncate max-w-[120px]">
          ({labels[index]}) {option}
        </span>
      ))}
    </div>
  );
}
