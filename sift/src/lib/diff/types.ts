/**
 * Sift Diff Engine — Core Types
 *
 * Represents the structured diff between two spreadsheet versions.
 * Designed to work with Univer's cell data format.
 */

/** Address of a single cell */
export interface CellAddress {
  row: number;
  col: number;
  /** Optional sheet identifier */
  sheetId?: string;
}

/** Represents a single cell's data (compatible with Univer ICellData) */
export interface CellData {
  /** Display value */
  v?: string | number | boolean | null;
  /** Formula string (e.g. "=SUM(A1:A10)") */
  f?: string | null;
  /** Cell type: 1=string, 2=number, 3=boolean, 4=force-string */
  t?: number;
  /** Style index or inline style */
  s?: unknown;
}

/** What kind of change occurred */
export type ChangeType =
  | 'value'        // Value changed (not formula-driven)
  | 'formula'      // Formula text changed
  | 'formula-value' // Value changed AND it has a formula (recalc result)
  | 'type'         // Cell type changed (e.g. number → text)
  | 'added'        // Cell was empty, now has content
  | 'removed'      // Cell had content, now empty
  | 'style';       // Only style changed (future)

/** A single cell-level change */
export interface CellChange {
  address: CellAddress;
  changeType: ChangeType;
  before: CellData | null;
  after: CellData | null;
}

/** Row-level structural change */
export interface RowChange {
  type: 'added' | 'removed';
  /** Row index in the "after" sheet (for added) or "before" sheet (for removed) */
  index: number;
  /** Number of cells with content in this row */
  cellCount: number;
}

/** Column-level structural change */
export interface ColChange {
  type: 'added' | 'removed';
  index: number;
  cellCount: number;
}

/** Summary statistics for the diff */
export interface DiffSummary {
  totalChanges: number;
  valueChanges: number;
  formulaChanges: number;
  addedCells: number;
  removedCells: number;
  addedRows: number;
  removedRows: number;
  addedCols: number;
  removedCols: number;
  /** Cells that changed only because a formula upstream changed */
  formulaValueChanges: number;
}

/** The full diff result for a single sheet */
export interface SheetDiff {
  sheetId: string;
  sheetName?: string;
  changes: CellChange[];
  rowChanges: RowChange[];
  colChanges: ColChange[];
  summary: DiffSummary;
}

/** Diff across an entire workbook (multiple sheets) */
export interface WorkbookDiff {
  sheets: SheetDiff[];
  addedSheets: string[];
  removedSheets: string[];
  totalSummary: DiffSummary;
}

/** Input format: a sheet's cell data as sparse row→col→CellData */
export type SheetCellData = Record<number, Record<number, CellData>>;

/** Input for a single sheet comparison */
export interface SheetInput {
  id: string;
  name?: string;
  cellData: SheetCellData;
  rowCount?: number;
  columnCount?: number;
}

/** Input for workbook comparison */
export interface WorkbookInput {
  sheets: Record<string, SheetInput>;
  sheetOrder?: string[];
}
