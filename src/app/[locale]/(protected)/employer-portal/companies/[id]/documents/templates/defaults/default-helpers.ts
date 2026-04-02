import { DocumentType } from '@/types/template';

export function getStandardHelpers(): string {
  return `/**
 * WageX Standard & Custom Helpers
 * All template logic is defined here.
 * Add or modify helpers as needed per template.
 */

// 1. Currency & Numbers
Handlebars.registerHelper('formatCurrency', (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
});

Handlebars.registerHelper('add', (a, b) => (a || 0) + (b || 0));

// 2. Dates
Handlebars.registerHelper('formatDate', (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
});

Handlebars.registerHelper('formatDateTime', (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-LK');
});

// 3. Logic & Comparison
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('lt', (a, b) => a < b);
Handlebars.registerHelper('or', (a, b) => a || b);

// 4. Array helpers
Handlebars.registerHelper('chunk', (arr, size) => {
  if (!Array.isArray(arr)) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
});

// 5. Data Extraction (for components array)
Handlebars.registerHelper('getAmount', (list, name) => {
  if (!Array.isArray(list)) return 0;
  const item = list.find((i) => i.name === name);
  return item ? item.amount : 0;
});

Handlebars.registerHelper('getCustomTotal', (obj, key) => {
  if (!obj) return 0;
  return obj[key] || 0;
});

// 6. Filtering salary components
Handlebars.registerHelper('filterAdditions', (components) => {
  if (!Array.isArray(components)) return [];
  return components.filter(c => c.category === 'ADDITION');
});

Handlebars.registerHelper('filterDeductions', (components) => {
  if (!Array.isArray(components)) return [];
  return components.filter(c => c.category === 'DEDUCTION');
});

// 7. Formatting minutes to hours
Handlebars.registerHelper('minutesToHours', (minutes) => {
  if (!minutes) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + 'h ' + m + 'm';
});

// 8. Utility
Handlebars.registerHelper('uppercase', (str) => {
  if (typeof str !== 'string') return str;
  return str.toUpperCase();
});

Handlebars.registerHelper('default', (value, fallback) => value || fallback);
`;
}

export function getDefaultHelpers(type?: DocumentType): string {
  // If we need type-specific helpers in the future, we can add them here.
  // For now, all document types share the same standard helpers.
  return getStandardHelpers();
}
