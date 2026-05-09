import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        none: "border-transparent bg-emerald-100 text-emerald-700",
        low: "border-transparent bg-orange-100 text-orange-700",
        medium: "border-transparent bg-amber-100 text-amber-700",
        high: "border-transparent bg-red-100 text-red-700",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        danger: "border-transparent bg-red-100 text-red-700",
        outline: "border-input text-gray-700 bg-white",
        chip: "border-gray-200 bg-gray-50 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
