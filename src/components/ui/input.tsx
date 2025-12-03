import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-primary/15 bg-background/80 backdrop-blur-sm px-4 py-2 text-base ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/70",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:bg-background/95 focus-visible:border-primary/40",
          "focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:ring-offset-0",
          "hover:border-primary/25 hover:bg-background/90",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
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
