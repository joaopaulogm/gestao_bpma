import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export interface TableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClick?: () => void
}

const TableCard = React.forwardRef<HTMLDivElement, TableCardProps>(
  ({ className, children, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card/90 backdrop-blur-sm rounded-2xl",
        "border border-border/40",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        "transition-all duration-300 ease-apple",
        "p-3 sm:p-4",
        onClick && "cursor-pointer hover:border-primary/30 hover:translate-y-[-1px]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
)
TableCard.displayName = "TableCard"

export interface TableCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TableCardHeader = React.forwardRef<HTMLDivElement, TableCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 mb-3", className)}
      {...props}
    >
      {children}
    </div>
  )
)
TableCardHeader.displayName = "TableCardHeader"

export interface TableCardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  subtitle?: string
}

const TableCardTitle = React.forwardRef<HTMLDivElement, TableCardTitleProps>(
  ({ className, children, subtitle, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 min-w-0", className)} {...props}>
      <div className="font-semibold text-sm sm:text-base text-foreground mb-1">
        {children}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {subtitle}
        </div>
      )}
    </div>
  )
)
TableCardTitle.displayName = "TableCardTitle"

export interface TableCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TableCardContent = React.forwardRef<HTMLDivElement, TableCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-3", className)}
      {...props}
    >
      {children}
    </div>
  )
)
TableCardContent.displayName = "TableCardContent"

export interface TableCardFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  className?: string
}

const TableCardField = React.forwardRef<HTMLDivElement, TableCardFieldProps>(
  ({ label, value, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3", className)}
      {...props}
    >
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="text-sm text-foreground font-medium">
        {value}
      </div>
    </div>
  )
)
TableCardField.displayName = "TableCardField"

export interface TableCardProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: number
  max: number
  unit?: string
  showValue?: boolean
  segments?: Array<{ value: number; color: string; label?: string }>
}

const TableCardProgress = React.forwardRef<HTMLDivElement, TableCardProgressProps>(
  ({ label, value, max, unit = "", showValue = true, segments, className, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)
    
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {showValue && (
            <span className="text-xs font-semibold text-foreground">
              {value.toLocaleString('pt-BR')} {unit} de {max.toLocaleString('pt-BR')} {unit}
            </span>
          )}
        </div>
        <Progress value={percentage} className="h-2" />
        {segments && segments.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {segment.label || `${segment.value}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
TableCardProgress.displayName = "TableCardProgress"

export interface TableCardBadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  className?: string
}

const TableCardBadge = ({ children, variant = "default", className }: TableCardBadgeProps) => {
  return (
    <Badge
      variant={variant === "success" ? "success" : variant === "warning" ? "warning" : variant}
      className={cn(
        "rounded-lg px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {children}
    </Badge>
  )
}

export interface TableCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TableCardActions = React.forwardRef<HTMLDivElement, TableCardActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-2 pt-2 border-t border-border/50", className)}
      {...props}
    >
      {children}
    </div>
  )
)
TableCardActions.displayName = "TableCardActions"

export {
  TableCard,
  TableCardHeader,
  TableCardTitle,
  TableCardContent,
  TableCardField,
  TableCardProgress,
  TableCardBadge,
  TableCardActions,
}
