#!/bin/sh
# Checks the JavaScript copy against the Go engine: same scenarios, same output, moment by moment.
# Copies amp/engine's source (not its tests) next to gocheck/main.go, builds with the local Go, and diffs.
set -e
here=$(cd "$(dirname "$0")" && pwd)
node "$here/scenarios.js"
rm -rf "$here/gocheck/engine" && mkdir "$here/gocheck/engine"
cp "$here/../../../../amp/engine/"*.go "$here/gocheck/engine/" && rm "$here/gocheck/engine/"*_test.go
printf 'module c122check\n\ngo %s\n' "$(GOTOOLCHAIN=local go env GOVERSION | sed 's/go//')" > "$here/gocheck/go.mod"
(cd "$here/gocheck" && GOTOOLCHAIN=local go run . ../scenarios.json > ../out-go.txt)
rm -rf "$here/gocheck/engine"
node "$here/run-js.js" > "$here/out-js.txt"
if diff "$here/out-go.txt" "$here/out-js.txt" > /dev/null; then echo "same: $(wc -l < "$here/out-go.txt") lines"; else echo "DIFFERENT"; diff "$here/out-go.txt" "$here/out-js.txt" | head -20; exit 1; fi
