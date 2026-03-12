# Reddit Post — r/smallbusiness, r/Accounting, r/excel, r/SideProject

**Title:** I built a free tool that shows you exactly what changed between two spreadsheet versions

**Body:**

I kept running into the same problem: someone sends an updated spreadsheet and I need to figure out what actually changed. Manually comparing cells is painful, especially with formulas.

So I built **Sift** — drop two files (XLSX, CSV, or ODS), get a color-coded cell-by-cell diff instantly.

**What it does:**
- 🟢 Green = added, 🔴 Red = deleted, 🟡 Yellow = modified
- Tracks formula changes (catches when someone swaps `=SUM(...)` for a hardcoded number)
- AI-powered change summaries in plain English
- Multi-sheet support with a filterable change sidebar
- Works with XLSX, CSV, and ODS files

**The key thing: everything runs 100% in your browser.** Your files never leave your machine. No accounts, no uploads to any server, no data collection. Just drag, drop, and see the diff.

Free to use: https://sift-nine.vercel.app

I built this for finance teams, accountants, and ops people who review spreadsheet revisions regularly. But it's useful anytime you need to compare two versions of anything tabular.

Would love feedback — what's missing? What would make this more useful for your workflow?
