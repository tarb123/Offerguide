import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import CandidateApplication from "@/models/CandidateApplication";

const ProgramSchema = new mongoose.Schema(
  {
    programName: String,
    status: String,
    recommendedDuration: String,
    startDate: String,
    endDate: String,
    assignedMentorId: String,
    assignedMentorName: String,
    assignedMentorEmail: String,
    weeklySchedule: Array,
    portfolioChecklist: Array,
    capstoneTimeline: Array,
  },
  { timestamps: true }
);

const PGPProgram =
  mongoose.models.PGPProgram || mongoose.model("PGPProgram", ProgramSchema);

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId")?.trim() || "";
    const email = searchParams.get("email")?.trim().toLowerCase() || "";

    if (!mentorId && !email) {
      return NextResponse.json(
        { message: "Mentor id or email is required." },
        { status: 400 }
      );
    }

    // A program belongs to this mentor if either the id or the email matches —
    // id is the reliable key, email is a fallback for older records.
    const match: Record<string, unknown>[] = [];
    if (mentorId) match.push({ assignedMentorId: mentorId });
    if (email) match.push({ assignedMentorEmail: email });

    const programs = await PGPProgram.find({ $or: match })
      .sort({ createdAt: -1 })
      .lean();

    // Collect enrolled students per program in one pass.
    const applications = await CandidateApplication.find({
      assignedProgramId: { $in: programs.map((p) => String(p._id)) },
    })
      .select("assignedProgramId fullName email")
      .sort({ fullName: 1 })
      .lean();

    const studentsByProgram = new Map<string, { fullName: string; email: string }[]>();
    for (const app of applications) {
      const id = app.assignedProgramId || "";
      const list = studentsByProgram.get(id) || [];
      list.push({ fullName: app.fullName || "", email: app.email || "" });
      studentsByProgram.set(id, list);
    }

    const result = programs.map((p) => {
      const id = String(p._id);
      const students = studentsByProgram.get(id) || [];
      return {
        programId: id,
        programName: p.programName || "Untitled program",
        status: p.status || "Draft",
        recommendedDuration: p.recommendedDuration || "",
        startDate: p.startDate || "",
        endDate: p.endDate || "",
        weeks: p.weeklySchedule?.length || 0,
        portfolioItems: p.portfolioChecklist?.length || 0,
        capstoneItems: p.capstoneTimeline?.length || 0,
        studentCount: students.length,
        students,
      };
    });

    return NextResponse.json({
      totalPrograms: result.length,
      totalStudents: result.reduce((sum, p) => sum + p.studentCount, 0),
      programs: result,
    });
  } catch (error) {
    console.error("Mentor Programs Fetch Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch mentor programs." },
      { status: 500 }
    );
  }
}
