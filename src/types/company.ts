export interface CompanyFile {
    key: string;
    name: string;
    url: string;
    size?: string;
    uploadedAt?: string;
    uploadedBy?: string;
}

export interface Company {
    id: string;
    name: string;
    employerNumber: string;
    address: string;
    startedDate: string;
    logo?: string;
    timezone?: string;
    active?: boolean;
    files?: CompanyFile[];
    createdAt: string;
    updatedAt: string;
}
