import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentType, DocumentTemplate } from "@/types/template";
import { TemplateService } from "@/services/template.service";

export function useTemplates(filters: { companyId?: string; type?: DocumentType; isActive?: boolean } = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["templates", filters],
    queryFn: async () => {
      const response = await TemplateService.getTemplates(filters);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: Partial<DocumentTemplate>) => {
      const response = await TemplateService.createTemplate(data);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DocumentTemplate> }) => {
      const response = await TemplateService.updateTemplate(id, data);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await TemplateService.deleteTemplate(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  return {
    templatesQuery,
    createTemplateMutation,
    updateTemplateMutation,
    deleteTemplateMutation,
  };
}

export function useTemplateVariables(type?: DocumentType) {
  return useQuery({
    queryKey: ["template-variables", type],
    queryFn: async () => {
      if (!type) return {};
      const response = await TemplateService.getTemplateVariables(type);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!type,
  });
}

export function useTemplateLiveData(type?: DocumentType, resourceId?: string) {
  return useQuery({
    queryKey: ["template-live-data", type, resourceId],
    queryFn: async () => {
      if (!type) return null;
      const response = await TemplateService.getTemplateLiveData(type, resourceId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!type,
  });
}
