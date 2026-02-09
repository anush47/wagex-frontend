
import { useState } from "react";
import { useHolidays } from "@/hooks/use-calendars";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
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
import { format } from "date-fns";

interface HolidaySelectProps {
    calendarId?: string;
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function HolidaySelect({
    calendarId,
    value,
    onValueChange,
    placeholder = "Select a holiday...",
    className
}: HolidaySelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: holidaysData, isFetching } = useHolidays({
        calendarId,
        search,
        startDate,
        endDate,
        limit: 100 // Get enough for selection
    });

    const holidays = Array.isArray(holidaysData) ? holidaysData : (holidaysData as any)?.items || [];
    const selectedHoliday = holidays.find((h: any) => h.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between bg-background border-none h-11 rounded-xl shadow-sm px-4 font-bold text-xs hover:bg-muted/50 transition-all", className)}
                >
                    {selectedHoliday ? (
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="truncate w-full">{selectedHoliday.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                                {format(new Date(selectedHoliday.date), "PPP")}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground font-normal">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
                <Command className="rounded-2xl" shouldFilter={false}>
                    <div className="p-3 border-b border-border/50 bg-muted/20 space-y-3">
                        <CommandInput
                            placeholder="Search holiday name..."
                            value={search}
                            onValueChange={setSearch}
                            isSearching={isFetching}
                            className="bg-transparent border-none focus-visible:ring-0"
                        />
                        <div className="flex items-center gap-2 px-1">
                            <div className="flex-1 space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 ml-1">From</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-background border border-border/40 rounded-lg h-8 px-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 ml-1">To</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-background border border-border/40 rounded-lg h-8 px-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 mt-4 rounded-lg hover:bg-red-50 hover:text-red-500"
                                    onClick={() => { setStartDate(""); setEndDate(""); }}
                                >
                                    <span className="text-[10px] font-extrabold">✕</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <CommandList className="max-h-[300px]">
                        {isFetching ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-xs text-muted-foreground">Searching holidays...</span>
                            </div>
                        ) : holidays.length === 0 ? (
                            <CommandEmpty>No holidays found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {holidays.map((holiday: any) => (
                                    <CommandItem
                                        key={holiday.id}
                                        value={holiday.id}
                                        onSelect={() => {
                                            onValueChange(holiday.id);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className="flex flex-col items-start py-2.5 px-4 cursor-pointer gap-0.5"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm truncate">{holiday.name}</span>
                                            {value === holiday.id && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(holiday.date), "PPP")}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
