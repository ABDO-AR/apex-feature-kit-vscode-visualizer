# Apex Feature Kit — VS Code Visualizer

> by [Abdo AR](https://abdoar.com)

Feature-Driven Development visualizer for VS Code — sidebar tree + Mermaid flow diagram for your `.features/` workspace.

---

## Overview

This VS Code extension reads your project's `.features/` directory (created by [`@abdoar/apex-feature-kit`](https://www.npmjs.com/package/@abdoar/apex-feature-kit)) and provides two live, synced views of your feature pipeline:

- **Sidebar Tree** — Features with nested phase groups and task checklists. See exactly which tasks are done, in-progress, or not started — without opening the spec file.
- **Flow Diagram** — A Mermaid.js chronological flowchart in an editor tab, plus a feature dashboard with progress bars and task breakdowns.

Both views update in real-time when specs or `tree.yaml` change (via the AI agent or CLI). Zero hardcoded colors — everything adapts to your VS Code theme.

---

## Quick Start

1. Install the extension from the VS Code Marketplace (or the `.vsix` file)
2. Open a project that has a `.features/` directory
3. The extension auto-activates — the sidebar and flow diagram open automatically

No `.features/` yet? Install the CLI first:

```bash
npm install -g @abdoar/apex-feature-kit
apex-feature-kit init all
```

---

## Features

### Sidebar — Apex Features

A native TreeView in the Explorer sidebar showing:

- **Features** with state icons: completed (gold), in-progress (blue), pending-sync (gold), not-started (gray)
- **Phases** under each feature (collapsed groups from `### Phase` headers in specs)
- **Tasks** with check/unchecked icons matching `- [x]` / `- [ ]` in specs
- **Definition of Done** section with its own checklist
- Right-click to open a spec file or run `apex-feature-kit sync`

### Flow Diagram — Apex Project Flow

A WebviewPanel editor tab showing:

- **Mermaid.js flowchart** — Features sorted by `created_at`, connected with chronological arrows
- **Feature dashboard** — Cards with progress bars, task lists grouped by phase, and state badges
- Click any card to jump to its spec file

### Instructions

Click the book icon in the sidebar title bar, or run `Apex: Show Instructions` from the command palette. Opens `.features/instructions.md` in VS Code's native markdown preview.

### Live Updates

A `FileSystemWatcher` monitors `.features/**` — when the AI agent marks tasks `[x]` or the CLI runs `sync`, both the sidebar and flow diagram update instantly (with 300ms debounce to batch rapid changes).

---

## Commands

| Command | Description |
|---|---|
| `Apex: Open Flow Diagram` | Open or reveal the Mermaid flow tab |
| `Apex: Refresh Feature Tree` | Manually refresh the sidebar |
| `Apex: Open Feature Spec` | Open a spec file (prompts if multiple features) |
| `Apex: Run Sync` | Run `apex-feature-kit sync` in a terminal |
| `Apex: Show Instructions` | Open the AI protocol in markdown preview |

Sidebar title bar buttons: refresh, flow diagram, instructions.

---

## Feature States

The extension derives four states from `tree.yaml` and spec task checkboxes:

| State | Icon | Condition |
|---|---|---|
| **Completed** | Gold `pass-filled` | `completed_at` is set (sync ran after all tasks done) |
| **Sync Needed** | Gold `sync` | All tasks checked but `completed_at` is null — run `apex-feature-kit sync` |
| **In Progress** | Blue `loading~spin` | Some tasks checked, some not |
| **Not Started** | Gray `circle-outline` | No tasks checked yet |

---

## Theme Compatibility

All visual elements use VS Code's native theming:

- Sidebar icons use `vscode.ThemeIcon` (codicons) with `vscode.ThemeColor` keys
- Webview colors use `var(--vscode-*)` CSS variables
- Mermaid diagram colors are read at runtime via `getComputedStyle`

Works in Light+, Dark+, High Contrast, and any third-party theme. No hardcoded colors.

---

## Development

```bash
npm install           # Install dependencies
npm run compile       # Compile TypeScript to out/
npm run watch         # Auto-compile on file changes
```

Test in VS Code: press **F5** to launch the Extension Development Host. See [docs/guide.md](docs/guide.md) for full instructions.

---

## Author & Links

**Abdo AR** — Co-Founder & CTO | Software Engineer & UI/UX Expert

Empowering startups to build market-ready digital products — fast, scalable, and cost-effective.

- [abdoar.com](https://abdoar.com)
- [GitHub](https://github.com/ABDO-AR)
- [LinkedIn](https://www.linkedin.com/in/arfathielsayed/)
- [Upwork](https://www.upwork.com/freelancers/abdoa130) — Top Rated (top 10%)

---

## License

[MIT](https://github.com/ABDO-AR/apex-feature-kit-vscode-visualizer/blob/main/LICENSE)
