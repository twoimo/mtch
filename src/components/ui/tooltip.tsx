import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"
import { useIsMobile, useIsTouchDevice } from "@/hooks/use-mobile"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  
  // Conditionally adjust tooltip behavior for touch devices
  const mobileProps = isTouchDevice ? {
    side: "bottom" as const,
    align: "center" as const,
    sideOffset: 8,
    avoidCollisions: true
  } : {};
  
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90",
        "transition-all duration-200 ease-out",
        isMobile && "py-2", // More vertical padding on mobile
        className
      )} 
      {...(isMobile ? mobileProps : {})}
      {...props}
    />
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
