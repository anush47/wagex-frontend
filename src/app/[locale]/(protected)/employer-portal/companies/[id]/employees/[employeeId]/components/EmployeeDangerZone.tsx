"use client";

import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    IconAlertTriangle,
    IconLoader2,
    IconTrash,
    IconUserOff,
    IconDatabase,
    IconArchive
} from "@tabler/icons-react";
import { EmployeeService } from "@/services/employee.service";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface EmployeeDangerZoneProps {
    employee: Employee;
    onEmployeeDeleted: () => void;
}

export function EmployeeDangerZone({ employee, onEmployeeDeleted }: EmployeeDangerZoneProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteResult, setDeleteResult] = useState<{
        type: 'hard' | 'soft';
        message: string;
    } | null>(null);
    const [salaryCount, setSalaryCount] = useState<number | null>(null);
    const [loadingSalaryCount, setLoadingSalaryCount] = useState(false);

    // Fetch salary count when dialog opens
    useEffect(() => {
        if (showDeleteDialog && salaryCount === null && employee.status !== 'DELETED') {
            fetchSalaryCount();
        }
    }, [showDeleteDialog, salaryCount, employee.status]);

    const fetchSalaryCount = async () => {
        setLoadingSalaryCount(true);
        try {
            // Fetch from salaries endpoint
            const response = await fetch(`/api/v1/salaries?employeeId=${employee.id}&page=1&limit=1`);
            if (response.ok) {
                const data = await response.json();
                // Backend returns { items, total, page, limit }
                const total = data?.total ?? 0;
                setSalaryCount(total);
            }
        } catch (error) {
            console.error('Failed to fetch salary count:', error);
            setSalaryCount(0); // Default to 0 on error
        } finally {
            setLoadingSalaryCount(false);
        }
    };

    const willSoftDelete = salaryCount !== null && salaryCount > 0;
    const isAlreadyDeleted = employee.status === 'DELETED';

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await EmployeeService.deleteEmployee(employee.id, employee.companyId);
            if (res.error) {
                toast.error(res.error.message || "Failed to delete employee");
                return;
            }

            const data = res.data as any;
            const softDeleted = data?.softDeleted ?? false;

            setDeleteResult({
                type: softDeleted ? 'soft' : 'hard',
                message: data?.message || (softDeleted 
                    ? 'Employee marked as deleted (records preserved)' 
                    : 'Employee permanently deleted')
            });

            toast.success(softDeleted 
                ? 'Employee marked as deleted' 
                : 'Employee permanently deleted');

            onEmployeeDeleted();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setDeleting(false);
        }
    };

    const getDeleteDialogDescription = () => {
        if (isAlreadyDeleted) {
            return "This employee has already been marked as deleted.";
        }

        if (salaryCount === null && loadingSalaryCount) {
            return "Analyzing employee records...";
        }

        if (willSoftDelete) {
            return (
                <>
                    This employee has <span className="font-bold">{salaryCount} salary record{salaryCount > 1 ? 's' : ''}</span>, so their record will be <span className="font-bold">archived</span> (soft delete) to preserve historical data. All attendance, salary, and leave records will be preserved. Member No <span className="font-bold">{employee.employeeNo}</span> will not be available for reuse.
                </>
            );
        }

        if (salaryCount !== null && salaryCount === 0) {
            return (
                <>
                    This employee has <span className="font-bold">no salary records</span>, so they will be <span className="font-bold">permanently deleted</span> (hard delete). All associated records will be cascaded and removed. Member No <span className="font-bold">{employee.employeeNo}</span> will be available for reuse.
                </>
            );
        }

        return (
            <>
                This action will <span className="font-bold text-neutral-900 dark:text-white">permanently remove</span> the employee{" "}
                <span className="font-bold text-neutral-900 dark:text-white">{employee.fullName}</span> (Member No:{" "}
                <span className="font-bold text-neutral-900 dark:text-white">{employee.employeeNo}</span>) from active records.
            </>
        );
    };

    return (
        <>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                            <IconAlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Danger Zone</CardTitle>
                            <CardDescription className="text-neutral-500 font-medium">Irreversible actions and employee termination</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 space-y-4">

                    {/* Delete Employee */}
                    <div className="p-6 bg-red-50 dark:bg-red-950/10 rounded-[2rem] border border-red-200 dark:border-red-900/30">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <IconTrash className="w-5 h-5 text-red-600 dark:text-red-500" />
                                    <h4 className="text-base font-bold text-red-900 dark:text-red-400">Delete Employee</h4>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-500/80 leading-relaxed max-w-lg">
                                    {employee.status === 'DELETED' 
                                        ? "This employee has already been deleted."
                                        : "Permanently remove this employee from the system. This will either soft delete (preserve records) or hard delete based on salary history."}
                                </p>
                                {employee.status === 'DELETED' && (
                                    <Badge className="bg-red-500/10 text-red-600 border-red-200 dark:border-red-900">
                                        Already Deleted
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={deleting || employee.status === 'DELETED'}
                                className="h-12 px-8 rounded-2xl font-bold uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
                            >
                                {deleting ? (
                                    <>
                                        <IconLoader2 className="w-4 h-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <IconTrash className="w-4 h-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Current Status Info */}
                    <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem] border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                <IconDatabase className="w-5 h-5 text-neutral-500" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                    Current Status
                                </h4>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-neutral-500">Status:</span>
                                        <Badge className={
                                            employee.status === 'ACTIVE' 
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900" 
                                                : employee.status === 'INACTIVE'
                                                ? "bg-neutral-500/10 text-neutral-600 border-neutral-200 dark:border-neutral-800"
                                                : employee.status === 'SUSPENDED'
                                                ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900"
                                                : "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900"
                                        }>
                                            {employee.status}
                                        </Badge>
                                    </div>
                                    {employee.resignedDate && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-500">Resigned:</span>
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {new Date(employee.resignedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                variant="destructive"
                icon={<IconAlertTriangle className="h-8 w-8" />}
                title="Delete Employee?"
                description={getDeleteDialogDescription()}
                actionLabel="Yes, Delete Employee"
                cancelLabel="Cancel"
                loading={deleting}
                onAction={handleDelete}
            />

            {/* Result Dialog */}
            <Dialog open={!!deleteResult} onOpenChange={() => setDeleteResult(null)}>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
                    <DialogHeader>
                        <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
                            deleteResult?.type === 'hard' 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        }`}>
                            {deleteResult?.type === 'hard' ? <IconTrash className="w-6 h-6" /> : <IconArchive className="w-6 h-6" />}
                        </div>
                        <DialogTitle className="text-center text-xl font-black uppercase tracking-tight">
                            {deleteResult?.type === 'hard' ? 'Employee Deleted' : 'Employee Archived'}
                        </DialogTitle>
                        <DialogDescription className="text-center font-medium">
                            {deleteResult?.message}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full h-12 rounded-xl font-bold"
                            onClick={() => setDeleteResult(null)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
