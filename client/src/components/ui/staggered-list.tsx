import * as React from "react";
import { cn } from "@/lib/utils";

interface StaggeredListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The delay between each child animation in milliseconds
   */
  staggerDelay?: number;
  /**
   * Whether to animate the children when they enter the viewport
   */
  animateOnScroll?: boolean;
  /**
   * The root margin for the intersection observer
   */
  rootMargin?: string;
  /**
   * The threshold for the intersection observer
   */
  threshold?: number;
}

/**
 * StaggeredList component that animates its children with a staggered delay
 */
const StaggeredList = React.forwardRef<HTMLDivElement, StaggeredListProps>(
  ({ 
    className, 
    children, 
    staggerDelay = 50, 
    animateOnScroll = true,
    rootMargin = "0px",
    threshold = 0.1,
    ...props 
  }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(!animateOnScroll);
    
    React.useEffect(() => {
      if (!animateOnScroll) {
        setIsVisible(true);
        return;
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin,
          threshold,
        }
      );
      
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      
      return () => {
        observer.disconnect();
      };
    }, [animateOnScroll, rootMargin, threshold]);
    
    // Apply staggered animation to children
    const childrenWithStagger = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return React.cloneElement(child, {
        className: cn(
          "stagger-item",
          isVisible && "stagger-item-visible",
          child.props.className
        ),
        style: {
          ...child.props.style,
          transitionDelay: isVisible ? `${index * staggerDelay}ms` : undefined,
        },
      });
    });
    
    return (
      <div
        ref={(node) => {
          // Merge refs
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          containerRef.current = node;
        }}
        className={cn("staggered-list", className)}
        {...props}
      >
        {childrenWithStagger}
      </div>
    );
  }
);

StaggeredList.displayName = "StaggeredList";

export { StaggeredList };
