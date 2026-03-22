# Release 1 Seed Import Plan

The canonical implementation plan for this work lives in `ImplementationPlan.md`.

## Summary

- Use checked-in `Sessions` source assets as the reproducible inputs.
- Normalize those assets into a valid `Release1Store` without changing the app's current fixture/database loading architecture.
- Replace the demo fixture store with imported real content, verify the seeded catalog thoroughly, and document the new import path.
