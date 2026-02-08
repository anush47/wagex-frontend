# Attendance System - Frontend Integration Guide

## Overview

This document provides a quick reference for integrating with the attendance system from the frontend perspective.

---

## API Endpoints

### Base URL
All attendance endpoints are under `/attendance/manual` (requires JWT authentication).

### Sessions

#### Get Sessions (Paginated)
```typescript
GET /attendance/manual/sessions?companyId={id}&employeeId={id}&startDate={date}&endDate={date}&page={n}&limit={n}

Response:
{
  items: AttendanceSession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

#### Get Single Session
```typescript
GET /attendance/manual/sessions/{id}

Response: AttendanceSession
```

#### Update Session
```typescript
PATCH /attendance/manual/sessions/{id}

Body: {
  inApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  outApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  checkInTime?: string | null;
  checkOutTime?: string | null;
  shiftId?: string;
  workDayStatus?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  isLate?: boolean;
  isEarlyLeave?: boolean;
  isOnLeave?: boolean;
  isHalfDay?: boolean;
  hasShortLeave?: boolean;
  remarks?: string;
  totalMinutes?: number;
  breakMinutes?: number;
  workMinutes?: number;
  overtimeMinutes?: number;
}

Response: AttendanceSession
```

#### Delete Session
```typescript
DELETE /attendance/manual/sessions/{id}

Response: { success: boolean }
```

### Events

#### Get Events (Paginated)
```typescript
GET /attendance/manual/events?companyId={id}&employeeId={id}&startDate={date}&endDate={date}&status={status}&page={n}&limit={n}

Response:
{
  items: AttendanceEvent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

#### Create Manual Event
```typescript
POST /attendance/manual/events

Body: {
  employeeId: string;
  eventTime: string; // ISO 8601
  eventType: 'IN' | 'OUT';
  device?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
}

Response: {
  success: boolean;
  event: {
    id: string;
    employeeId: string;
    eventTime: string;
    eventType: 'IN' | 'OUT';
    status: string;
  }
}
```

---

## TypeScript Types

### AttendanceSession
```typescript
interface AttendanceSession {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeNo: number;
    nameWithInitials: string;
    fullName: string;
    photo?: string;
  };
  sessionDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  inApprovalStatus: ApprovalStatus;
  outApprovalStatus: ApprovalStatus;
  checkInLocation?: string;
  checkOutLocation?: string;
  shiftId?: string;
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  workDayStatus: SessionWorkDayStatus;
  totalMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  isOnLeave: boolean;
  isHalfDay: boolean;
  hasShortLeave: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type SessionWorkDayStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
```

### AttendanceEvent
```typescript
interface AttendanceEvent {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeNo: number;
    nameWithInitials: string;
    fullName: string;
  };
  eventTime: string;
  eventType: EventType;
  source: EventSource;
  status: EventStatus;
  device?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
  createdAt: string;
}

type EventType = 'IN' | 'OUT';
type EventSource = 'WEB' | 'API_KEY' | 'MANUAL';
type EventStatus = 'ACTIVE' | 'REJECTED' | 'IGNORED';
```

---

## Custom Hooks

### useAttendanceSessions
```typescript
import { useAttendanceSessions } from '@/hooks/use-attendance';

const { data, isLoading, error, refetch } = useAttendanceSessions({
  companyId: 'uuid',
  employeeId?: 'uuid',
  startDate?: '2026-02-01',
  endDate?: '2026-02-28',
  page: 1,
  limit: 20
});

// data.items: AttendanceSession[]
// data.meta: { total, page, limit, totalPages }
```

### useAttendanceSession
```typescript
import { useAttendanceSession } from '@/hooks/use-attendance';

const { data: session, isLoading } = useAttendanceSession(sessionId);
```

### useAttendanceEvents
```typescript
import { useAttendanceEvents } from '@/hooks/use-attendance';

const { data, isLoading } = useAttendanceEvents({
  companyId: 'uuid',
  employeeId?: 'uuid',
  startDate?: '2026-02-01',
  endDate?: '2026-02-28',
  status?: 'ACTIVE',
  page: 1,
  limit: 20
});
```

### useAttendanceMutations
```typescript
import { useAttendanceMutations } from '@/hooks/use-attendance';

const { 
  updateSession, 
  deleteSession, 
  createEvent 
} = useAttendanceMutations();

// Update session
await updateSession.mutateAsync({
  id: 'session-id',
  dto: { inApprovalStatus: 'APPROVED' }
});

// Delete session
await deleteSession.mutateAsync('session-id');

// Create manual event
await createEvent.mutateAsync({
  employeeId: 'uuid',
  eventTime: new Date().toISOString(),
  eventType: 'IN'
});
```

---

## Common Patterns

### Quick Approve Button
```typescript
const handleQuickApprove = async (session: AttendanceSession) => {
  const updates: any = {};
  const approvedItems: string[] = [];

  if (session.inApprovalStatus === 'PENDING') {
    updates.inApprovalStatus = 'APPROVED';
    approvedItems.push('check-in');
  }
  if (session.outApprovalStatus === 'PENDING') {
    updates.outApprovalStatus = 'APPROVED';
    approvedItems.push('check-out');
  }

  if (Object.keys(updates).length === 0) {
    toast.info('No pending approvals');
    return;
  }

  try {
    await updateSession.mutateAsync({ id: session.id, dto: updates });
    toast.success(`Approved ${approvedItems.join(' and ')}`);
  } catch (err) {
    toast.error('Failed to approve');
  }
};
```

### Salary Period Selection
```typescript
import { SalaryPeriodQuickSelect } from './components/SalaryPeriodQuickSelect';

<SalaryPeriodQuickSelect
  companyId={companyId}
  onRangeSelect={(start, end) => {
    setStartDate(start);
    setEndDate(end);
  }}
  currentStart={startDate}
  currentEnd={endDate}
/>
```

### Collapsible Filters
```typescript
const [showFilters, setShowFilters] = useState(false);

<Button onClick={() => setShowFilters(!showFilters)}>
  <IconFilter className="h-3.5 w-3.5 mr-1.5" />
  Filters
</Button>

{showFilters && (
  <div className="flex gap-2 pt-2 border-t">
    {/* Filter components */}
  </div>
)}
```

---

## UI Components Reference

### Session Status Badges
```tsx
const getApprovalBadge = (status: ApprovalStatus) => {
  const styles = {
    PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    APPROVED: "bg-green-500/10 text-green-600 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
};
```

### Time Display
```tsx
import { format } from 'date-fns';

const formatTime = (time?: string) => {
  if (!time) return "-";
  return format(new Date(time), "h:mm a");
};

const formatMinutes = (minutes?: number) => {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
```

### Full-Width Approval Buttons
```tsx
<div className="flex gap-2 w-full">
  <Button 
    variant="default" 
    className="flex-1 h-9"
    onClick={() => handleApproval('APPROVED')}
  >
    <IconCheck className="h-3.5 w-3.5 mr-1.5" />
    <span className="text-xs font-bold">Approve</span>
  </Button>
  <Button 
    variant="destructive" 
    className="flex-1 h-9"
    onClick={() => handleApproval('REJECTED')}
  >
    <IconX className="h-3.5 w-3.5 mr-1.5" />
    <span className="text-xs font-bold">Reject</span>
  </Button>
</div>
```

---

## Error Handling

Always provide user feedback for all actions:

```typescript
try {
  await updateSession.mutateAsync({ id, dto });
  toast.success('Session updated successfully');
} catch (err) {
  console.error('Update failed:', err);
  toast.error('Failed to update session. Please try again.');
}
```

---

## Performance Tips

1. **Use Pagination**: Always paginate large datasets
2. **Lazy Load Images**: Use `EmployeeAvatar` component for profile photos
3. **Debounce Filters**: Debounce search/filter inputs to reduce API calls
4. **Memoize Calculations**: Use `useMemo` for expensive computations
5. **Invalidate Queries**: Always invalidate related queries after mutations

---

## Related Documentation

- Backend API: See `/wagex-backend/devdocs/ATTENDANCE_EXTERNAL_API.md`
- Component Patterns: See `DEVELOPMENT_GUIDE.md`
- API Reference: See `API_DOCUMENTATION.md`
