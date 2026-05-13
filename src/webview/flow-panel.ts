import * as vscode from 'vscode';
import * as path from 'path';
import type { EnrichedFeature } from '../shared/types.js';
import { PANEL_ID, PANEL_TITLE, CMD, FEATURES_DIR } from '../shared/constants.js';
import { generateFlowHtml } from './flow-html.js';

interface FlowMessage {
  command: string;
  featureId?: string;
  data?: string;
}

export class ApexFlowPanel {
  public static currentPanel: ApexFlowPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _features: EnrichedFeature[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    features: EnrichedFeature[]
  ): ApexFlowPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ApexFlowPanel.currentPanel) {
      ApexFlowPanel.currentPanel._panel.reveal(column);
      ApexFlowPanel.currentPanel.update(features);
      return ApexFlowPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      PANEL_ID,
      PANEL_TITLE,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.iconPath = vscode.Uri.joinPath(extensionUri, 'resources', 'icon.svg');

    const instance = new ApexFlowPanel(panel);
    ApexFlowPanel.currentPanel = instance;
    instance.update(features);
    return instance;
  }

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null);

    this._panel.webview.onDidReceiveMessage(
      (msg: FlowMessage) => {
        switch (msg.command) {
          case 'openSpec':
            if (msg.featureId) {
              vscode.commands.executeCommand(CMD.openSpec, msg.featureId);
            }
            break;
          case 'refresh':
            vscode.commands.executeCommand(CMD.refreshTree);
            break;
          case 'exportPng':
            if (msg.data) {
              this.savePng(msg.data);
            }
            break;
        }
      },
      null
    );
  }

  public update(features: EnrichedFeature[]): void {
    this._features = features;
    this._panel.webview.html = generateFlowHtml(features);
  }

  private async savePng(dataUrl: string): Promise<void> {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultName = `apex-flow-${timestamp}.png`;

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(workspaceRoot, FEATURES_DIR, defaultName)),
      filters: { 'PNG Images': ['png'] },
    });

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, buffer);
      vscode.window.showInformationMessage(`Flow diagram exported to ${uri.fsPath}`);
    }
  }

  public dispose(): void {
    ApexFlowPanel.currentPanel = undefined;
    this._panel.dispose();
  }
}
