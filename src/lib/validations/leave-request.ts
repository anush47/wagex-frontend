import { differenceInCalendarDays, differenceInMinutes, startOfDay, addDays, isBefore, isAfter, isSameDay, areIntervalsOverlapping } from "date-fns";
import { LeaveRequestType, LeaveBalance, LeaveRequest } from "@/types/leave";
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
    balances: LeaveBalance[];
    existingRequests?: LeaveRequest[];
}

export const validateLeaveRequest = (ctx: ValidationContext): string | null => {
    const { formData, selectedLeaveType, documents, creatorRole, balances, existingRequests } = ctx;

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

    // 5. Overlap Validation
    if (existingRequests && existingRequests.length > 0) {
        const hasOverlap = existingRequests.some(req => {
            // Skip cancelled/rejected requests
            if (req.status === 'REJECTED' || req.status === 'CANCELLED') return false;

            return areIntervalsOverlapping(
                { start, end },
                { start: new Date(req.startDate), end: new Date(req.endDate) }
            );
        });

        if (hasOverlap) {
            return "This request overlaps with an existing leave request";
        }
    }

    // 6. Balance Validation
    // Calculate required days/amount
    let requiredAmount = 0;
    if (formData.type === "SHORT_LEAVE") {
        // Short leave usually counts as a fraction or specific logic, 
        // but often configured as 0.25 or 0.5 or 0 depending on policy.
        // For now, let's assume if it counts towards balance, the backend handles the deduction.
        // But for PRE-VALIDATION, we might skip strict 'amount' checks for short leave 
        // unless we know the factor. 
        // However, if the user has 0 balance, they shouldn't applied.

        // Use a safe assumption or skip specific amount calc for Short Leave 
        // if we don't know the exact factor here.
        // Let's check generally if they have ANY balance if it's a paid leave.
        // Or if we can find the balance object.
    } else {
        // Full/Half Days
        if (formData.type === "FULL_DAY") {
            requiredAmount = differenceInCalendarDays(end, start) + 1;
        } else {
            // Half Day
            requiredAmount = 0.5;
        }
    }

    const currentBalance = balances.find(b => b.leaveTypeId === formData.leaveTypeId);
    if (currentBalance) {
        // Only valid if we have a calculated required amount > 0
        if (requiredAmount > 0) {
            if (currentBalance.available < requiredAmount) {
                // Format the available balance to 1 decimal place, stripping trailing zero
                const formattedBalance = Number(currentBalance.available).toFixed(1).replace(/\.0$/, '');
                return `Insufficient leave balance. You only have ${formattedBalance} days available.`;
            }
        } else if (formData.type === "SHORT_LEAVE") {
            // For short leave, just check if they have positive balance if checking is strict
            // For now, ignoring strict amount check for short leave to avoid blocking valid logic
            // where short leave might be 0.1 days etc.
            if (currentBalance.available <= 0) {
                return `Insufficient leave balance.`;
            }
        }
    }


    return null;
};
