import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

function useSlidingIndicator(listRef: React.RefObject<HTMLElement | null>) {
  const [style, setStyle] = React.useState({ left: 0, width: 0, opacity: 0 })

  const measure = React.useCallback(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
    if (!active) {
      setStyle((s) => ({ ...s, opacity: 0 }))
      return
    }
    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    setStyle({
      left: activeRect.left - listRect.left,
      width: activeRect.width,
      opacity: 1,
    })
  }, [listRef])

  React.useLayoutEffect(() => {
    measure()
    const list = listRef.current
    if (!list) return
    const mo = new MutationObserver(measure)
    mo.observe(list, { attributes: true, attributeFilter: ["data-state"], subtree: true })
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    window.addEventListener("resize", measure)
    return () => {
      mo.disconnect()
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, listRef])

  return style
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null)
  const style = useSlidingIndicator(listRef)

  return (
    <div className="relative inline-flex">
      <TabsPrimitive.List
        ref={(el) => {
          (listRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (typeof ref === "function") ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-xl",
          "bg-muted/60 backdrop-blur-sm p-1 text-muted-foreground",
          "border border-border/30",
          className
        )}
        {...props}
      />
      <span
        className="absolute bottom-0 h-0.5 rounded-full bg-primary transition-[left,width,opacity] duration-300 ease-out"
        style={{ left: style.left, width: style.width, opacity: style.opacity }}
        aria-hidden
      />
    </div>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5",
      "text-sm font-medium ring-offset-background transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50 hover:text-foreground/80",
      "data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 animate-fade-in",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
