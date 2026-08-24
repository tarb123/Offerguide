import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import CandidateApplication from "@/models/CandidateApplication";

const ProgramSchema = new mongoose.Schema(
  { programName: String, weeklySchedule: Array },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    programId: String,
    programName: String,
    candidateEmail: { type: String, lowercase: true },
    candidateName: String,
    week: String,
    status: String,
    markedById: String,
    markedByName: String,
  },
  { timestamps: true }
);

const PGPProgram =
  mongoose.models.PGPProgram || mongoose.model("PGPProgram", ProgramSchema);
const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

function weekNo(value: string) {
  const m = /(\d+)/.exec(value || "");
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase() || "";
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const application = await CandidateApplication.findOne({ email }).lean();
    const programId = application?.assignedProgramId || "";

    if (!programId) {
      return NextResponse.json({
        enrolled: false,
        programName: "",
        weeks: [],
        records: [],
        summary: { present: 0, absent: 0, late: 0, excused: 0, total: 0, percent: 0 },
      });
    }

    const program = await PGPProgram.findById(programId).lean();const programDoc = Array.isArray(program) ? program[0] : program;
    const weeks = Array.from(
      new Set(
       (programDoc?.weeklySchedule || [])
          .map((w: { week?: string }) => w.week)
          .filter(Boolean)
      )
    ).sort((a, b) => weekNo(a as string) - weekNo(b as string)) as string[];

    const records = await Attendance.find({ programId, candidateEmail: email })
      .select("week status")
      .lean();

    const byWeek = new Map(records.map((r) => [r.week, r.status]));
    const rows = weeks.map((w) => ({ week: w, status: byWeek.get(w) || "" }));

    const count = (s: string) =>
      records.filter((r) => r.status === s).length;
    const present = count("Present");
    const late = count("Late");
    const absent = count("Absent");
    const excused = count("Excused");
    const marked = present + late + absent + excused;
    // Present and Late both count toward attendance credit.
    const percent = marked
      ? Math.round(((present + late) / marked) * 100)
      : 0;

    return NextResponse.json({
      enrolled: true,
      programName: application?.assignedProgramName || programDoc?.programName || "",
      weeks: rows,
      summary: { present, absent, late, excused, total: weeks.length, percent },
    });
  } catch (error) {
    console.error("Candidate Attendance Error:", error);
    return NextResponse.json(
      { message: "Failed to load attendance." },
      { status: 500 }
    );
  }
}
