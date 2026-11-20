package engine

import "math/bits"

// memberSet is a set of members, one bit each, numbered across every population in the order they were declared.
type memberSet []uint64

// addAll puts every member of p in the set.
func (s *memberSet) addAll(p Population) {
	for i := p.first; i < p.first+p.size; i++ {
		s.add(i)
	}
}

func (s *memberSet) add(member int) {
	word := member / 64
	for len(*s) <= word {
		*s = append(*s, 0)
	}
	(*s)[word] |= 1 << (member % 64)
}

// countIn counts the set's members that belong to p.
func (s memberSet) countIn(p Population) int {
	count := 0
	for i := p.first; i < p.first+p.size; {
		word, offset := i/64, i%64
		width := min(64-offset, p.first+p.size-i)
		if word < len(s) {
			count += bits.OnesCount64(s[word] >> offset & mask(width))
		}
		i += width
	}
	return count
}

// mask has the lowest width bits set.
func mask(width int) uint64 {
	if width == 64 {
		return ^uint64(0)
	}
	return 1<<width - 1
}

// empty removes every member, keeping the room already made.
func (s memberSet) empty() {
	clear(s)
}
