// Freezes C19: copies models/instances.js to models/flow.js, which C20 then changes. instances.js stays as it was.
'use strict';
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '../../models/instances.js'), dst = path.join(__dirname, '../../models/flow.js');
fs.copyFileSync(src, dst); console.log('copied', src, '->', dst);
