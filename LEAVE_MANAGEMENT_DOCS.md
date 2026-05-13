# Leave Management System - Complete Documentation

## Overview
The Leave Management System has been fully implemented with a MongoDB backend and React frontend. Members can request leaves, and coordinators/admins can approve or reject them.

## System Flow

### 1. Member Flow
1. Member navigates to Leave Management in their dashboard
2. Clicks "Request New Leave"
3. Fills in form: Leave Type, Start Date, End Date, Reason
4. Submits the form
5. Leave request is saved to MongoDB with status "Pending"
6. Can edit or delete pending leave requests
7. Once approved/rejected by admin, cannot edit

### 2. Coordinator Flow
1. Coordinator navigates to Leave Management
2. Sees all leave requests with status filters:
   - Pending (needs action)
   - Approved (already approved)
   - Rejected (already rejected)
3. Can view full details of any leave request
4. For pending requests, can:
   - Approve: Adds approval details and changes status to "Approved"
   - Reject: Requires reason, changes status to "Rejected"
5. Changes are reflected in database and member's view

## Backend API Endpoints

### Member Endpoints

#### Submit Leave Request
```
POST /api/leave/submit
Content-Type: application/json
Authorization: Bearer Token (via cookie)

Body:
{
  "type": "Sick Leave",
  "startDate": "2024-05-15",
  "endDate": "2024-05-17",
  "reason": "Personal health issue"
}

Response:
{
  "message": "Leave request submitted successfully",
  "leave": { ... }
}
```

#### Get My Leaves
```
GET /api/leave/my-leaves
Authorization: Bearer Token (via cookie)

Response:
{
  "message": "Leaves retrieved successfully",
  "leaves": [ { ... }, { ... } ]
}
```

#### Update Leave Request
```
PUT /api/leave/:id
Content-Type: application/json
Authorization: Bearer Token (via cookie)

Body:
{
  "type": "Casual Leave",
  "startDate": "2024-05-15",
  "endDate": "2024-05-16",
  "reason": "Family visit"
}

Note: Can only update pending leaves
```

#### Delete Leave Request
```
DELETE /api/leave/:id
Authorization: Bearer Token (via cookie)

Note: Can only delete pending leaves
```

### Coordinator/Admin Endpoints

#### Get All Leaves
```
GET /api/leave/all?status=Pending
Authorization: Bearer Token (via cookie)

Query Parameters:
- status: "Pending", "Approved", "Rejected" (optional)

Response:
{
  "message": "Leaves retrieved successfully",
  "leaves": [ { ... } ]
}
```

#### Get Pending Leaves
```
GET /api/leave/pending
Authorization: Bearer Token (via cookie)

Response:
{
  "message": "Pending leaves retrieved successfully",
  "leaves": [ { ... } ]
}
```

#### Approve Leave
```
PUT /api/leave/:id/approve
Content-Type: application/json
Authorization: Bearer Token (via cookie)

Body:
{
  "approvedBy": "Coordinator Name"
}

Response:
{
  "message": "Leave approved successfully",
  "leave": { ... }
}
```

#### Reject Leave
```
PUT /api/leave/:id/reject
Content-Type: application/json
Authorization: Bearer Token (via cookie)

Body:
{
  "rejectionReason": "Insufficient leaves remaining",
  "rejectedBy": "Coordinator Name"
}

Response:
{
  "message": "Leave rejected successfully",
  "leave": { ... }
}
```

## Database Schema

### Leave Model
```javascript
{
  _id: ObjectId,
  memberId: ObjectId (Reference to Member),
  memberName: String,
  memberEmail: String,
  memberPhone: String,
  type: String (Sick Leave, Casual Leave, Annual Leave, Maternity Leave, Paternity Leave),
  startDate: Date,
  endDate: Date,
  days: Number,
  reason: String,
  status: String (Pending, Approved, Rejected),
  appliedDate: Date,
  approvedBy: String (optional),
  approvedDate: Date (optional),
  rejectionReason: String (optional),
  rejectedBy: String (optional),
  rejectedDate: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Components

### Member LeaveManagement
**File:** `src/views/Uniques/Member/LeaveManagement/index.jsx`

Features:
- View all personal leave requests
- Statistics cards (Total, Pending, Approved, Rejected)
- Submit new leave request via dialog
- Edit pending leave requests
- Delete pending leave requests
- Real-time status updates

State Management:
- `leaves`: Array of leave objects
- `isLoading`: Loading state for API calls
- `openDialog`: Dialog visibility state
- `editingId`: ID of leave being edited
- `formData`: Form input values

### Coordinator LeaveManagement
**File:** `src/views/Uniques/Coordinator/LeaveManagement/index.jsx`

Features:
- View all leave requests in the system
- Tabbed interface (Pending, Approved, Rejected)
- Statistics cards for each status
- View full leave request details
- Approve pending requests
- Reject pending requests with reason
- Auto-refresh when page becomes visible

State Management:
- `leaves`: Array of all leaves
- `tabValue`: Current tab (0=Pending, 1=Approved, 2=Rejected)
- `isLoading`: Loading state
- `openDialog`: Dialog for actions
- `selectedLeave`: Leave being viewed/acted upon
- `rejectReason`: Reason for rejection

## Error Handling

### API Errors
- 400: Missing required fields or invalid date range
- 401: User not authenticated
- 403: Not authorized to modify this leave
- 404: Leave request not found
- 500: Server error

### Frontend Validation
- Required fields check
- Date validation (start date must be before end date)
- Confirmation dialogs for delete operations
- Toast notifications for all operations

## Key Implementation Details

1. **Authentication**: Uses JWT tokens in cookies, verified by `verifyToken` middleware
2. **User Context**: User ID obtained from `req.user.id` in JWT token
3. **Database**: All data persisted in MongoDB
4. **Real-time Updates**: Refresh button to load latest data
5. **Status Flow**: Pending → (Approved | Rejected)
6. **Auto-refresh**: Coordinator view auto-refreshes when tab becomes visible

## Testing Checklist

- [ ] Member can submit leave request
- [ ] Member can view their leave requests
- [ ] Member can edit pending leave requests
- [ ] Member can delete pending leave requests
- [ ] Member cannot edit/delete approved/rejected leaves
- [ ] Coordinator can view all pending leaves
- [ ] Coordinator can approve leave requests
- [ ] Coordinator can reject leave requests with reason
- [ ] Coordinator can view approved/rejected leaves
- [ ] Leave status changes are reflected immediately
- [ ] Days calculation is correct
- [ ] Form validation works (all fields required, valid dates)
- [ ] Authentication/authorization works
- [ ] Error messages are displayed correctly
- [ ] Toast notifications show for all operations

## Integration Notes

1. Ensure `verifyToken` middleware is applied to all leave routes
2. Member ID is extracted from JWT token (`req.user.id`)
3. Coordinator/Admin role verification can be added to routes if needed
4. Email notifications can be added for leave status changes
5. Leave quota tracking can be integrated with member model

## Future Enhancements

1. Email notifications on approval/rejection
2. Leave quota management per leave type
3. Holiday calendar integration
4. Multi-level approval (Member → Coordinator → Admin)
5. Leave balance dashboard
6. Export leave reports
7. Recurring leave patterns
8. Team member leave visibility for coordinators
