import type { EnrichedFeature } from '../shared/types.js';

export function generateFlowHtml(features: EnrichedFeature[]): string {
  const mermaidGraph = generateMermaidGraph(features);
  const featureCards = generateFeatureCards(features);
  const nodeStyleData = generateNodeStyleData(features);
  return wrapInDocument(mermaidGraph, featureCards, nodeStyleData);
}

interface NodeStyle {
  id: string;
  state: string;
}

function generateMermaidGraph(features: EnrichedFeature[]): string {
  const sorted = [...features].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) {
    return 'graph TD\n  empty["No features yet — run apex-feature-kit init all"]';
  }

  let graph = 'graph TD\n';

  for (const feat of sorted) {
    const id = sanitizeMermaidId(feat.id);
    const label = buildNodeLabel(feat);
    graph += `  ${id}["${label}"]\n`;
  }

  for (let i = 1; i < sorted.length; i++) {
    const prevId = sanitizeMermaidId(sorted[i - 1].id);
    const currId = sanitizeMermaidId(sorted[i].id);
    graph += `  ${prevId} --> ${currId}\n`;
  }

  return graph;
}

function generateNodeStyleData(features: EnrichedFeature[]): NodeStyle[] {
  return features.map(f => ({ id: sanitizeMermaidId(f.id), state: f.state }));
}

function buildNodeLabel(feat: EnrichedFeature): string {
  const icon = feat.state === 'completed' ? '✓'
    : feat.state === 'pending-sync' ? '⏳'
    : feat.state === 'in-progress' ? '◉'
    : '○';
  const progress = feat.taskCounts.total > 0
    ? ` ${feat.taskCounts.completed}/${feat.taskCounts.total}`
    : '';
  return `${icon} ${feat.title}${progress}`;
}

function sanitizeMermaidId(id: string): string {
  return `f_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

function generateFeatureCards(features: EnrichedFeature[]): string {
  return features.map(feat => generateFeatureCard(feat)).join('\n');
}

function generateFeatureCard(feat: EnrichedFeature): string {
  const pct = feat.taskCounts.total > 0
    ? Math.round((feat.taskCounts.completed / feat.taskCounts.total) * 100)
    : 0;
  const badgeLabel = feat.state === 'completed' ? 'Completed'
    : feat.state === 'pending-sync' ? 'Sync Needed'
    : feat.state === 'in-progress' ? 'In Progress'
    : 'Not Started';

  const phases = new Map<string, EnrichedFeature['spec']['tasks'][0][]>();
  for (const task of feat.spec.tasks) {
    const phase = task.phase || 'Tasks';
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push(task);
  }

  let taskHtml = '';
  for (const [phaseName, tasks] of phases) {
    taskHtml += `    <div class="phase-label">${escapeHtml(phaseName)}</div>\n`;
    taskHtml += '    <ul class="task-list">\n';
    for (const task of tasks) {
      const cls = task.checked ? 'done' : 'pending';
      taskHtml += `      <li class="${cls}">${escapeHtml(task.text)}</li>\n`;
    }
    taskHtml += '    </ul>\n';
  }

  return `<div class="feature-card ${feat.state}" data-feature-id="${escapeHtml(feat.id)}">
  <h3>${escapeHtml(feat.title)} <span class="state-badge ${feat.state}">${badgeLabel}</span></h3>
  <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
  <span>${feat.taskCounts.completed}/${feat.taskCounts.total} tasks</span>
${taskHtml}
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapInDocument(mermaidGraph: string, featureCards: string, nodeStyleData: NodeStyle[]): string {
  const nodeStyleJson = JSON.stringify(nodeStyleData);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src https://cdn.jsdelivr.net;">
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body {
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-fontFamily);
      padding: 20px;
      margin: 0;
    }
    h2 {
      color: var(--vscode-editor-foreground);
      border-bottom: 1px solid var(--vscode-widget-border);
      padding-bottom: 8px;
    }
    #flow-container {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      overflow-x: auto;
    }
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-top: 32px;
    }
    .feature-card {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      padding: 16px;
      cursor: pointer;
    }
    .feature-card:hover {
      border-color: var(--vscode-focusBorder);
    }
    .feature-card.completed { border-left: 3px solid var(--vscode-testing-iconPassed); }
    .feature-card.in-progress { border-left: 3px solid var(--vscode-charts-blue); }
    .feature-card.pending-sync { border-left: 3px solid var(--vscode-charts-yellow); }
    .feature-card.not-started { border-left: 3px solid var(--vscode-descriptionForeground); }
    .feature-card h3 {
      margin: 0 0 8px;
      color: var(--vscode-editor-foreground);
      font-size: 14px;
    }
    .progress-bar {
      background: var(--vscode-widget-border);
      border-radius: 3px;
      height: 6px;
      margin: 8px 0;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s;
    }
    .completed .progress-bar-fill { background: var(--vscode-testing-iconPassed); }
    .in-progress .progress-bar-fill { background: var(--vscode-charts-blue); }
    .pending-sync .progress-bar-fill { background: var(--vscode-charts-yellow); }
    .task-list {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      font-size: 12px;
    }
    .task-list li {
      padding: 2px 0;
      color: var(--vscode-editor-foreground);
      opacity: 0.9;
    }
    .task-list li.done {
      text-decoration: line-through;
      opacity: 0.5;
    }
    .task-list li.done::before { content: '\\2611  '; color: var(--vscode-testing-iconPassed); }
    .task-list li.pending::before { content: '\\2610  '; color: var(--vscode-descriptionForeground); }
    .phase-label {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      margin: 8px 0 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .state-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 3px;
      display: inline-block;
    }
    .state-badge.completed { background: var(--vscode-testing-iconPassed); color: var(--vscode-editor-background); }
    .state-badge.in-progress { background: var(--vscode-charts-blue); color: #fff; }
    .state-badge.pending-sync { background: var(--vscode-charts-yellow); color: var(--vscode-editor-background); }
    .state-badge.not-started { background: var(--vscode-descriptionForeground); color: var(--vscode-editor-background); }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <h2>Apex Project Flow</h2>
  <div id="flow-container">
    <pre class="mermaid">${mermaidGraph}</pre>
  </div>
  <h2>Feature Dashboard</h2>
  <div class="dashboard">
    ${featureCards}
  </div>
  <script>
    var vscode = acquireVsCodeApi();
    var isDark = document.body.classList.contains('vscode-dark')
      || document.body.classList.contains('vscode-high-contrast');

    var cs = getComputedStyle(document.body);
    var themeColors = {
      nodeFill: cs.getPropertyValue('--vscode-editorWidget-background').trim() || (isDark ? '#2d2d2d' : '#f3f3f3'),
      nodeText: cs.getPropertyValue('--vscode-editor-foreground').trim() || (isDark ? '#cccccc' : '#333333'),
      completedFill: cs.getPropertyValue('--vscode-testing-iconPassed').trim() || '#73c991',
      completedStroke: cs.getPropertyValue('--vscode-charts-yellow').trim() || '#cca700',
      inProgressStroke: cs.getPropertyValue('--vscode-charts-blue').trim() || '#3794ff',
      lineColor: cs.getPropertyValue('--vscode-charts-foreground').trim() || (isDark ? '#cccccc' : '#666666'),
      fontFamily: cs.getPropertyValue('--vscode-fontFamily').trim() || 'sans-serif',
    };

    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'default',
      themeVariables: {
        primaryColor: themeColors.nodeFill,
        primaryTextColor: themeColors.nodeText,
        primaryBorderColor: themeColors.inProgressStroke,
        lineColor: themeColors.lineColor,
        fontFamily: themeColors.fontFamily,
      }
    });

    var nodeStyles = ${nodeStyleJson};
    window.addEventListener('load', function() {
      setTimeout(function() {
        nodeStyles.forEach(function(ns) {
          var el = document.getElementById(ns.id);
          if (!el) {
            var nodes = document.querySelectorAll('[id]');
            nodes.forEach(function(n) {
              if (n.id && n.id.indexOf(ns.id) !== -1) el = n;
            });
          }
          if (el) {
            var fill = ns.state === 'completed' ? themeColors.completedFill : themeColors.nodeFill;
            var stroke = ns.state === 'completed' || ns.state === 'pending-sync'
              ? themeColors.completedStroke
              : ns.state === 'in-progress'
              ? themeColors.inProgressStroke
              : themeColors.lineColor;
            el.style.fill = fill;
            el.style.stroke = stroke;
            el.style.strokeWidth = '2px';
            var textEls = el.querySelectorAll('text');
            textEls.forEach(function(t) { t.style.fill = themeColors.nodeText; });
          }
        });
      }, 500);
    });

    document.querySelectorAll('.feature-card').forEach(function(card) {
      card.addEventListener('click', function() {
        vscode.postMessage({ command: 'openSpec', featureId: card.dataset.featureId });
      });
    });
  </script>
</body>
</html>`;
}
