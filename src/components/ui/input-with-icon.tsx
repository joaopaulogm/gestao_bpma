import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface InputWithIconProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, type, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-4 w-4 text-muted-foreground/60" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 sm:h-11 w-full rounded-lg border border-input bg-background/80",
            "shadow-sm shadow-black/5",
            "text-sm text-foreground",
            "transition-all duration-200",
            "placeholder:text-muted-foreground/70",
            "focus-visible:border-ring focus-visible:outline-none",
            "focus-visible:ring-[3px] focus-visible:ring-ring/20",
            "hover:border-primary/25 hover:bg-background/90",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && iconPosition === "left" ? "pl-10 pr-4" : "",
            Icon && iconPosition === "right" ? "pl-4 pr-10" : "",
            !Icon ? "px-4" : "",
            "py-2",
            type === "search" &&
              "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
            type === "file" &&
              "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <Icon className="h-4 w-4 text-muted-foreground/60" />
          </div>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
