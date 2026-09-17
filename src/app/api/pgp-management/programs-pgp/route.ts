import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/offerguide/adminAuth";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import MentorUser, { isMentorActive } from "@/models/MentorUser";

const ProgramSchema = new mongoose.Schema(
  {
    programName: { type: String, required: true },
    recommendedDuration: String,
    frequency: String,
    sessionDuration: String,
    totalHours: Number,
    trainingStyle: String,
    finalOutput: String,
    programPromise: String,
    startDate: String,
    endDate: String,
    status: {
      type: String,
      enum: ["Draft", "Active", "Completed", "Paused"],
      default: "Draft",
    },

    assignedMentorId: String,
    assignedMentorName: String,
    assignedMentorEmail: String,

    weeklySchedule: Array,
    sessionFlow: Array,
    capstoneTimeline: Array,
    portfolioChecklist: Array,
    evaluationPlan: Array,
  },
  { timestamps: true }
);

const PGPProgram =
  mongoose.models.PGPProgram || mongoose.model("PGPProgram", ProgramSchema);

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();

    const mentors = await MentorUser.find().sort({ createdAt: -1 }).lean();
    const programs = await PGPProgram.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      // Only mentors who can actually sign in are offered for assignment; a
      // Pending signup has to be marked Active on the Mentors tab first.
      mentors: mentors.filter((m) => isMentorActive(m.status)).map((m) => ({
        mentorId: String(m._id),
        fullName: m.fullName || "",
        email: m.email || "",
      })),
      programs: programs.map((p) => ({
        programId: String(p._id),
        ...p,
      })),
    });
  } catch (error) {
    console.error("Programs Fetch Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch programs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();

    const body = await request.json();
    const mentor = body.assignedMentorId
      ? await MentorUser.findById(body.assignedMentorId)
      : null;

    const program = await PGPProgram.create({
      ...body,
      assignedMentorId: mentor?._id?.toString() || "",
      assignedMentorName: mentor?.fullName || "",
      assignedMentorEmail: mentor?.email || "",
    });

    return NextResponse.json({
      message: "Program created successfully.",
      program,
    });
  } catch (error) {
    console.error("Program Create Error:", error);

    return NextResponse.json(
      { message: "Failed to create program." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();

    const body = await request.json();

    const mentor = body.assignedMentorId
      ? await MentorUser.findById(body.assignedMentorId)
      : null;

    const program = await PGPProgram.findByIdAndUpdate(
      body.programId,
      {
        $set: {
          ...body,
          assignedMentorId: mentor?._id?.toString() || "",
          assignedMentorName: mentor?.fullName || "",
          assignedMentorEmail: mentor?.email || "",
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Program updated successfully.",
      program,
    });
  } catch (error) {
    console.error("Program Update Error:", error);

    return NextResponse.json(
      { message: "Failed to update program." },
      { status: 500 }
    );
  }
}
