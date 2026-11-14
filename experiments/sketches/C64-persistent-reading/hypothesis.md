# C64 · Persistent assemblies while reading

Theory: `docs/theories/persistent-assemblies.md` (the owner's). What a region settled into stays active and changes
only when something arriving doesn't fit it; a misfit lets it go and that part settles afresh. Tested in the reading
world of C62 (same language, engine and learning): the eye reads new text in order, stepping 2 or 4 letters, either
explaining every window from scratch (FRESH) or carrying forward what it settled into (PERSIST). Expect: much less work
per look, no more left unexplained, and perhaps cleaner cuts. A control (SPLIT) has PERSIST's seam between old and new
letters without carrying anything over, to check that any gain in cuts isn't just the seam. Run: `node run.js` (out.txt).
