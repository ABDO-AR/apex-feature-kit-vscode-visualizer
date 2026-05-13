import type { ParsedSpec, ParsedTask } from '../shared/types.js';

export function parseSpec(content: string): ParsedSpec {
  const lines = content.split('\n');
  let status = '';
  let overview = '';
  const tasks: ParsedTask[] = [];
  const dodItems: ParsedTask[] = [];

  let section: 'none' | 'overview' | 'tasks' | 'dod' | 'done' = 'none';
  let currentPhase = '';
  let currentTask: { text: string; checked: boolean; phase: string } | null = null;

  function flushTask(): void {
    if (!currentTask) return;
    if (section === 'tasks') {
      tasks.push({ ...currentTask });
    } else if (section === 'dod') {
      dodItems.push({ ...currentTask });
    }
    currentTask = null;
  }

  for (const line of lines) {
    if (line.startsWith('> Status:')) {
      status = line.replace('> Status:', '').trim();
      continue;
    }

    if (line.startsWith('## Overview')) {
      flushTask();
      section = 'overview';
      continue;
    }
    if (line.startsWith('## Implementation Tasks')) {
      flushTask();
      section = 'tasks';
      currentPhase = '';
      continue;
    }
    if (line.startsWith('## Definition of Done')) {
      flushTask();
      section = 'dod';
      currentPhase = 'Definition of Done';
      continue;
    }
    if (line.startsWith('## Notes')) {
      flushTask();
      section = 'done';
      continue;
    }
    if (line.startsWith('## ')) {
      flushTask();
      section = 'none';
      continue;
    }

    if (section === 'tasks' && line.startsWith('### ')) {
      flushTask();
      currentPhase = line.replace('### ', '').trim();
      continue;
    }

    const checkboxMatch = line.match(/^- \[([ xX])\] (.*)/);
    if (checkboxMatch && (section === 'tasks' || section === 'dod')) {
      flushTask();
      currentTask = {
        text: checkboxMatch[2].trim(),
        checked: checkboxMatch[1] !== ' ',
        phase: currentPhase,
      };
      continue;
    }

    if (currentTask && (line.startsWith('   ') || line.startsWith('\t'))) {
      currentTask.text += ' ' + line.trim();
      continue;
    }

    if (section === 'overview' && line.trim() && !line.startsWith('#') && !line.startsWith('>')) {
      if (!overview) {
        overview = line.trim();
      }
    }
  }
  flushTask();

  return { status, overview, tasks, definitionOfDone: { items: dodItems } };
}

export function computeCounts(items: ParsedTask[]): { total: number; completed: number; unchecked: number } {
  const total = items.length;
  const completed = items.filter(t => t.checked).length;
  return { total, completed, unchecked: total - completed };
}
