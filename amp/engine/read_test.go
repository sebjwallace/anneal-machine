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

// Option 3 in its L1B form: the motif b c is cast once, and every L1A member that took part projects up to it.
func TestCastingAMotif(t *testing.T) {
	m := New()
	mustRead(t, m, "abcd")
	if len(m.Assemblies()) != 0 {
		t.Fatal("a read with no motif casts nothing")
	}
	second := mustRead(t, m, "xbcy")
	cast := second.Moments[3].Cast // y, the burst that ends the motif b c
	if cast == nil || !cast.New || cast.Assembly != 1 {
		t.Fatalf("y should cast #1: %+v", cast)
	}
	a, _ := m.Assembly(1)
	if a.Name() != "bc" || len(a.Members) != 2 || len(a.Bonds()) != 2 {
		t.Fatalf("#1 should be b c, two members bonded both ways: %+v", a)
	}
	b, c := second.Moments[1], second.Moments[2]
	if len(a.From[0]) != 2 || a.From[0][0] != b.Member || len(a.From[1]) != 1 || a.From[1][0] != c.Member {
		t.Errorf("the new b and the b that primed c should both project up to #1's b, and c to its c: %v", a.From)
	}

	third := mustRead(t, m, "zbcq")
	again := third.Moments[3].Cast
	if again == nil || again.New || again.Assembly != 1 || len(again.Projections) != 1 {
		t.Fatalf("b c from a third way in should add one projection to #1: %+v", again)
	}
	if len(m.Assemblies()) != 1 {
		t.Errorf("%d assemblies, want 1", len(m.Assemblies()))
	}
}

// A read that ends in a motif casts it at its last moment; repeated letters get a member each.
func TestCastingAtTheEndOfARead(t *testing.T) {
	m := New()
	mustRead(t, m, "the cat the")
	r := mustRead(t, m, "the cat the")
	last := r.Moments[len(r.Moments)-1].Cast
	if last == nil {
		t.Fatal("the read ends in a motif, so its last moment casts it")
	}
	a, _ := m.Assembly(last.Assembly)
	if a.Name() != "the_cat_the" {
		t.Errorf("cast %s, want the_cat_the (from the burst t, the rest primed)", a.Name())
	}
	seen := map[Member]bool{}
	for _, member := range a.Members {
		if seen[member] {
			t.Errorf("%s is in #%d twice", member, a.ID)
		}
		seen[member] = true
	}
}

func TestSnapshotKeepsAssemblies(t *testing.T) {
	m := New()
	mustRead(t, m, "abcd")
	mustRead(t, m, "xbcy")
	mustRead(t, m, "zbcq")
	var file bytes.Buffer
	if err := m.WriteSnapshot(&file); err != nil {
		t.Fatal(err)
	}
	opened, err := ReadSnapshot(&file)
	if err != nil {
		t.Fatal(err)
	}
	a, _ := m.Assembly(1)
	b, ok := opened.Assembly(1)
	if !ok || b.Name() != a.Name() || len(b.From[0]) != 3 {
		t.Errorf("opened #1: %+v, want %+v", b, a)
	}
}

// With gates, casting reuses members, so the reads that used to run L1B out of individuals are all taken in.
func TestReusingMembersInL1B(t *testing.T) {
	m := New()
	for _, text := range []string{
		"the cat sat on the mat the dog sat on the log",
		"the dog sat on the mat",
		"the cat sat on the log",
		"a dog and a cat sat on a mat",
	} {
		mustRead(t, m, text)
	}
	shared := map[Member]int{}
	for _, a := range m.Assemblies() {
		for _, member := range a.Members {
			shared[member]++
		}
	}
	reused := 0
	for _, n := range shared {
		if n > 1 {
			reused++
		}
	}
	if reused == 0 {
		t.Error("some L1B member should belong to more than one assembly")
	}
}

// "the_" is cast. Reading "thx": t bursts, which clears L1B, and its t comes on there, opening the gate (any one
// member opens it). The moment after, the gate brings on e and _, which the input hasn't reached: the assembly is
// complete at h.
func TestL1BGates(t *testing.T) {
	m := New()
	mustRead(t, m, "the cat the dog")
	a, _ := m.Assembly(1)
	if a.Name() != "the_" {
		t.Fatalf("#1 is %s, want the_", a.Name())
	}
	r := mustRead(t, m, "thx")
	at, ah := r.Moments[0].L1B, r.Moments[1].L1B
	if !at.Cleared || len(at.Up) != 1 || at.Up[0] != a.Members[0] || !at.Gates[0].Open || at.Gates[0].Complete() {
		t.Errorf("at t: cleared, #1's t up, its gate open but not complete: %+v", at)
	}
	if ah.Cleared || !ah.Gates[0].Complete() || len(ah.Completed) != 2 {
		t.Errorf("at h: #1 complete, e and _ brought on by its gate: %+v", ah)
	}
	if x := r.Moments[2].L1B; !x.Cleared || len(x.On) != 0 {
		t.Errorf("at x: the burst clears L1B and nothing projects up from x: %+v", x)
	}
}
