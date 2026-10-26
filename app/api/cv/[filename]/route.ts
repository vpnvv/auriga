import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { findCvFile } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const filePath = findCvFile(filename);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "CV PDF file not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to serve CV PDF" },
      { status: 500 }
    );
  }
}
