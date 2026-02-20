import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx for conditional class names with tailwind-merge
 * to properly merge Tailwind CSS classes without conflicts.
 * 
 * Usage:
 * cn('text-red-500', 'bg-blue-500') // 'text-red-500 bg-blue-500'
 * cn('px-4', { 'py-2': true }) // 'px-4 py-2'
 * cn('text-sm', 'text-lg') // 'text-lg' (conflict resolved)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
