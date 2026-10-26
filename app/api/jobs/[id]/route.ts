import { NextRequest, NextResponse } from "next/server";
import { updateJobStatus, getJobs } from "@/lib/data";
import { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = decodeURIComponent(params.id);
    const body = await request.json();
    const { status, notes } = body;

    if (!["Shortlisted", "Applied", "Ignored"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be Shortlisted, Applied, or Ignored." },
        { status: 400 }
      );
    }

    const updated = updateJobStatus(id, status as ApplicationStatus, notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Job with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const allJobs = getJobs();
    const job = allJobs.find(j => j.id === id || j.company.toLowerCase() === id.toLowerCase());

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update job" },
      { status: 500 }
    );
  }
}
