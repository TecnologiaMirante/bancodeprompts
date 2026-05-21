import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function NativeSelect({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none border border-input rounded-xl px-3.5 py-2 pr-9 text-sm h-9",
          "bg-transparent text-foreground cursor-pointer",
          "transition-[color,box-shadow,border-color] outline-none",
          "focus:border-ring focus:ring-[3px] focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[&>option]:bg-popover [&>option]:text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  )
}

export { NativeSelect }
