package engine

import (
	"bytes"
	"strings"
	"testing"
)

// bursts writes a read as its characters, upper case where the population burst.
func bursts(r Reading) string {
	var b strings.Builder
	for i, moment := range r.Moments {
		c := string(r.Text[i])
		if c == " " {
			c = "_"
		}
		if moment.Burst {
			c = strings.ToUpper(c)
		}
		b.WriteString(c)
	}
	return b.String()
}

func mustRead(t *testing.T, m *Memory, text string) Reading {
	t.Helper()
	r, err := m.Read(text)
	if err != nil {
		t.Fatal(err)
	}
	return r
}

// The owner's example: A B C D, then X B C Y. B bursts the second time too, but C is primed by the B member from the
// first read; the B member picked the second time bonds to that C as well.
func TestRepeatIsPredicted(t *testing.T) {
	m := New()
	if got := bursts(mustRead(t, m, "abcd")); got != "ABCD" {
		t.Errorf("first read: %s", got)
	}
	second := mustRead(t, m, "xbcy")
	if got := bursts(second); got != "XBcY" {
		t.Errorf("second read: %s, want XBcY", got)
	}
	b, c := second.Moments[1], second.Moments[2]
	if !b.New || len(b.Active) != ReadingSize {
		t.Errorf("b should burst with every member active and pick an individual: %+v", b)
	}
	if c.New {
		t.Errorf("c should be the member from the first read, not new")
	}
	if c.Bond == nil || c.Bond.From != b.Member || c.Bond.To != c.Member {
		t.Errorf("the new b member should bond to the primed c: %+v", c.Bond)
	}
	if n := len(m.Bonds()); n != 6 {
		t.Errorf("%d bonds, want 6 (a→b, b→c, c→d, x→b', b'→c, c→y)", n)
	}
}

// A primed member arriving forms nothing new when the bond into it is the one that primed it.
func TestReadingAgainFormsNothing(t *testing.T) {
	m := New()
	mustRead(t, m, "the cat the dog")
	before := len(m.Bonds())
	again := mustRead(t, m, "the cat the dog")
	if got := bursts(again); got != "The_cat_the_dog" {
		t.Errorf("second read: %s, want only the first t to burst", got)
	}
	if got := len(m.Bonds()) - before; got != 1 {
		t.Errorf("%d bonds formed, want 1 (the new t member into h)", got)
	}
}

func TestBurstPicksAnIndividual(t *testing.T) {
	m := New()
	for i := range ReadingSize {
		r := mustRead(t, m, "z")
		if !r.Moments[0].Burst || !r.Moments[0].New {
			t.Fatalf("read %d: z should burst and pick an individual", i+1)
		}
	}
	if got := len(m.Selected("z")); got != ReadingSize {
		t.Errorf("%d members of z selected, want all %d", got, ReadingSize)
	}
	if _, err := m.Read("z"); err == nil {
		t.Error("with no individual left, the read should be refused")
	}
}

func TestReadIsAllOrNothing(t *testing.T) {
	m := New()
	mustRead(t, m, "ab")
	if _, err := m.Read("cd!"); err == nil {
		t.Fatal("! should be refused")
	}
	if len(m.Populations()) != 2 || len(m.Bonds()) != 1 || m.Moment() != 2 {
		t.Errorf("a refused read changed the memory: %d populations, %d bonds, moment %d", len(m.Populations()), len(m.Bonds()), m.Moment())
	}
}

func TestSameReadsSameMemory(t *testing.T) {
	a, b := New(), New()
	text := "the cat sat on the mat the dog sat on the log"
	mustRead(t, a, text)
	mustRead(t, b, text)
	if !equalBonds(a.Bonds(), b.Bonds()) {
		t.Error("the same reads gave different bonds")
	}
}

func TestSnapshotRoundTrip(t *testing.T) {
	m := New()
	mustRead(t, m, "the cat sat on the mat")
	var file bytes.Buffer
	if err := m.WriteSnapshot(&file); err != nil {
		t.Fatal(err)
	}
	opened, err := ReadSnapshot(&file)
	if err != nil {
		t.Fatal(err)
	}
	if !equalBonds(m.Bonds(), opened.Bonds()) || opened.Moment() != m.Moment() {
		t.Fatal("the opened memory differs")
	}
	x, y := mustRead(t, m, "the dog"), mustRead(t, opened, "the dog")
	for i := range x.Moments {
		if x.Moments[i].Member != y.Moments[i].Member {
			t.Errorf("moment %d: %s, opened %s", i+1, x.Moments[i].Member, y.Moments[i].Member)
		}
	}
}

func equalBonds(a, b []Bond) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestMotifs(t *testing.T) {
	m := New()
	mustRead(t, m, "abcd")
	second := mustRead(t, m, "xbcy")
	motifs := second.Motifs()
	if len(motifs) != 1 || motifs[0] != (Motif{Start: 1, End: 2}) || motifs[0].Length() != 1 {
		t.Fatalf("XBcY should have one motif, b c, of 1: %v", motifs)
	}
	again := mustRead(t, New(), "the cat the dog")
	var lengths []int
	for _, l := range again.Motifs() {
		lengths = append(lengths, l.Length())
	}
	// THE_CAT_The_DOG: the second "the " follows on from its burst t
	if len(lengths) != 1 || lengths[0] != 3 {
		t.Errorf("motifs of %v, want one of 3 (t h e _)", lengths)
	}
	if _, in := second.MotifAt(1); in {
		t.Error("b, which burst, isn't yet seen to start a motif")
	}
	if l, in := second.MotifAt(2); !in || l.Length() != 1 {
		t.Errorf("c is in a motif of 1: %v %v", l, in)
	}
}
