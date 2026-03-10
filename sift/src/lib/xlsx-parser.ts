/**
 * Convert uploaded XLSX/CSV files into Sift SheetInput format.
 */
import * as XLSX from 'xlsx';
import type { SheetInput, CellData, SheetCellData } from './diff/types';

export interface ParsedWorkbook {
  sheets: SheetInput[];
  fileName: string;
}

/**
 * Parse an ArrayBuffer (from File.arrayBuffer()) into SheetInput[].
 */
export function parseWorkbook(buffer: ArrayBuffer, fileName: string): ParsedWorkbook {
  const wb = XLSX.read(buffer, { cellFormula: true, cellStyles: false });

  const sheets: SheetInput[] = wb.SheetNames.map((name, idx) => {
    const ws = wb.Sheets[name];
    const cellData: SheetCellData = {};

    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell) continue;

        const cd: CellData = {};

        // Value
        if (cell.v !== undefined && cell.v !== null) {
          cd.v = cell.v;
        }

        // Formula
        if (cell.f) {
          cd.f = `=${cell.f}`;
        }

        // Type
        if (cell.t === 's') cd.t = 1;
        else if (cell.t === 'n') cd.t = 2;
        else if (cell.t === 'b') cd.t = 3;

        if (!cellData[r]) cellData[r] = {};
        cellData[r][c] = cd;
      }
    }

    return {
      id: `sheet-${idx}`,
      name,
      cellData,
      rowCount: range.e.r + 1,
      columnCount: range.e.c + 1,
    };
  });

  return { sheets, fileName };
}

/**
 * Parse a CSV string into a single SheetInput.
 */
export function parseCsv(text: string, fileName: string): ParsedWorkbook {
  const wb = XLSX.read(text, { type: 'string' });
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return parseWorkbook(buffer, fileName);
}
