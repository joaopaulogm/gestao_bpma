import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border/40 bg-background/60 backdrop-blur-md px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-apple",
          "focus-visible:outline-none focus-visible:bg-background/90 focus-visible:border-primary/50",
          "focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0",
          "hover:border-border/60 hover:bg-background/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
