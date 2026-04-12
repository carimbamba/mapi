import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS com tailwind-merge
 * @param  {...string} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
