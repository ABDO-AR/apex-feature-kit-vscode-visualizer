import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FeatureReader } from './data/feature-reader.js';
import { startWatching } from './data/watcher.js';
import { ApexTreeProvider, FeatureNode } from './sidebar/tree-provider.js';
import { InstructionsTreeProvider } from './sidebar/instructions-tree.js';
import { TreeYamlProvider } from './sidebar/tree-yaml-provider.js';
import { ApexFlowPanel } from './webview/flow-panel.js';
import { showInstructions } from './instructions/instructions-panel.js';
import { VIEW_ID, CMD, CONTEXT_KEY, FEATURES_DIR, TREE_FILE } from './shared/constants.js';
import type { EnrichedFeature } from './shared/types.js';

const INSTRUCTIONS_VIEW_ID = 'apexInstructions';
const TREE_YAML_VIEW_ID = 'apexTreeYaml';

async function expandAllInView<T>(
  view: vscode.TreeView<T>,
  provider: vscode.TreeDataProvider<T>,
  maxDepth: number = 3
): Promise<void> {
  async function expandLevel(elements: T[] | null | undefined, depth: number): Promise<void> {
    if (!elements || depth > maxDepth) return;
    for (const el of elements) {
      await view.reveal(el, { expand: true, select: false, focus: false });
      const children = await provider.getChildren(el);
      if (children) await expandLevel(children, depth + 1);
    }
  }
  const roots = await provider.getChildren();
  await expandLevel(roots, 1);
}

class ExpandStateTracker {
  private state = new Map<string, boolean>();

  isExpanded(key: string): boolean {
    return this.state.get(key) ?? false;
  }

  toggle(key: string): boolean {
    const next = !this.isExpanded(key);
    this.state.set(key, next);
    return next;
  }

  all(): IterableIterator<[string, boolean]> {
    return this.state.entries();
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const reader = new FeatureReader(workspaceRoot);
  const treeProvider = new ApexTreeProvider();
  const instructionsProvider = new InstructionsTreeProvider(workspaceRoot);
  const treeYamlProvider = new TreeYamlProvider(workspaceRoot);
  const expandTracker = new ExpandStateTracker();

  const featuresView = vscode.window.createTreeView(VIEW_ID, { treeDataProvider: treeProvider });
  const treeYamlView = vscode.window.createTreeView(TREE_YAML_VIEW_ID, { treeDataProvider: treeYamlProvider });
  const instructionsView = vscode.window.createTreeView(INSTRUCTIONS_VIEW_ID, { treeDataProvider: instructionsProvider });

  const openFlow = vscode.commands.registerCommand(CMD.openFlow, async () => {
    const features = await reader.readTree();
    ApexFlowPanel.createOrShow(context.extensionUri, features);
  });

  const refreshTree = vscode.commands.registerCommand(CMD.refreshTree, async () => {
    const features = await reader.readTree();
    treeProvider.refresh(features);
    treeYamlProvider.refresh(features);
    instructionsProvider.refresh();
  });

  const openSpec = vscode.commands.registerCommand(CMD.openSpec, async (arg: EnrichedFeature | { feature: EnrichedFeature } | string | undefined) => {
    let specPath: string | undefined;

    if (arg && typeof arg === 'object') {
      const feature = 'feature' in arg ? arg.feature : arg;
      if ('file' in feature) {
        specPath = reader.specPath((feature as EnrichedFeature).file);
      }
    } else if (typeof arg === 'string') {
      const features = await reader.readTree();
      const match = features.find(f =>
        f.id === arg || f.title.toLowerCase().includes(arg.toLowerCase())
      );
      if (match) specPath = reader.specPath(match.file);
    }

    if (!specPath) {
      const features = await reader.readTree();
      if (features.length === 1) {
        specPath = reader.specPath(features[0].file);
      } else if (features.length > 1) {
        const pick = await vscode.window.showQuickPick(
          features.map(f => ({ label: f.title, detail: f.file, feature: f })),
          { placeHolder: 'Select a feature spec to open' }
        );
        if (pick) specPath = reader.specPath(pick.feature.file);
      }
    }

    if (specPath && fs.existsSync(specPath)) {
      const doc = await vscode.workspace.openTextDocument(specPath);
      vscode.window.showTextDocument(doc, { preview: true });
    }
  });

  const runSync = vscode.commands.registerCommand(CMD.runSync, () => {
    const terminal = vscode.window.createTerminal('Apex Sync');
    terminal.sendText('apex-feature-kit sync');
    terminal.show();
  });

  const showInstructionsCmd = vscode.commands.registerCommand(CMD.showInstructions, () => {
    showInstructions(workspaceRoot);
  });

  const openTreeYaml = vscode.commands.registerCommand(CMD.openTreeYaml, () => {
    const tp = path.join(workspaceRoot, FEATURES_DIR, TREE_FILE);
    if (fs.existsSync(tp)) {
      const doc = vscode.workspace.openTextDocument(tp);
      doc.then(d => vscode.window.showTextDocument(d, { preview: true }));
    }
  });

  const toggleExpandFeatures = vscode.commands.registerCommand(CMD.toggleExpandFeatures, async () => {
    const expanded = expandTracker.toggle(VIEW_ID);
    if (expanded) {
      await expandAllInView(featuresView, treeProvider);
    } else {
      vscode.commands.executeCommand('workbench.actions.treeView.apexFeatureTree.collapseAll');
    }
  });

  const toggleExpandTree = vscode.commands.registerCommand(CMD.toggleExpandTree, async () => {
    const expanded = expandTracker.toggle(TREE_YAML_VIEW_ID);
    if (expanded) {
      await expandAllInView(treeYamlView, treeYamlProvider);
    } else {
      vscode.commands.executeCommand('workbench.actions.treeView.apexTreeYaml.collapseAll');
    }
  });

  const toggleExpandInstructions = vscode.commands.registerCommand(CMD.toggleExpandInstructions, async () => {
    const expanded = expandTracker.toggle(INSTRUCTIONS_VIEW_ID);
    if (expanded) {
      await expandAllInView(instructionsView, instructionsProvider);
    } else {
      vscode.commands.executeCommand('workbench.actions.treeView.apexInstructions.collapseAll');
    }
  });

  const toggleExpandFeature = vscode.commands.registerCommand(CMD.toggleExpandFeature, async (node: FeatureNode) => {
    const key = `${VIEW_ID}:${node.featureId}`;
    const expanded = expandTracker.toggle(key);
    if (expanded) {
      await featuresView.reveal(node, { expand: true, select: false, focus: false });
      const children = await treeProvider.getChildren(node);
      if (children) {
        for (const child of children) {
          await featuresView.reveal(child, { expand: true, select: false, focus: false });
        }
      }
    } else {
      await vscode.commands.executeCommand('workbench.actions.treeView.apexFeatureTree.collapseAll');
      for (const [k, isOpen] of expandTracker.all()) {
        if (isOpen && k.startsWith(`${VIEW_ID}:`) && k !== key) {
          const fid = k.replace(`${VIEW_ID}:`, '');
          const feature = treeProvider.findFeatureNode(fid);
          if (feature) {
            await featuresView.reveal(feature, { expand: true, select: false, focus: false });
            const children = await treeProvider.getChildren(feature);
            if (children) {
              for (const child of children) {
                await featuresView.reveal(child, { expand: true, select: false, focus: false });
              }
            }
          }
        }
      }
    }
  });

  const watcher = startWatching(workspaceRoot, async () => {
    const features = await reader.readTree();
    treeProvider.refresh(features);
    treeYamlProvider.refresh(features);
    instructionsProvider.refresh();
    if (ApexFlowPanel.currentPanel) {
      ApexFlowPanel.currentPanel.update(features);
    }
    vscode.commands.executeCommand('setContext', CONTEXT_KEY, reader.hasFeaturesDir());
  });

  if (reader.hasFeaturesDir()) {
    reader.readTree().then(features => {
      treeProvider.refresh(features);
      treeYamlProvider.refresh(features);
      instructionsProvider.refresh();
      vscode.commands.executeCommand(CMD.openFlow);
    });
  }

  vscode.commands.executeCommand('setContext', CONTEXT_KEY, reader.hasFeaturesDir());

  context.subscriptions.push(
    featuresView,
    treeYamlView,
    instructionsView,
    openFlow,
    refreshTree,
    openSpec,
    openTreeYaml,
    runSync,
    showInstructionsCmd,
    toggleExpandFeatures,
    toggleExpandTree,
    toggleExpandInstructions,
    toggleExpandFeature,
    watcher
  );
}

export function deactivate(): void {
  ApexFlowPanel.currentPanel?.dispose();
}
