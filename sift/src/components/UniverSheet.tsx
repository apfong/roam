'use client';

import { useEffect, useRef } from 'react';

import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';

export default function UniverSheet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    // Create a workbook with sample data to prove it works
    univerAPI.createWorkbook({
      id: 'sift-spike',
      name: 'Sift Spike',
      sheetOrder: ['sheet1'],
      sheets: {
        sheet1: {
          id: 'sheet1',
          name: 'Before vs After',
          rowCount: 20,
          columnCount: 10,
          cellData: {
            0: {
              0: { v: 'Item' },
              1: { v: 'Q1 Revenue' },
              2: { v: 'Q2 Revenue' },
              3: { v: 'Change' },
            },
            1: {
              0: { v: 'Widget A' },
              1: { v: 45000 },
              2: { v: 52000 },
              3: { v: 7000 },
            },
            2: {
              0: { v: 'Widget B' },
              1: { v: 32000 },
              2: { v: 28000 },
              3: { v: -4000 },
            },
            3: {
              0: { v: 'Widget C' },
              1: { v: 18000 },
              2: { v: 22500 },
              3: { v: 4500 },
            },
            4: {
              0: { v: 'Total' },
              1: { v: 95000 },
              2: { v: 102500 },
              3: { v: 7500 },
            },
          },
        },
      },
    });
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
