---
description: Implement a feature from its spec — the user provides which feature and any extra context
---

You are implementing a feature from its spec. The user has provided context after the command indicating which feature to implement and any additional instructions.

## Instructions

1. Read `.features/tree.yaml` to list all features.
2. Identify the target feature from the user's context. If the context doesn't clearly match a feature, list the features and pick the most relevant one.
3. Read the full spec file from `.features/specs/{filename}`.
4. Read `.features/instructions.md` for the protocol rules.
5. The spec contains EVERYTHING you need — Files to Create/Modify, Data Schema, API definitions, Implementation Tasks in order. Follow it precisely.
6. Implement tasks in the order specified in the spec's "Implementation Tasks" section. Each phase builds on the previous one.
7. After implementing each task, mark it as `[x]` in the spec file using the edit tool.
8. If the user's context included additional implementation details or constraints, incorporate them.
9. After all Implementation Tasks are done, address the "Definition of Done" items.
10. When all tasks are marked `[x]`, run `apex-feature-kit sync` in the terminal to auto-set the completion status in `tree.yaml`.

IMPORTANT: Do NOT ask the user which feature to implement — extract it from their context. Do NOT ask for confirmation before starting — begin implementation immediately. The spec is your blueprint — trust it.
