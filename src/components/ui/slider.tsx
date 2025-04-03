import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTooltip?: boolean;
    formatTooltip?: (value: number) => string;
  }
>(({ className, showTooltip = false, formatTooltip, ...props }, ref) => {
  const [value, setValue] = React.useState(props.defaultValue || [0]);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue);
    if (props.onValueChange) {
      props.onValueChange(newValue);
    }
    
    // Show tooltip briefly when value changes, especially useful for mobile
    if (isMobile) {
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 1500);
    }
  };

  const showTooltipValue = (val: number) => {
    if (formatTooltip) {
      return formatTooltip(val);
    }
    return val.toString();
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        isMobile ? "py-4" : "", // Extra padding for touch devices
        className
      )}
      onValueChange={handleValueChange}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => isMobile ? null : setTooltipVisible(false)}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => isMobile ? null : setTooltipVisible(false)}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
        isMobile && "h-3" // Thicker track for mobile
      )}>
        <SliderPrimitive.Range className="absolute h-full bg-primary transition-all" />
      </SliderPrimitive.Track>
      
      {value.map((val, i) => (
        <SliderPrimitive.Thumb 
          key={i}
          className={cn(
            "block border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:bg-primary/10",
            isMobile ? "h-7 w-7 rounded-full" : "h-5 w-5 rounded-full", // Larger thumb for mobile
          )}
        >
          {showTooltip && tooltipVisible && (
            <div className={cn(
              "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded",
              "animate-in fade-in duration-100"
            )}>
              {showTooltipValue(val)}
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
