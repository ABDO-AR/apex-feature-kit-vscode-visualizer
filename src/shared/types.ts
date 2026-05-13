export interface FeatureEntry {
  id: string;
  file: string;
  title: string;
  created_at: string;
  completed_at: string | null;
}

export interface TreeData {
  features: FeatureEntry[];
}

export interface ParsedTask {
  text: string;
  checked: boolean;
  phase: string;
}

export interface ParsedDoD {
  items: ParsedTask[];
}

export interface ParsedSpec {
  status: string;
  overview: string;
  tasks: ParsedTask[];
  definitionOfDone: ParsedDoD;
}

export type FeatureState = 'completed' | 'pending-sync' | 'in-progress' | 'not-started';

export interface TaskCounts {
  total: number;
  completed: number;
  unchecked: number;
}

export interface EnrichedFeature extends FeatureEntry {
  spec: ParsedSpec;
  taskCounts: TaskCounts;
  dodCounts: TaskCounts;
  state: FeatureState;
}
