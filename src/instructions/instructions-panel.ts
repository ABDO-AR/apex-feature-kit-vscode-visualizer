import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { INSTRUCTIONS_PANEL_ID, INSTRUCTIONS_PANEL_TITLE, FEATURES_DIR, INSTRUCTIONS_FILE } from '../shared/constants.js';

export function showInstructions(workspaceRoot: string): void {
  const instrPath = path.join(workspaceRoot, FEATURES_DIR, INSTRUCTIONS_FILE);

  if (!fs.existsSync(instrPath)) {
    vscode.window.showWarningMessage(
      'No .features/instructions.md found. Run apex-feature-kit init first.'
    );
    return;
  }

  const doc = vscode.workspace.openTextDocument(instrPath);
  doc.then(d => {
    vscode.commands.executeCommand('markdown.showPreviewToSide', d.uri);
  });
}
