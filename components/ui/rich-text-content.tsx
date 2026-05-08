"use client";

import { cn } from "@/lib/utils";

interface RichTextContentProps {
  html?: string | null;
  className?: string;
}

export function RichTextContent({ html, className }: RichTextContentProps) {
  if (!html) return null;

  return (
    <div
      className={cn("quill-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
