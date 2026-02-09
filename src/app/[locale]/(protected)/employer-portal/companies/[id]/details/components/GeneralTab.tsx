import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBuildingSkyscraper, IconMail, IconMapPin, IconCalendar, IconId, IconLoader2, IconCalendarStats } from "@tabler/icons-react";
import { CompanyService } from "@/services/company.service";
import { ImageUpload } from "@/components/ui/image-upload"; // Assuming this component exists or we'll create/mock it
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LabelInputContainer } from "@/components/ui/form-elements";
import { Separator } from "@/components/ui/separator";
interface GeneralTabProps {
    formData: Company;
    handleChange: (field: keyof Company, value: any) => void;
    onDelete: () => void;
}

export function GeneralTab({ formData, handleChange, onDelete }: GeneralTabProps) {

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-8 lg:col-span-2">
                    <Card className="border border-neutral-100 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 rounded-[2rem]">
                        <CardContent className="p-10 space-y-10">

                            {/* Section: Basic Details */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                        <IconBuildingSkyscraper className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black tracking-tight">Company Details</h3>
                                </div>

                                <div className="space-y-6">
                                    <LabelInputContainer>
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Company Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name || ""}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner transition-all duration-300 focus:shadow-primary/5"
                                            placeholder="Enter company name"
                                        />
                                    </LabelInputContainer>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <LabelInputContainer>
                                            <Label htmlFor="employerNumber" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Employer Number</Label>
                                            <Input
                                                id="employerNumber"
                                                value={formData.employerNumber || ""}
                                                onChange={(e) => handleChange("employerNumber", e.target.value)}
                                                className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner"
                                                placeholder="EMP-XXX"
                                            />
                                        </LabelInputContainer>
                                        <LabelInputContainer>
                                            <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Started Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent rounded-2xl px-4 md:px-6 text-left font-medium shadow-inner hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base md:text-lg",
                                                            !formData.startedDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {formData.startedDate ? (
                                                            format(new Date(formData.startedDate), "PPP")
                                                        ) : (
                                                            <span className="text-sm md:text-base text-neutral-400 font-normal">Pick a date</span>
                                                        )}
                                                        <IconCalendar className="ml-auto h-5 w-5 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.startedDate ? new Date(formData.startedDate) : undefined}
                                                        onSelect={(date) => handleChange("startedDate", date ? date.toISOString() : null)}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </LabelInputContainer>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-neutral-100 dark:bg-neutral-800/50" />

                            {/* Section: Address */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-3xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                        <IconMapPin className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black tracking-tight">Location</h3>
                                </div>

                                <LabelInputContainer>
                                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address || ""}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner"
                                        placeholder="123 Business St, City, Country"
                                    />
                                </LabelInputContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Card */}
                    <Card className="border border-neutral-100 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 rounded-[2rem]">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-12 w-12 rounded-3xl flex items-center justify-center transition-colors duration-500", formData.active ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-neutral-200 text-neutral-500")}>
                                        <IconBuildingSkyscraper className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-lg font-bold">Active Status</Label>
                                        <p className="text-sm text-neutral-500 font-medium">
                                            {formData.active ? "Company is active and operational." : "Company is inactive."}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.active}
                                    onCheckedChange={(checked) => handleChange("active", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Logo & Additional Settings */}
                <div className="space-y-8">
                    <div className="sticky top-8 space-y-8">
                        <Card className="border border-neutral-100 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 rounded-[2rem]">
                            <CardHeader className="p-8 pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-3xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <IconId className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl font-black tracking-tight">Identity</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <ImageUpload
                                    label="Company Logo"
                                    companyId={formData.id}
                                    value={formData.logo}
                                    onChange={(key) => handleChange("logo", key)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Danger Zone: Reduced significance and moved to end */}
            <Card className="border border-red-100 dark:border-red-900/20 shadow-none bg-neutral-50 dark:bg-red-950/5 rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium font-sans">
                                Permanently delete this company and all its data. Action cannot be undone.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            className="rounded-xl h-11 px-6 font-bold bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 dark:border-red-900/30 transition-all shadow-none"
                        >
                            Delete Company
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
