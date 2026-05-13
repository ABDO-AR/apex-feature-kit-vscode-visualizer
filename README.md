<div align="center">
  <img src="resources/logo.png" width="128" height="128" alt="Apex Feature Kit Logo" />
  <h1>Apex Feature Kit</h1>
  <p>Feature-Driven Development visualizer for VS Code</p>
  <p>
    <a href="https://github.com/ABDO-AR/apex-feature-kit-vscode-visualizer"><img src="https://img.shields.io/badge/GitHub-Repository-blue" alt="GitHub" /></a>
    <img src="https://img.shields.io/badge/VS_Code-1.85%2B-blue" alt="VS Code" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  </p>
</div>

---

> by [Abdo AR](https://abdoar.com)

This VS Code extension reads your project's `.features/` directory (created by [`@abdoar/apex-feature-kit`](https://www.npmjs.com/package/@abdoar/apex-feature-kit)) and provides live, synced views of your feature pipeline:

- **Sidebar Views** — Features, Tree, and Instructions panels in a dedicated Activity Bar section with state icons, expand/collapse, and inline actions
- **Flow Diagram** — Interactive split-view with flow nodes, detail panel, accordion task lists, and PNG export

Both views update in real-time when specs or `tree.yaml` change (via the AI agent or CLI). Everything adapts to your VS Code theme.

---

## Quick Start

1. Install the extension from the VS Code Marketplace (or the `.vsix` file)
2. Open a project that has a `.features/` directory
3. The extension auto-activates — click the Apex icon in the Activity Bar

No `.features/` yet? Install the CLI first:

```bash
npm install -g @abdoar/apex-feature-kit
apex-feature-kit init all
```

---

## Sidebar Views

The extension adds a dedicated **Apex Feature Kit** icon to the Activity Bar with three panels:

### Features

A native TreeView showing:

- **Features** with state-colored filled circles: completed (green), in-progress (orange), not-started (gray), sync-needed (yellow)
- **Phases** under each feature (collapsed groups from `### Phase` headers in specs)
- **Tasks** with check/unchecked icons matching `- [x]` / `- [ ]` in specs
- **Definition of Done** section with its own checklist
- Inline actions: open spec, expand/collapse, run sync
- Toolbar: refresh, flow diagram, instructions, toggle expand/collapse

### Tree

A flat view of `tree.yaml` entries:

- `tree.yaml` file node (click to open)
- Each feature as a checklist item with state icon and task counts
- Inline actions: open spec, run sync
- Toolbar: refresh, open tree.yaml, toggle expand/collapse

### Instructions

Hierarchical view of `.features/instructions.md`:

- `instructions.md` file node (click to open)
- Sections parsed from headings (h1 → h2 → h3 hierarchy)
- Click any section to jump to that line in the file
- Toolbar: open instructions, toggle expand/collapse

---

## Flow Diagram

An interactive WebviewPanel with:

- **Toolbar** — Refresh, Expand/Collapse, Export PNG
- **Flow Panel** (left) — Clickable nodes with state-colored progress bars; single-click selects, double-click opens spec
- **Detail Panel** (right) — Selected feature's stats, progress bar, overview, accordion phases with task checkboxes, and DoD section
- **PNG Export** — Renders the diagram to canvas and saves via save dialog

---

## Commands

| Command | Description |
|---|---|
| `Apex: Open Flow Diagram` | Open or reveal the interactive flow tab |
| `Apex: Refresh Feature Tree` | Manually refresh all sidebar views |
| `Apex: Open Feature Spec` | Open a spec file directly |
| `Apex: Run Sync` | Run `apex-feature-kit sync` in a terminal |
| `Apex: Show Instructions` | Open the AI protocol in markdown preview |
| `Apex: Open tree.yaml` | Open the tree.yaml file |
| `Apex: Toggle Expand Features` | Expand/collapse all features in sidebar |
| `Apex: Toggle Expand Tree` | Expand/collapse tree view |
| `Apex: Toggle Expand Instructions` | Expand/collapse instructions view |
| `Apex: Toggle Expand Feature` | Expand/collapse a single feature's tasks |

---

## Feature States

| State | Icon | Condition |
|---|---|---|
| **Completed** | Green filled circle | `completed_at` is set |
| **In Progress** | Orange filled circle | Some tasks checked, some not |
| **Sync Needed** | Yellow sync icon | All tasks checked but `completed_at` is null |
| **Not Started** | Gray filled circle | No tasks checked yet |

---

## Theme Compatibility

All visual elements use VS Code's native theming:

- Sidebar icons use `vscode.ThemeIcon` with `vscode.ThemeColor` keys
- Webview colors use `var(--vscode-*)` CSS variables
- Inline png icons (no external font dependencies)
- Works in Light+, Dark+, High Contrast, and any third-party theme

---

## Development

```bash
npm install           # Install dependencies
npm run compile       # Compile TypeScript to out/
npm run watch         # Auto-compile on file changes
```

Test in VS Code: press **F5** to launch the Extension Development Host.

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
