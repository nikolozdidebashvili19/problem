import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// Native <select>: best mobile UX (OS picker) and fully accessible without extra JS
function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          'h-10 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pl-3 pr-9 text-base',
          'shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }
