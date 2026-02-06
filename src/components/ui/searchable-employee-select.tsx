"use client";

import React, { useState, useEffect } from "react";
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
import type { Employee } from "@/types/employee";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { useEmployees, useEmployee } from "@/hooks/use-employees";

interface SearchableEmployeeSelectProps {
    companyId: string;
    value?: string | null;
    onSelect?: (employeeId: string, employee?: Employee) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    excludeIds?: string[];
}

export function SearchableEmployeeSelect({
    companyId,
    value,
    onSelect,
    placeholder = "Select employee...",
    className,
    disabled = false,
    excludeIds = [],
}: SearchableEmployeeSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Fetch the selected employee details (TanStack Query handles caching)
    const { data: selectedEmployee } = useEmployee(value || null);

    // Fetch the list of employees based on search
    const { data: resp, isLoading: loading } = useEmployees({
        companyId,
        search: typeof debouncedSearch === 'string' ? debouncedSearch : "",
        limit: 20
    }, open); // Only enabled when dropdown is open

    // Handle paginated or raw array response
    let employees = (resp as any)?.data || (Array.isArray(resp) ? resp : []);

    // Filter out excluded IDs if provided
    if (excludeIds.length > 0 && Array.isArray(employees)) {
        employees = employees.filter((e: Employee) => !excludeIds.includes(e.id));
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-11 rounded-xl px-4 font-normal hover:bg-muted/50", className)}
                    disabled={disabled}
                >
                    {selectedEmployee ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-sm">{selectedEmployee.nameWithInitials}</span>
                            <Badge variant="outline" className="text-[9px] font-mono h-4 px-1 rounded-sm">
                                {selectedEmployee.employeeNo}
                            </Badge>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search employees..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {loading && (
                            <div className="p-2 space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col gap-2 p-2 px-3 animate-pulse">
                                        <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                        <div className="h-3 w-1/4 bg-neutral-50 dark:bg-neutral-800/50 rounded" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {!loading && employees.length === 0 && (
                            <CommandEmpty>No employees found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {employees.map((employee: Employee) => (
                                <CommandItem
                                    key={employee.id}
                                    value={employee.id} // Standard value prop for command item
                                    onSelect={() => {
                                        if (onSelect) onSelect(employee.id, employee);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === employee.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{employee.nameWithInitials}</span>
                                        <span className="text-xs text-muted-foreground">{employee.employeeNo}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
