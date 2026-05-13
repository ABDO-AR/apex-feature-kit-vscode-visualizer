# Apex Feature Kit — VS Code Extension Guide

## Prerequisites

- Node.js 18+
- VS Code 1.85+
- The `apex-feature-kit` CLI installed globally (`npm install -g @abdoar/apex-feature-kit`)
- A project with a `.features/` directory (run `apex-feature-kit init all` in your project first)

## Setup

```bash
cd apex-feature-kit-vscode-visualizer
npm install
```

## Compile

```bash
npm run compile
```

Output goes to `out/`. TypeScript source is in `src/`.

To auto-compile on file changes:

```bash
npm run watch
```

## Test the Extension

### Step 1: Open the extension project in VS Code

```bash
cd apex-feature-kit-vscode-visualizer
code .
```

### Step 2: Press F5

This launches a new **Extension Development Host** VS Code window with the extension loaded. The launch config is in `.vscode/launch.json`.

### Step 3: Open a project that has `.features/`

In the Extension Development Host window, open a workspace that contains a `.features/` directory (e.g., the `apex-feature-kit` project).

### Step 4: Verify the extension works

1. **Sidebar** — Look for "Apex Features" in the Explorer sidebar. Features from `tree.yaml` should appear with state icons (gold check for completed, spinning blue for in-progress, outline for not-started).

2. **Expand features** — Click a feature to see phases, then click a phase to see individual tasks with check/unchecked icons.

3. **Flow tab** — Should auto-open showing a Mermaid.js diagram of your features. If not, click the graph icon in the sidebar title bar, or run `Apex: Open Flow Diagram` from the command palette.

4. **Instructions** — Click the book icon in the sidebar title bar, or run `Apex: Show Instructions` to open the AI protocol in markdown preview.

5. **Theme switch** — Switch VS Code themes (Ctrl+K Ctrl+T) to verify icons and webview colors adapt correctly.

### Step 5: Make changes and reload

If you edit source files while the Extension Development Host is running:

1. Run `npm run compile` (or have `npm run watch` running)
2. In the Extension Development Host, press `Ctrl+R` to reload the window
3. Your changes take effect immediately

## Publish to VS Code Marketplace

### One-time setup

1. Create a [Publisher ID](https://marketplace.visualstudio.com/manage) on the VS Code Marketplace
2. Install the packaging tool:

```bash
npm install -g @vscode/vsce
```

3. Log in with your publisher:

```bash
vsce login <your-publisher-id>
```

Update `publisher` in `package.json` to match your Publisher ID.

### Package as .vsix

```bash
vsce package
```

This creates `apex-feature-kit-vscode-visualizer-0.1.0.vsix` in the project root. You can install it locally for testing:

```bash
code --install-extension apex-feature-kit-vscode-visualizer-0.1.0.vsix
```

### Publish

```bash
vsce publish
```

This packages and uploads to the marketplace in one step.

### Publish a new version

```bash
vsce publish patch   # 0.1.0 → 0.1.1
vsce publish minor    # 0.1.0 → 0.2.0
vsce publish major    # 0.1.0 → 1.0.0
```

## Unpublish

```bash
vsce unpublish <publisher>.<extension-name>
```
