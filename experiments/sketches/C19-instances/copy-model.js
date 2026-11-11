// Freezes C18: copies models/shift.js to models/instances.js, which C19 then changes. shift.js stays as it was.
'use strict';
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '../../models/shift.js'), dst = path.join(__dirname, '../../models/instances.js');
fs.copyFileSync(src, dst); console.log('copied', src, '->', dst);
