# Hacker News — Show HN

**Title:** Show HN: Sift – Client-side spreadsheet diff with formula tracking and AI summaries

**URL:** https://sift-nine.vercel.app

**Comment:**

Comparing spreadsheet versions is surprisingly annoying. Excel's built-in compare is clunky, and most online tools require uploading your files to a server — not great for sensitive financial data.

Sift runs entirely in the browser. Drop two files (XLSX/CSV/ODS), get a cell-by-cell diff with:

- Color-coded changes (added/deleted/modified)
- Formula tracking — see when `=SUM(A1:A10)` became `5000`
- AI-generated change summaries
- Multi-sheet support with a filterable sidebar
- Row/column insertion and deletion detection

No server, no account, no data leaves your machine. Built with Next.js and Univer for the spreadsheet rendering.

Use case: finance teams auditing budget revisions, accountants reviewing draft vs. final reports, ops teams tracking vendor pricing updates.

Free to use. Feedback welcome — especially on edge cases I might be missing with complex workbooks.
