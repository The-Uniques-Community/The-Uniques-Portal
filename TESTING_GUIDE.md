# Leave Management System - Quick Start & Testing Guide

## Quick Start

### 1. Backend Setup
```bash
# Navigate to server folder
cd server

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

The server should start on PORT (usually 5000 or specified in .env)

### 2. Frontend Verification
The frontend is already updated:
- Member Leave Management: `src/views/Uniques/Member/LeaveManagement/index.jsx`
- Coordinator Leave Management: `src/views/Uniques/Coordinator/LeaveManagement/index.jsx`

## Testing Workflow

### Test 1: Member Submits Leave Request

**Step 1**: Login as member
1. Go to member dashboard
2. Navigate to "Leave Management" in sidebar
3. Click "Request New Leave"

**Step 2**: Fill form
- Leave Type: Select from dropdown
- Start Date: Pick a future date
- End Date: Pick a date after start date
- Reason: Type a reason

**Step 3**: Submit
- Click "Submit" button
- Should see "Leave request submitted successfully" toast
- Leave should appear in table with status "Pending"

### Test 2: Coordinator Approves Leave

**Step 1**: Login as coordinator
1. Go to coordinator dashboard
2. Navigate to "Leave Management" in sidebar

**Step 2**: View Pending Leaves
- Should see "Pending" tab with submitted leave
- Leave should show member name, email, type, dates, days, reason, status

**Step 3**: Approve Leave
1. Click "Approve" button on the leave
2. Review leave details dialog
3. Click "Approve" button in dialog
4. Should see "Leave approved successfully" toast
5. Leave should move to "Approved" tab

### Test 3: Coordinator Rejects Leave

**Step 1**: Submit another leave request (repeat Test 1)

**Step 2**: Login as coordinator
1. Navigate to Leave Management
2. See new leave in "Pending" tab

**Step 3**: Reject Leave
1. Click "Reject" button
2. Enter rejection reason
3. Click "Reject" button
4. Should see success toast
5. Leave should move to "Rejected" tab with reason visible

### Test 4: Member Edits Pending Leave

**Step 1**: Login as member
1. Go to Leave Management
2. Click "Edit" on pending leave

**Step 2**: Update Details
- Change leave type, dates, or reason
- Click "Update"
- Should see success toast

**Step 3**: Verify Change
- Leave should reflect updated information

### Test 5: Member Deletes Pending Leave

**Step 1**: Login as member
1. Go to Leave Management
2. Click "Delete" on pending leave
3. Confirm deletion

**Step 2**: Verify
- Leave should be removed from list
- Should see success toast

### Test 6: Auto-refresh in Coordinator View

**Step 1**: Open Coordinator Leave Management
1. Switch to other browser tab
2. Wait a moment
3. Come back to Leave Management tab

**Step 2**: Verify
- Page should auto-refresh with latest data
- Note: Refresh button can be clicked manually too

## Verification Checklist

### Database Level
- [ ] MongoDB has `leaves` collection
- [ ] Leave documents contain all required fields
- [ ] Member references are valid ObjectIds

### API Level (using Postman or cURL)
- [ ] POST /api/leave/submit returns 201
- [ ] GET /api/leave/my-leaves returns 200
- [ ] PUT /api/leave/:id returns 200
- [ ] DELETE /api/leave/:id returns 200
- [ ] GET /api/leave/all returns 200
- [ ] PUT /api/leave/:id/approve returns 200
- [ ] PUT /api/leave/:id/reject returns 200

### Frontend Level
- [ ] Forms validate correctly
- [ ] Toast notifications appear
- [ ] Loading states work
- [ ] Data updates in real-time
- [ ] Error messages are clear

### Authentication
- [ ] Unauthenticated requests return 401
- [ ] Coordinator can only see leaves, not approve others' leaves if restricted
- [ ] Member can only see/edit their own leaves

## Expected Data Format

### Leave Request Object
```javascript
{
  _id: "507f1f77bcf86cd799439011", // MongoDB ID
  memberId: "507f1f77bcf86cd799439012", // Member's ID
  memberName: "John Doe",
  memberEmail: "john@example.com",
  memberPhone: "+91 9876543210",
  type: "Sick Leave",
  startDate: "2024-05-15T00:00:00.000Z",
  endDate: "2024-05-17T00:00:00.000Z",
  days: 3,
  reason: "Personal health issue",
  status: "Pending", // or "Approved", "Rejected"
  appliedDate: "2024-05-13T10:30:00.000Z",
  approvedBy: "Coordinator Name", // only if approved
  approvedDate: "2024-05-13T14:00:00.000Z", // only if approved
  rejectionReason: null, // only if rejected
  rejectedBy: null, // only if rejected
  rejectedDate: null, // only if rejected
  createdAt: "2024-05-13T10:30:00.000Z",
  updatedAt: "2024-05-13T14:00:00.000Z"
}
```

## Common Issues During Testing

### Issue: 401 Unauthorized Error
**Cause**: JWT token expired or missing
**Solution**: 
1. Log out and log in again
2. Check if cookies are enabled in browser
3. Check browser DevTools → Application → Cookies

### Issue: Leave form won't submit
**Cause**: Validation errors
**Solution**:
1. Check all fields are filled
2. Verify start date is before end date
3. Check date format (YYYY-MM-DD)
4. Check browser console for error messages

### Issue: Coordinator doesn't see any leaves
**Cause**: No leave requests in database yet
**Solution**:
1. Submit a leave request from member first
2. Check database directly: `db.leaves.find()`
3. Verify member ID is correct

### Issue: Can't edit/delete approved leaves
**Cause**: By design, only pending leaves can be edited
**Solution**: This is expected behavior - leaves become "locked" once approved/rejected

### Issue: Dates show incorrectly
**Cause**: Timezone differences
**Solution**:
1. Frontend converts to local timezone automatically
2. Backend stores in UTC (Z format)
3. Conversion is handled by JavaScript Date object

## Logs to Check

### Server Console
```
// Expected logs on leave submission:
Leave request submitted successfully
// or errors:
Error submitting leave request: [error message]
```

### Browser Console
```
// Check DevTools → Console for:
Failed to load leave requests: [error]
Error saving leave: [error]
```

### Network Tab
- Check request/response bodies
- Verify status codes (200, 201, 400, 401, 500)
- Confirm JSON format

## Performance Notes

- First load may take 2-3 seconds (API call + rendering)
- Subsequent actions are faster (cached data)
- Coordinator refresh auto-triggers every time tab becomes visible

## Security Considerations

- JWT token required for all endpoints
- User can only see/edit their own leaves (enforced in API)
- Member ID extracted from token, not request body
- Coordinator cannot modify completed actions (approved/rejected)

## Next Steps After Testing

1. **Integration**: Integrate with email notifications
2. **Enhancement**: Add leave quota management
3. **Reporting**: Create leave reports dashboard
4. **Approval Chain**: Implement multi-level approvals (Member → Coordinator → HR)
5. **Calendar**: Add leave calendar view
6. **Notifications**: Push notifications for status changes
