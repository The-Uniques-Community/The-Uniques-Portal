# Diagnostic & Scratch Scripts Registry

This directory contains standalone developer diagnostic scripts, collection inspectors, and isolated verification test harnesses.

> [!NOTE]
> These scripts are excluded from CI linting via `eslint.config.js` (`server/scratch/**`). They are intended for developer troubleshooting, offline database verification, and testing.

---

## Script Catalog

| Script | Responsibility |
| :--- | :--- |
| `check-db.js` | Basic MongoDB connection ping and collection names inspector. |
| `clone_database.js` | Dual-connection cross-cluster database cloning utility. |
| `inspect_counts.js` | Inspects document counts across all database collections. |
| `test_all_crud.js` | End-to-end CRUD verification across database models. |
| `test_clone_connections.js` | Validates source and target MongoDB connection strings. |
| `verify_batch_schemas.js` | Validates batch documents against schema constraints. |
| `verify_db_conn.js` | Verifies latency and replica set status of MongoDB. |
| `verify_file_migration.js` | Verifies file embedding post-migration. |
| `verify_password_reset.js` | Tests OTP generation, expiration, and password reset flow. |
| `verify_project_upload.js` | Validates multipart image upload integration. |
| `verify_schemas_and_models.js` | Validates that all Mongoose models compile and instantiate correctly. |
| `verify_server_routes.js` | Traverses the Express router stack and prints registered paths. |
