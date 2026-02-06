import React from "react";
import { CompanyFile } from "@/types/company";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCloudUpload, IconFileText, IconTrash } from "@tabler/icons-react";
import { FileUpload } from "@/components/ui/file-upload";
import { differenceInCalendarDays } from "date-fns";
import { CreatorRole } from "@/lib/validations/leave-request";

interface LeaveDocumentSectionProps {
    documents: CompanyFile[];
    setDocuments: React.Dispatch<React.SetStateAction<CompanyFile[]>>;
    selectedLeaveType: any;
    formData: {
        startDate: string;
        endDate: string;
    };
    creatorRole: CreatorRole;
    companyId: string;
}

export function LeaveDocumentSection({
    documents,
    setDocuments,
    selectedLeaveType,
    formData,
    creatorRole,
    companyId
}: LeaveDocumentSectionProps) {
    const isRequired = selectedLeaveType && (
        selectedLeaveType.requireDocuments || (
            selectedLeaveType.requireDocumentsIfConsecutiveMoreThan &&
            formData.startDate && formData.endDate &&
            (differenceInCalendarDays(new Date(formData.endDate), new Date(formData.startDate)) + 1) > selectedLeaveType.requireDocumentsIfConsecutiveMoreThan
        )
    );

    return (
        <div className="space-y-3">
            <Label className="text-xs font-bold text-neutral-500 ml-1 flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1.5">
                    <IconCloudUpload className="w-3.5 h-3.5" />
                    Supporting Documents
                </div>
                {isRequired && (
                    <Badge variant={creatorRole === 'EMPLOYEE' ? "destructive" : "outline"} className="text-[9px] h-5 px-2">
                        {creatorRole === 'EMPLOYEE' ? "Required" : "Recommended"}
                    </Badge>
                )}
            </Label>

            {documents.length > 0 && (
                <div className="space-y-2">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <IconFileText className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <div className="text-sm font-bold truncate">{doc.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{doc.size}</div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => setDocuments(docs => docs.filter((_, i) => i !== index))}
                            >
                                <IconTrash className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <FileUpload
                companyId={companyId}
                folder="leaves"
                onUpload={(file) => setDocuments(prev => [...prev, file])}
                className="min-h-[120px]"
            />
        </div>
    );
}
