# Apex Feature Kit - AI Protocol

You are operating within the Feature-Driven Development (FDD) framework powered by @abdoar/apex-feature-kit.

## Core Rules

1. **Read `.features/tree.yaml` first** — Always check the master index for the current feature list and status before taking any action.
2. **Never modify `tree.yaml` directly** — Only `apex-feature-kit sync` can update `tree.yaml`. The AI must never write to it.
3. **Mark tasks as `[x]` only when verified** — Do not check off tasks prematurely. Only mark a task complete when the implementation is confirmed working.
4. **After completing all tasks in a feature, run `apex-feature-kit sync`** — This is the only way to set `completed_at` in `tree.yaml`.
5. **Respect the spec format** — Every spec file in `.features/specs/` must follow the comprehensive structure defined below.
6. **Specs must be self-contained** — A junior developer or a different AI should be able to read a spec file and implement the feature with NO other context. The spec IS the blueprint.

## Feature Spec File Format

Every spec file must follow this comprehensive structure. Each section is required unless marked optional. Write in plain, clear English that a junior developer can understand.

```markdown
# {Feature Title}

> Created: {ISO 8601 timestamp}
> ID: {unique id}
> Status: In Progress

---

## Overview

Plain-English description of what this feature does and why. Include the user's original context. A junior developer should read this and immediately understand the feature's purpose.

## Technical Context

What you discovered by analyzing the codebase before writing this spec. This grounds the feature in the real project:

- **Tech Stack**: Framework, language, runtime, database — derived from package.json, config files, existing code
- **Project Structure**: How the codebase is organized — key directories, naming conventions, file patterns
- **Existing Patterns**: Coding patterns, architectural conventions, and frameworks already in use that this feature should follow
- **Related Features**: Links to other spec files in .features/specs/ that are related or depend on this feature

## Files to Create

Every new file that needs to be created, with full path and purpose:

| File Path | Purpose |
|---|---|
| `path/to/new/file.ts` | What this file does |

## Files to Modify

Every existing file that needs changes, with specific changes described:

| File Path | Changes |
|---|---|
| `path/to/existing/file.ts` | What specifically needs to change |

## Data Schema

Database models, TypeScript types, interfaces, enums — the full data shapes this feature introduces. Use tables for database models and code blocks for types. Be explicit about field types, constraints, and relationships.

## API / Interface

All endpoints, function signatures, public APIs, or interfaces this feature exposes. Use tables for REST endpoints (Method, Path, Auth, Request, Response, Description). Use code blocks for function signatures and event interfaces.

## Dependencies

New packages, libraries, or external services this feature requires:

| Package | Version | Purpose |
|---|---|---|
| `package-name` | ^1.0.0 | Why it's needed |

## Implementation Tasks

Granular, ordered checklist of every task needed. Organized into sub-sections by phase (Setup, Core Logic, Integration, Testing, etc.). Each task must be specific enough that a junior developer knows exactly what to do. Ordered by dependency — earlier tasks unblock later ones.

### Phase Name

- [ ] Specific, actionable task
- [ ] Another task

## Definition of Done

Completion criteria that must ALL be true before the feature can be considered complete. These are higher-level quality gates, not individual tasks.

- [ ] All implementation tasks are completed
- [ ] Code passes lint and type checks
- [ ] No regressions in existing features

## Notes

Additional context, constraints, decisions, things to watch out for, or deferred items. Anything that helps the implementer avoid pitfalls.
```

## Spec Writing Rules

When writing a spec with `/new-feature`, you MUST:

1. **Analyze the codebase first** — Before writing anything, scan the project to understand the tech stack, directory structure, existing patterns, and conventions. The spec must reflect the ACTUAL project, not assumptions.
2. **Be exhaustive** — Include EVERY file that will be created or modified. Include full type definitions. Include exact API endpoint signatures. A developer reading the spec should never need to ask "what about X?"
3. **Be specific** — "Add a route" is bad. "Add `POST /auth/login` to `src/routes/index.ts` that calls `authController.login` and returns `{ user, tokens }`" is good.
4. **Order tasks by dependency** — Setup tasks first, then core logic, then integration, then testing. Earlier tasks unblock later ones.
5. **Write for juniors** — Use plain English. Explain WHY, not just WHAT. Include examples where helpful.
6. **No placeholder sections** — Every section must have real content derived from analyzing the codebase and the user's context. Never leave a section as "TBD" or "TODO".

## Filename Convention

Spec files are named: `YYYYMMDDHHmm-slug-name.md`
- Timestamp: current date/time when the spec is created
- Slug: kebab-case version of the feature title

Examples:
- `202605121730-auth-system.md`
- `202605140930-user-profile-page.md`
- `202605151200-payment-integration.md`

## tree.yaml Structure

```yaml
# Apex Feature Kit - Master Index
features:
  - id: "m4q7r2k"
    file: "specs/202605121730-auth-system.md"
    title: "Auth System"
    created_at: "2026-05-12T17:30:00.000Z"
    completed_at: null
```

- `id`: Unique identifier (base-36 timestamp)
- `file`: Relative path to the spec markdown file
- `title`: Human-readable feature name
- `created_at`: ISO 8601 timestamp when the spec was created
- `completed_at`: ISO 8601 timestamp when ALL tasks were marked `[x]` (set automatically by `apex-feature-kit sync` — never by the AI)

## Workflow

1. **Create** → `/new-feature {context}` → AI analyzes codebase, writes comprehensive spec + adds tree.yaml entry
2. **Implement** → `/implement-feature {context}` → AI builds from spec, marks tasks `[x]`
3. **Verify** → `/verify-feature {context}` → AI audits implementation against spec
4. **Update** → `/update-feature {context}` → AI modifies spec details
5. **Complete** → AI runs `apex-feature-kit sync` → CLI auto-stamps `completed_at`
