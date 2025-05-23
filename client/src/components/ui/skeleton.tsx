import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to use the enhanced skeleton animation with gradient
   */
  enhanced?: boolean;
}

function Skeleton({
  className,
  enhanced = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        enhanced 
          ? "skeleton rounded-md" 
          : "animate-pulse-subtle rounded-md bg-muted", 
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
