# Assemblies

## What an assembly is

An **assembly** is a set of members held together by the bonds between them, so that enough of it being active brings
back the rest. It is the machine's memory of a thing. Assemblies are the dynamic structure: they form and break as the
machine learns, unlike populations and communities, which are fixed.

Angle brackets mark an assembly, to tell it apart from a plain set of active members in braces.

```
A = ⟨1, 4, 7⟩      A is an assembly of members 1, 4 and 7
4 ∈ A              4 is a member of A
```

## Composition

An assembly can be made of parts of other assemblies. That is composition.

```
C = ⟨A{2, 4}, B{6, 7}⟩
```

**A name followed by braces means those members of that thing.** So `A{2, 4}` is members 2 and 4 of A, and C is
composed of those together with members 6 and 7 of B.

Composition is close to a union, but not only a union. A plain union forgets which parts belonged together and how
they are joined. In an assembly the joining is the point: the bonds that tie the parts together are part of what it is.
So composition is the union *plus* the bonds that make it complete as one whole.

## Forms and breaks

Two verbs describe structure changing.

```
forms ⟨1, 4, 7⟩     an assembly forms over 1, 4 and 7
breaks 4 -> 7       the bond from 4 to 7 is removed
```

Nothing grows or hardens. Structure forms and breaks, and that is all. What makes it form and break is heat (see
[heat and learning](heat-and-learning.md)).

*Provisional:* the exact form of the two verb statements is not yet agreed.

## Backlog

Named assemblies would let an interpreter report which ones completed during a run, for example "A completed at step
3". Noted for when there is an interpreter.
