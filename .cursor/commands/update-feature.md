---
description: Update or modify the details of an existing feature spec — user provides which feature and what to change
---

You are updating an existing feature spec. The user has provided context after the command indicating which feature to update and what changes to make.

## Instructions

1. Read `.features/tree.yaml` to list all features.
2. Identify the target feature from the user's context.
3. Read the full spec file from `.features/specs/{filename}`.
4. Read `.features/instructions.md` for the protocol and spec format rules.
5. If the update affects technical details (new files, schema changes, API changes), **re-analyze the relevant parts of the codebase** to ensure the updated spec remains accurate and grounded in the real project.
6. Apply the user's requested changes to the spec file. Common updates include:
   - **Overview**: Modify or expand the description
   - **Files to Create/Modify**: Add or remove files, update change descriptions
   - **Data Schema**: Add/remove fields, change types, add new models
   - **API / Interface**: Add/remove endpoints, change signatures
   - **Dependencies**: Add/remove packages
   - **Implementation Tasks**: Add new `- [ ]` items, remove obsolete ones, reorder if dependency order changed
   - **Definition of Done**: Add or refine quality gates
   - **Notes**: Append new constraints or decisions
7. Use the edit tool to apply changes. Preserve the spec format defined in `instructions.md`.
8. Do NOT modify `tree.yaml` directly. Title and metadata sync on next `apex-feature-kit sync`.
9. Confirm the changes to the user by showing what was updated.

IMPORTANT: Do NOT ask the user what they want to update — extract it from their context. Apply changes immediately and report what was changed. Keep the spec comprehensive and self-contained after the update.
