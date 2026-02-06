import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableEmployeeSelect } from "@/components/ui/searchable-employee-select";
import { LeaveRequestType, LeaveBalance } from "@/types/leave";
import { CompanyFile } from "@/types/company";
import { IconUser, IconCalendarStar, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { addMinutes, format } from "date-fns";
import { LeaveBalanceDisplay } from "./LeaveBalanceDisplay";
import { LeaveDocumentSection } from "./LeaveDocumentSection";
import { CreatorRole } from "@/lib/validations/leave-request";

interface CreateLeaveRequestFormProps {
    companyId: string;
    defaultEmployeeId?: string;
    creatorRole: CreatorRole;
    leaveTypes: any[];
    balances: LeaveBalance[];
    loading: boolean;
    fetchingConfig: boolean;
    onSubmit: (formData: any, documents: CompanyFile[]) => Promise<void>;
    onCancel: () => void;
    onEmployeeChange?: (id: string) => void;
}

export function CreateLeaveRequestForm({
    companyId,
    defaultEmployeeId,
    creatorRole,
    leaveTypes,
    balances,
    loading,
    fetchingConfig,
    onSubmit,
    onCancel,
    onEmployeeChange
}: CreateLeaveRequestFormProps) {
    const [documents, setDocuments] = useState<CompanyFile[]>([]);

    // UX States
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [shortLeaveDuration, setShortLeaveDuration] = useState<number>(60);
    const [shortLeaveStartTime, setShortLeaveStartTime] = useState<string>("");

    const [formData, setFormData] = useState({
        employeeId: defaultEmployeeId || "",
        leaveTypeId: "",
        type: "FULL_DAY" as LeaveRequestType,
        startDate: "",
        endDate: "",
        reason: "",
    });

    const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);
    const isShortLeaveType = selectedLeaveType?.isShortLeave === true;

    // Effect to auto-update based on UX inputs logic
    useEffect(() => {
        // Robustly check if it's strictly a short leave context
        // We prioritize the configuration (isShortLeaveType) or explicit user selection
        const isShort = formData.type === "SHORT_LEAVE" || isShortLeaveType;

        if (isShort) {
            // Check if user has entered time and duration
            if (shortLeaveStartTime && shortLeaveDuration) {
                const start = new Date(shortLeaveStartTime);
                const end = addMinutes(start, shortLeaveDuration);
                const formatDateTime = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

                const newStart = formatDateTime(start);
                const newEnd = formatDateTime(end);

                // Check for updates needed
                const needsDateUpdate = formData.startDate !== newStart || formData.endDate !== newEnd;
                const needsTypeUpdate = formData.type !== "SHORT_LEAVE";

                if (needsDateUpdate || needsTypeUpdate) {
                    setFormData(prev => ({
                        ...prev,
                        // Force type to SHORT_LEAVE if config dictates it
                        type: "SHORT_LEAVE" as LeaveRequestType,
                        startDate: newStart,
                        endDate: newEnd
                    }));
                }
            }
        } else {
            // Logic for Full/Half day
            if (!isMultiDay && formData.startDate) {
                // Determine effective end date
                // If it's single day, end date = start date
                const targetEndDate = formData.startDate;

                // Sync End Date if mismatch
                if (formData.endDate !== targetEndDate) {
                    setFormData(prev => ({ ...prev, endDate: targetEndDate }));
                }
            } else if (isMultiDay && formData.startDate && formData.endDate) {
                // Nothing specific to force-sync here, user enters both
            }
        }
    }, [formData.type, isShortLeaveType, isMultiDay, formData.startDate, formData.endDate, shortLeaveStartTime, shortLeaveDuration]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, documents);
    };

    return (
        <form id="create-leave-request-form" onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!defaultEmployeeId && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                            <IconUser className="w-3.5 h-3.5" />
                            Employee
                        </Label>
                        <SearchableEmployeeSelect
                            companyId={companyId}
                            value={formData.employeeId}
                            onSelect={(id) => {
                                setFormData({ ...formData, employeeId: id, leaveTypeId: "" });
                                onEmployeeChange?.(id);
                            }}
                        />
                    </div>
                )}
            </div>

            <LeaveBalanceDisplay balances={balances} leaveTypes={leaveTypes} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                        <IconCalendarStar className="w-3.5 h-3.5" />
                        Leave Type
                    </Label>
                    <Select
                        value={formData.leaveTypeId}
                        onValueChange={(value) => {
                            const selected = leaveTypes.find(lt => lt.id === value);
                            const isShort = selected?.isShortLeave === true;

                            const newType: LeaveRequestType = isShort ? LeaveRequestType.SHORT_LEAVE : LeaveRequestType.FULL_DAY;

                            setFormData(prev => ({
                                ...prev,
                                leaveTypeId: value,
                                type: newType,
                                startDate: "",
                                endDate: ""
                            }));

                            if (isShort) {
                                setIsMultiDay(false);
                                setShortLeaveStartTime("");
                            }
                        }}
                        disabled={(!formData.employeeId && !defaultEmployeeId) || fetchingConfig}
                    >
                        <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                            <SelectValue placeholder={
                                fetchingConfig ? "Loading leave types..." :
                                    (formData.employeeId || defaultEmployeeId) ? "Select leave type" : "Select employee first"
                            }>
                                {formData.leaveTypeId && selectedLeaveType && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: selectedLeaveType.color || '#3b82f6' }}
                                        />
                                        <span>{selectedLeaveType.name}</span>
                                        {selectedLeaveType.code && (
                                            <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 min-w-0 px-1">
                                                {selectedLeaveType.code}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {leaveTypes.length === 0 && (formData.employeeId || defaultEmployeeId) ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No leave types available
                                </div>
                            ) : (
                                leaveTypes.map((lt) => {
                                    const balance = balances.find(b => b.leaveTypeId === lt.id);
                                    return (
                                        <SelectItem key={lt.id} value={lt.id}>
                                            <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded"
                                                        style={{ backgroundColor: lt.color || '#3b82f6' }}
                                                    />
                                                    <span className="font-bold">{lt.name}</span>
                                                    <Badge variant="outline" className="text-[9px] font-mono font-black">
                                                        {lt.code}
                                                    </Badge>
                                                </div>
                                                {balance && (
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {Number(balance.available).toFixed(1).replace(/\.0$/, '')} days left
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5">
                        <IconClock className="w-3.5 h-3.5" />
                        Request Type
                    </Label>
                    <Select
                        value={isShortLeaveType ? "SHORT_LEAVE" : formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as LeaveRequestType })}
                        disabled={!formData.leaveTypeId || isShortLeaveType}
                    >
                        <SelectTrigger className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm">
                            <SelectValue placeholder={formData.leaveTypeId ? "Select request type" : "Select leave type first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {isShortLeaveType ? (
                                <SelectItem value="SHORT_LEAVE">Short Leave</SelectItem>
                            ) : (
                                <>
                                    <SelectItem value="FULL_DAY">Full Day</SelectItem>
                                    <SelectItem value="HALF_DAY_FIRST">Half Day (First Half)</SelectItem>
                                    <SelectItem value="HALF_DAY_LAST">Half Day (Second Half)</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Inputs Section */}
            {(formData.type === "SHORT_LEAVE" || isShortLeaveType) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1">
                            Start Time
                        </Label>
                        <Input
                            type="datetime-local"
                            value={shortLeaveStartTime}
                            onChange={(e) => setShortLeaveStartTime(e.target.value)}
                            className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-neutral-500 ml-1">
                            Duration (Minutes)
                        </Label>
                        <Input
                            type="number"
                            min={15}
                            step={15}
                            value={shortLeaveDuration}
                            onChange={(e) => setShortLeaveDuration(parseInt(e.target.value) || 0)}
                            className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                            required
                        />
                        {selectedLeaveType?.maxDurationMinutes && (
                            <p className="text-[10px] text-muted-foreground ml-1">
                                Max: {selectedLeaveType.maxDurationMinutes} mins
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                        <Switch
                            checked={isMultiDay}
                            onCheckedChange={setIsMultiDay}
                            id="multi-day-mode"
                        />
                        <Label htmlFor="multi-day-mode" className="text-xs font-bold text-neutral-500 cursor-pointer">
                            Multiple Days
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-neutral-500 ml-1">
                                {isMultiDay ? "Start Date" : "Date"}
                            </Label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                required
                            />
                        </div>

                        {isMultiDay && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                                <Label className="text-xs font-bold text-neutral-500 ml-1">
                                    End Date
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="h-11 bg-muted/40 border-none rounded-xl px-4 font-bold text-sm shadow-sm"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-500 ml-1">Reason (Optional)</Label>
                <Textarea
                    placeholder="Enter reason for leave..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="bg-muted/40 border-none rounded-xl px-4 py-3 font-medium text-sm shadow-sm resize-none"
                />
            </div>

            <LeaveDocumentSection
                documents={documents}
                setDocuments={setDocuments}
                selectedLeaveType={selectedLeaveType}
                formData={formData}
                creatorRole={creatorRole}
                companyId={companyId}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end pt-4 border-t border-border/50">
                <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl px-10 h-11 font-bold text-xs hover:bg-background/50"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="rounded-xl px-14 h-11 font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading || (!formData.employeeId && !defaultEmployeeId) || !formData.leaveTypeId}
                >
                    {loading ? "Creating..." : "Create Request"}
                </Button>
            </div>
        </form>
    );
}
