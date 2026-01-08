import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background/80",
          "shadow-sm shadow-black/5",
          "px-4 py-3 text-sm text-foreground",
          "transition-all duration-200",
          "placeholder:text-muted-foreground/70",
          "focus-visible:border-ring focus-visible:outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/20",
          "hover:border-primary/25 hover:bg-background/90",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
