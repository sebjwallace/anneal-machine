package engine

// Lull is a run of correct predictions in a read: from a moment whose population burst, through the moments after it
// that arrived primed, up to the next burst or the end of the read. Its length is how many predictions it got right.
type Lull struct {
	Start, End int // indices into the read's moments, both included: Start burst, the rest arrived primed
}

// Length is how many predictions the lull got right: every moment in it but the one that burst.
func (l Lull) Length() int { return l.End - l.Start }

// Members are the members selected over the lull, in order.
func (l Lull) Members(r Reading) []Member {
	members := make([]Member, 0, l.End-l.Start+1)
	for _, moment := range r.Moments[l.Start : l.End+1] {
		members = append(members, moment.Member)
	}
	return members
}

// Lulls lists the read's lulls, in order. A read always starts with a burst, since nothing is active before it.
func (r Reading) Lulls() []Lull {
	var lulls []Lull
	start := -1
	for i, moment := range r.Moments {
		if moment.Burst {
			start = i
			continue
		}
		if n := len(lulls); n > 0 && lulls[n-1].Start == start {
			lulls[n-1].End = i
		} else {
			lulls = append(lulls, Lull{Start: start, End: i})
		}
	}
	return lulls
}

// LullAt is the lull the moment at index i is in, as far as that moment, if it is in one.
func (r Reading) LullAt(i int) (Lull, bool) {
	for _, l := range r.Lulls() {
		if i >= l.Start && i <= l.End {
			if i == l.Start {
				return Lull{}, false // the burst that a lull starts from is only seen to start one once the next arrives primed
			}
			return Lull{Start: l.Start, End: i}, true
		}
	}
	return Lull{}, false
}
