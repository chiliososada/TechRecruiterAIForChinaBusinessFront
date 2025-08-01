
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
        warning:
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80",
        purple:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200/80",
        interview:
          "border-transparent bg-purple-500 text-white hover:bg-purple-600/80",
        proposed:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600/80",
        preliminary:
          "border-transparent bg-orange-500 text-white hover:bg-orange-600/80",
        waiting:
          "border-transparent bg-amber-400 text-white hover:bg-amber-500/80",
        completed:
          "border-transparent bg-gray-500 text-white hover:bg-gray-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
