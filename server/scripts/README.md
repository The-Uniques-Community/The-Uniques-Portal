# Production Database Migration Scripts

This directory houses mission-critical database schema migration and reconciliation utilities for the Uniques Portal backend.

> [!WARNING]
> These scripts mutate production MongoDB collections. Always execute with `--dry-run` first and verify with the technical lead before running in production.

---

## Migration Utilities

### 1. `migrate_files_to_embedded.js`
- **Purpose**: Converts standalone, normalized `File` model references (ObjectIds) into embedded subdocuments across `members`, `trainers`, `events`, `users`, and `formresponses`.
- **Usage**:
  ```bash
  # Dry run (safe inspection mode)
  node server/scripts/migrate_files_to_embedded.js --dry-run

  # Execute migration with automated backup
  node server/scripts/migrate_files_to_embedded.js --backup
  ```

### 2. `migrateToUnifiedUser.js`
- **Purpose**: Consolidates legacy separate collections (`Member`, `Admin`, `CommunityAdmin`) into the unified `users` collection utilizing Mongoose discriminators (`role: "member" | "admin" | "coordinator"`).
- **Usage**:
  ```bash
  # Dry run
  node server/scripts/migrateToUnifiedUser.js --dry-run

  # Live migration (automatically creates backup_<TIMESTAMP>_ collections)
  node server/scripts/migrateToUnifiedUser.js
  ```

### 3. `rollbackUnifiedUser.js`
- **Purpose**: Rollback mechanism that restores pre-migration collections from timestamped backups if any discrepancy is detected post-migration.
- **Usage**:
  ```bash
  node server/scripts/rollbackUnifiedUser.js --restore-collections <TIMESTAMP>
  ```

### 4. `testUnifiedUserVerification.js`
- **Purpose**: Diagnostic test suite validating schema virtuals, discriminator queries, populates, and authentication queries against the unified `users` collection.
- **Usage**:
  ```bash
  node server/scripts/testUnifiedUserVerification.js
  ```
