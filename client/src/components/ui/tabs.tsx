import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & { withSlider?: boolean }
>(({ className, withSlider = false, ...props }, ref) => {
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [activeTabElement, setActiveTabElement] = React.useState<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({});

  React.useEffect(() => {
    if (withSlider && activeTabElement) {
      const updateIndicator = () => {
        setIndicatorStyle({
          width: `${activeTabElement.offsetWidth}px`,
          transform: `translateX(${activeTabElement.offsetLeft}px)`,
          height: '2px',
          backgroundColor: 'var(--primary)',
          position: 'absolute',
          bottom: '0',
          transition: 'transform 250ms ease, width 250ms ease',
        });
      };

      updateIndicator();
      window.addEventListener('resize', updateIndicator);
      return () => window.removeEventListener('resize', updateIndicator);
    }
  }, [withSlider, activeTabElement]);

  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn(withSlider && 'relative', className)}
      onValueChange={(value) => {
        if (withSlider && tabsRef.current) {
          const newActiveTab = tabsRef.current.querySelector(`[data-state="active"][data-value="${value}"]`) as HTMLButtonElement;
          setActiveTabElement(newActiveTab);
        }
        if (props.onValueChange) {
          props.onValueChange(value);
        }
      }}
      {...props}
    />
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { withSlider?: boolean }
>(({ className, withSlider = false, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (withSlider && listRef.current) {
      const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLButtonElement;
      if (activeTab && listRef.current.parentElement) {
        const indicator = document.createElement('div');
        indicator.className = 'tab-indicator';
        indicator.style.width = `${activeTab.offsetWidth}px`;
        indicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
        indicator.style.height = '2px';
        indicator.style.backgroundColor = 'var(--primary)';
        indicator.style.position = 'absolute';
        indicator.style.bottom = '0';
        indicator.style.transition = 'transform 250ms ease, width 250ms ease';
        listRef.current.parentElement.appendChild(indicator);
      }
    }
  }, [withSlider]);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        listRef.current = node;
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground relative",
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm z-10",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
