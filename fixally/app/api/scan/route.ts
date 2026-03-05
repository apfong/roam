/**
 * POST /api/scan
 * Accepts { url: string }, runs accessibility scan, returns violations.
 */

import { NextRequest, NextResponse } from "next/server";
import { scanUrl } from "@/lib/scanner";

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    // Block localhost and private IPs
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname === "[::1]"
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Must be a public http/https URL." },
        { status: 400 }
      );
    }

    const result = await scanUrl(url);

    if (result.error) {
      return NextResponse.json(
        { error: `Scan failed: ${result.error}`, result },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
