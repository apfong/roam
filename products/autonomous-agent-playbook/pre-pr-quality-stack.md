# Pre-PR Quality Stack

Run these skills in order before creating any PR. Catches the "works but sloppy" pattern common in AI-generated code.

## The Stack

```
1. /code-review  → Self-review for bugs, edge cases, security
2. /simplify     → Can this be done with less code?
3. /deslop       → Remove unnecessary comments, dead code, AI-smell
4. /commit-pr    → Then create the PR
```

## Why This Order

1. **Code review first** — Find actual bugs before worrying about style
2. **Simplify second** — Fewer lines = fewer bugs, easier review
3. **Deslop last** — Clean up cosmetic issues after logic is solid
4. **Commit only after all pass** — PR is reviewer-ready

## Implementation

### As a Compound Skill

Create `skills/pre-pr.md`:
```markdown
# Pre-PR Quality Check

Before creating any PR, run these steps in order:

1. Review the changes for bugs, edge cases, and security issues
2. Look for opportunities to simplify — can anything be done with less code?
3. Remove AI-smell: unnecessary comments, dead code, overly verbose variable names
4. Only after all checks pass, create the commit and PR
```

### As Sequential Skill Invocation

```
"Run /code-review, then /simplify, then /deslop, then /commit-pr"
```

Or configure as a hook that runs before PR creation.

## AI-Smell Indicators (for /deslop)

- Comments that just restate the code
- Unused imports or variables
- Overly defensive null checks that can't happen
- Generic variable names (data, result, temp, item)
- Console.log / print statements left in
- TODOs that were already done
- Commented-out code blocks

## VSDD-Style Phased Gates

Source: [Verified Spec-Driven Development](https://gist.github.com/dollspace-gay/d8d3bc3ecf4188df049d7a4726bb2a00)

For higher-stakes work, extend the pre-PR stack with formal gates inspired by VSDD:

### The Full Pipeline

```
Phase 1: Spec Crystallization
    Behavioral contract + edge case catalog + verification strategy
    Gate: Adversary can't find legitimate holes
        ↓
Phase 2: Test-First Implementation (TDD Core)
    Write ALL tests first → Red Gate (all must fail) → Minimal implementation → Refactor
    Gate: All tests green, human approves alignment with spec intent
        ↓
Phase 3: Adversarial Refinement
    Fresh-context reviewer examines spec + tests + implementation
    Zero-tolerance: every critique is a concrete flaw with location
    Gate: Adversary forced to hallucinate flaws (convergence)
        ↓
Phase 4: Feedback Integration Loop
    Spec flaws → back to Phase 1
    Test flaws → back to Phase 2a
    Implementation flaws → back to Phase 2c
        ↓
Phase 5: Create PR (only after convergence)
```

### Key VSDD Ideas Worth Stealing

**1. The Adversary Must Have Fresh Context**
Don't ask the same agent that wrote the code to review it. Use a different session or agent with no accumulated goodwill. Context reset on every review pass.

**2. Convergence Signal = Hallucination Point**
You're done iterating when the reviewer is *forced to invent problems that don't exist*. This is a concrete, testable exit condition — much better than "looks good to me."

**3. Spec Review Before Tests**
The spec is iterated until the adversary can't find legitimate holes in either the behavioral contract or the verification strategy. Tests are never written against a bad spec.

**4. Full Traceability**
```
Spec Requirement → Test Case → Implementation → Adversarial Review
```
At any point, answer: "Why does this line of code exist?" and trace it to a spec requirement.

### When to Use Full VSDD vs Basic Stack

| Scenario | Use |
|----------|-----|
| Bug fix, small feature | Basic stack (review → simplify → deslop) |
| New module, API surface | Add spec gate + adversarial review |
| Security-critical, financial | Full VSDD with formal verification |
| Prototype/exploration | Skip entirely |

---

## Source

Pattern from [@leerob](https://x.com/leerob/status/2018456023145820461) (Vercel), adopted by Claude Code team.
