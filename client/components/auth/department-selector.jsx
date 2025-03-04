"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/ui/icons";
import useDepartmentStore from "@/stores/department-store";

export function DepartmentSelector({form}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);
  
  const { departments, loading, error, fetchDepartments } =
    useDepartmentStore();

  React.useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSelectDepartment = (selectedDepartment) => {
    setValue(selectedDepartment.id);
    form.setValue("departmentId", selectedDepartment.id);
    //setOpen(false);
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
          {value ? departments.find((department) => department.id === value)?.alias : "Select department"}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search department..." />
          <CommandList>
            <CommandEmpty>No departments found.</CommandEmpty>
            <CommandGroup>
              {loading && (
                <Icons.spinner
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {error && <p className="text-red-500">{error}</p>}
              {departments.map((department) => (
                <CommandItem
                  key={department.id}
                  value={department.id}
                  onSelect={() => handleSelectDepartment(department.id === value ? 0 : department)}
                >
                  {department.alias}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === department.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
