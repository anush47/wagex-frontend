/**
 * This file no longer stores sample constants.
 * It's now a thin client that handles type-specific data fetching.
 */
import { DocumentType } from '@/types/template';
import { TemplateService } from '@/services/template.service';

export async function getSampleData(type: DocumentType) {
  const response = await TemplateService.getTemplateVariables(type);
  if (response.error) throw new Error(response.error.message);
  return response.data || {};
}
