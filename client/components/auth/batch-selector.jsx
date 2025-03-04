"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// from current year to 1974
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1974 + 1 }, (_, i) => currentYear - i);
const batches = years.map((year) => ({
  value: year,
  label: year,
}));

export function BatchSelector({form}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(0)

  const handleSelectBatch = (selectedBatch) => {
    setValue(selectedBatch.value);
    form.setValue("batch", selectedBatch.value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? batches.find((batch) => batch.value === value)?.label
            : "Select batch..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search batch..." />
          <CommandList>
            <CommandEmpty>No batches found.</CommandEmpty>
            <CommandGroup>
              {batches.map((batch) => (
                <CommandItem
                  key={batch.value}
                  value={batch.value}
                  onSelect={() => handleSelectBatch(batch.value === value ? 0 : batch)}
                >
                  {batch.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === batch.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
