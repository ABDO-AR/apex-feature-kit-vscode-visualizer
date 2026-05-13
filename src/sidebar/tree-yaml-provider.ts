import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import type { EnrichedFeature, FeatureState } from '../shared/types.js';
import { FEATURES_DIR, TREE_FILE, CMD } from '../shared/constants.js';

type TreeYamlNode = TreeFileNode | TreeFeatureNode;

export class TreeFileNode extends vscode.TreeItem {
  constructor(public readonly filePath: string) {
    super('tree.yaml', vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon('file-symlink-file');
    this.description = FEATURES_DIR;
    this.contextValue = 'tree-yaml-file';
    this.tooltip = filePath;
    this.command = {
      command: 'vscode.open',
      title: 'Open tree.yaml',
      arguments: [vscode.Uri.file(filePath)],
    };
  }
}

export class TreeFeatureNode extends vscode.TreeItem {
  public readonly featureId: string;
  public readonly featureState: FeatureState;

  constructor(public readonly feature: EnrichedFeature) {
    super(feature.title, vscode.TreeItemCollapsibleState.None);
    this.featureId = feature.id;
    this.featureState = feature.state;
    this.contextValue = `tree-feature-${feature.state}`;
    this.description = this.buildDescription(feature);
    this.iconPath = this.buildIcon(feature);
    this.tooltip = this.buildTooltip(feature);
    this.command = {
      command: CMD.openSpec,
      title: 'Open Spec',
      arguments: [feature],
    };
  }

  private buildIcon(f: EnrichedFeature): vscode.ThemeIcon {
    if (f.completed_at !== null) {
      return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
    }
    switch (f.state) {
      case 'pending-sync':
        return new vscode.ThemeIcon('sync', new vscode.ThemeColor('charts.yellow'));
      case 'in-progress':
        return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.orange'));
      default:
        return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('descriptionForeground'));
    }
  }

  private buildDescription(f: EnrichedFeature): string {
    if (f.completed_at !== null) {
      return `completed ${f.completed_at}`;
    }
    if (f.taskCounts.total > 0) {
      return `${f.taskCounts.completed}/${f.taskCounts.total} tasks`;
    }
    return f.file;
  }

  private buildTooltip(f: EnrichedFeature): string {
    const lines = [
      f.title,
      `ID: ${f.id}`,
      `Spec: ${f.file}`,
      `State: ${f.state}`,
      `Created: ${f.created_at}`,
    ];
    if (f.completed_at) {
      lines.push(`Completed: ${f.completed_at}`);
    }
    if (f.taskCounts.total > 0) {
      const pct = Math.round((f.taskCounts.completed / f.taskCounts.total) * 100);
      lines.push(`Tasks: ${f.taskCounts.completed}/${f.taskCounts.total} (${pct}%)`);
    }
    return lines.join('\n');
  }
}

export class TreeYamlProvider implements vscode.TreeDataProvider<TreeYamlNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeYamlNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private features: EnrichedFeature[] = [];
  private treeFilePath: string | undefined;
  private cachedFileNode: TreeFileNode | undefined;
  private parentMap = new Map<TreeYamlNode, TreeYamlNode>();

  constructor(private workspaceRoot: string) {
    const tp = path.join(workspaceRoot, FEATURES_DIR, TREE_FILE);
    if (fs.existsSync(tp)) {
      this.treeFilePath = tp;
      this.cachedFileNode = new TreeFileNode(tp);
    }
  }

  refresh(features?: EnrichedFeature[]): void {
    if (features) this.features = features;
    const tp = path.join(this.workspaceRoot, FEATURES_DIR, TREE_FILE);
    if (fs.existsSync(tp)) {
      this.treeFilePath = tp;
      this.cachedFileNode = new TreeFileNode(tp);
    } else {
      this.treeFilePath = undefined;
      this.cachedFileNode = undefined;
    }
    this.parentMap.clear();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeYamlNode): vscode.TreeItem {
    return element;
  }

  getParent(element: TreeYamlNode): vscode.ProviderResult<TreeYamlNode> {
    return this.parentMap.get(element);
  }

  getChildren(element?: TreeYamlNode): vscode.ProviderResult<TreeYamlNode[]> {
    if (!element) {
      if (!this.cachedFileNode) return [];
      return [this.cachedFileNode];
    }

    if (element instanceof TreeFileNode) {
      return this.features.map(f => {
        const node = new TreeFeatureNode(f);
        this.parentMap.set(node, element);
        return node;
      });
    }

    return [];
  }
}
