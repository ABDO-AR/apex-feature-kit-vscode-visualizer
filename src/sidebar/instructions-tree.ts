import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FEATURES_DIR, INSTRUCTIONS_FILE, CMD } from '../shared/constants.js';

type InstructionNode = InstructionFileNode | InstructionSectionNode;

interface ParsedSection {
  title: string;
  level: number;
  line: number;
  children: ParsedSection[];
}

export class InstructionFileNode extends vscode.TreeItem {
  constructor(public readonly filePath: string) {
    super('instructions.md', vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon('book');
    this.description = FEATURES_DIR;
    this.contextValue = 'instruction-file';
    this.command = {
      command: CMD.showInstructions,
      title: 'Open Instructions',
    };
  }
}

export class InstructionSectionNode extends vscode.TreeItem {
  public readonly children: InstructionSectionNode[] = [];
  public readonly headingLine: number;

  constructor(title: string, level: number, line: number, workspaceRoot: string) {
    super(title, level < 3 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
    this.headingLine = line;
    this.iconPath = level === 1
      ? new vscode.ThemeIcon('symbol-class')
      : level === 2
        ? new vscode.ThemeIcon('symbol-method')
        : new vscode.ThemeIcon('symbol-field');
    this.contextValue = 'instruction-section';

    const instrPath = path.join(workspaceRoot, FEATURES_DIR, INSTRUCTIONS_FILE);
    this.command = {
      command: 'vscode.open',
      title: 'Go to Section',
      arguments: [
        vscode.Uri.file(instrPath),
        { selection: new vscode.Range(line, 0, line, 200) } as vscode.TextDocumentShowOptions,
      ],
    };
  }
}

export class InstructionsTreeProvider implements vscode.TreeDataProvider<InstructionNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<InstructionNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private rootNode: InstructionFileNode | undefined;
  private topSections: InstructionSectionNode[] = [];
  private parentMap = new Map<InstructionNode, InstructionNode>();

  constructor(private workspaceRoot: string) {
    this.parseInstructions();
  }

  refresh(): void {
    this.parseInstructions();
    this.parentMap.clear();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: InstructionNode): vscode.TreeItem {
    return element;
  }

  getParent(element: InstructionNode): vscode.ProviderResult<InstructionNode> {
    return this.parentMap.get(element);
  }

  getChildren(element?: InstructionNode): vscode.ProviderResult<InstructionNode[]> {
    if (!element) {
      if (!this.rootNode) return [];
      return [this.rootNode];
    }

    if (element instanceof InstructionFileNode) {
      for (const section of this.topSections) {
        this.parentMap.set(section, element);
      }
      return this.topSections;
    }

    if (element instanceof InstructionSectionNode) {
      for (const child of element.children) {
        this.parentMap.set(child, element);
      }
      return element.children;
    }

    return [];
  }

  private parseInstructions(): void {
    const instrPath = path.join(this.workspaceRoot, FEATURES_DIR, INSTRUCTIONS_FILE);
    this.rootNode = undefined;
    this.topSections = [];

    if (!fs.existsSync(instrPath)) return;

    this.rootNode = new InstructionFileNode(instrPath);

    try {
      const content = fs.readFileSync(instrPath, 'utf-8');
      const lines = content.split('\n');
      const parsed = this.parseHeadings(lines);
      this.topSections = this.buildSectionNodes(parsed, this.workspaceRoot);
    } catch {
      this.topSections = [];
    }
  }

  private parseHeadings(lines: string[]): ParsedSection[] {
    const raw: { title: string; level: number; line: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,3})\s+(.+)/);
      if (match) {
        const title = match[2].trim();
        if (title.includes('{') || title.includes('}')) continue;
        raw.push({ title, level: match[1].length, line: i });
      }
    }

    return this.buildHierarchy(raw);
  }

  private buildHierarchy(raw: { title: string; level: number; line: number }[]): ParsedSection[] {
    const root: ParsedSection[] = [];
    const stack: ParsedSection[] = [];

    for (const item of raw) {
      const section: ParsedSection = { ...item, children: [] };

      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(section);
      } else {
        root.push(section);
      }

      stack.push(section);
    }

    return root;
  }

  private buildSectionNodes(
    parsed: ParsedSection[],
    workspaceRoot: string
  ): InstructionSectionNode[] {
    return parsed.map(s => {
      const node = new InstructionSectionNode(s.title, s.level, s.line, workspaceRoot);
      const childNodes = this.buildSectionNodes(s.children, workspaceRoot);
      node.children.push(...childNodes);
      return node;
    });
  }
}
