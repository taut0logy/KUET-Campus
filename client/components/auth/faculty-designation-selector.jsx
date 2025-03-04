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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

// from current year to 1974
const designations = [
  { value: "PROFESSOR", label: "Professor" },
  { value: "ASSOCIATE_PROFESSOR", label: "Associate Professor" },
  { value: "ASSISTANT_PROFESSOR", label: "Assistant Professor" },
  { value: "LECTURER", label: "Lecturer" },
  { value: "SENIOR_LECTURER", label: "Senior Lecturer" },
  { value: "TEACHERS_ASSISTANT", label: "Teacher's Assistant" },
]

export function FacultyDesignationSelector({onChange}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? designations.find((designation) => designation.value === value)?.label
            : "Select designation..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search designation..." className="h-9" />
          <CommandList>
            <CommandEmpty>No designation found.</CommandEmpty>
            <CommandGroup>
              {designations.map((designation) => (
                <CommandItem
                  key={designation.value}
                  value={designation.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    onChange(currentValue);
                  }}
                >
                  {designation.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === designation.value ? "opacity-100" : "opacity-0"
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
