import { Employee } from "./employee";

export interface Department {
    id: string;
    name: string;
    description?: string;
    companyId: string;

    parentId?: string | null;
    parent?: { id: string, name: string };
    children?: { id: string, name: string }[];

    headId?: string | null;
    head?: { id: string, nameWithInitials: string, photo?: string };

    _count?: {
        employees: number;
    };

    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentDto {
    name: string;
    description?: string;
    companyId: string;
    parentId?: string | null;
    headId?: string | null;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> { }
