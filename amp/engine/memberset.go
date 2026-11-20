package engine

import (
	"math/bits"
	"slices"
)

// memberSet is a set of members, one bit each, numbered across every population in the order they were declared.
type memberSet []uint64

func (s *memberSet) add(member int) {
	word := member / 64
	for len(*s) <= word {
		*s = append(*s, 0)
	}
	(*s)[word] |= 1 << (member % 64)
}

func (s memberSet) has(member int) bool {
	word := member / 64
	return word < len(s) && s[word]&(1<<(member%64)) != 0
}

// addAll puts every member of p in the set.
func (s *memberSet) addAll(p Population) {
	for i := p.first; i < p.first+p.size; i++ {
		s.add(i)
	}
}

func (s memberSet) union(other memberSet) memberSet {
	longer, shorter := s, other
	if len(shorter) > len(longer) {
		longer, shorter = shorter, longer
	}
	result := slices.Clone(longer)
	for i, word := range shorter {
		result[i] |= word
	}
	return result
}

func (s memberSet) intersection(other memberSet) memberSet {
	result := make(memberSet, min(len(s), len(other)))
	for i := range result {
		result[i] = s[i] & other[i]
	}
	return result
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

// isEmpty is true when the set has no members.
func (s memberSet) isEmpty() bool {
	return !slices.ContainsFunc(s, func(word uint64) bool { return word != 0 })
}

// key writes the set so that two sets with the same members give the same key.
func (s memberSet) key() string {
	end := len(s)
	for end > 0 && s[end-1] == 0 {
		end--
	}
	key := make([]byte, 0, end*8)
	for _, word := range s[:end] {
		for shift := 0; shift < 64; shift += 8 {
			key = append(key, byte(word>>shift))
		}
	}
	return string(key)
}
