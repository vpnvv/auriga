import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { stdout, stderr } = await execPromise(
      "gh workflow run daily-job-search.yml",
      { cwd: process.cwd() }
    );

    return NextResponse.json({
      success: true,
      message: "GitHub Actions workflow run triggered successfully on cloud runner!",
      output: stdout || stderr,
    });
  } catch (error: any) {
    console.error("Failed to trigger GitHub workflow run:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to trigger workflow run via gh CLI",
      },
      { status: 500 }
    );
  }
}
