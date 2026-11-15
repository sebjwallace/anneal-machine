import { NAME, roleOf } from './roles.js';

// Puts a moment into a few words, read from the moment itself: nothing here is written for one step.

const list = (items) => {
  const words = [...items];
  return words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`;
};
const cells = (set) => list([...set].map((cell) => cell.name).sort());
const columns = (set) => list([...set].map((column) => column.label));

export function caption(moment) {
  if (!moment) return 'Sixteen columns of four cells, nothing stored. Press Next.';
  const said = [];
  if (moment.bursts.length === moment.lit.length) said.push('Nothing predicted it: every lit column bursts.');
  else if (moment.bursts.length) said.push(`Predicted, except ${columns(moment.bursts)}, which burst.`);
  else said.push('Predicted by the moment before.');
  if (moment.recognised.length) said.push(`Recognised in ${columns(moment.recognised)}.`);
  if (moment.uncovered.length) said.push(`Unexplained in ${columns(moment.uncovered)}: fresh cells.`);
  if (moment.refused.length) said.push(`Tie in ${columns(moment.refused)}: refused.`);
  for (const cut of moment.cuts) said.push(`Cut: ${cells(cut.fit)} fit, ${cells(cut.rest)} not there; each becomes an assembly, and the whole is retied from them.`);
  if (moment.parts.length >= 2) said.push(`${moment.parts.length} parts, tied into one assembly.`);
  if (moment.brought.size) said.push(`Brought back ${cells(moment.brought)}.`);
  if (moment.missing.length) said.push(`Predicted, not there: ${cells(moment.missing)}.`);
  if (!moment.grown.length) said.push('Nothing grows.');
  return said.join(' ');
}

// typed: the input as given. An input is the set of columns that are on, so a letter typed twice lights its column
// once; when the two differ, both are shown.
export function summary(moment, typed) {
  if (!moment) return '';
  const lit = moment.input.join('');
  const heat = moment.uncovered.length + moment.brought.size + moment.missing.length;
  const counts = {
    seq: moment.learnt.length,
    part: moment.assemblies.flatMap((assembly) => assembly.segments).length,
  };
  const grown = Object.entries(counts).filter(([, n]) => n)
    .map(([role, n]) => `<span class="${role}">+${n} ${NAME[role]}</span>`).join(' ');
  return `<b>${typed}</b>${typed === lit ? '' : ` <span class="muted">(columns ${lit})</span>`}`
    + ` · ${grown || '<span class="muted">nothing grows</span>'}`
    + ` · <span class="${heat ? 'heat' : 'muted'}">heat ${heat}</span>`;
}

export function cellNote(cell) {
  if (!cell) return '';
  if (!cell.segments.length) return `<b>${cell.name}</b> · no segments`;
  return `<b>${cell.name}</b> · ${cell.segments.map((s) => {
    const role = roleOf(s);
    return `<span class="${role}">${NAME[role]}</span> ← ${s.links.map((c) => c.name).join(' ')}`;
  }).join(' · ')}`;
}
