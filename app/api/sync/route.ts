import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import { getJobs, getMetrics } from "@/lib/data";

const execPromise = util.promisify(exec);
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Run the Python search pipeline in background/subprocess
    const { stdout, stderr } = await execPromise(
      "python3 scripts/run_daily_search.py --mode=send-approved",
      { cwd: process.cwd() }
    );

    const jobs = getJobs();
    const metrics = getMetrics(jobs);

    return NextResponse.json({
      success: true,
      message: "Search pipeline executed and tracker refreshed.",
      jobs,
      metrics,
      log: stdout || stderr,
    });
  } catch (error: any) {
    console.error("Local sync execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Pipeline execution failed",
      },
      { status: 500 }
    );
  }
}
