import * as vscode from 'vscode';
import type { EnrichedFeature } from '../shared/types.js';
import { PANEL_ID, PANEL_TITLE, CMD } from '../shared/constants.js';
import { generateFlowHtml } from './flow-html.js';

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

    const instance = new ApexFlowPanel(panel, extensionUri);
    ApexFlowPanel.currentPanel = instance;
    instance.update(features);
    return instance;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    _extensionUri: vscode.Uri
  ) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null);

    this._panel.webview.onDidReceiveMessage(
      (msg: { command: string; featureId: string }) => {
        switch (msg.command) {
          case 'openSpec':
            vscode.commands.executeCommand(CMD.openSpec, msg.featureId);
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

  public dispose(): void {
    ApexFlowPanel.currentPanel = undefined;
    this._panel.dispose();
  }
}
