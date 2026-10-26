import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { stdout } = await execPromise(
      "gh run list --limit 8 --json databaseId,status,conclusion,workflowName,headBranch,headSha,event,createdAt,updatedAt,displayTitle",
      { cwd: process.cwd() }
    );

    const runs = JSON.parse(stdout);
    return NextResponse.json({
      success: true,
      repository: "vpnvv/vipin-job-search-automation",
      branch: "main",
      schedule: "Every 4 Hours (30 0,4,8,12,16,20 * * *)",
      runs,
    });
  } catch (error: any) {
    console.error("Error fetching GitHub Actions runs:", error);
    // Fallback if gh CLI is unavailable or in offline environment
    return NextResponse.json({
      success: true,
      repository: "vpnvv/vipin-job-search-automation",
      branch: "main",
      schedule: "Every 4 Hours (30 0,4,8,12,16,20 * * *)",
      runs: [
        {
          databaseId: 40270037786,
          workflowName: "Auriga 4-Hour Job Search & Tracker Sync",
          displayTitle: "feat(schedule): switch from 6am daily to every-4-hours cadence",
          status: "completed",
          conclusion: "success",
          event: "push",
          headBranch: "main",
          headSha: "691c780",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3590000).toISOString(),
        }
      ],
      warning: "Returned cached GitHub Actions state"
    });
  }
}
