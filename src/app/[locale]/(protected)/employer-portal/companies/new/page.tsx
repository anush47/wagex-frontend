"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { companySchema, type CompanyFormValues } from "@/schemas/company.schema";
import { LabelInputContainer } from "@/components/ui/form-elements";
import { IconArrowLeft, IconMapPin, IconInfoCircle, IconCalendar } from "@tabler/icons-react";
import { Link, useRouter } from "@/i18n/routing";
import { useCompanyMutations } from "@/hooks/use-companies";
import { ImageUpload } from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewCompanyPage() {
    const router = useRouter();
    const t = useTranslations("Companies");
    const common = useTranslations("Common");

    const { createCompany } = useCompanyMutations();
    const { mutateAsync: createCompanyFn, isPending } = createCompany;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "",
            employerNumber: "",
            address: "",
            startedDate: "",
            logo: "",
        },
    });

    const onSubmit = async (data: CompanyFormValues) => {
        const toastId = toast.loading("Establishing new company...");
        try {
            await createCompanyFn(data);
            toast.success("Company established successfully!", { id: toastId });
            router.push("/employer-portal/companies");
        } catch (error) {
            console.error("Failed to create company", error);
            toast.error("Failed to establish company", { id: toastId });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-16">
                <div className="space-y-3 md:space-y-4">
                    <Link
                        href="/employer-portal/companies"
                        className="group inline-flex items-center text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-400 hover:text-primary transition-all duration-300"
                    >
                        <IconArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        {common("back")}
                    </Link>
                    <div className="space-y-1 md:space-y-2 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground">
                            {t("newCompany")}
                        </h1>
                        <p className="text-base md:text-xl text-neutral-500 font-medium max-w-2xl leading-relaxed">
                            {t("createDescription")}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-12">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-12 items-start">
                    <div className="xl:col-span-8 space-y-6 md:space-y-8">
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-6 md:p-10 space-y-8 md:space-y-12">

                                {/* Section: Basic Info */}
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-primary-foreground">
                                            <IconInfoCircle className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight">{t("details")}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <LabelInputContainer className="md:col-span-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">{t("name")}</Label>
                                            <Input
                                                id="name"
                                                placeholder={t("namePlaceholder")}
                                                {...register("name")}
                                                className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner"
                                            />
                                            {errors.name && (
                                                <p className="text-destructive text-[10px] md:text-xs font-bold mt-1 md:mt-2 ml-1 md:ml-2">{errors.name.message}</p>
                                            )}
                                        </LabelInputContainer>

                                        <LabelInputContainer>
                                            <Label htmlFor="employerNumber" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">{t("regId")}</Label>
                                            <Input
                                                id="employerNumber"
                                                placeholder={t("regIdPlaceholder")}
                                                {...register("employerNumber")}
                                                className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner"
                                            />
                                            {errors.employerNumber && (
                                                <p className="text-destructive text-[10px] md:text-xs font-bold mt-1 md:mt-2 ml-1 md:ml-2">{errors.employerNumber.message}</p>
                                            )}
                                        </LabelInputContainer>

                                        <LabelInputContainer>
                                            <Label htmlFor="startedDate" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">{t("startedDate")}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent rounded-xl md:rounded-2xl px-4 md:px-6 text-left font-medium shadow-inner hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base md:text-lg",
                                                            !watch("startedDate") && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {watch("startedDate") ? (
                                                            format(new Date(watch("startedDate")), "PPP")
                                                        ) : (
                                                            <span className="text-base text-neutral-400 font-normal">Pick a date</span>
                                                        )}
                                                        <IconCalendar className="ml-auto h-5 w-5 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={watch("startedDate") ? new Date(watch("startedDate")) : undefined}
                                                        onSelect={(date) => setValue("startedDate", date ? date.toISOString() : "")}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.startedDate && (
                                                <p className="text-destructive text-[10px] md:text-xs font-bold mt-1 md:mt-2 ml-1 md:ml-2">{errors.startedDate.message}</p>
                                            )}
                                        </LabelInputContainer>
                                    </div>
                                </div>

                                <Separator className="bg-neutral-100 dark:bg-neutral-800/50" />

                                {/* Section: Location */}
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl md:rounded-3xl bg-orange-500 flex items-center justify-center text-white">
                                            <IconMapPin className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black tracking-tight">{t("address")}</h3>
                                    </div>

                                    <LabelInputContainer>
                                        <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">{t("address")}</Label>
                                        <Input
                                            id="address"
                                            placeholder={t("addressPlaceholder")}
                                            {...register("address")}
                                            className="h-12 md:h-14 bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl px-4 md:px-6 text-base md:text-lg font-medium shadow-inner"
                                        />
                                        {errors.address && (
                                            <p className="text-destructive text-[10px] md:text-xs font-bold mt-1 md:mt-2 ml-1 md:ml-2">{errors.address.message}</p>
                                        )}
                                    </LabelInputContainer>
                                </div>

                            </CardContent>
                        </Card>
                    </div>

                    <div className="xl:col-span-4 space-y-6 md:space-y-10 sticky top-12">
                        <ImageUpload
                            label={t("logo")}
                            value={watch("logo")}
                            onChange={(url) => setValue("logo", url)}
                        />
                        {errors.logo && (
                            <p className="text-destructive text-[10px] md:text-xs font-bold mt-1 md:mt-2 ml-1 md:ml-2">{errors.logo.message}</p>
                        )}

                        <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-10">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 md:h-20 text-lg md:text-xl font-black rounded-2xl md:rounded-3xl bg-primary text-primary-foreground shadow-xl hover:-translate-y-1 active:translate-y-0.5 transition-all duration-500"
                            >
                                {isPending ? common("save") + "..." : t("establishNew")}
                            </Button>
                            <Link href="/employer-portal/companies" className="block w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-14 md:h-20 text-base md:text-lg font-bold rounded-2xl md:rounded-3xl border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-300"
                                >
                                    {t("discard")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
