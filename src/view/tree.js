import { PALETTE } from './drawing.js';

// The structure as a tree: each assembly over the assemblies it was tied from. One shared by several (an abstraction)
// appears under each of them, marked. Each row shows whether the node is present in the moment.

const MARK = { seen: 'seen', recalled: 'recalled', partial: 'part' };

export function tree(structure, moment, focusNode) {
  if (!structure.nodes.length) return '<div class="empty">Nothing stored yet.</div>';
  const index = new Map(structure.nodes.map((node, i) => [node, i]));
  const row = (node, depth) => {
    const cut = structure.justCut(node);
    const presence = cut ? null : structure.presence(node, moment);
    const swatch = `<span class="sw" style="background:${PALETTE[node.colour % PALETTE.length]}"></span>`;
    const cls = ['node', cut ? 'cut' : presence ?? 'absent', focusNode === node ? 'focus' : ''].join(' ');
    const marks = (cut ? `<span class="mark cut">cut → ${node.replacement?.label ?? ''}</span>` : '')
      + (presence ? `<span class="mark ${presence}">${MARK[presence]}</span>` : '')
      + (node.shared ? '<span class="mark shared">shared</span>' : '');
    return `<div class="${cls}" data-node="${index.get(node)}" style="padding-left:${depth * 16 + 4}px">`
      + `${swatch}<span class="name">${node.label}</span>${marks}<span class="born">t${node.born}</span></div>`
      + node.children.map((child) => row(child, depth + 1)).join('');
  };
  return structure.roots.map((node) => row(node, 0)).join('');
}
