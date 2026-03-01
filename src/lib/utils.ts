import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import removeMd from "remove-markdown"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function markdownToPlainText(markdown: string, maxLength?: number): string {
  let plainText = removeMd(markdown, {
    stripListLeaders: true,
    gfm: true,
    useImgAltText: true,
  })
  
  plainText = plainText.replace(/\s+/g, " ").trim()
  
  if (maxLength && plainText.length > maxLength) {
    plainText = plainText.slice(0, maxLength) + "..."
  }
  
  return plainText
}
