---
description: Verify the implementation of a feature against its spec — user provides which feature and verification scope
---

You are verifying a feature's implementation against its spec. The user has provided context after the command indicating which feature to verify and any specific concerns.

## Instructions

1. Read `.features/tree.yaml` to list all features.
2. Identify the target feature from the user's context. If unclear, pick the most recently active feature.
3. Read the full spec file from `.features/specs/{filename}`.
4. Read `.features/instructions.md` for the protocol rules.
5. Verify against EVERY section of the spec, not just the tasks:
   - **Files to Create**: Do all listed files exist? Do they serve their stated purpose?
   - **Files to Modify**: Were the specified changes actually made in those files?
   - **Data Schema**: Do the actual types/models match what's defined in the spec?
   - **API / Interface**: Do the endpoints match the spec? Correct methods, paths, request/response shapes?
   - **Dependencies**: Are all listed packages installed?
   - **Implementation Tasks**: For each checked task (`- [x]`), verify the implementation actually exists and works. For each unchecked task (`- [ ]`), confirm it's genuinely incomplete.
   - **Definition of Done**: Audit all quality gates.
6. Report findings in a structured format:
   - **Verified**: Sections/tasks confirmed working and matching spec
   - **Gaps**: Spec says X but implementation does Y (or is missing)
   - **Incomplete**: Tasks still `[ ]` with notes on what's needed
   - **Regressions**: Any new issues introduced in existing code
7. If the user's context mentioned specific areas to focus on, prioritize those in the verification.
8. If verification reveals falsely completed tasks, unmark them (change `[x]` back to `[ ]`).
9. Do NOT run `apex-feature-kit sync` unless all tasks genuinely pass verification.

IMPORTANT: Do NOT ask the user which feature to verify — extract it from their context. Perform the verification silently and report results.
