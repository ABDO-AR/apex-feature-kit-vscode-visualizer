export const VIEW_ID = 'apexFeatureTree';
export const PANEL_ID = 'apexFlow';
export const PANEL_TITLE = 'Apex Project Flow';
export const INSTRUCTIONS_PANEL_ID = 'apexInstructions';
export const INSTRUCTIONS_PANEL_TITLE = 'Apex — AI Protocol & Instructions';

export const CMD = {
  openFlow: 'apex.openFlow',
  refreshTree: 'apex.refreshTree',
  openSpec: 'apex.openSpec',
  runSync: 'apex.runSync',
  showInstructions: 'apex.showInstructions',
  openTreeYaml: 'apex.openTreeYaml',
  toggleExpandFeatures: 'apex.toggleExpandFeatures',
  toggleExpandTree: 'apex.toggleExpandTree',
  toggleExpandInstructions: 'apex.toggleExpandInstructions',
  toggleExpandFeature: 'apex.toggleExpandFeature',
} as const;

export const CONTEXT_KEY = 'apex.hasFeatures';

export const FEATURES_DIR = '.features';
export const TREE_FILE = 'tree.yaml';
export const SPECS_DIR = 'specs';
export const INSTRUCTIONS_FILE = 'instructions.md';
