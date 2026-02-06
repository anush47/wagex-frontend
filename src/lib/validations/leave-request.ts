import { differenceInCalendarDays, differenceInMinutes, startOfDay, addDays, isBefore, isAfter, isSameDay } from "date-fns";
import { LeaveRequestType } from "@/types/leave";
import { CompanyFile } from "@/types/company";

export type CreatorRole = 'EMPLOYER' | 'EMPLOYEE';

export interface ValidationContext {
    formData: {
        startDate: string;
        endDate: string;
        leaveTypeId: string;
        type: LeaveRequestType;
    };
    selectedLeaveType: any; // Using any for now to avoid extensive type imports, preferably use LeaveType
    documents: CompanyFile[];
    creatorRole: CreatorRole;
}

export const validateLeaveRequest = (ctx: ValidationContext): string | null => {
    const { formData, selectedLeaveType, documents, creatorRole } = ctx;

    if (!formData.startDate || !formData.endDate) return "Start and End dates are required";
    if (!selectedLeaveType) return "Invalid Leave Type";

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();
    const today = startOfDay(now);

    // Basic Time Order Validation
    if (isAfter(start, end)) {
        return "Start time cannot be after End time";
    }

    // 1. Short Leave Validation
    if (formData.type === "SHORT_LEAVE") {
        const isShort = !!selectedLeaveType.isShortLeave;
        if (!isShort) return "Selected leave type does not support Short Leave";

        if (selectedLeaveType.maxDurationMinutes) {
            const diffMinutes = differenceInMinutes(end, start);
            if (diffMinutes > selectedLeaveType.maxDurationMinutes) {
                return `Short leave cannot exceed ${selectedLeaveType.maxDurationMinutes} minutes`;
            }
        }

        if (!isSameDay(start, end)) {
            return "Short leave must be within the same day";
        }
    } else {
        // 2. Duration Validation (Consecutive Days)
        if (selectedLeaveType.maxConsecutiveDays) {
            const diffDays = differenceInCalendarDays(end, start) + 1; // inclusive
            if (diffDays > selectedLeaveType.maxConsecutiveDays) {
                return `Leave duration cannot exceed ${selectedLeaveType.maxConsecutiveDays} consecutive days`;
            }
        }
    }

    // 3. Policy Rules
    // Backdating check
    if (selectedLeaveType.canApplyBackdated === false) {
        // If cannot backdate, start date must be today or future.
        if (isBefore(startOfDay(start), today)) {
            return "Backdated leave requests are not allowed for this leave type";
        }
    }

    // Notice Period check
    if (selectedLeaveType.minNoticeDays) {
        const minStartDate = addDays(today, selectedLeaveType.minNoticeDays);
        if (isBefore(startOfDay(start), minStartDate)) {
            return `This leave type requires at least ${selectedLeaveType.minNoticeDays} days notice`;
        }
    }

    // 4. Document Validation
    const isDocumentRequired = selectedLeaveType.requireDocuments || (
        selectedLeaveType.requireDocumentsIfConsecutiveMoreThan &&
        (differenceInCalendarDays(end, start) + 1) > selectedLeaveType.requireDocumentsIfConsecutiveMoreThan
    );

    if (creatorRole === 'EMPLOYEE' && isDocumentRequired && documents.length === 0) {
        return "Supporting documents are required for this leave request";
    }

    return null;
};
