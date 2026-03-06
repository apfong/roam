/**
 * Florida SOS Daily Filing Parser
 * 
 * Parses fixed-width corporate filing data from Florida Division of Corporations
 * Source: https://dos.fl.gov/sunbiz/other-services/data-downloads/daily-data/
 * Format: https://dos.sunbiz.org/data-definitions/cor.html
 * 
 * SFTP: sftp.floridados.gov | User: Public | Pass: PubAccess1845!
 * Path: doc > cor > yyyymmddc.txt
 */

export interface FloridaFiling {
  corpNumber: string;
  corpName: string;
  status: 'A' | 'I';
  filingType: string;
  filingTypeLabel: string;
  principalAddress: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  mailingAddress: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  fileDate: string;
  feiNumber: string;
  registeredAgent: {
    name: string;
    type: 'P' | 'C';
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  officers: Array<{
    title: string;
    type: 'P' | 'C';
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }>;
}

const FILING_TYPES: Record<string, string> = {
  'DOMP': 'Domestic Profit Corporation',
  'DOMNP': 'Domestic Non-Profit Corporation',
  'FORP': 'Foreign Profit Corporation',
  'FORNP': 'Foreign Non-Profit Corporation',
  'DOMLP': 'Domestic Limited Partnership',
  'FORLP': 'Foreign Limited Partnership',
  'FLAL': 'Florida Limited Liability Company',
  'FORL': 'Foreign Limited Liability Company',
  'NPREG': 'Non-Profit Registration',
  'TRUST': 'Declaration of Trust',
  'AGENT': 'Designation of Registered Agent',
};

function extract(line: string, start: number, length: number): string {
  // Fixed-width format, 1-indexed positions
  return line.substring(start - 1, start - 1 + length).trim();
}

function parseOfficer(line: string, startPos: number) {
  return {
    title: extract(line, startPos, 4),
    type: extract(line, startPos + 4, 1) as 'P' | 'C',
    name: extract(line, startPos + 5, 42),
    address: extract(line, startPos + 47, 42),
    city: extract(line, startPos + 89, 28),
    state: extract(line, startPos + 117, 2),
    zip: extract(line, startPos + 119, 9),
  };
}

export function parseLine(line: string): FloridaFiling | null {
  if (line.length < 500) return null;

  const filingType = extract(line, 206, 15);

  const officers = [];
  // Officers start at positions: 669, 797, 925, 1053, 1181, 1309
  const officerStarts = [669, 797, 925, 1053, 1181, 1309];
  for (const pos of officerStarts) {
    if (line.length >= pos + 128) {
      const officer = parseOfficer(line, pos);
      if (officer.name) officers.push(officer);
    }
  }

  return {
    corpNumber: extract(line, 1, 12),
    corpName: extract(line, 13, 192),
    status: extract(line, 205, 1) as 'A' | 'I',
    filingType,
    filingTypeLabel: FILING_TYPES[filingType] ?? filingType,
    principalAddress: {
      address1: extract(line, 221, 42),
      address2: extract(line, 263, 42),
      city: extract(line, 305, 28),
      state: extract(line, 333, 2),
      zip: extract(line, 335, 10),
      country: extract(line, 345, 2),
    },
    mailingAddress: {
      address1: extract(line, 347, 42),
      address2: extract(line, 389, 42),
      city: extract(line, 431, 28),
      state: extract(line, 459, 2),
      zip: extract(line, 461, 10),
      country: extract(line, 471, 2),
    },
    fileDate: extract(line, 473, 8),
    feiNumber: extract(line, 481, 14),
    registeredAgent: {
      name: extract(line, 545, 42),
      type: extract(line, 587, 1) as 'P' | 'C',
      address: extract(line, 588, 42),
      city: extract(line, 630, 28),
      state: extract(line, 658, 2),
      zip: extract(line, 660, 9),
    },
    officers,
  };
}

export function parseFile(content: string): FloridaFiling[] {
  return content
    .split('\n')
    .map(parseLine)
    .filter((f): f is FloridaFiling => f !== null);
}

/** Filter for new business filings (LLCs and corps, active, FL-based) */
export function filterNewBusinesses(filings: FloridaFiling[]): FloridaFiling[] {
  const businessTypes = ['FLAL', 'DOMP', 'DOMNP', 'DOMLP'];
  return filings.filter(f => 
    f.status === 'A' &&
    businessTypes.includes(f.filingType.trim()) &&
    f.principalAddress.state === 'FL'
  );
}
