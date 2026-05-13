import * as vscode from 'vscode';
import type { EnrichedFeature, ParsedTask, FeatureState } from '../shared/types.js';
import { CMD } from '../shared/constants.js';

type ApexTreeNode = FeatureNode | PhaseNode | TaskNode | DodHeaderNode | DodNode;

export class FeatureNode extends vscode.TreeItem {
  public readonly featureId: string;
  public readonly featureState: FeatureState;

  constructor(public readonly feature: EnrichedFeature) {
    super(feature.title, vscode.TreeItemCollapsibleState.Collapsed);
    this.featureId = feature.id;
    this.featureState = feature.state;
    this.contextValue = `feature-${feature.state}`;
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
    switch (f.state) {
      case 'completed':
        return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
      case 'pending-sync':
        return new vscode.ThemeIcon('sync', new vscode.ThemeColor('charts.yellow'));
      case 'in-progress':
        return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.orange'));
      case 'not-started':
        return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('descriptionForeground'));
    }
  }

  private buildDescription(f: EnrichedFeature): string {
    switch (f.state) {
      case 'completed': return `${f.taskCounts.completed}/${f.taskCounts.total}`;
      case 'pending-sync': return `${f.taskCounts.completed}/${f.taskCounts.total} — sync needed`;
      case 'in-progress': return `${f.taskCounts.completed}/${f.taskCounts.total}`;
      case 'not-started': return `${f.taskCounts.total} tasks`;
    }
  }

  private buildTooltip(f: EnrichedFeature): string {
    const pct = f.taskCounts.total > 0
      ? Math.round((f.taskCounts.completed / f.taskCounts.total) * 100)
      : 0;
    const lines = [
      f.title,
      `State: ${f.state}`,
      `ID: ${f.id}`,
      `Created: ${f.created_at}`,
      `Tasks: ${f.taskCounts.completed}/${f.taskCounts.total} (${pct}%)`,
    ];
    if (f.dodCounts.total > 0) {
      lines.push(`DoD: ${f.dodCounts.completed}/${f.dodCounts.total}`);
    }
    if (f.completed_at) {
      lines.push(`Completed: ${f.completed_at}`);
    }
    return lines.join('\n');
  }
}

export class PhaseNode extends vscode.TreeItem {
  public readonly featureId: string;

  constructor(
    phaseName: string,
    taskCount: number,
    completedCount: number,
    featureId: string
  ) {
    super(phaseName, vscode.TreeItemCollapsibleState.Collapsed);
    this.featureId = featureId;
    this.description = `${completedCount}/${taskCount}`;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.contextValue = 'phase';
  }
}

export class TaskNode extends vscode.TreeItem {
  constructor(task: ParsedTask) {
    super(task.text, vscode.TreeItemCollapsibleState.None);
    this.iconPath = task.checked
      ? new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'))
      : new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('descriptionForeground'));
    this.description = task.checked ? 'done' : '';
    this.contextValue = task.checked ? 'task-done' : 'task-pending';
    this.tooltip = task.phase ? `[${task.phase}] ${task.text}` : task.text;
  }
}

export class DodHeaderNode extends vscode.TreeItem {
  public readonly featureId: string;

  constructor(total: number, completed: number, featureId: string) {
    super('Definition of Done', vscode.TreeItemCollapsibleState.Collapsed);
    this.featureId = featureId;
    this.description = `${completed}/${total}`;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.contextValue = 'dod-header';
  }
}

export class DodNode extends vscode.TreeItem {
  constructor(task: ParsedTask) {
    super(task.text, vscode.TreeItemCollapsibleState.None);
    this.iconPath = task.checked
      ? new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'))
      : new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('descriptionForeground'));
    this.contextValue = task.checked ? 'dod-done' : 'dod-pending';
  }
}

export class ApexTreeProvider implements vscode.TreeDataProvider<ApexTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ApexTreeNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private features: EnrichedFeature[] = [];
  private parentMap = new Map<ApexTreeNode, ApexTreeNode>();

  refresh(features?: EnrichedFeature[]): void {
    if (features) this.features = features;
    this.parentMap.clear();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ApexTreeNode): vscode.TreeItem {
    return element;
  }

  getParent(element: ApexTreeNode): vscode.ProviderResult<ApexTreeNode> {
    return this.parentMap.get(element);
  }

  getChildren(element?: ApexTreeNode): vscode.ProviderResult<ApexTreeNode[]> {
    if (!element) {
      return this.features.map(f => new FeatureNode(f));
    }

    if (element instanceof FeatureNode) {
      return this.getFeatureChildren(element);
    }

    if (element instanceof PhaseNode) {
      return this.getPhaseChildren(element);
    }

    if (element instanceof DodHeaderNode) {
      return this.getDodChildren(element);
    }

    return [];
  }

  private getFeatureChildren(node: FeatureNode): ApexTreeNode[] {
    const feature = this.findFeature(node.featureId);
    if (!feature) return [];

    const children: ApexTreeNode[] = [];
    const phases = new Map<string, ParsedTask[]>();

    for (const task of feature.spec.tasks) {
      const phase = task.phase || 'Tasks';
      if (!phases.has(phase)) phases.set(phase, []);
      phases.get(phase)!.push(task);
    }

    for (const [phaseName, tasks] of phases) {
      const phaseNode = new PhaseNode(
        phaseName,
        tasks.length,
        tasks.filter(t => t.checked).length,
        feature.id
      );
      this.parentMap.set(phaseNode, node);
      children.push(phaseNode);
    }

    if (feature.spec.definitionOfDone.items.length > 0) {
      const dodNode = new DodHeaderNode(
        feature.dodCounts.total,
        feature.dodCounts.completed,
        feature.id
      );
      this.parentMap.set(dodNode, node);
      children.push(dodNode);
    }

    return children;
  }

  private getPhaseChildren(node: PhaseNode): ApexTreeNode[] {
    const feature = this.findFeature(node.featureId);
    if (!feature) return [];
    return feature.spec.tasks
      .filter(t => t.phase === node.label)
      .map(t => {
        const taskNode = new TaskNode(t);
        this.parentMap.set(taskNode, node);
        return taskNode;
      });
  }

  private getDodChildren(node: DodHeaderNode): ApexTreeNode[] {
    const feature = this.findFeature(node.featureId);
    if (!feature) return [];
    return feature.spec.definitionOfDone.items.map(t => {
      const dodNode = new DodNode(t);
      this.parentMap.set(dodNode, node);
      return dodNode;
    });
  }

  findFeatureNode(id: string): FeatureNode | undefined {
    const feature = this.findFeature(id);
    return feature ? new FeatureNode(feature) : undefined;
  }

  private findFeature(id: string): EnrichedFeature | undefined {
    return this.features.find(f => f.id === id);
  }
}
