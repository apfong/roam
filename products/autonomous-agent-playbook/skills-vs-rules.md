# Skills vs Rules

Both Claude Code and Cursor now support both patterns. Understanding when to use each is critical for effective agent workflows.

## Definitions

### Rules (Declarative, Always-On)
- **What:** Context that's ALWAYS included in the agent's system prompt
- **When:** Loaded at session start, applies to every turn
- **Format:** `.cursorrules`, `CLAUDE.md`, or rules in config
- **Best for:** Style guides, project conventions, security policies

### Skills (Procedural, On-Demand)
- **What:** Domain-specific procedures agents discover and invoke when relevant
- **When:** Loaded dynamically when the task matches
- **Format:** `SKILL.md` files with procedures, commands, scripts
- **Best for:** "How-to" workflows, domain expertise, multi-step procedures

## Key Insight

> "Rules = what you always want. Skills = what you sometimes need."
> — Cursor docs

Rules bloat context on every turn. Skills keep context focused by loading only what's relevant.

## When to Use Rules

✅ **Coding style & conventions**
```markdown
# .cursorrules / CLAUDE.md
- Use TypeScript strict mode
- Prefer functional components
- Always add error boundaries
```

✅ **Project-specific context**
```markdown
# CLAUDE.md
This is a Next.js 14 app using App Router.
Database: Supabase with Row Level Security.
Auth: Magic link via Supabase Auth.
```

✅ **Security policies**
```markdown
Never commit secrets.
Always validate user input.
Use parameterized queries.
```

✅ **Communication preferences**
```markdown
Be concise. Skip preamble.
Show code, not explanations.
```

## When to Use Skills

✅ **Multi-step workflows**
```markdown
# skills/deploy.md
## Deploy to Production
1. Run tests: `pnpm test`
2. Build: `pnpm build`
3. Check bundle size: `pnpm analyze`
4. Deploy: `vercel --prod`
5. Verify: hit /api/health on prod URL
```

✅ **Domain expertise**
```markdown
# skills/supabase-rls.md
## Adding Row Level Security
1. Create policy with `CREATE POLICY`
2. Test as authenticated user
3. Test as different user (should fail)
4. Test as anon (should fail)
[detailed examples...]
```

✅ **Tool-specific procedures**
```markdown
# skills/git-worktree.md
## Parallel Development with Worktrees
1. Create worktree: `git worktree add ../feature-x feature-x`
2. Work in separate directory
3. Each worktree can have its own Claude session
4. Merge via normal git flow
```

✅ **Conditional workflows**
```markdown
# skills/fix-build.md
## When Build Fails
1. Check error type (TypeScript, ESLint, Test)
2. For TS errors: [procedure]
3. For ESLint: [procedure]
4. For tests: [procedure]
```

## Skill Discovery

Agents should be able to **discover** relevant skills, not have them force-loaded.

### Cursor Approach
Skills are indexed; agent sees skill descriptions and can invoke with `/skill-name` or naturally.

### Claude Code Approach
Skills in project directories are listed in context; agent can read when relevant.

### Manual Invocation
User can always force: "Use the deploy skill" or `/deploy`

## File Organization

```
project/
├── CLAUDE.md              # Rules (always loaded)
├── .cursorrules           # Rules (Cursor)
├── skills/
│   ├── deploy.md          # Skill: deployment workflow
│   ├── testing.md         # Skill: test patterns
│   ├── debugging.md       # Skill: debug procedures
│   └── domain/
│       ├── auth.md        # Domain skill: auth patterns
│       └── payments.md    # Domain skill: Stripe integration
```

## Anti-Patterns

❌ **Putting procedures in rules** — bloats every turn
```markdown
# Bad: in CLAUDE.md
When deploying, first run tests, then build, then...
[500 lines of deployment procedure]
```

❌ **Putting policies in skills** — might not load when needed
```markdown
# Bad: in skills/security.md
Never commit API keys.
# This should be in rules so it's ALWAYS present
```

❌ **Too many rules** — context pollution
If your rules file is >500 lines, split into skills.

❌ **Too granular skills** — discovery overhead
Each skill should be a coherent workflow, not a single command.

## Migration Guide

**If your CLAUDE.md is huge:**
1. Keep: style, conventions, project context, security
2. Move to skills: deployment, testing procedures, domain workflows

**If you have no skills:**
1. Notice when you repeat multi-step instructions
2. Extract to a skill file
3. Reference skill instead of repeating

## Sources

- [Cursor: Skills vs Rules](https://cursor.com/docs/context/skills)
- [Claude Code: CLAUDE.md](https://docs.anthropic.com/en/docs/claude-code/configuration)
- [@bcherny](https://x.com/bcherny/status/2017742748984742078): "If you do something more than once a day, turn it into a skill"
