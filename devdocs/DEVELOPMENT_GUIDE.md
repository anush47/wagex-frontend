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

## 📊 Attendance UI Components

### Overview
The attendance interface is organized into a tabbed layout with collapsible filters and detailed session management.

### Main Components

#### 1. AttendanceSessionsTab
**Purpose**: Display and manage processed attendance sessions

**Features**:
- **Collapsible Filters**: Hidden by default, toggled with "Filters" button
  - Salary period quick select (current + 2 previous periods)
  - Date range picker (From/To)
  - Employee selector (searchable)
  - Approval status filter (All, Pending, Approved)
  - Clear all filters button
- **Quick Approve**: Inline button to approve pending check-in/check-out times
- **Session Details**: Click row to open detailed dialog
- **Pagination**: Server-side pagination with page controls

**Key Patterns**:
```tsx
// Always use optional chaining for employee data
{session.employee?.fullName || 'Unknown'}

// Provide user feedback for actions
toast.success(`Successfully approved check-in for ${employee?.fullName}`);

// Filter sessions client-side for approval status
sessions.filter((session: AttendanceSession) => {
  if (approvalFilter === "PENDING") {
    return session.inApprovalStatus === 'PENDING' || 
           session.outApprovalStatus === 'PENDING';
  }
  return true;
})
```

#### 2. AttendanceEventsTab
**Purpose**: Display raw event logs (audit trail)

**Features**:
- Same collapsible filter pattern as Sessions tab
- Event status filter (Active, Rejected, Ignored)
- Source badges (Web, API Key, Manual)
- Event type badges (IN/OUT with directional icons)
- Read-only view (no editing)

#### 3. SessionDetailsDialog
**Purpose**: View and edit individual session details

**Features**:
- **Session Info Card**: Employee, date, shift, work day status
- **Time Details**: 
  - Check-in/check-out times with login/logout icons
  - Approval badges (Pending, Approved, Rejected)
  - Full-width approve/reject buttons for pending items
- **Calculations**: Total time, work time, break time, overtime
- **Flags**: Late, early leave, on leave, half day, short leave
- **Edit Mode**: Toggle to edit times and flags
- **Delete**: Remove entire session

**UI Patterns**:
```tsx
// Full-width approval buttons
<div className="flex gap-2 w-full">
  <Button variant="default" className="flex-1">
    <IconCheck className="h-3.5 w-3.5 mr-1.5" />
    <span className="text-xs font-bold">Approve</span>
  </Button>
  <Button variant="destructive" className="flex-1">
    <IconX className="h-3.5 w-3.5 mr-1.5" />
    <span className="text-xs font-bold">Reject</span>
  </Button>
</div>

// Visual icons for clarity
<IconLogin className="h-3.5 w-3.5 text-green-600" />
<Label>Check In</Label>
```

#### 4. SalaryPeriodQuickSelect
**Purpose**: Quick selection of salary periods based on company payroll config

**Features**:
- Auto-loads current period on mount
- Shows 3 periods: Current, Last, 2 Periods Ago
- Handles split-month cycles (e.g., 26th to 25th)
- Displays date ranges in readable format
- Uses `useMemo` for performance

**Implementation Notes**:
- Reads from company policy (`useCompanyPolicy` hook)
- Only supports `MONTHLY` frequency currently
- Automatically updates parent component's date filters
- Uses Radix UI Select with popper positioning

### Data Flow

```
User Action → Mutation Hook → API Call → Query Invalidation → UI Update
```

**Example**:
```tsx
// 1. User clicks approve
const handleApprove = async () => {
  // 2. Call mutation
  await updateSession.mutateAsync({ 
    id: session.id, 
    dto: { inApprovalStatus: 'APPROVED' } 
  });
  
  // 3. Show feedback
  toast.success('Approved successfully');
  
  // 4. Query invalidation happens automatically via mutation hook
  // 5. UI re-renders with updated data
};
```

### Best Practices

1. **Always Show Feedback**: Use `sonner` toast for all user actions
2. **Collapsible Filters**: Keep filters hidden by default to reduce visual clutter
3. **Type Safety**: Use explicit types for all session/event data
4. **Optional Chaining**: Always use `?.` when accessing nested employee data
5. **Responsive Design**: Ensure buttons and filters work on mobile
6. **Loading States**: Show skeletons during data fetching
7. **Error Handling**: Display user-friendly error messages

---

## 🚀 Common Commands
- **Dev Mode**: `npm run dev` or `bun run dev`
- **Build**: `npm run build`
- **Install**: `bun install`
