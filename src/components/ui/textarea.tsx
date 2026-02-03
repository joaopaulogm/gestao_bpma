import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl",
          "border border-border/40 bg-background/60 backdrop-blur-md",
          "px-3 py-2.5 text-sm ring-offset-background",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-apple",
          "focus-visible:outline-none focus-visible:bg-background/90 focus-visible:border-primary/50",
          "focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0",
          "hover:border-border/60 hover:bg-background/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
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
