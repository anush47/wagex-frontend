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
import { EmployeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";

interface SearchableEmployeeSelectProps {
    companyId: string;
    value?: string;
    onSelect?: (employeeId: string, employee?: Employee) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableEmployeeSelect({
    companyId,
    value,
    onSelect,
    placeholder = "Select employee...",
    className,
    disabled = false,
}: SearchableEmployeeSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Initial fetch for selected employee if value exists but object is missing
    useEffect(() => {
        const fetchInitial = async () => {
            if (value && !selectedEmployee && value !== "ALL") {
                try {
                    const response = await EmployeeService.getEmployee(value);
                    if (response.data) {
                        setSelectedEmployee(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch selected employee", error);
                }
            } else if (!value) {
                setSelectedEmployee(undefined);
            }
        };
        fetchInitial();
    }, [value, selectedEmployee]);

    // Fetch employees on search
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!open) return;

            setLoading(true);
            try {
                // Ensure we pass a string for search, useDebounce might return the initial value immediately
                const term = typeof debouncedSearch === 'string' ? debouncedSearch : "";

                const response = await EmployeeService.getEmployees({
                    companyId,
                    search: term,
                    limit: 20
                });

                // Handle response structure carefully based on previous findings
                const data = response.data?.data || [];
                // @ts-ignore - Temporary fix if types are still mismatched in some environments
                const list = Array.isArray(data) ? data : (data?.data || []);

                setEmployees(list);
            } catch (error) {
                console.error("Failed to search employees", error);
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [debouncedSearch, companyId, open]);

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
                        {loading && <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}
                        {!loading && employees.length === 0 && (
                            <CommandEmpty>No employees found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {employees.map((employee) => (
                                <CommandItem
                                    key={employee.id}
                                    value={employee.id} // Standard value prop for command item
                                    onSelect={() => {
                                        setSelectedEmployee(employee);
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
