import { z } from "zod";

export const companySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    employerNumber: z.string().min(1, "Employer number is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    startedDate: z.string().or(z.date()),
    logo: z.string().url().optional().or(z.literal("")),
    files: z.array(z.object({
        key: z.string(),
        name: z.string(),
        url: z.string()
    })).optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
