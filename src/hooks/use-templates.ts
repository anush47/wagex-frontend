import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentType } from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useTemplates(filters: { companyId?: string; type?: DocumentType; isActive?: boolean } = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["templates", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters.companyId) searchParams.append("companyId", filters.companyId);
      if (filters.type) searchParams.append("type", filters.type);
      if (filters.isActive !== undefined) searchParams.append("isActive", String(filters.isActive));

      const res = await fetch(`${API_URL}/templates?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const variablesQuery = (type: DocumentType) => useQuery({
    queryKey: ["template-variables", type],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/templates/variables/${type}`);
      if (!res.ok) throw new Error("Failed to fetch variables");
      return res.json();
    },
    enabled: !!type,
  });

  return {
    templatesQuery,
    createTemplateMutation,
    updateTemplateMutation,
    deleteTemplateMutation,
    variablesQuery,
  };
}
