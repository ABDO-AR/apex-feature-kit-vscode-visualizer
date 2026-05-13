import type { EnrichedFeature } from '../shared/types.js';

const SVG = {
  refresh: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.451 6.847A5.5 5.5 0 0 0 3.17 5.5H1.5l2.5 3 2.5-3H4.67a3.99 3.99 0 0 1 7.83-.5h1a5 5 0 0 0-.049-.153ZM2.549 9.153A5.5 5.5 0 0 0 12.83 10.5h1.67l-2.5-3-2.5 3h1.83a3.99 3.99 0 0 1-7.83.5h-1a5 5 0 0 0 .049.153Z"/></svg>`,
  expandAll: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 4.5l2-2 2 2"/><path d="M1 4.5h4M3 3v6.5"/><path d="M7 4.5l2-2 2 2"/><path d="M7 4.5h4M9 3v6.5"/><path d="M1 12.5l2 2 2-2"/><path d="M1 12.5h4"/><path d="M7 12.5l2 2 2-2"/><path d="M7 12.5h4"/></svg>`,
  collapseAll: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 3.5l2 2"/><path d="M5 3.5H3v2"/><path d="M9 3.5l2 2"/><path d="M11 3.5H9v2"/><path d="M3 11.5l2-2"/><path d="M5 11.5H3v-2"/><path d="M9 11.5l2-2"/><path d="M11 11.5H9v-2"/></svg>`,
  exportIcon: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M15.25 7.5H6.57l2.99-3.02L8.42 3.5 3 9l5.42 5.5 1.14-1.02L6.57 10.5h8.68z"/><path d="M1 14h3v1H1V1h3v1H1v12z"/></svg>`,
  goToFile: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M12.85 6.35L10.65 4.15l-.71.71L11.79 6.7H5v1h6.79l-1.85 1.85.71.71 2.2-2.2a.5.5 0 0 0 0-.71Z"/><path d="M4 1h5.5L13 4.5V10h-1V6H8V2H5v12h6v1H4V1Z"/><path d="M9 2.5V5h2.5L9 2.5Z"/></svg>`,
  chevronRight: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.94 13.06l4.47-4.47a.75.75 0 0 0 0-1.06L5.94 2.94 5 3.88 8.88 7.76 5 12.12l.94.94Z"/></svg>`,
  folder: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 2H7.71l-1-1.5H1.5A1.5 1.5 0 0 0 0 2v10a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 12V3.5A1.5 1.5 0 0 0 14.5 2Zm.5 10a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5h14v7Z"/></svg>`,
  shield: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1 1.5 4.5V7c0 3.5 2.8 6.8 6.5 7.5C11.7 13.8 14.5 10.5 14.5 7V4.5L8 1Zm0 2 5.5 2.5V7c0 2.8-2.2 5.5-5.5 6.1C4.7 12.5 2.5 9.8 2.5 7V5.5L8 3Z"/></svg>`,
  check: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.85 4.44l-7.5 7.5-3.5-3.5.7-.7 2.8 2.8 6.8-6.8.7.7Z"/></svg>`,
};

function svgIcon(name: keyof typeof SVG, size = 14): string {
  return `<span style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center;flex-shrink:0;vertical-align:middle;">${SVG[name]}</span>`;
}

export function generateFlowHtml(features: EnrichedFeature[]): string {
  const featuresJson = JSON.stringify(features.map(f => ({
    id: f.id,
    title: f.title,
    file: f.file,
    state: f.state,
    created_at: f.created_at,
    completed_at: f.completed_at,
    taskCounts: f.taskCounts,
    dodCounts: f.dodCounts,
    overview: f.spec.overview,
    tasks: f.spec.tasks,
    definitionOfDone: f.spec.definitionOfDone,
  })));

  const sortedJson = JSON.stringify(
    [...features].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(f => f.id)
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;">
  <style>
    :root {
      --ui-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --code-font: var(--vscode-fontFamily, Consolas, monospace);
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --muted: var(--vscode-descriptionForeground);
      --accent: var(--vscode-focusBorder);
      --card-bg: var(--vscode-editorWidget-background);
      --border: var(--vscode-widget-border);
      --shadow: var(--vscode-widget-shadow, rgba(0,0,0,0.12));
      --green: var(--vscode-testing-iconPassed);
      --orange: var(--vscode-charts-orange);
      --yellow: var(--vscode-charts-yellow);
      --dim: var(--vscode-descriptionForeground);
      --hover-bg: var(--vscode-list-hoverBackground);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--fg);
      font-family: var(--ui-font);
      font-size: 13px;
      line-height: 1.5;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--card-bg);
      flex-shrink: 0;
    }
    .toolbar-title {
      font-weight: 600;
      font-size: 13px;
      margin-right: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-title .logo {
      width: 20px; height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .toolbar-title .logo svg {
      width: 100%; height: 100%;
    }
    .toolbar-btn {
      background: none;
      border: 1px solid transparent;
      color: var(--fg);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: var(--ui-font);
      display: flex;
      align-items: center;
      gap: 5px;
      opacity: 0.85;
      transition: background 0.15s, opacity 0.15s, border-color 0.15s;
    }
    .toolbar-btn:hover {
      background: var(--hover-bg);
      opacity: 1;
      border-color: var(--border);
    }
    .toolbar-sep {
      width: 1px;
      height: 18px;
      background: var(--border);
      margin: 0 4px;
    }

    /* ── Main layout ── */
    .main { display: flex; flex: 1; min-height: 0; }

    /* ── Flow panel (left) ── */
    .flow-panel {
      width: 260px;
      min-width: 200px;
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .flow-panel::-webkit-scrollbar { width: 6px; }
    .flow-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* ── Flow nodes ── */
    .flow-node {
      width: 220px;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
      position: relative;
    }
    .flow-node:hover {
      border-color: var(--accent);
      box-shadow: 0 2px 8px var(--shadow);
      transform: translateY(-1px);
    }
    .flow-node.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent), 0 2px 8px var(--shadow);
    }
    .flow-node.completed { border-left: 3px solid var(--green); }
    .flow-node.in-progress { border-left: 3px solid var(--orange); }
    .flow-node.pending-sync { border-left: 3px solid var(--yellow); }
    .flow-node.not-started { border-left: 3px solid var(--dim); }

    .flow-node-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .flow-node-icon {
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .flow-node-icon svg { width: 10px; height: 10px; }
    .flow-node-icon.completed { background: var(--green); color: var(--bg); }
    .flow-node-icon.in-progress { background: var(--orange); color: #fff; }
    .flow-node-icon.pending-sync { background: var(--yellow); color: var(--bg); }
    .flow-node-icon.not-started { background: var(--dim); color: var(--bg); }
    .flow-node-title {
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .flow-node-progress { display: flex; align-items: center; gap: 6px; }
    .flow-node-bar {
      flex: 1; height: 4px;
      background: var(--border);
      border-radius: 2px; overflow: hidden;
    }
    .flow-node-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .flow-node-pct { font-size: 10px; color: var(--muted); min-width: 28px; text-align: right; }

    /* ── Flow connector ── */
    .flow-connector {
      width: 2px; height: 20px;
      background: var(--border);
      position: relative;
    }
    .flow-connector::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--border);
    }

    /* ── Detail panel (right) ── */
    .detail-panel {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      min-width: 0;
    }
    .detail-panel::-webkit-scrollbar { width: 8px; }
    .detail-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--muted);
      padding: 40px;
      text-align: center;
    }
    .empty-state .icon { font-size: 40px; opacity: 0.4; }
    .empty-state h3 { font-size: 14px; font-weight: 600; color: var(--fg); }
    .empty-state p { font-size: 12px; max-width: 300px; }

    /* ── Feature detail ── */
    .feature-detail { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .detail-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border);
    }
    .detail-header-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .detail-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .detail-badge.completed { background: var(--green); color: var(--bg); }
    .detail-badge.in-progress { background: var(--orange); color: #fff; }
    .detail-badge.pending-sync { background: var(--yellow); color: var(--bg); }
    .detail-badge.not-started { background: var(--dim); color: var(--bg); }
    .detail-title { font-size: 18px; font-weight: 700; flex: 1; }
    .detail-open-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--fg);
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-family: var(--ui-font);
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.15s;
    }
    .detail-open-btn:hover { background: var(--hover-bg); }

    .detail-stats { display: flex; gap: 16px; margin-top: 12px; }
    .detail-stat { display: flex; flex-direction: column; gap: 2px; }
    .detail-stat-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
    }
    .detail-stat-value { font-size: 14px; font-weight: 600; }
    .detail-progress { margin-top: 12px; }
    .detail-progress-bar {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    .detail-progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
    .detail-progress-label { font-size: 11px; color: var(--muted); margin-top: 4px; }
    .detail-overview {
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.6;
      padding: 8px 12px;
      background: var(--card-bg);
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    /* ── Accordion sections ── */
    .detail-body { padding: 8px 0; }
    .accordion { border-bottom: 1px solid var(--border); }
    .accordion:last-child { border-bottom: none; }
    .accordion-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .accordion-header:hover { background: var(--hover-bg); }
    .accordion-chevron {
      transition: transform 0.2s;
      width: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .accordion.open .accordion-chevron { transform: rotate(90deg); }
    .accordion-icon {
      width: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
    }
    .accordion-label { flex: 1; font-weight: 600; font-size: 12px; }
    .accordion-count {
      font-size: 11px;
      color: var(--muted);
      background: var(--border);
      padding: 1px 6px;
      border-radius: 8px;
    }
    .accordion-body { display: none; padding: 4px 24px 12px 48px; }
    .accordion.open .accordion-body { display: block; }

    /* ── Task items ── */
    .task-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .task-checkbox {
      width: 16px; height: 16px;
      border-radius: 3px;
      border: 1.5px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
      transition: border-color 0.15s, background 0.15s;
    }
    .task-checkbox svg { width: 10px; height: 10px; }
    .task-checkbox.checked {
      background: var(--green);
      border-color: var(--green);
      color: var(--bg);
    }
    .task-checkbox.unchecked { border-color: var(--dim); color: transparent; }
    .task-text { flex: 1; }
    .task-text.done { text-decoration: line-through; opacity: 0.5; }

    /* ── Export overlay ── */
    .export-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .export-overlay.show { display: flex; }
    .export-dialog {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px var(--shadow);
    }
    .export-dialog h3 { margin-bottom: 12px; font-size: 14px; }
    .export-dialog p { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
    .export-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .export-btn {
      padding: 6px 14px;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: none;
      color: var(--fg);
      cursor: pointer;
      font-family: var(--ui-font);
      font-size: 12px;
      transition: background 0.15s;
    }
    .export-btn:hover { background: var(--hover-bg); }
    .export-btn.primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
    .export-btn.primary:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span class="logo"><svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M99.23 10.59C100.25 11.62 100.82 13 100.82 14.44C100.82 15.89 100.25 17.27 99.23 18.3L54.93 62.6C54.42 63.11 53.81 63.51 53.14 63.79C52.47 64.06 51.75 64.2 51.03 64.19C50.31 64.19 49.59 64.04 48.93 63.75C48.26 63.47 47.66 63.05 47.16 62.53L29.7 44.48C28.7 43.44 28.16 42.05 28.19 40.61C28.22 39.17 28.81 37.8 29.85 36.8C30.88 35.8 32.27 35.25 33.71 35.27C35.15 35.29 36.53 35.88 37.53 36.9L51.14 50.97L91.53 10.59C92.55 9.57 93.93 9 95.38 9C96.82 9 98.21 9.57 99.23 10.59Z" fill="var(--green)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M99.04 38C100.06 39.02 100.64 40.41 100.64 41.85C100.64 43.3 100.06 44.68 99.04 45.7L54.74 90C54.23 90.52 53.62 90.92 52.95 91.19C52.28 91.47 51.57 91.61 50.84 91.6C50.12 91.59 49.41 91.44 48.74 91.16C48.08 90.87 47.48 90.46 46.97 89.94L29.51 71.89C28.52 70.85 27.97 69.46 28 68.02C28.03 66.58 28.63 65.21 29.66 64.21C30.7 63.21 32.08 62.65 33.52 62.67C34.96 62.69 36.34 63.28 37.35 64.31L50.96 78.38L91.34 38C92.36 36.98 93.75 36.41 95.19 36.41C96.64 36.41 98.02 36.98 99.04 38Z" fill="var(--orange)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M99.23 65.4C100.25 66.42 100.82 67.81 100.82 69.25C100.82 70.7 100.25 72.08 99.23 73.1L54.93 117.41C54.42 117.92 53.81 118.32 53.14 118.6C52.47 118.87 51.75 119.01 51.03 119C50.31 118.99 49.59 118.85 48.93 118.56C48.26 118.28 47.66 117.86 47.16 117.34L29.7 99.29C28.7 98.25 28.16 96.86 28.19 95.42C28.22 93.98 28.81 92.61 29.85 91.61C30.88 90.61 32.27 90.06 33.71 90.07C35.15 90.09 36.53 90.68 37.53 91.71L51.14 105.78L91.53 65.4C92.55 64.38 93.93 63.81 95.38 63.81C96.82 63.81 98.21 64.38 99.23 65.4Z" fill="var(--dim)"/></svg></span>
      Apex Project Flow
    </div>
    <button class="toolbar-btn" onclick="doRefresh()" title="Refresh">
      ${svgIcon('refresh')} Refresh
    </button>
    <span class="toolbar-sep"></span>
    <button class="toolbar-btn" onclick="doExpandAll()" title="Expand All">
      ${svgIcon('expandAll')} Expand
    </button>
    <button class="toolbar-btn" onclick="doCollapseAll()" title="Collapse All">
      ${svgIcon('collapseAll')} Collapse
    </button>
    <span class="toolbar-sep"></span>
    <button class="toolbar-btn" onclick="doExportPng()" title="Export PNG">
      ${svgIcon('exportIcon')} Export PNG
    </button>
  </div>

  <div class="main" id="main">
    <div class="flow-panel" id="flowPanel"></div>
    <div class="detail-panel" id="detailPanel"></div>
  </div>

  <div class="export-overlay" id="exportOverlay">
    <div class="export-dialog">
      <h3>Export Diagram as PNG</h3>
      <p>Export the flow diagram and feature details as a PNG image.</p>
      <div class="export-actions">
        <button class="export-btn" onclick="closeExport()">Cancel</button>
        <button class="export-btn primary" onclick="confirmExport()">Export</button>
      </div>
    </div>
  </div>

  <script>
    var vscode = acquireVsCodeApi();
    var features = ${featuresJson};
    var sortedIds = ${sortedJson};
    var selectedId = null;

    var svgRefresh = ${JSON.stringify(SVG.refresh)};
    var svgExpand = ${JSON.stringify(SVG.expandAll)};
    var svgCollapse = ${JSON.stringify(SVG.collapseAll)};
    var svgExport = ${JSON.stringify(SVG.exportIcon)};
    var svgGoToFile = ${JSON.stringify(SVG.goToFile)};
    var svgChevron = ${JSON.stringify(SVG.chevronRight)};
    var svgFolder = ${JSON.stringify(SVG.folder)};
    var svgShield = ${JSON.stringify(SVG.shield)};
    var svgCheck = ${JSON.stringify(SVG.check)};

    function icon(svg, size) {
      size = size || 14;
      return '<span style="display:inline-flex;width:' + size + 'px;height:' + size + 'px;align-items:center;justify-content:center;flex-shrink:0;vertical-align:middle;">' + svg + '</span>';
    }

    function escapeHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function getFeature(id) { return features.find(function(f) { return f.id === id; }); }

    function stateLabel(state) {
      if (state === 'completed') return 'Completed';
      if (state === 'in-progress') return 'In Progress';
      if (state === 'pending-sync') return 'Sync Needed';
      return 'Not Started';
    }

    function pctColor(state) {
      if (state === 'completed') return 'var(--green)';
      if (state === 'in-progress') return 'var(--orange)';
      if (state === 'pending-sync') return 'var(--yellow)';
      return 'var(--dim)';
    }

    function pct(feature) {
      return feature.taskCounts.total > 0
        ? Math.round((feature.taskCounts.completed / feature.taskCounts.total) * 100)
        : 0;
    }

    /* ── Render flow nodes ── */
    function renderFlow() {
      var panel = document.getElementById('flowPanel');
      if (features.length === 0) {
        panel.innerHTML = '<div class="empty-state"><div class="icon">&#9776;</div><h3>No features yet</h3><p>Run apex-feature-kit init all to get started.</p></div>';
        return;
      }
      var html = '';
      for (var i = 0; i < sortedIds.length; i++) {
        var f = getFeature(sortedIds[i]);
        if (!f) continue;
        var p = pct(f);
        var sel = f.id === selectedId ? ' selected' : '';
        html += '<div class="flow-node ' + f.state + sel + '" data-id="' + escapeHtml(f.id) + '" onclick="selectFeature(\\'' + escapeHtml(f.id) + '\\')" ondblclick="openSpec(\\'' + escapeHtml(f.id) + '\\')">';
        html += '  <div class="flow-node-header">';
        html += '    <div class="flow-node-icon ' + f.state + '">' + svgCheck + '</div>';
        html += '    <div class="flow-node-title">' + escapeHtml(f.title) + '</div>';
        html += '  </div>';
        html += '  <div class="flow-node-progress">';
        html += '    <div class="flow-node-bar"><div class="flow-node-bar-fill" style="width:' + p + '%;background:' + pctColor(f.state) + '"></div></div>';
        html += '    <span class="flow-node-pct">' + p + '%</span>';
        html += '  </div>';
        html += '</div>';
        if (i < sortedIds.length - 1) html += '<div class="flow-connector"></div>';
      }
      panel.innerHTML = html;
    }

    /* ── Render detail panel ── */
    function renderDetail() {
      var panel = document.getElementById('detailPanel');
      if (!selectedId) {
        panel.innerHTML = '<div class="empty-state"><h3>Select a feature</h3><p>Click a flow node to view details, or double-click to open the spec file.</p></div>';
        return;
      }
      var f = getFeature(selectedId);
      if (!f) { panel.innerHTML = ''; return; }
      var p = pct(f);
      var html = '<div class="feature-detail">';

      html += '<div class="detail-header">';
      html += '  <div class="detail-header-top">';
      html += '    <span class="detail-title">' + escapeHtml(f.title) + '</span>';
      html += '    <span class="detail-badge ' + f.state + '">' + stateLabel(f.state) + '</span>';
      html += '    <button class="detail-open-btn" onclick="openSpec(\\'' + escapeHtml(f.id) + '\\')">' + icon(svgGoToFile) + ' Open Spec</button>';
      html += '  </div>';

      html += '  <div class="detail-stats">';
      html += '    <div class="detail-stat"><span class="detail-stat-label">Tasks</span><span class="detail-stat-value">' + f.taskCounts.completed + '/' + f.taskCounts.total + '</span></div>';
      if (f.dodCounts.total > 0) {
        html += '    <div class="detail-stat"><span class="detail-stat-label">DoD</span><span class="detail-stat-value">' + f.dodCounts.completed + '/' + f.dodCounts.total + '</span></div>';
      }
      html += '    <div class="detail-stat"><span class="detail-stat-label">Created</span><span class="detail-stat-value">' + escapeHtml(f.created_at) + '</span></div>';
      if (f.completed_at) {
        html += '    <div class="detail-stat"><span class="detail-stat-label">Completed</span><span class="detail-stat-value">' + escapeHtml(f.completed_at) + '</span></div>';
      }
      html += '  </div>';

      if (f.taskCounts.total > 0) {
        html += '  <div class="detail-progress">';
        html += '    <div class="detail-progress-bar"><div class="detail-progress-fill" style="width:' + p + '%;background:' + pctColor(f.state) + '"></div></div>';
        html += '    <div class="detail-progress-label">' + f.taskCounts.completed + ' of ' + f.taskCounts.total + ' tasks complete (' + p + '%)</div>';
        html += '  </div>';
      }
      if (f.overview) {
        html += '  <div class="detail-overview">' + escapeHtml(f.overview) + '</div>';
      }
      html += '</div>';

      html += '<div class="detail-body">';

      var phases = new Map();
      for (var t = 0; t < f.tasks.length; t++) {
        var phase = f.tasks[t].phase || 'Tasks';
        if (!phases.has(phase)) phases.set(phase, []);
        phases.get(phase).push(f.tasks[t]);
      }
      var phaseIdx = 0;
      phases.forEach(function(tasks, phaseName) {
        var done = tasks.filter(function(t) { return t.checked; }).length;
        html += '<div class="accordion' + (phaseIdx === 0 ? ' open' : '') + '" data-phase="' + phaseIdx + '">';
        html += '  <div class="accordion-header" onclick="toggleAccordion(this)">';
        html += '    <span class="accordion-chevron">' + svgChevron + '</span>';
        html += '    <span class="accordion-icon">' + svgFolder + '</span>';
        html += '    <span class="accordion-label">' + escapeHtml(phaseName) + '</span>';
        html += '    <span class="accordion-count">' + done + '/' + tasks.length + '</span>';
        html += '  </div>';
        html += '  <div class="accordion-body">';
        for (var i = 0; i < tasks.length; i++) {
          var cls = tasks[i].checked ? 'checked' : 'unchecked';
          var txtCls = tasks[i].checked ? 'done' : '';
          html += '    <div class="task-item">';
          html += '      <div class="task-checkbox ' + cls + '">' + (tasks[i].checked ? svgCheck : '') + '</div>';
          html += '      <span class="task-text ' + txtCls + '">' + escapeHtml(tasks[i].text) + '</span>';
          html += '    </div>';
        }
        html += '  </div>';
        html += '</div>';
        phaseIdx++;
      });

      if (f.definitionOfDone.items.length > 0) {
        var dodDone = f.definitionOfDone.items.filter(function(t) { return t.checked; }).length;
        html += '<div class="accordion" data-phase="dod">';
        html += '  <div class="accordion-header" onclick="toggleAccordion(this)">';
        html += '    <span class="accordion-chevron">' + svgChevron + '</span>';
        html += '    <span class="accordion-icon">' + svgShield + '</span>';
        html += '    <span class="accordion-label">Definition of Done</span>';
        html += '    <span class="accordion-count">' + dodDone + '/' + f.definitionOfDone.items.length + '</span>';
        html += '  </div>';
        html += '  <div class="accordion-body">';
        for (var i = 0; i < f.definitionOfDone.items.length; i++) {
          var item = f.definitionOfDone.items[i];
          var cls = item.checked ? 'checked' : 'unchecked';
          var txtCls = item.checked ? 'done' : '';
          html += '    <div class="task-item">';
          html += '      <div class="task-checkbox ' + cls + '">' + (item.checked ? svgCheck : '') + '</div>';
          html += '      <span class="task-text ' + txtCls + '">' + escapeHtml(item.text) + '</span>';
          html += '    </div>';
        }
        html += '  </div>';
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
      panel.innerHTML = html;
    }

    /* ── Interactions ── */
    function selectFeature(id) { selectedId = id; renderFlow(); renderDetail(); }
    function openSpec(id) { vscode.postMessage({ command: 'openSpec', featureId: id }); }
    function toggleAccordion(header) { header.parentElement.classList.toggle('open'); }
    function doExpandAll() { document.querySelectorAll('.accordion').forEach(function(a) { a.classList.add('open'); }); }
    function doCollapseAll() { document.querySelectorAll('.accordion').forEach(function(a) { a.classList.remove('open'); }); }
    function doRefresh() { vscode.postMessage({ command: 'refresh' }); }
    function doExportPng() { document.getElementById('exportOverlay').classList.add('show'); }
    function closeExport() { document.getElementById('exportOverlay').classList.remove('show'); }
    function confirmExport() { closeExport(); exportToPng(); }

    function exportToPng() {
      var flowPanel = document.getElementById('flowPanel');
      var detailPanel = document.getElementById('detailPanel');
      var canvas = document.createElement('canvas');
      var w = flowPanel.offsetWidth + detailPanel.offsetWidth + 40;
      var h = Math.max(flowPanel.scrollHeight, detailPanel.scrollHeight) + 80;
      canvas.width = w * 2; canvas.height = h * 2;
      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      var cs = getComputedStyle(document.body);
      var bg = cs.getPropertyValue('--bg').trim() || '#1e1e1e';
      var fg = cs.getPropertyValue('--fg').trim() || '#cccccc';
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      ctx.fillStyle = fg; ctx.fillText('Apex Project Flow', 20, 30);
      var yOffset = 60;
      for (var i = 0; i < sortedIds.length; i++) {
        var f = getFeature(sortedIds[i]); if (!f) continue;
        var p = pct(f);
        var stateClr = f.state === 'completed' ? (cs.getPropertyValue('--green').trim() || '#73c991')
          : f.state === 'in-progress' ? (cs.getPropertyValue('--orange').trim() || '#d18616')
          : f.state === 'pending-sync' ? (cs.getPropertyValue('--yellow').trim() || '#cca700')
          : (cs.getPropertyValue('--dim').trim() || '#999');
        ctx.fillStyle = cs.getPropertyValue('--card-bg').trim() || '#2d2d2d';
        ctx.strokeStyle = cs.getPropertyValue('--border').trim() || '#444';
        ctx.lineWidth = 1;
        roundRect(ctx, 30, yOffset, w - 60, 50, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = stateClr; ctx.fillRect(30, yOffset, 3, 50);
        ctx.fillStyle = fg; ctx.font = '600 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillText(f.title, 50, yOffset + 20);
        ctx.fillStyle = stateClr; ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillText(stateLabel(f.state) + '  ' + p + '%', 50, yOffset + 38);
        var barX = w - 200; var barW = 100;
        ctx.fillStyle = cs.getPropertyValue('--border').trim() || '#444';
        roundRect(ctx, barX, yOffset + 28, barW, 4, 2); ctx.fill();
        ctx.fillStyle = stateClr;
        roundRect(ctx, barX, yOffset + 28, barW * p / 100, 4, 2); ctx.fill();
        ctx.fillStyle = cs.getPropertyValue('--muted').trim() || '#999';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillText(f.taskCounts.completed + '/' + f.taskCounts.total, barX + barW + 8, yOffset + 32);
        if (i < sortedIds.length - 1) {
          ctx.strokeStyle = cs.getPropertyValue('--border').trim() || '#444';
          ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(w / 2, yOffset + 50); ctx.lineTo(w / 2, yOffset + 65); ctx.stroke();
        }
        yOffset += 65;
      }
      var dataUrl = canvas.toDataURL('image/png');
      vscode.postMessage({ command: 'exportPng', data: dataUrl });
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    }

    if (sortedIds.length > 0) selectedId = sortedIds[0];
    renderFlow();
    renderDetail();
  </script>
</body>
</html>`;
}
