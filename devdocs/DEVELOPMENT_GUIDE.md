# WageX Frontend Development Guide

Welcome to the WageX Frontend development standards. This document ensures a premium, high-performance, and consistent user interface across all modules.

## 🛠 Technology Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Styling**: Tailwind CSS
- **Primitives**: Radix UI
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **State Management**: React Query (Server State) + React Context/Hooks (UI State)

---

## 🏗 Architectural Patterns

### 1. Unified Data Fetching
We use **TanStack Query** for all API interactions. 
- **Custom Hooks**: Every feature should have its own set of hooks (e.g., `useEmployees`, `useLeaveRequests`) in `src/hooks/`.
- **Invalidation**: Always use `queryClient.invalidateQueries` after mutations to keep the UI in sync.
- **Loading States**: Implement high-detail **Skeleton Loaders** rather than generic spinners.

### 2. Standardized Components
Maintain consistency by using the shared UI library:
- **Headers**: Use the bold uppercase header pattern for all main pages.
- **Avatars**: Use the `EmployeeAvatar` component. It lazy-loads profile photos from storage only when visible to optimize performance and costs.
- **Tables**: Use the standardized `Table` primitives with hover states and consistent padding.

### 3. Performance & Cost Optimization
- **List Views**: Avoid loading expensive resources like signed image URLs in long tables. Use initials or generic icons for lists.
- **Detail Views**: Load high-resolution resources (avatars, documents) only when a specific record is opened (e.g., in a Dialog or Sidebar).
- **R2 Storage**: Be mindful of Class B operations. Resolve storage URLs only when strictly necessary.

---

## 🎨 Design System & Aesthetics

### 1. Typography
- **Headings**: Use `text-3xl` or `text-4xl` with `font-black` and `uppercase` for page titles.
- **Details**: Use `font-mono` and `tracking-tighter` for technical IDs (Member IDs, Reference Numbers).
- **Labels**: Use small, bold, uppercase labels (`text-[10px] uppercase tracking-widest`) for metadata.

### 2. Colors & Borders
- **Border Radius**: We use generous rounding (`rounded-[2rem]` for cards, `rounded-xl` for inputs).
- **Gradients & Shadows**: Use subtle primary shadows (`shadow-primary/10`) and soft background tints (`bg-primary/5`) for hover states.

### 3. Micro-Animations
- **Entrances**: Use `animate-in fade-in slide-in-from-bottom-4` for new content containers.
- **Interactive**: Add `hover:scale-[1.02] active:scale-[0.98] transition-all` to primary buttons.

---

## 📝 Development Workflow

### 1. Form Handling
- **Normalization**: Always capitalize employee names before submission:
  ```tsx
  if (payload.fullName) payload.fullName = payload.fullName.toUpperCase();
  ```
- **Validation**: Use `sonner` for toast notifications on success/error.

### 2. Skeleton Loading
Every asynchronous list or grid must have a skeleton that mimics the final layout:
- Tables should have skeleton rows.
- Cards should have skeleton placeholders for image and text zones.

### 3. Localization
The project uses `next-intl`. Use the `useTranslations` hook for all user-facing text to support multi-language capability.

---

## 🚀 Common Commands
- **Dev Mode**: `npm run dev` or `bun run dev`
- **Build**: `npm run build`
- **Install**: `bun install`
