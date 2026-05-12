// routes/migrationRoutes.js
import express from 'express';
import { migrateEventMemberRelationship, verifyMigration, rollbackMigration } from '../../controller/admin/migrationController.js';
// Ensure only admins can run migrations

const migrationRouter = express.Router();

// Migration routes - protected by admin middleware
migrationRouter.post('/migrate-event-relationships', migrateEventMemberRelationship);
migrationRouter.get('/verify-migration', verifyMigration);
migrationRouter.post('/rollback-migration', rollbackMigration);

export default migrationRouter;

