/**
 * @file migrationRoutes.js
 * @description Administrative migration router facilitating data schema transitions for event-member relationships.
 * @architecture Mounted at `/api/admin/migration` in server/index.js, providing schema transition, verification, and rollback endpoints.
 * @agent_note Executes database schema updates; strictly protected by admin role.
 */
import express from 'express';
import { migrateEventMemberRelationship, verifyMigration, rollbackMigration } from '../../controller/admin/migrationController.js';
import verifyToken from '../../middlewares/verifyToken.js';
import verifyRole from '../../middlewares/verifyRole.js';

const migrationRouter = express.Router();

// Strictly Admin RBAC
migrationRouter.use(verifyToken, verifyRole(['admin']));

// Migration routes - protected by admin middleware
migrationRouter.post('/migrate-event-relationships', migrateEventMemberRelationship);
migrationRouter.get('/verify-migration', verifyMigration);
migrationRouter.post('/rollback-migration', rollbackMigration);

export default migrationRouter;
