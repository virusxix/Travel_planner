import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "gradient-btn text-white border-0",
        secondary: "bg-slate-100 text-foreground hover:bg-slate-200 border border-slate-200",
        ghost: "hover:bg-slate-100 text-foreground",
        accent: "bg-accent-500 text-white hover:bg-orange-600",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        glass: "bg-white text-foreground border border-slate-200 hover:bg-slate-50 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-foreground",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs rounded-xl",
        lg: "h-14 px-8 text-base rounded-[1.25rem]",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
