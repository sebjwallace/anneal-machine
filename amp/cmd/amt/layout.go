package main

import (
	"container/heap"
	"slices"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// The layout places each member on a grid, left to right by its bonds, and routes each bond as a line of
// box-drawing cells. It is worked out once for the whole memory, so nothing moves while moments are stepped through;
// what a moment hasn't reached yet is simply not drawn.

const (
	nodeWidth = 2 // a member is drawn as its letter and a subscript number, as in t₄
	colPitch  = nodeWidth + 6
	rowPitch  = 2
	marginTop = 4
	marginBot = 4
	marginL   = 1
	marginR   = 6
)

type point struct{ x, y int }

// Directions a line leaves a cell by.
const (
	up = 1 << iota
	down
	left
	right
)

// route is one bond's line: the cells it passes through, each with the directions it leaves by, and the arrow at
// the end, beside the member it goes to.
type route struct {
	cells []point
	bits  []int
	arrow rune
}

type layout struct {
	width, height int
	nodes         map[engine.Member]point // where each member's label starts
	routes        map[engine.Bond]route
	crossings     map[point]bool // cells where two unrelated lines cross
	top, bottom   int            // the first and last rows anything is drawn on
}

// order lists the members of the memory in the order they first appear in its bonds, then any member with no bond.
func order(memory *engine.Memory) []engine.Member {
	var members []engine.Member
	seen := map[engine.Member]bool{}
	add := func(m engine.Member) {
		if !seen[m] {
			seen[m] = true
			members = append(members, m)
		}
	}
	for _, b := range memory.Bonds() {
		add(b.From)
		add(b.To)
	}
	for _, p := range memory.Populations() {
		for _, m := range memory.Selected(p.Name()) {
			add(m)
		}
	}
	return members
}

func lay(memory *engine.Memory) layout {
	members := order(memory)
	bonds := memory.Bonds()
	index := map[engine.Member]int{}
	for i, m := range members {
		index[m] = i
	}
	out := make([][]int, len(members)) // bond indices leaving each member
	for i, b := range bonds {
		out[index[b.From]] = append(out[index[b.From]], i)
	}

	// Bonds that lead back to a member already on the way there (loops) are drawn as return lines and don't count
	// towards placing members left to right.
	back := make([]bool, len(bonds))
	state := make([]int, len(members)) // 0 unvisited, 1 on the way, 2 done
	var visit func(int)
	visit = func(v int) {
		state[v] = 1
		for _, bi := range out[v] {
			w := index[bonds[bi].To]
			switch state[w] {
			case 0:
				visit(w)
			case 1:
				back[bi] = true
			}
		}
		state[v] = 2
	}
	for v := range members {
		if state[v] == 0 {
			visit(v)
		}
	}

	// Columns: the longest way in from a member nothing leads to.
	col := make([]int, len(members))
	in := make([]int, len(members))
	for i, b := range bonds {
		if !back[i] {
			in[index[b.To]]++
		}
	}
	queue := []int{}
	for v := range members {
		if in[v] == 0 {
			queue = append(queue, v)
		}
	}
	for len(queue) > 0 {
		v := queue[0]
		queue = queue[1:]
		for _, bi := range out[v] {
			if back[bi] {
				continue
			}
			w := index[bonds[bi].To]
			col[w] = max(col[w], col[v]+1)
			if in[w]--; in[w] == 0 {
				queue = append(queue, w)
			}
		}
	}

	// Rows: a member goes on the row of the first member that leads into it, or the nearest free row below.
	firstFrom := make([]int, len(members))
	for v := range firstFrom {
		firstFrom[v] = -1
	}
	for i, b := range bonds {
		if w := index[b.To]; !back[i] && firstFrom[w] < 0 {
			firstFrom[w] = index[b.From]
		}
	}
	placing := make([]int, len(members))
	for v := range placing {
		placing[v] = v
	}
	slices.SortStableFunc(placing, func(a, b int) int { return col[a] - col[b] })
	row := make([]int, len(members))
	taken := map[point]bool{}
	maxCol, maxRow := 0, 0
	for _, v := range placing {
		r := 0
		if f := firstFrom[v]; f >= 0 {
			r = row[f]
		}
		for taken[point{col[v], r}] {
			r++
		}
		row[v] = r
		taken[point{col[v], r}] = true
		maxCol, maxRow = max(maxCol, col[v]), max(maxRow, r)
	}

	l := layout{
		width:     marginL + (maxCol+1)*colPitch + marginR,
		height:    marginTop + (maxRow+1)*rowPitch + marginBot,
		nodes:     map[engine.Member]point{},
		routes:    map[engine.Bond]route{},
		crossings: map[point]bool{},
	}
	for v, m := range members {
		l.nodes[m] = point{marginL + 1 + col[v]*colPitch, marginTop + row[v]*rowPitch}
	}

	// Route the short lines first, so a chain stays a straight row, and the return lines last.
	routing := make([]int, len(bonds))
	for i := range routing {
		routing[i] = i
	}
	span := func(i int) int {
		d := col[index[bonds[i].To]] - col[index[bonds[i].From]]
		if back[i] {
			return 1000 - d
		}
		return d + 10*abs(row[index[bonds[i].To]]-row[index[bonds[i].From]])
	}
	slices.SortStableFunc(routing, func(a, b int) int { return span(a) - span(b) })
	g := newGrid(l)
	for _, i := range routing {
		if r, ok := g.route(bonds[i]); ok {
			l.routes[bonds[i]] = r
		}
	}
	l.crossings = g.crossings
	l.top, l.bottom = l.height, 0
	for _, p := range l.nodes {
		l.top, l.bottom = min(l.top, p.y), max(l.bottom, p.y)
	}
	for _, r := range l.routes {
		for _, c := range r.cells {
			l.top, l.bottom = min(l.top, c.y), max(l.bottom, c.y)
		}
	}
	if l.top > l.bottom {
		l.top, l.bottom = 0, 0
	}
	return l
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

// grid is the routing surface: which cells members take up, and which lines already pass through each cell.
type grid struct {
	l         layout
	blocked   map[point]bool
	ends      map[point]engine.Member // arrow cells, by the member they point into
	starts    map[point]engine.Member // the first cell of the lines leaving each member
	used      map[point][]engine.Bond
	bits      map[point]int
	crossings map[point]bool
}

func newGrid(l layout) *grid {
	g := &grid{l: l, blocked: map[point]bool{}, ends: map[point]engine.Member{}, starts: map[point]engine.Member{},
		used: map[point][]engine.Bond{}, bits: map[point]int{}, crossings: map[point]bool{}}
	for m, p := range l.nodes {
		for x := p.x - 1; x <= p.x+nodeWidth; x++ {
			g.blocked[point{x, p.y}] = true
		}
		g.starts[point{p.x + nodeWidth + 1, p.y}] = m
	}
	return g
}

// shareable is true when a line for b may run through a cell alongside the lines already there: they all leave the
// same member (branching), or all go to the same member (joining).
func (g *grid) shareable(c point, b engine.Bond) bool {
	there := g.used[c]
	sameFrom, sameTo := true, true
	for _, o := range there {
		sameFrom = sameFrom && o.From == b.From
		sameTo = sameTo && o.To == b.To
	}
	return sameFrom || sameTo
}

type step struct {
	x, y, dir int
}

var moves = []struct{ dx, dy, bit int }{{0, -1, up}, {0, 1, down}, {-1, 0, left}, {1, 0, right}}

func opposite(bit int) int {
	switch bit {
	case up:
		return down
	case down:
		return up
	case left:
		return right
	}
	return left
}

func (g *grid) inside(c point) bool {
	return c.x >= 0 && c.y >= 0 && c.x < g.l.width && c.y < g.l.height
}

// enterable says whether a line for b may enter cell c moving in direction dir, and what it costs. A line may cross
// an unrelated straight line at right angles, going straight on.
func (g *grid) enterable(c point, b engine.Bond, dir int) (cost float64, crossing bool, ok bool) {
	if !g.inside(c) || g.blocked[c] {
		return 0, false, false
	}
	if to, isEnd := g.ends[c]; isEnd && to != b.To {
		return 0, false, false
	}
	if from, isStart := g.starts[c]; isStart && from != b.From {
		return 0, false, false
	}
	if len(g.used[c]) == 0 {
		return 1, false, true
	}
	if g.shareable(c, b) {
		return 0.3, false, true
	}
	bits := g.bits[c]
	horizontal, vertical := left|right, up|down
	if (bits == horizontal && dir&vertical != 0) || (bits == vertical && dir&horizontal != 0) {
		return 12, true, true
	}
	return 0, false, false
}

// route finds the cheapest line from the member b leaves to the member it goes to, entering that member from the
// left, from above or from below.
func (g *grid) route(b engine.Bond) (route, bool) {
	from, to := g.l.nodes[b.From], g.l.nodes[b.To]
	start := point{from.x + nodeWidth + 1, from.y}
	goals := map[point]rune{
		{to.x - 2, to.y}: '→',
		{to.x, to.y - 1}: '▼',
		{to.x, to.y + 1}: '▲',
	}
	if _, _, ok := g.enterable(start, b, right); !ok {
		return route{}, false
	}
	best := map[step]float64{}
	prev := map[step]step{}
	open := &queue{}
	first := step{start.x, start.y, right}
	best[first] = 0
	heap.Push(open, item{first, 0})
	var goal *step
	for open.Len() > 0 {
		cur := heap.Pop(open).(item)
		if cur.cost > best[cur.s] {
			continue
		}
		c := point{cur.s.x, cur.s.y}
		if _, isGoal := goals[c]; isGoal && !g.crossings[c] {
			s := cur.s
			goal = &s
			break
		}
		for _, mv := range moves {
			if mv.bit == opposite(cur.s.dir) {
				continue
			}
			next := point{c.x + mv.dx, c.y + mv.dy}
			cost, crossing, ok := g.enterable(next, b, mv.bit)
			if !ok {
				continue
			}
			if mv.bit != cur.s.dir {
				if crossing || g.crossings[c] || cur.s == first {
					continue // no turning on a crossing, or straight out of a member
				}
				cost += 2
			}
			if crossing {
				// go straight through: the cell after must take the line too, without another crossing
				after := point{next.x + mv.dx, next.y + mv.dy}
				afterCost, afterCrossing, afterOK := g.enterable(after, b, mv.bit)
				if !afterOK || afterCrossing {
					continue
				}
				mid := step{next.x, next.y, mv.bit}
				s := step{after.x, after.y, mv.bit}
				total := cur.cost + cost + afterCost
				if old, seen := best[s]; !seen || total < old {
					best[mid] = cur.cost + cost
					prev[mid] = cur.s
					best[s] = total
					prev[s] = mid
					heap.Push(open, item{s, total})
				}
				continue
			}
			if goals[next] == '→' && mv.bit != right {
				cost += 3 // join a line into a member before its arrow, not on it
			}
			s := step{next.x, next.y, mv.bit}
			total := cur.cost + cost
			if old, seen := best[s]; !seen || total < old {
				best[s] = total
				prev[s] = cur.s
				heap.Push(open, item{s, total})
			}
		}
	}
	if goal == nil {
		return route{}, false
	}
	var steps []step
	for s := *goal; ; s = prev[s] {
		steps = append(steps, s)
		if s == first {
			break
		}
	}
	slices.Reverse(steps)
	r := route{arrow: goals[point{goal.x, goal.y}]}
	for i, s := range steps {
		c := point{s.x, s.y}
		bits := 0
		if i == 0 {
			bits |= left // the stub back to the member the line leaves
		} else {
			bits |= opposite(s.dir)
		}
		if i+1 < len(steps) {
			bits |= steps[i+1].dir
		}
		r.cells = append(r.cells, c)
		r.bits = append(r.bits, bits)
	}
	for i, c := range r.cells {
		if len(g.used[c]) > 0 && !g.shareable(c, b) {
			g.crossings[c] = true
		} else {
			g.bits[c] |= r.bits[i]
		}
		g.used[c] = append(g.used[c], b)
	}
	g.ends[point{goal.x, goal.y}] = b.To
	return r, true
}

type item struct {
	s    step
	cost float64
}

type queue []item

func (q queue) Len() int           { return len(q) }
func (q queue) Less(i, j int) bool { return q[i].cost < q[j].cost }
func (q queue) Swap(i, j int)      { q[i], q[j] = q[j], q[i] }
func (q *queue) Push(x any)        { *q = append(*q, x.(item)) }
func (q *queue) Pop() any          { old := *q; it := old[len(old)-1]; *q = old[:len(old)-1]; return it }
