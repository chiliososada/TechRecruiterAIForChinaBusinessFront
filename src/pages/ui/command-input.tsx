
import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="flex items-center border-b px-3 rounded-md border" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

CommandInput.displayName = "CommandInput"

export { CommandInput }
