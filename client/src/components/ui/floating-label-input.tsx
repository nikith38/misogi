import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { useFormContext } from "react-hook-form";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * FloatingLabelInput component that combines Form components with floating label animation
 */
const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ name, label, description, className, containerClassName, ...props }, ref) => {
    const form = useFormContext();
    
    if (!form) {
      throw new Error("FloatingLabelInput must be used within a Form component");
    }
    
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem floating className={cn("mb-4", containerClassName)}>
            <FormLabel floating>{label}</FormLabel>
            <FormControl floatingLabel>
              <Input
                ref={ref}
                floatingLabel
                className={cn("transition-all duration-200", className)}
                {...field}
                {...props}
              />
            </FormControl>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
