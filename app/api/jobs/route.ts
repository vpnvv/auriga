import { NextResponse } from "next/server";
import { getJobs, getMetrics } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = getJobs();
    const metrics = getMetrics(jobs);
    return NextResponse.json({
      success: true,
      jobs,
      metrics,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
