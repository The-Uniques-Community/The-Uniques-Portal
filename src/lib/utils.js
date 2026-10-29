/**
 * @file utils.js
 * @description Core styling helper utility combining clsx conditional class names with tailwind-merge for deduplication and conflict resolution.
 * @architecture Used universally across UI components, buttons, dialogs, and layout elements to construct responsive Tailwind classes.
 * @agent_note Essential for merging custom user-provided `className` props with default component styles without Tailwind specificity collisions.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * @desc Concatenates and resolves conflicting Tailwind CSS classes into a single string.
 * @param {...any} inputs - Class names, conditional boolean maps, or arrays.
 * @returns {string} Clean, resolved class name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
