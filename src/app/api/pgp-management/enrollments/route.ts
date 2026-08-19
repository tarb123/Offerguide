import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import CandidateApplication from "@/models/CandidateApplication";

const ProgramSchema = new mongoose.Schema(
  {
    programName: String,
    status: String,
    assignedMentorName: String,
    weeklySchedule: Array,
  },
  { timestamps: true }
);

const PGPProgram =
  mongoose.models.PGPProgram || mongoose.model("PGPProgram", ProgramSchema);

export async function GET() {
  try {
    await dbConnect();

    const programs = await PGPProgram.find().sort({ createdAt: -1 }).lean();
    const applications = await CandidateApplication.find({
      assignedProgramId: { $nin: [null, ""] },
    })
      .select("fullName email gender contactNumber assignedProgramId")
      .sort({ fullName: 1 })
      .lean();

    const byProgram = new Map<
      string,
      { fullName: string; email: string; gender: string; contactNumber: string }[]
    >();
    for (const a of applications) {
      const id = a.assignedProgramId || "";
      const list = byProgram.get(id) || [];
      list.push({
        fullName: a.fullName || "",
        email: a.email || "",
        gender: a.gender || "",
        contactNumber: a.contactNumber || "",
      });
      byProgram.set(id, list);
    }

    const result = programs.map((p) => {
      const id = String(p._id);
      const students = byProgram.get(id) || [];
      return {
        programId: id,
        programName: p.programName || "Untitled program",
        status: p.status || "Draft",
        mentorName: p.assignedMentorName || "",
        weeks: p.weeklySchedule?.length || 0,
        studentCount: students.length,
        students,
      };
    });

    return NextResponse.json({
      totalStudents: result.reduce((s, p) => s + p.studentCount, 0),
      programs: result,
    });
  } catch (error) {
    console.error("Enrollments Fetch Error:", error);
    return NextResponse.json(
      { message: "Failed to load enrollments." },
      { status: 500 }
    );
  }
}
