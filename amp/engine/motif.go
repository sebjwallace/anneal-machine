package engine

// Motif is a run of correct predictions in a read: from a moment whose population burst, through the moments after it
// that arrived primed, up to the next burst or the end of the read. Its length is how many predictions it got right.
type Motif struct {
	Start, End int // indices into the read's moments, both included: Start burst, the rest arrived primed
}

// Length is how many predictions the motif got right: every moment in it but the one that burst.
func (l Motif) Length() int { return l.End - l.Start }

// Members are the members selected over the motif, in order.
func (l Motif) Members(r Reading) []Member {
	members := make([]Member, 0, l.End-l.Start+1)
	for _, moment := range r.Moments[l.Start : l.End+1] {
		members = append(members, moment.Member)
	}
	return members
}

// Motifs lists the read's motifs, in order. A read always starts with a burst, since nothing is active before it.
func (r Reading) Motifs() []Motif {
	var motifs []Motif
	start := -1
	for i, moment := range r.Moments {
		if moment.Burst {
			start = i
			continue
		}
		if n := len(motifs); n > 0 && motifs[n-1].Start == start {
			motifs[n-1].End = i
		} else {
			motifs = append(motifs, Motif{Start: start, End: i})
		}
	}
	return motifs
}

// MotifAt is the motif the moment at index i is in, as far as that moment, if it is in one.
func (r Reading) MotifAt(i int) (Motif, bool) {
	for _, l := range r.Motifs() {
		if i >= l.Start && i <= l.End {
			if i == l.Start {
				return Motif{}, false // the burst that a motif starts from is only seen to start one once the next arrives primed
			}
			return Motif{Start: l.Start, End: i}, true
		}
	}
	return Motif{}, false
}
