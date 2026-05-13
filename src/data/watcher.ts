import * as vscode from 'vscode';
import * as path from 'path';
import { FEATURES_DIR } from '../shared/constants.js';

export function startWatching(
  workspaceRoot: string,
  onRefresh: () => void
): vscode.Disposable {
  const pattern = new vscode.RelativePattern(
    vscode.Uri.file(workspaceRoot),
    path.join(FEATURES_DIR, '**')
  );
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const debouncedRefresh = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      onRefresh();
    }, 300);
  };

  const d1 = watcher.onDidCreate(debouncedRefresh);
  const d2 = watcher.onDidChange(debouncedRefresh);
  const d3 = watcher.onDidDelete(debouncedRefresh);

  return vscode.Disposable.from(watcher, d1, d2, d3);
}
