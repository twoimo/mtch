import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTooltip?: boolean;
    formatTooltip?: (value: number) => string;
  }
>(({ className, showTooltip = false, formatTooltip, ...props }, ref) => {
  const [value, setValue] = React.useState(props.defaultValue || [0]);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);

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
        className
      )}
      onValueChange={handleValueChange}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary transition-all" />
      </SliderPrimitive.Track>
      
      {value.map((val, i) => (
        <SliderPrimitive.Thumb 
          key={i}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:bg-primary/10"
        >
          {showTooltip && tooltipVisible && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground opacity-0 transition-opacity animate-fade-in">
              {showTooltipValue(val)}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
