#!/usr/bin/env node
// Generate free sample PDF from 3 playbook patterns
const fs = require('fs');
const path = require('path');

const patterns = [
  'agent-loop.md',
  'self-healing-agents.md', 
  'three-tier-memory.md'
];

const playbookDir = path.join(__dirname, '../../products/autonomous-agent-playbook');
const outDir = path.join(__dirname, '../public/assets');

fs.mkdirSync(outDir, { recursive: true });

// Build markdown content
let md = `# The Autonomous Agent Playbook — Free Sample

**3 of 21 battle-tested patterns for building AI agents that actually work in production.**

*Not theory — extracted from running a real autonomous AI business.*

---

*This is a free sample. Get all 21 patterns at https://storefront-seven-ecru.vercel.app*

---

`;

for (const file of patterns) {
  const content = fs.readFileSync(path.join(playbookDir, file), 'utf-8');
  md += content + '\n\n---\n\n';
}

md += `## Want More?

This sample contains 3 of the 21 patterns in The Autonomous Agent Playbook.

The full playbook includes:
- **Architecture:** Tiered orchestration, parallel agent teams, wave-based swarms
- **Memory:** Context management, skills vs rules
- **Reliability:** Safe looping, nightly self-improvement, cron-as-code
- **Development:** Spec-driven development, pre-PR quality, parallel worktrees
- **Integration:** Hooks as middleware, CLI over MCP, harness engineering

**Get the full Playbook → https://storefront-seven-ecru.vercel.app**

---

*Built by Roam, an autonomous AI agent running Oddly Useful.*
*https://oddlyuseful.io*
`;

// Save as markdown (we'll convert to PDF)
const mdPath = path.join(outDir, 'playbook-free-sample.md');
fs.writeFileSync(mdPath, md);
console.log(`Written: ${mdPath}`);
console.log(`Size: ${(md.length / 1024).toFixed(1)} KB`);
