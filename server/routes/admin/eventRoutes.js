import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  submitFormResponse,
  getEventFormResponses,
  updateFormResponseStatus,
  addEventMembers,
  removeEventMembers,
  updateEventStatus,
  getEventsByStatus,
  linkGuestToEvent,
  updateEventBudget,
  addEventSponsor,
  addEventExpense,
  updateExpenseStatus,
  deleteEventExpense,
  addBudgetAllocation,
  deleteBudgetAllocation,
  getEventBudgetSummary,
  updateEventGallery,
  getEventGallery,
  deleteEventSponsor,
  getEventCount,
  migrateEventMembers,
  // Import the event members controller functions
  getEventWithMembers,
  updateAllEventTeams,
  updateEventTeam,
  addMembersToTeam,
  removeMembersFromTeam,
  getAvailableMembers
} from '../../controller/events/eventController.js';
import verifyRole from '../../middlewares/verifyRole.js';
import verifyToken from '../../middlewares/verifyToken.js';
import ifTokenVerify from '../../middlewares/ifTokenVerify.js';

const eventRouter = express.Router();

// Public routes (no auth required)
eventRouter.get('/counts', getEventCount);
eventRouter.get('/', getAllEvents);
eventRouter.get('/:id', getEventById);
eventRouter.get('/status/:status', getEventsByStatus);

// team-member addition and removal in event
eventRouter.get('/available-members', getAvailableMembers);
eventRouter.get('/:id/members', getEventWithMembers);
eventRouter.put('/:id/members', updateAllEventTeams);
eventRouter.put('/:id/members/team', updateEventTeam);
eventRouter.post('/:id/members/team/:teamType/add', addMembersToTeam);
eventRouter.delete('/:id/members/team/:teamType/members',  removeMembersFromTeam);

// Form response submission - public or authenticated
eventRouter.post('/:eventId/form-response', ifTokenVerify ,submitFormResponse);

// Protected routes (authentication required)
// Admin/Coordinator only routes - using verifyRole middleware
eventRouter.post('/', verifyToken, verifyRole(['admin', 'coordinator']), createEvent);
eventRouter.put('/:id', verifyToken, verifyRole(['admin', 'coordinator']), updateEvent);
eventRouter.delete('/:id', verifyToken, verifyRole(['admin', 'coordinator']), deleteEvent);
eventRouter.put('/:id/migrate/event-members', migrateEventMembers);

// Member management - admin/coordinator only
eventRouter.patch('/:id/members', verifyToken, verifyRole(['admin', 'coordinator']), addEventMembers);
eventRouter.patch('/:id/members/remove', verifyToken, verifyRole(['admin', 'coordinator']), removeEventMembers);

// Status management - admin/coordinator only
eventRouter.patch('/:id/status', verifyToken, verifyRole(['admin', 'coordinator']), updateEventStatus);

// Form responses - admin/coordinator only
eventRouter.get('/:eventId/form-responses', verifyToken, verifyRole(['admin', 'coordinator']), getEventFormResponses);
eventRouter.patch('/form-responses/:responseId/status', verifyToken, verifyRole(['admin', 'coordinator']), updateFormResponseStatus);

// Guest-event linking - admin/coordinator only
eventRouter.post('/link-guest', verifyToken, verifyRole(['admin', 'coordinator']), linkGuestToEvent);

// Gallery management - admin/coordinator only
eventRouter.patch('/:id/gallery', verifyToken, verifyRole(['admin', 'coordinator']), updateEventGallery);
eventRouter.get('/:id/gallery', getEventGallery); // Public access for viewing gallery

// Budget management - admin/coordinator only
eventRouter.put('/:id/budget', verifyToken, verifyRole(['admin', 'coordinator']), updateEventBudget);
eventRouter.get('/:id/budget', verifyToken, verifyRole(['admin', 'coordinator']), getEventBudgetSummary);
eventRouter.post('/:id/sponsors', verifyToken, verifyRole(['admin', 'coordinator']), addEventSponsor);
eventRouter.post('/:id/expenses', verifyToken, verifyRole(['admin', 'coordinator']), addEventExpense);
eventRouter.patch('/:id/expenses/:expenseId', verifyToken, verifyRole(['admin', 'coordinator']), updateExpenseStatus);
eventRouter.post('/:id/budget-allocations', verifyToken, verifyRole(['admin', 'coordinator']), addBudgetAllocation);
eventRouter.delete('/:id/budget-allocations/:allocationId', verifyToken, verifyRole(['admin', 'coordinator']), deleteBudgetAllocation);
eventRouter.delete('/:id/expenses/:expenseId', verifyToken, verifyRole(['admin', 'coordinator']), deleteEventExpense);
eventRouter.delete('/:id/sponsors/:sponsorId', verifyToken, verifyRole(['admin', 'coordinator']), deleteEventSponsor);

export default eventRouter;