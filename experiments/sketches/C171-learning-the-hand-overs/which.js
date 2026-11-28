// C171 · which pairs settled (a check written after the run): one worked example, every candidate, the ones that settle
'use strict';
process.argv[2] = '';
const src = require('fs').readFileSync('./learn.js', 'utf8').replace(/const out = \['C171[\s\S]*$/, 'module.exports = { CANDIDATES, workedPage, runOn, key, rng, digitsOf };');
require('fs').writeFileSync('/tmp/c171-lib.js', src.replace(/require\('\.\//g, `require('${__dirname}/`));
const { CANDIDATES, workedPage, runOn, key, rng, digitsOf } = require('/tmp/c171-lib.js');
const rand = rng(424242);
for (let e = 0; e < 3; e++) {
  const top = digitsOf(rand, 2 + e % 3), mult = digitsOf(rand, 2);
  const { page, hot } = workedPage(top, mult, false);
  console.log(`example ${e + 1} (${top.join('')} × ${mult.join('')}): settled by ${CANDIDATES.filter((ch) => runOn(ch, page, hot).log.settled).map(key).join(' | ')}`);
}
