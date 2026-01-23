import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-apple focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm hover:shadow-md",
        secondary:
          "border-border/40 bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-sm",
        outline: "text-foreground border-border/50 bg-background/60 backdrop-blur-sm hover:bg-muted/60",
        success:
          "border-transparent bg-gradient-to-r from-success to-success/90 text-success-foreground shadow-sm",
        warning:
          "border-transparent bg-gradient-to-r from-warning to-warning/90 text-warning-foreground shadow-sm",
        accent:
          "border-transparent bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
