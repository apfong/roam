'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

import type { SheetInput, SheetDiff, CellChange } from '@/lib/diff';
import { diffSheet } from '@/lib/diff';
import { DIFF_COLORS } from '@/lib/diff/colors';

interface DiffOverlaySheetProps {
  before: SheetInput;
  after: SheetInput;
  onDiffComputed?: (diff: SheetDiff) => void;
  onCellHover?: (change: CellChange | null) => void;
  height?: string;
}

/**
 * Renders the "after" spreadsheet with diff-colored cell backgrounds.
 * Green = added, red = removed, yellow = value change, blue = formula change, indigo = recalc.
 */
export default function DiffOverlaySheet({
  before,
  after,
  onDiffComputed,
  height = '600px',
}: DiffOverlaySheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const applyOverlay = useCallback(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const diff = diffSheet(before, after);
    onDiffComputed?.(diff);

    // Build cell data from "after" with diff-colored backgrounds
    const styledCellData: Record<number, Record<number, Record<string, unknown>>> = {};

    // Copy after data
    for (const rowStr of Object.keys(after.cellData)) {
      const row = Number(rowStr);
      styledCellData[row] = {};
      const cols = after.cellData[row];
      for (const colStr of Object.keys(cols)) {
        const col = Number(colStr);
        const cell = cols[col];
        styledCellData[row][col] = { ...cell };
      }
    }

    // For removed cells, we need to show them from "before" with strikethrough
    for (const change of diff.changes) {
      const { row, col } = change.address;
      if (!styledCellData[row]) styledCellData[row] = {};

      const color = DIFF_COLORS[change.changeType];

      if (change.changeType === 'removed') {
        // Show old value with red bg + strikethrough
        styledCellData[row][col] = {
          v: change.before?.v ?? '',
          s: {
            bg: { rgb: color.bg },
            bd: {
              b: { s: 1, cl: { rgb: color.accent } },
              t: { s: 1, cl: { rgb: color.accent } },
              l: { s: 1, cl: { rgb: color.accent } },
              r: { s: 1, cl: { rgb: color.accent } },
            },
            st: { s: 1 }, // strikethrough
            cl: { rgb: '#991b1b' },
          },
        };
      } else {
        // Color the cell background
        const existing = styledCellData[row][col] ?? {};
        styledCellData[row][col] = {
          ...existing,
          s: {
            bg: { rgb: color.bg },
            bd: {
              b: { s: 1, cl: { rgb: color.accent } },
              t: { s: 1, cl: { rgb: color.accent } },
              l: { s: 1, cl: { rgb: color.accent } },
              r: { s: 1, cl: { rgb: color.accent } },
            },
          },
        };
      }
    }

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerAPI.createWorkbook({
      id: 'sift-diff',
      name: 'Sift Diff View',
      sheetOrder: [after.id],
      sheets: {
        [after.id]: {
          id: after.id,
          name: after.name ?? 'Sheet1',
          rowCount: Math.max(20, Object.keys(styledCellData).length + 5),
          columnCount: 10,
          cellData: styledCellData,
        },
      },
    });
  }, [before, after, onDiffComputed]);

  useEffect(() => {
    applyOverlay();
  }, [applyOverlay]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}
