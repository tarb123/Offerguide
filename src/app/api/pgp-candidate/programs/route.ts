import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import CandidateApplication from "@/models/CandidateApplication";

const ProgramSchema = new mongoose.Schema(
  {
    programName: String,
    status: String,
    recommendedDuration: String,
    assignedMentorName: String,
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
    const email = searchParams.get("email")?.trim().toLowerCase() || "";

    const programs = await PGPProgram.find().sort({ createdAt: -1 }).lean();
    const application = email
      ? await CandidateApplication.findOne({ email }).lean()
      : null;

    return NextResponse.json({
      enrolledProgramId: application?.assignedProgramId || "",
      programs: programs.map((p) => ({
        programId: String(p._id),
        programName: p.programName || "Untitled program",
        status: p.status || "Draft",
        mentorName: p.assignedMentorName || "",
        recommendedDuration: p.recommendedDuration || "",
        weeks: p.weeklySchedule?.length || 0,
        portfolioItems: p.portfolioChecklist?.length || 0,
        capstoneItems: p.capstoneTimeline?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Candidate Programs Fetch Error:", error);
    return NextResponse.json(
      { message: "Failed to load programs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const email = String(body.email || "").toLowerCase();
    const programId = String(body.programId || "");

    if (!email || !programId) {
      return NextResponse.json(
        { message: "Email and program are required." },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      return NextResponse.json({ message: "Invalid program." }, { status: 400 });
    }

    const program = await PGPProgram.findById(programId).select("programName").exec();
    if (!program) {
      return NextResponse.json({ message: "Program not found." }, { status: 404 });
    }

    await CandidateApplication.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          fullName: body.fullName || "",
          assignedProgramId: programId,
          assignedProgramName: program.programName || "",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: `Enrolled in ${program.programName}.`,
      assignedProgramId: programId,
      assignedProgramName: program.programName || "",
    });
  } catch (error) {
    console.error("Candidate Enroll Error:", error);
    return NextResponse.json(
      { message: "Failed to enroll." },
      { status: 500 }
    );
  }
}
