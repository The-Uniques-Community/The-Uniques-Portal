#!/usr/bin/env bash
# =============================================================================
# Backward Compatibility Wrapper
# Delegates execution to the cross-platform npm script 'dev:all'.
# =============================================================================
echo "==> Notice: 'run.sh' is deprecated. Delegating to 'npm run dev:all'..."
npm run dev:all "$@"
