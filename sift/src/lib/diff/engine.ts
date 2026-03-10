/**
 * Sift Diff Engine — Core comparison logic
 *
 * Compares two spreadsheet versions and produces a structured diff.
 * Formula-aware: distinguishes between direct edits and recalculated values.
 */

import type {
  CellAddress,
  CellChange,
  CellData,
  ChangeType,
  ColChange,
  DiffSummary,
  RowChange,
  SheetCellData,
  SheetDiff,
  SheetInput,
  WorkbookDiff,
  WorkbookInput,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEmpty(cell: CellData | undefined | null): boolean {
  if (!cell) return true;
  return cell.v === null && !cell.f && cell.v === undefined;
}

function isEmptyCell(cell: CellData | undefined | null): boolean {
  if (!cell) return true;
  const noValue = cell.v === null || cell.v === undefined || cell.v === '';
  const noFormula = !cell.f;
  return noValue && noFormula;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  // Handle NaN
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
  return a === b;
}

function formulasEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  const fa = (a ?? '').trim().toUpperCase();
  const fb = (b ?? '').trim().toUpperCase();
  return fa === fb;
}

/** Get the bounding box of populated cells */
function getBounds(data: SheetCellData): { maxRow: number; maxCol: number } {
  let maxRow = -1;
  let maxCol = -1;
  for (const rowStr of Object.keys(data)) {
    const row = Number(rowStr);
    const cols = data[row];
    if (!cols) continue;
    for (const colStr of Object.keys(cols)) {
      const col = Number(colStr);
      if (!isEmptyCell(cols[col])) {
        if (row > maxRow) maxRow = row;
        if (col > maxCol) maxCol = col;
      }
    }
    if (row > maxRow) maxRow = row;
  }
  return { maxRow, maxCol };
}

/** Collect all cell addresses that have data in either version */
function allAddresses(before: SheetCellData, after: SheetCellData): CellAddress[] {
  const seen = new Set<string>();
  const addresses: CellAddress[] = [];

  const addFromData = (data: SheetCellData) => {
    for (const rowStr of Object.keys(data)) {
      const row = Number(rowStr);
      const cols = data[row];
      if (!cols) continue;
      for (const colStr of Object.keys(cols)) {
        const col = Number(colStr);
        const key = `${row},${col}`;
        if (!seen.has(key)) {
          seen.add(key);
          addresses.push({ row, col });
        }
      }
    }
  };

  addFromData(before);
  addFromData(after);
  return addresses;
}

// ---------------------------------------------------------------------------
// Cell-level comparison
// ---------------------------------------------------------------------------

function getCell(data: SheetCellData, row: number, col: number): CellData | null {
  return data[row]?.[col] ?? null;
}

function classifyChange(before: CellData | null, after: CellData | null): ChangeType | null {
  const bEmpty = isEmptyCell(before);
  const aEmpty = isEmptyCell(after);

  // No change
  if (bEmpty && aEmpty) return null;

  // Added
  if (bEmpty && !aEmpty) return 'added';

  // Removed
  if (!bEmpty && aEmpty) return 'removed';

  // Both have content — check what changed
  const b = before!;
  const a = after!;

  const formulaChanged = !formulasEqual(b.f, a.f);
  const valueChanged = !valuesEqual(b.v, a.v);
  const hasFormulaBefore = !!b.f;
  const hasFormulaAfter = !!a.f;

  // Formula text itself changed
  if (formulaChanged) return 'formula';

  // Value changed on a cell with a formula = recalc result
  if (valueChanged && (hasFormulaBefore || hasFormulaAfter)) return 'formula-value';

  // Plain value change
  if (valueChanged) return 'value';

  // Type changed (e.g. "42" string vs 42 number)
  if (b.t !== a.t && b.t !== undefined && a.t !== undefined) return 'type';

  return null; // No meaningful change
}

function compareCell(
  before: SheetCellData,
  after: SheetCellData,
  address: CellAddress,
): CellChange | null {
  const b = getCell(before, address.row, address.col);
  const a = getCell(after, address.row, address.col);
  const changeType = classifyChange(b, a);

  if (!changeType) return null;

  return {
    address,
    changeType,
    before: b,
    after: a,
  };
}

// ---------------------------------------------------------------------------
// Row/Column structural changes
// ---------------------------------------------------------------------------

function detectRowChanges(before: SheetCellData, after: SheetCellData): RowChange[] {
  const changes: RowChange[] = [];
  const beforeBounds = getBounds(before);
  const afterBounds = getBounds(after);

  // Rows in after but not in before (beyond before's range with content)
  for (let r = beforeBounds.maxRow + 1; r <= afterBounds.maxRow; r++) {
    const row = after[r];
    if (!row) continue;
    const cellCount = Object.values(row).filter(c => !isEmptyCell(c)).length;
    if (cellCount > 0) {
      changes.push({ type: 'added', index: r, cellCount });
    }
  }

  // Rows in before but not in after
  for (let r = afterBounds.maxRow + 1; r <= beforeBounds.maxRow; r++) {
    const row = before[r];
    if (!row) continue;
    const cellCount = Object.values(row).filter(c => !isEmptyCell(c)).length;
    if (cellCount > 0) {
      changes.push({ type: 'removed', index: r, cellCount });
    }
  }

  return changes;
}

function detectColChanges(before: SheetCellData, after: SheetCellData): ColChange[] {
  const changes: ColChange[] = [];
  const beforeBounds = getBounds(before);
  const afterBounds = getBounds(after);

  // Simple heuristic: columns beyond the other version's range
  for (let c = beforeBounds.maxCol + 1; c <= afterBounds.maxCol; c++) {
    let cellCount = 0;
    for (const rowStr of Object.keys(after)) {
      const cell = after[Number(rowStr)]?.[c];
      if (!isEmptyCell(cell)) cellCount++;
    }
    if (cellCount > 0) {
      changes.push({ type: 'added', index: c, cellCount });
    }
  }

  for (let c = afterBounds.maxCol + 1; c <= beforeBounds.maxCol; c++) {
    let cellCount = 0;
    for (const rowStr of Object.keys(before)) {
      const cell = before[Number(rowStr)]?.[c];
      if (!isEmptyCell(cell)) cellCount++;
    }
    if (cellCount > 0) {
      changes.push({ type: 'removed', index: c, cellCount });
    }
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function buildSummary(
  changes: CellChange[],
  rowChanges: RowChange[],
  colChanges: ColChange[],
): DiffSummary {
  const summary: DiffSummary = {
    totalChanges: changes.length,
    valueChanges: 0,
    formulaChanges: 0,
    addedCells: 0,
    removedCells: 0,
    addedRows: 0,
    removedRows: 0,
    addedCols: 0,
    removedCols: 0,
    formulaValueChanges: 0,
  };

  for (const c of changes) {
    switch (c.changeType) {
      case 'value': summary.valueChanges++; break;
      case 'formula': summary.formulaChanges++; break;
      case 'formula-value': summary.formulaValueChanges++; break;
      case 'added': summary.addedCells++; break;
      case 'removed': summary.removedCells++; break;
    }
  }

  for (const r of rowChanges) {
    if (r.type === 'added') summary.addedRows++;
    else summary.removedRows++;
  }

  for (const c of colChanges) {
    if (c.type === 'added') summary.addedCols++;
    else summary.removedCols++;
  }

  return summary;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Compare two versions of a single sheet */
export function diffSheet(before: SheetInput, after: SheetInput): SheetDiff {
  const addresses = allAddresses(before.cellData, after.cellData);
  const changes: CellChange[] = [];

  for (const addr of addresses) {
    const change = compareCell(before.cellData, after.cellData, {
      ...addr,
      sheetId: after.id,
    });
    if (change) changes.push(change);
  }

  const rowChanges = detectRowChanges(before.cellData, after.cellData);
  const colChanges = detectColChanges(before.cellData, after.cellData);
  const summary = buildSummary(changes, rowChanges, colChanges);

  return {
    sheetId: after.id,
    sheetName: after.name ?? before.name,
    changes,
    rowChanges,
    colChanges,
    summary,
  };
}

/** Compare two workbook versions */
export function diffWorkbook(before: WorkbookInput, after: WorkbookInput): WorkbookDiff {
  const beforeIds = new Set(Object.keys(before.sheets));
  const afterIds = new Set(Object.keys(after.sheets));

  const addedSheets = [...afterIds].filter(id => !beforeIds.has(id));
  const removedSheets = [...beforeIds].filter(id => !afterIds.has(id));
  const commonSheets = [...afterIds].filter(id => beforeIds.has(id));

  const sheets: SheetDiff[] = [];

  for (const id of commonSheets) {
    sheets.push(diffSheet(before.sheets[id], after.sheets[id]));
  }

  // Added sheets — diff against empty
  for (const id of addedSheets) {
    const emptySheet: SheetInput = { id, cellData: {} };
    sheets.push(diffSheet(emptySheet, after.sheets[id]));
  }

  // Removed sheets — diff against empty
  for (const id of removedSheets) {
    const emptySheet: SheetInput = { id, cellData: {} };
    sheets.push(diffSheet(before.sheets[id], emptySheet));
  }

  // Aggregate summary
  const totalSummary: DiffSummary = {
    totalChanges: 0, valueChanges: 0, formulaChanges: 0,
    addedCells: 0, removedCells: 0,
    addedRows: 0, removedRows: 0,
    addedCols: 0, removedCols: 0,
    formulaValueChanges: 0,
  };

  for (const s of sheets) {
    for (const key of Object.keys(totalSummary) as (keyof DiffSummary)[]) {
      totalSummary[key] += s.summary[key];
    }
  }

  return { sheets, addedSheets, removedSheets, totalSummary };
}
