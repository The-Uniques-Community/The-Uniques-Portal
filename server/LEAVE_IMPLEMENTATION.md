# Server-Side Leave Management Implementation Guide

## Files Added/Modified

### New Files:
1. **server/models/member/leaveModel.js** - MongoDB schema for leave requests
2. **server/controller/member/leaveController.js** - Business logic for leave management
3. **server/routes/member/leaveRoute.js** - Express routes for leave API endpoints

### Modified Files:
1. **server/index.js** - Added leave routes registration

## Architecture

```
Client (React)
    ↓
API Requests (fetch)
    ↓
Express Routes (/api/leave/*)
    ↓
verifyToken Middleware
    ↓
Controllers (leaveController.js)
    ↓
MongoDB Models (leaveModel.js)
    ↓
Database (MongoDB)
```

## Endpoint Breakdown

### Member Endpoints
- `POST /api/leave/submit` - Create new leave request
- `GET /api/leave/my-leaves` - Get user's leaves
- `PUT /api/leave/:id` - Update pending leave
- `DELETE /api/leave/:id` - Delete pending leave

### Admin/Coordinator Endpoints
- `GET /api/leave/all` - Get all leaves (with optional status filter)
- `GET /api/leave/pending` - Get pending leaves only
- `GET /api/leave/:id` - Get single leave details
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave

## Authentication Flow

1. User logs in → JWT token created in cookie
2. Frontend sends requests with `credentials: "include"`
3. `verifyToken` middleware extracts token from cookie
4. Token is decoded, user info attached to `req.user`
5. Controllers access member ID via `req.user.id`

## Error Scenarios & Handling

### Submit Leave
- Validation: All fields required
- Validation: startDate <= endDate
- Validation: Date range must be valid
- Error: Member not found
- Error: Database save fails

### Update Leave
- Check: Leave exists
- Check: Belongs to current member
- Check: Status is "Pending"
- Error: Non-pending leaves cannot be edited

### Delete Leave
- Check: Leave exists
- Check: Belongs to current member
- Check: Status is "Pending"

### Approve Leave
- Check: Leave exists
- Check: Status is "Pending"
- Action: Set status to "Approved", add approver details

### Reject Leave
- Check: Leave exists
- Check: Status is "Pending"
- Check: Rejection reason provided
- Action: Set status to "Rejected", add rejection details

## Database Queries

### Finding Leave by ID
```javascript
Leave.findById(id)
Leave.findById(id).populate("memberId", "fullName email contact")
```

### Finding User's Leaves
```javascript
Leave.find({ memberId: userId })
Leave.find({ memberId: userId }).sort({ appliedDate: -1 })
```

### Finding by Status
```javascript
Leave.find({ status: "Pending" })
Leave.find({ status: "Approved" })
Leave.find({ status: "Rejected" })
```

## Important Notes

1. **Date Handling**: Ensure consistent date format (ISO 8601)
2. **Days Calculation**: `Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1`
3. **User ID**: Always from JWT token (`req.user.id`), not from request body
4. **Status Values**: "Pending" (default), "Approved", "Rejected"
5. **Timestamps**: Created/Updated timestamps managed by MongoDB

## Testing with cURL

### Submit Leave
```bash
curl -X POST http://localhost:3000/api/leave/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "type": "Sick Leave",
    "startDate": "2024-05-15",
    "endDate": "2024-05-17",
    "reason": "Fever"
  }'
```

### Get My Leaves
```bash
curl -X GET http://localhost:3000/api/leave/my-leaves \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Get All Leaves
```bash
curl -X GET http://localhost:3000/api/leave/all \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

### Approve Leave
```bash
curl -X PUT http://localhost:3000/api/leave/LEAVE_ID/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "approvedBy": "Admin Name"
  }'
```

### Reject Leave
```bash
curl -X PUT http://localhost:3000/api/leave/LEAVE_ID/reject \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "rejectionReason": "Insufficient balance",
    "rejectedBy": "Admin Name"
  }'
```

## Debugging

### Enable Logging
Add these lines to controllers for debugging:
```javascript
console.log("memberId:", memberId);
console.log("User from token:", req.user);
console.log("Leave found:", leave);
```

### Check MongoDB Connection
Ensure `dbconnect()` is called in `server/index.js` before routes are registered.

### Verify Routes Registration
In `server/index.js`, check:
```javascript
import leaveRoute from "./routes/member/leaveRoute.js";
app.use("/api/leave", leaveRoute);
```

### Test with Postman
1. Set cookie in Postman settings: `token=YOUR_JWT_TOKEN`
2. Send requests to `http://localhost:PORT/api/leave/*`
3. Check response status and body

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: JWT token missing or expired. Re-login to get new token.

### Issue: 400 Bad Request - "Member not found"
**Solution**: Member ID in token might not exist in database. Verify member is created first.

### Issue: 404 Leave not found
**Solution**: Check leave ID is valid and belongs to correct database.

### Issue: Cannot update/delete approved leave
**Solution**: By design, only "Pending" leaves can be edited/deleted.

### Issue: Coordinator can't see any leaves
**Solution**: Ensure members have submitted leave requests, check database for records.
