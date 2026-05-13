import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { EnrichedFeature, FeatureEntry, FeatureState, TreeData } from '../shared/types.js';
import { FEATURES_DIR, TREE_FILE, INSTRUCTIONS_FILE } from '../shared/constants.js';
import { parseSpec, computeCounts } from './spec-parser.js';

export class FeatureReader {
  constructor(private workspaceRoot: string) {}

  private featuresPath(): string {
    return path.join(this.workspaceRoot, FEATURES_DIR);
  }

  private treePath(): string {
    return path.join(this.featuresPath(), TREE_FILE);
  }

  hasFeaturesDir(): boolean {
    return fs.existsSync(this.treePath());
  }

  async readTree(): Promise<EnrichedFeature[]> {
    if (!this.hasFeaturesDir()) {
      return [];
    }

    const content = fs.readFileSync(this.treePath(), 'utf8');
    const data = yaml.load(content) as TreeData | null | undefined;

    if (!data || !Array.isArray(data.features)) {
      return [];
    }

    const enriched: EnrichedFeature[] = [];
    for (const entry of data.features as FeatureEntry[]) {
      try {
        enriched.push(this.enrichFeature(entry));
      } catch {
        enriched.push(this.fallbackFeature(entry));
      }
    }
    return enriched;
  }

  readSpecRaw(relativePath: string): string | undefined {
    const fullPath = path.join(this.featuresPath(), relativePath);
    if (!fs.existsSync(fullPath)) return undefined;
    return fs.readFileSync(fullPath, 'utf8');
  }

  readInstructions(): string | undefined {
    const fullPath = path.join(this.featuresPath(), INSTRUCTIONS_FILE);
    if (!fs.existsSync(fullPath)) return undefined;
    return fs.readFileSync(fullPath, 'utf8');
  }

  specPath(relativePath: string): string {
    return path.join(this.featuresPath(), relativePath);
  }

  private enrichFeature(entry: FeatureEntry): EnrichedFeature {
    const specPath = path.join(this.featuresPath(), entry.file);
    const specContent = fs.readFileSync(specPath, 'utf8');
    const spec = parseSpec(specContent);

    const taskCounts = computeCounts(spec.tasks);
    const dodCounts = computeCounts(spec.definitionOfDone.items);
    const state = this.deriveState(entry, taskCounts, dodCounts);

    return { ...entry, spec, taskCounts, dodCounts, state };
  }

  private fallbackFeature(entry: FeatureEntry): EnrichedFeature {
    const zero = { total: 0, completed: 0, unchecked: 0 };
    return {
      ...entry,
      spec: { status: 'Unknown', overview: '', tasks: [], definitionOfDone: { items: [] } },
      taskCounts: zero,
      dodCounts: { ...zero },
      state: this.deriveState(entry, zero, zero),
    };
  }

  private deriveState(
    entry: FeatureEntry,
    taskCounts: { total: number; unchecked: number },
    _dodCounts: { total: number; unchecked: number }
  ): FeatureState {
    if (entry.completed_at !== null) {
      return 'completed';
    }
    if (taskCounts.total > 0 && taskCounts.unchecked === 0) {
      return 'pending-sync';
    }
    if (taskCounts.total > 0 && taskCounts.unchecked < taskCounts.total) {
      return 'in-progress';
    }
    return 'not-started';
  }
}
