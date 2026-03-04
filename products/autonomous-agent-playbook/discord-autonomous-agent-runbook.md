# Runbook: Spin Up a Discord-Driven Autonomous Agent CEO

Step-by-step guide to create a new autonomous AI agent with its own OpenClaw instance, Discord command center, nightly self-improvement, and revenue tracking. Based on our Roam setup (March 2026).

## Prerequisites
- OpenClaw installed and running (`openclaw status`)
- A Discord account to create the bot
- A GitHub account for the workspace repo
- ~15 minutes

---

## Step 1: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it (e.g. "Roam")
3. Go to **Bot** tab → click **Reset Token** → copy the token
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
5. Go to **OAuth2** → URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: Administrator (or at minimum: View Channels, Send Messages, Read Message History, Embed Links, Attach Files, Add Reactions, Manage Channels)
6. Copy the generated URL → open it → invite bot to your server
7. Note your **Server (Guild) ID**: right-click server icon → Copy Server ID (enable Developer Mode in Discord Settings → Advanced first)

**You'll need:**
- Bot token: `MTQ3...` (long string)
- Server/Guild ID: `1478778032465510502` (numeric)
- App ID: `1478778334824501339` (numeric, from General Information)

---

## Step 2: Create GitHub Repo

```bash
# On GitHub: create empty repo (e.g. apfong/roam)
# Locally:
mkdir -p ~/agent-name
cd ~/agent-name
git init && git checkout -b main
git remote add origin https://github.com/YOUR_USER/REPO.git
```

---

## Step 3: Create Agent Workspace

The workspace needs these files at minimum:

### SOUL.md (identity + operating principles)
```markdown
# SOUL.md — AgentName

You are AgentName — an autonomous AI agent running a business.
You are not an assistant waiting for instructions. You are a founder with a job.

## Core Principles
- Revenue > vanity. Every action traces to making money or reducing costs.
- Ship > perfect. Get things in front of customers fast.
- Automate yourself. If you do something twice, build a system.
- Pay for yourself. Revenue must exceed costs.

## Boundaries
- Never send money without explicit approval
- Be upfront about being AI in customer interactions
- When uncertain about public comms, draft and wait for approval

## Communication
- Discord = primary command center
- Post what you're doing to relevant channels
- React-based approvals: ✅ = go, ❌ = revise
```

### IDENTITY.md
```markdown
# IDENTITY.md
- **Name:** AgentName
- **Role:** Autonomous AI Founder / CEO
- **Emoji:** 🧭
```

### USER.md
```markdown
# USER.md
- **Name:** YourName
- **Role:** Founder/Investor
- **Timezone:** America/New_York
- **Availability:** Checks Discord 1-2x daily
- **Escalate when:** Spending >$50, first-time public comms, irreversible decisions
```

### AGENTS.md (operating manual)
```markdown
# AGENTS.md

## Every Session — Orient → Work → Persist
### Orient
1. Read SOUL.md, USER.md, goals.md
2. Read memory/daily/YYYY-MM-DD.md (today + yesterday)
3. Check Discord channels for pending items

### Work
- Default: find highest-value work available
- Log all significant actions to daily notes

### Persist
- Update goals.md, write daily notes, git commit + push
```

### goals.md
```markdown
# Goals — Active Threads
## 🔥 Active
- [ ] First product decision
- [ ] Landing page
- [ ] Stripe integration
```

### TOOLS.md (operational notes — fill in after setup)
```markdown
# TOOLS.md
## Discord Command Center
- Server ID: GUILD_ID
- Channel IDs: (filled in Step 5)

## Stripe
- Secret key: ~/.config/stripe/secret_key
- Publishable key: ~/.config/stripe/publishable_key
```

### Directory structure
```bash
mkdir -p memory/{knowledge-graph,daily,tacit,notes,observations}
mkdir -p scripts products finances
```

### finances/costs.md
```markdown
# Cost Tracking
| Item | Cost | Notes |
|------|------|-------|
| Claude API | ~$TBD/mo | |
| Hosting | $0 | Running on host machine |

## Revenue
| Date | Source | Amount |
|------|--------|--------|

## Net: $0
```

### scripts/nightly-improve.md
```markdown
# Nightly Self-Improvement Protocol
1. Check if improvement log exists for today (skip if backup run)
2. Review today's session transcripts
3. Extract: regressions → AGENTS.md, patterns → memory/tacit/
4. Write changelog to memory/daily/YYYY-MM-DD-improvements.md
5. Git commit + push
6. Post summary to Discord #daily-report
```

### Commit and push
```bash
cd ~/agent-name
git add -A
git commit -m "Initial workspace: identity, memory, goals, finances"
git push -u origin main
```

---

## Step 4: Create OpenClaw Agent Instance

```bash
openclaw agents add AGENT_NAME \
  --workspace ~/agent-name \
  --model anthropic/claude-opus-4-6 \
  --non-interactive
```

This creates:
- Agent config in `~/.openclaw/agents/AGENT_NAME/`
- Session storage separate from main agent
- Own auth profile (inherits from main if not overridden)

Verify: `openclaw agents list`

---

## Step 5: Configure Discord Channel + Binding

### Add Discord to OpenClaw config

Use `gateway config.patch` (from agent tool or CLI):

```json5
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "YOUR_BOT_TOKEN",
      "groupPolicy": "open",
      "replyToMode": "first",
      "historyLimit": 20,
      "dmPolicy": "pairing",
      "guilds": {
        "YOUR_GUILD_ID": {
          "requireMention": false
        }
      },
      "activity": "Building autonomously",
      "activityType": 4,
      "status": "online"
    }
  },
  "plugins": {
    "entries": {
      "discord": {
        "enabled": true
      }
    }
  },
  "bindings": [
    {
      "agentId": "AGENT_NAME",
      "match": {
        "channel": "discord"
      }
    }
  ]
}
```

**Critical settings:**
- `requireMention: false` — without this, the bot ignores messages unless @mentioned
- `bindings` — routes all Discord traffic to your new agent (not the main/default agent)
- `activityType: 4` — custom status shown in Discord

**If you already have Discord configured for another agent**, use guild-specific or channel-specific bindings instead of a blanket channel binding:
```json5
{
  "bindings": [
    {
      "agentId": "agent-a",
      "match": { "channel": "discord", "guildId": "GUILD_A_ID" }
    },
    {
      "agentId": "agent-b",
      "match": { "channel": "discord", "guildId": "GUILD_B_ID" }
    }
  ]
}
```

### Restart gateway
The config.patch triggers a restart automatically. Verify:
```bash
openclaw channels status
# Should show: Discord default: enabled, configured, running, bot:@AgentName
```

**Troubleshooting:**
- `error: 4014` → Enable Message Content Intent in Developer Portal
- `reason: no-mention` in logs → Set `requireMention: false` in guild config
- Bot shows `stopped` → Check token, check intents, restart gateway

---

## Step 6: Create Discord Channels

Use the `message` tool (from the agent) or API:

```bash
# Create categories
message(action="category-create", channel="discord", guildId="GUILD_ID", name="🧭 Operations")
message(action="category-create", channel="discord", guildId="GUILD_ID", name="💰 Revenue")
message(action="category-create", channel="discord", guildId="GUILD_ID", name="🛠 Development")
message(action="category-create", channel="discord", guildId="GUILD_ID", name="📢 Content")

# Create channels under categories (use category ID from response)
message(action="channel-create", channel="discord", guildId="GUILD_ID", name="daily-report", topic="Nightly summaries", parentId="CAT_ID")
message(action="channel-create", ..., name="support", topic="Customer issues, escalations")
message(action="channel-create", ..., name="decisions", topic="Needs ✅/❌ approval")
message(action="channel-create", ..., name="sales", topic="Outreach, leads")
message(action="channel-create", ..., name="finances", topic="Revenue, costs, P&L")
message(action="channel-create", ..., name="dev-log", topic="Code changes, deployments")
message(action="channel-create", ..., name="bugs", topic="Auto-evaluated bug reports")
message(action="channel-create", ..., name="twitter-drafts", topic="Draft tweets — ✅ to post, ❌ to revise")
message(action="channel-create", ..., name="blog", topic="Draft blog posts")
```

**Save all channel IDs to TOOLS.md** — the agent needs them for targeted posting.

---

## Step 7: Set Up Nightly Self-Improvement Crons

Two crons per agent — primary + backup (crons fail ~10-15% of the time):

```bash
# Primary: 2am ET
openclaw cron add \
  --agent AGENT_NAME \
  --name "AgentName Nightly Self-Improvement (Primary)" \
  --cron "0 2 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --announce \
  --channel discord \
  --to "channel:DAILY_REPORT_CHANNEL_ID" \
  --timeout-seconds 1800 \
  --message "Run your nightly self-improvement protocol. Read scripts/nightly-improve.md. Review today's sessions, improve memory/skills/templates, write changelog to memory/daily/YYYY-MM-DD-improvements.md, git commit and push."

# Backup: 3am ET
openclaw cron add \
  --agent AGENT_NAME \
  --name "AgentName Nightly Self-Improvement (Backup)" \
  --cron "0 3 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --announce \
  --channel discord \
  --to "channel:DAILY_REPORT_CHANNEL_ID" \
  --timeout-seconds 1800 \
  --message "BACKUP: Check if today's improvement log exists in memory/daily/. If already done, say 'Already completed.' Otherwise run the full protocol from scripts/nightly-improve.md."
```

Verify: `openclaw cron list` — should show both with `agentId: AGENT_NAME`

---

## Step 8: Configure Stripe (Optional)

```bash
mkdir -p ~/.config/stripe
echo "sk_test_..." > ~/.config/stripe/secret_key
echo "pk_test_..." > ~/.config/stripe/publishable_key
```

For production, use live keys (`sk_live_...`). Test mode is fine for development.

---

## Step 9: Verify Everything Works

1. **Post in Discord** → agent should respond (check `openclaw channels logs` if not)
2. **Check cron list** → `openclaw cron list` shows agent's crons
3. **Check agent list** → `openclaw agents list` shows the agent
4. **Git repo** → workspace pushed and accessible
5. **Send intro message** — trigger via one-shot cron:

```bash
openclaw cron add \
  --agent AGENT_NAME \
  --name "First Boot" \
  --every 60m \
  --session isolated \
  --no-deliver \
  --timeout-seconds 120 \
  --message "Send intro message to Discord #general (channel:GENERAL_ID). Introduce yourself, explain channels, then post initial status to #daily-report."

# Trigger immediately
openclaw cron run JOB_ID

# Remove after it fires
openclaw cron rm JOB_ID
```

---

## Multi-Agent Setup (Multiple Discord-Driven Agents)

Each autonomous agent needs:
- Its own Discord server (simplest) OR separate guild bindings in one server
- Its own OpenClaw agent instance (`openclaw agents add`)
- Its own workspace directory and git repo
- Its own nightly improvement crons

For multiple agents sharing one OpenClaw gateway, route via guild-specific bindings:
```json5
{
  "bindings": [
    { "agentId": "ceo-agent", "match": { "channel": "discord", "guildId": "111..." } },
    { "agentId": "sales-agent", "match": { "channel": "discord", "guildId": "222..." } },
    { "agentId": "dev-agent", "match": { "channel": "discord", "guildId": "333..." } }
  ]
}
```

Or use a single server with channel-specific routing (advanced — requires per-channel session keys which Discord does automatically).

---

## Gotchas & Lessons Learned

1. **`requireMention` defaults to true** — your bot will silently ignore messages without it. Always set `requireMention: false` in guild config.
2. **Message Content Intent must be enabled** in Discord Developer Portal, not just the config. Error 4014 = this.
3. **Cross-context messaging is blocked** — Pip (Telegram-bound) can't send to Discord. Only the Discord-bound agent (Roam) can. Use cron jobs to trigger the right agent.
4. **`sessions_spawn` can't target other agents** unless explicitly allowed in config. Use cron jobs + `openclaw cron run` for cross-agent triggering.
5. **SSH vs HTTPS for git** — if SSH keys aren't set up, use HTTPS remote URLs.
6. **Backup crons are essential** — primary crons fail ~10-15% of the time. Always have a 3am backup that checks if the 2am run completed.
7. **Bot token in config is redacted** in `config.get` output — you can't read it back. Keep a copy somewhere safe.

---

## Reference: Roam's Setup (First Implementation)

- **Agent:** `roam`
- **Workspace:** `~/roam`
- **Repo:** `github.com/apfong/roam`
- **Discord Guild:** `1478778032465510502`
- **Bot App ID:** `1478778334824501339`
- **Model:** `anthropic/claude-opus-4-6`
- **Crons:** 2am primary + 3am backup (both `agentId: roam`, deliver to Discord)
- **Channels:** general, daily-report, support, decisions, sales, finances, dev-log, bugs, twitter-drafts, blog
