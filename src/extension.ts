import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FeatureReader } from './data/feature-reader.js';
import { startWatching } from './data/watcher.js';
import { ApexTreeProvider } from './sidebar/tree-provider.js';
import { InstructionsTreeProvider } from './sidebar/instructions-tree.js';
import { ApexFlowPanel } from './webview/flow-panel.js';
import { showInstructions } from './instructions/instructions-panel.js';
import { VIEW_ID, CMD, CONTEXT_KEY } from './shared/constants.js';
import type { EnrichedFeature } from './shared/types.js';

const INSTRUCTIONS_VIEW_ID = 'apexInstructions';

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const reader = new FeatureReader(workspaceRoot);
  const treeProvider = new ApexTreeProvider();
  const instructionsProvider = new InstructionsTreeProvider(workspaceRoot);

  const treeView = vscode.window.registerTreeDataProvider(VIEW_ID, treeProvider);
  const instructionsView = vscode.window.registerTreeDataProvider(INSTRUCTIONS_VIEW_ID, instructionsProvider);

  const openFlow = vscode.commands.registerCommand(CMD.openFlow, async () => {
    const features = await reader.readTree();
    ApexFlowPanel.createOrShow(context.extensionUri, features);
  });

  const refreshTree = vscode.commands.registerCommand(CMD.refreshTree, async () => {
    const features = await reader.readTree();
    treeProvider.refresh(features);
  });

  const openSpec = vscode.commands.registerCommand(CMD.openSpec, async (arg: EnrichedFeature | string | undefined) => {
    let specPath: string | undefined;

    if (arg && typeof arg === 'object' && 'file' in arg) {
      specPath = reader.specPath(arg.file);
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

  const watcher = startWatching(workspaceRoot, async () => {
    const features = await reader.readTree();
    treeProvider.refresh(features);
    instructionsProvider.refresh();
    if (ApexFlowPanel.currentPanel) {
      ApexFlowPanel.currentPanel.update(features);
    }
    vscode.commands.executeCommand('setContext', CONTEXT_KEY, reader.hasFeaturesDir());
  });

  if (reader.hasFeaturesDir()) {
    vscode.commands.executeCommand(CMD.openFlow);
  }

  vscode.commands.executeCommand('setContext', CONTEXT_KEY, reader.hasFeaturesDir());

  context.subscriptions.push(
    treeView,
    instructionsView,
    openFlow,
    refreshTree,
    openSpec,
    runSync,
    showInstructionsCmd,
    watcher
  );
}

export function deactivate(): void {
  ApexFlowPanel.currentPanel?.dispose();
}
