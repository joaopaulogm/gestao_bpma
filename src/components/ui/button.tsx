import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96] active:brightness-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-[0_2px_8px_rgba(7,29,73,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_16px_rgba(7,29,73,0.35)] hover:from-primary/95 hover:to-primary/85",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/90 text-destructive-foreground shadow-[0_2px_8px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_16px_rgba(255,59,48,0.35)]",
        outline:
          "border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-muted/80 hover:border-border hover:text-foreground",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/90 text-secondary-foreground border border-border/50 hover:from-secondary/95 hover:to-secondary/85",
        ghost: "hover:bg-muted/60 hover:text-foreground hover:backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        accent: "bg-gradient-to-b from-accent to-accent/90 text-accent-foreground shadow-[0_2px_8px_rgba(255,204,0,0.25)] hover:shadow-[0_4px_16px_rgba(255,204,0,0.4)]",
        glass: "bg-background/60 backdrop-blur-xl border border-border/40 text-foreground hover:bg-background/80 hover:border-border/60",
      },
      size: {
        default: "h-10 min-h-[40px] px-5 py-2",
        sm: "h-8 min-h-[32px] rounded-xl px-3 text-xs",
        lg: "h-11 min-h-[44px] rounded-2xl px-7",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
