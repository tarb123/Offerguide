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
    status: String, // Present | Absent | Late | Excused
    markedById: String,
    markedByName: String,
  },
  { timestamps: true }
);
AttendanceSchema.index(
  { programId: 1, candidateEmail: 1, week: 1 },
  { unique: true }
);

const PGPProgram =
  mongoose.models.PGPProgram || mongoose.model("PGPProgram", ProgramSchema);
const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

function weekNo(value: string) {
  const m = /(\d+)/.exec(value || "");
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid program id." }, { status: 400 });
    }

    const program = await PGPProgram.findById(id).lean();
    if (!program) {
      return NextResponse.json({ message: "Program not found." }, { status: 404 });
    }

    const weeks = Array.from(
      new Set(
        (program.weeklySchedule || [])
          .map((w: { week?: string }) => w.week)
          .filter(Boolean)
      )
    ).sort((a, b) => weekNo(a as string) - weekNo(b as string)) as string[];

    const students = await CandidateApplication.find({ assignedProgramId: id })
      .select("fullName email")
      .sort({ fullName: 1 })
      .lean();

    const records = await Attendance.find({ programId: id })
      .select("candidateEmail week status")
      .lean();

    return NextResponse.json({
      weeks,
      students: students.map((s) => ({
        fullName: s.fullName || "",
        email: s.email || "",
      })),
      records: records.map((r) => ({
        candidateEmail: r.candidateEmail || "",
        week: r.week || "",
        status: r.status || "",
      })),
    });
  } catch (error) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json(
      { message: "Failed to load attendance." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const candidateEmail = String(body.candidateEmail || "").toLowerCase();
    const week = String(body.week || "");
    const status = String(body.status || "");

    if (!candidateEmail || !week) {
      return NextResponse.json(
        { message: "Candidate and week are required." },
        { status: 400 }
      );
    }

    const program = await PGPProgram.findById(id).select("programName").lean();

    await Attendance.findOneAndUpdate(
      { programId: id, candidateEmail, week },
      {
        $set: {
          programId: id,
          programName: program?.programName || "",
          candidateEmail,
          candidateName: body.candidateName || "",
          week,
          status,
          markedById: body.markedById || "",
          markedByName: body.markedByName || "",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Attendance saved." });
  } catch (error) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json(
      { message: "Failed to save attendance." },
      { status: 500 }
    );
  }
}
