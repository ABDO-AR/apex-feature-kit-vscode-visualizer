import * as vscode from 'vscode';
import * as fs from 'fs';
import { FEATURES_DIR, INSTRUCTIONS_FILE } from '../shared/constants.js';

type InstructionNode = InstructionFileNode | InstructionSectionNode;

export class InstructionFileNode extends vscode.TreeItem {
  constructor(public readonly filePath: string) {
    super('instructions.md', vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('book');
    this.description = FEATURES_DIR;
    this.contextValue = 'instruction-file';
    this.command = {
      command: 'apex.showInstructions',
      title: 'Open Instructions',
    };
  }
}

export class InstructionSectionNode extends vscode.TreeItem {
  constructor(title: string, level: number) {
    super(title, level < 3 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
    this.iconPath = level === 1
      ? new vscode.ThemeIcon('symbol-class')
      : level === 2
        ? new vscode.ThemeIcon('symbol-method')
        : new vscode.ThemeIcon('symbol-field');
    this.contextValue = 'instruction-section';
  }
}

export class InstructionsTreeProvider implements vscode.TreeDataProvider<InstructionNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<InstructionNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private sections: InstructionSectionNode[] = [];
  private filePath: string | undefined;

  constructor(private workspaceRoot: string) {
    this.parseInstructions();
  }

  refresh(): void {
    this.parseInstructions();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: InstructionNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: InstructionNode): vscode.ProviderResult<InstructionNode[]> {
    if (!element) {
      if (!this.filePath) return [];
      return [new InstructionFileNode(this.filePath)];
    }

    if (element instanceof InstructionFileNode) {
      return this.sections;
    }

    return [];
  }

  private parseInstructions(): void {
    this.sections = [];
    const instrPath = `${this.workspaceRoot}/${FEATURES_DIR}/${INSTRUCTIONS_FILE}`;
    this.filePath = fs.existsSync(instrPath) ? instrPath : undefined;

    if (!this.filePath) return;

    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^(#{1,3})\s+(.+)/);
        if (match) {
          const level = match[1].length;
          const title = match[2].trim();
          this.sections.push(new InstructionSectionNode(title, level));
        }
      }
    } catch {
      this.sections = [];
    }
  }
}
