---
description: Create a comprehensive feature spec from the user's context and codebase analysis
---

You are creating a new feature spec. The user has provided their feature context after the command.

## Instructions

1. Extract the feature context from the user's message (everything after `/new-feature`).
2. **ANALYZE THE CODEBASE FIRST** — Before writing the spec, you MUST explore the project to understand:
   - Tech stack (read package.json, tsconfig, config files)
   - Project structure (scan directories, naming conventions, file patterns)
   - Existing patterns (how are modules/routes/models/services structured?)
   - Related existing code (what code already exists that this feature touches?)
3. Read `.features/instructions.md` for the full spec format and writing rules.
4. Derive a concise feature title from the context.
5. Generate a slug (kebab-case) and filename: `YYYYMMDDHHmm-{slug}.md`
6. Generate a unique ID: `Date.now().toString(36)` equivalent
7. Write the spec file to `.features/specs/{filename}` following the COMPREHENSIVE format from `instructions.md`. The spec MUST include:
   - **Overview**: Clear description of the feature using the user's context
   - **Technical Context**: What you discovered from analyzing the codebase — tech stack, structure, patterns, related features
   - **Files to Create**: Every new file with full path and purpose (derived from codebase structure)
   - **Files to Modify**: Every existing file with specific changes (identified by scanning the codebase)
   - **Data Schema**: Database models, TypeScript types, interfaces (derived from the feature requirements AND existing model patterns)
   - **API / Interface**: Endpoints, function signatures, public APIs (following existing routing/controller patterns)
   - **Dependencies**: New packages needed (check what's already installed, only add what's missing)
   - **Implementation Tasks**: Ordered checklist grouped by phase — specific enough for a junior developer
   - **Definition of Done**: Quality gates for completion
   - **Notes**: Constraints, decisions, things to watch out for
8. Add the feature entry to `.features/tree.yaml`:
   - Read the current `tree.yaml`
   - Append a new entry with `id`, `file`, `title`, `created_at` (current ISO timestamp), `completed_at: null`
   - Write the updated `tree.yaml`
9. Confirm to the user: feature created with title, file path, and task count.

CRITICAL RULES:
- Do NOT ask the user for any additional input. Use only the context provided with the command.
- Do NOT write placeholder sections. Every section must have real, specific content.
- The spec MUST be comprehensive enough that a junior developer or a different AI can implement the feature by reading ONLY the spec file.
- You MUST analyze the codebase before writing. The spec must reflect the ACTUAL project, not assumptions.
- Write in plain English. Explain the "why" behind decisions, not just the "what".
